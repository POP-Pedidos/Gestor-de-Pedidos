$(window).ready(function () {
    let callback_images = () => {
        $("#image_selector").fadeOut(200);
    };

    let multiple_select = false;

    let image_maxWidth = 0;
    let image_maxHeight = 0;

    let online_selected_images = [];

    let image_selector_lazy = {
        max: 0,
        ended: false,
        count: 35
    }

    function SearchForImages(query, offset = 0, count = image_selector_lazy.count) {
        return new Promise((resolve) => {
            $.get(`https://www.bing.com/images/async?q=${encodeURI(query)}&first=${offset}&count=${count}&mmasync=1`, (html) => {
                const $page = $(html);

                const images = [];

                for (const elem of $page.find("a[m]")) {
                    const json = JSON.parse($(elem).attr("m"));

                    images.push({
                        id: json.mid,
                        site_url: json.purl,
                        image_url: json.murl,
                        bing_image_url: json.turl,
                        title: json.t.replace(/[\u{100}-\u{FFFF}]/gu, ""),
                        desc: json.desc.replace(/[\u{100}-\u{FFFF}]/gu, ""),
                    });
                }

                resolve(images);
            });
        })
    }

    async function Search(query) {
        if (!query) return;

        $("#image_selector .online_searcher>header>.input>input").val(query);

        image_selector_lazy.processing = true;

        $("#image_selector .online_searcher>.list>.results").empty();

        for (let i = 0; i < 32; i++) {
            $("#image_selector .online_searcher>.list>.results").append(`<div class="skeleton" style="width: ${randomInt(180, 400)}px"></div>`);
        }

        const images = await SearchForImages(query);

        $("#image_selector .online_searcher>.list>.results").empty();

        for (const image of images) AddImage(image);

        image_selector_lazy.processing = false;
    }

    function AddImage(image) {
        const $container = $(`<div class="item skeleton"><img loading="lazy"><i class="fas fa-check"></i></div>`);
        const $img = $container.find("img");

        if (online_selected_images.some(img => img.id == image.id)) $container.addClass("selected");

        $img.on("error", function () {
            $img.remove();
        });

        $img.attr("src", image.bing_image_url);

        $img.on("load", () => $container.removeClass("skeleton"));

        $container.on("click", async function () {
            const $selected = $("#image_selector>main>.online_searcher>.list>.selected");
            const $selected_list = $selected.find(">.list");

            const $selected_container = $(`<div><img><button><i class="fas fa-trash"></i></button></div>`);
            const $selected_img = $selected_container.find("img");
            const $selected_button = $selected_container.find("button");

            $selected_img.attr("src", image.bing_image_url);

            $container.addClass("selected");

            if (!multiple_select) {
                $("#image_selector .online_searcher>.loading").css("display", "flex").fadeIn(100);

                const ShowProgress = progress => {
                    $("#image_selector .online_searcher>.loading .progress-bar>span").css("width", `${progress * 100}%`);
                }

                let base64 = await ImageToBase64(image.image_url, ShowProgress);
                if (!base64) base64 = await ImageToBase64(image.bing_image_url, ShowProgress);

                setTimeout(() => callback_images(base64), 300);

                return;
            } else {
                online_selected_images.push(image);
                const online_selected_images_index = online_selected_images.length - 1;

                $("#image_selector>main>.online_searcher>header>.buttons>button.save").toggle(online_selected_images.length > 0);

                $selected_button.on("click", function () {
                    $container.removeClass("selected");
                    $selected_container.remove();

                    online_selected_images.splice(online_selected_images_index, 1);

                    $("#image_selector>main>.online_searcher>header>.buttons>button.save").toggle(online_selected_images.length > 0);

                    if ($selected_list.find(">div").length == 0) $selected.fadeOut(200);
                });
            }

            if ($selected_list.find(">div").length == 0) $selected.fadeIn(200).css("display", "flex");

            $selected_list.append($selected_container);
        });

        $("#image_selector .online_searcher>.list>.results").append($container);
    }

    async function ImageToBase64(src, onProgress = () => { }) {
        return new Promise((resolve) => {
            const request = new XMLHttpRequest();
            request.open('GET', src, true);
            
            request.timeout = 10000;

            request.responseType = 'arraybuffer';

            request.onload = function (e) {
                onProgress(1);

                const blob = new Blob([this.response]);

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const img = new Image;

                img.onload = function () {
                    const iw = this.naturalWidth;
                    const ih = this.naturalHeight;
                    const scale = Math.min((image_maxWidth / iw), (image_maxHeight / ih));
                    const iwScaled = iw * scale;
                    const ihScaled = ih * scale;

                    if (iw > image_maxWidth || ih > image_maxHeight) {
                        canvas.width = iwScaled;
                        canvas.height = ihScaled;

                        console.log(`Economized ${(((iw * ih) - (iwScaled * ihScaled)) / (iw * ih)) * 100}% of image!`);

                        ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
                    } else {
                        canvas.width = iw;
                        canvas.height = ih;

                        ctx.drawImage(img, 0, 0, iw, ih);
                    }

                    resolve(canvas.toDataURL("image/png"));
                }

                img.onerror = () => resolve(null);

                const reader = new FileReader();
                reader.onloadend = () => img.src = reader.result;
                reader.readAsDataURL(blob);
            };

            request.onprogress = (e) => onProgress(e.loaded / e.total);

            request.onloadstart = () => onProgress(0);

            request.onerror = () => resolve(null);

            request.send();

            setTimeout(() => {
                if(request.status <= 0) {
                    request.abort();
                    resolve(null);
                }
            }, 10000);
        });
    }

    function AddElement() {
        $("#image_selector").remove();

        const $image_selector = $(`<div id="image_selector">
            <main>
                <div class="options">
                    <div class="online">
                        <img src="../../../img/search_files.svg">
                        <h3>Imagem Online</h3>
                    </div>
                    <div class="local">
                        <input type="file" accept="image/*" ${multiple_select ? "multiple" : ""} hidden />
                        <img src="../../../img/upload_files.svg">
                        <h3>Imagem do computador</h3>
                    </div>
                </div>
                <div class="online_searcher">
                    <div class="loading">
                        <img src="../../../img/person_download.svg">
                        <div>
                            <span>Baixando ${multiple_select ? "as imagens" : "a imagem"} em alta resolução e otimizando...</span>
                            <div class="progress-bar"><span></span></div>
                        </div>
                    </div>
                    <header>
                        <div class="input">
                            <input type="text" maxlength="100">
                            <svg focusable="false" viewBox="0 0 24 24"><path  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                        </div>
                        <div class="buttons">
                            <button class="close btn btn-danger"><i class="fas fa-times"></i></button>
                            <button class="save btn btn-primary"><i class="fas fa-check"></i></button>
                        </div>
                    </header>
                    <div class="list">
                        <div class="selected">
                            <span>Selecionados</span>
                            <div class="list"></div>
                        </div>
                        <div class="results">
                            <div class="none">
                                <i class="fas fa-arrow-up"></i>
                                <img src="../../../img/search_files.svg">
                                <h3>Procure por imagens por toda a internet</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>`);

        $("body").append($image_selector);

        $image_selector.find(">main").click(function (e) {
            e.stopPropagation();
        });

        $image_selector.click(function () {
            $(this).fadeOut(200);
        });

        $image_selector.find("header>.buttons>button.close").click(function () {
            $image_selector.fadeOut(200);
        });

        $image_selector.find(".options>.online").click(function () {
            $("#image_selector>main>div").fadeOut(150);
            setTimeout(() => {
                $("#image_selector>main>.online_searcher").fadeIn(300).css("display", "flex");
            }, 150);
        });

        $image_selector.find(".options>.local").click(function () {
            $(this).find("input[type='file']")[0].click();
        });

        $image_selector.find(".online_searcher>header>.input>input").keyup(function (e) {
            const query = $(this).val();

            if (e.keyCode == 13) Search(query);
        });

        $image_selector.find(".online_searcher>header>.input>svg").click(function () {
            const query = $(this).parent().find(">input").val();

            Search(query);
        });

        $image_selector.find(".online_searcher>header>.buttons>button.save").click(async function () {
            $image_selector.find(".loading").css("display", "flex").fadeIn(100);

            const $progress = $image_selector.find(".loading .progress-bar>span");

            const images_base64 = [];

            for (const image of online_selected_images) {
                const UpdateProgress = (download_progress = 0) => {
                    const image_percent = images_base64.length / online_selected_images.length;
                    const max_percent = online_selected_images.length * 100;
                    const cur_percent = (image_percent * max_percent - 100) + (download_progress * 100);

                    const _progress = (cur_percent / max_percent);

                    $progress.css("width", `${_progress * 100}%`);
                };

                let base64 = await ImageToBase64(image.image_url, UpdateProgress);
                if (!base64) base64 = await ImageToBase64(image.bing_image_url, UpdateProgress);

                images_base64.push(base64);

                UpdateProgress();
            }

            setTimeout(() => callback_images(images_base64), 300);
        });

        $image_selector.find(`.options>.local>input[type="file"]`).change(function (e) {
            if (e.target.files.length == 0) return;

            if (!multiple_select) {
                const reader = new FileReader();

                reader.onloadend = async (e) => {
                    const base64 = await ImageToBase64(reader.result);

                    callback_images(base64);
                }

                reader.readAsDataURL(e.target.files[0]);
            } else {
                let images_base64 = [];

                for (const file of e.target.files) {
                    const reader = new FileReader();

                    reader.onloadend = async () => {
                        const base64 = await ImageToBase64(reader.result);
                        images_base64.push(base64);

                        if (images_base64.length == e.target.files.length) {
                            callback_images(images_base64);
                        }
                    }

                    reader.readAsDataURL(file);
                }
            }
        });

        $image_selector.find(".online_searcher>.list>.results").scroll(async function () {
            if (image_selector_lazy.processing) return;
            if (image_selector_lazy.ended) return;

            const cur_offset = $(this).find(">.item").length;

            const scroll_top = $(this).scrollTop();
            const scroll_max = $(this)[0].scrollHeight - $(this)[0].clientHeight;

            if (scroll_top >= (scroll_max - 800)) {
                image_selector_lazy.processing = true;

                for (let i = 0; i < 32; i++) {
                    $("#image_selector .online_searcher>.list>.results").append(`<div class="skeleton" style="width: ${randomInt(180, 400)}px"></div>`);
                }

                const query = $("#image_selector .online_searcher>header>.input>input").val();
                const images = await SearchForImages(query, cur_offset);

                $("#image_selector .online_searcher>.list>.results>.skeleton").remove();

                for (const image of images) AddImage(image);

                image_selector_lazy.ended = images.length < image_selector_lazy.count;
                image_selector_lazy.processing = false;
            }
        });
    }

    window.ImageSelectorModal = (config = {}, callback) => {
        multiple_select = Boolean(config.multiple);

        image_maxWidth = Number(config.maxWidth);
        image_maxHeight = Number(config.maxHeight);

        if (!image_maxWidth) image_maxWidth = 10000;
        if (!image_maxHeight && image_maxWidth) image_maxHeight = image_maxWidth;
        if (!image_maxHeight) image_maxHeight = 10000;

        online_selected_images = [];

        image_selector_lazy = {
            max: 0,
            ended: false,
            count: 35
        };

        AddElement();

        if (config.query) Search(config.query);

        callback_images = (images_base64) => {
            $("#image_selector").fadeOut(200);

            callback(images_base64);
        };

        $("#image_selector>main>div").hide();

        if (config.online) $("#image_selector>main>.online_searcher").show();
        else $("#image_selector>main>.options").show();

        $("#image_selector").fadeIn(300).css("display", "flex");
    }
});