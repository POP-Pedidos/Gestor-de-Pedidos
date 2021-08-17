var seo_thumbnail;

function ShowProductEditor(product) {
    ResetEditor();

    $(".header").css("box-shadow", "none");
    $("#product_editor >header>i.back").click(CloseProductEditor);

    $("#product_editor .details input.name").on("keyup", function () {
        const $this = $(this);
        const $name = $("#product_editor>header>.name");
        const $input_seo_title = $("#product_editor .seo input.title");

        const value = $this.val();

        if (!!value) {
            $name.text(value);

            $name.addClass("editing");

            clearTimeout($this.data("timeout"));

            $this.data("timeout", setTimeout(() => {
                $name.removeClass("editing");
            }, 3000));
        } else {
            clearTimeout($this.data("timeout"));
            $name.text("Novo produto").removeClass("editing");
        }

        if ($input_seo_title.val().length < 10 || LevenshteinDistance($input_seo_title.val(), value) <= 10) {
            $input_seo_title.val(value.slice(0, 64));
        }
    }).on("change", function () {
        const $input_seo_title = $("#product_editor .seo input.title");

        $input_seo_title.change();
    });

    $("#product_editor .details textarea.desc").on("keyup", function () {
        const $input_seo_desc = $("#product_editor .seo textarea.desc");
        const value = $(this).val();

        if ($input_seo_desc.val().length < 15 || LevenshteinDistance($input_seo_desc.val(), value) <= 10) $input_seo_desc.val(value.slice(0, 180)).change();
    });

    $("#product_editor #switch_pizza").on("change", function () {
        const checked = $(this).is(":checked");

        if (checked) {
            $("#product_editor [only_pizza]").fadeIn(200);
            $(`#product_editor .pizza_price_rule input`).attr("required", true);
        }
        else {
            $("#product_editor [only_pizza]").fadeOut(200);
            $(`#product_editor .pizza_price_rule input`).attr("required", false);
        }
    });

    $("#product_editor .image_selector .add").click(function () {
        $("#product_image_selector>main>div").hide();
        $("#product_image_selector>main>.options").show();

        const query = $("#product_editor .details input.name").val().split(" ").slice(0, 3).join(" ");

        ImageSelectorModal({ query, multiple: true, maxWidth: 840 }, base64_list => {
            for (const base64 of base64_list) AddImageToList(base64);

            if (!cur_product?.images.length) GenerateThumbnail();
        });
    });

    $("#product_editor .pizza_flavors>.create-new>button").click(function () {
        AddPizzaFlavor();
    });

    $("#product_editor form.seo input.title").on("change", function () {
        GenerateThumbnail();
        UpdatePreview();
    });

    $("#product_editor form.seo textarea.desc").on("change", function () {
        GenerateThumbnail();
        UpdatePreview();
    });

    $("#product_editor .complements>.create-new>button").click(function () {
        ShowComplementGroupEditor();
    });

    $("#product_editor>main>.availability .list>div").click(function () {
        $(this).toggleClass("selected");
        $(this).find("input").prop("checked", $(this).hasClass("selected"));
    });

    $("#product_editor .flavors_selectors>button").click(function (e) {
        e.preventDefault();

        $(this).toggleClass("selected");

        $(this).parent().find(">button")[0].setCustomValidity("");
    });

    $("#product_editor >header>.actions>.cancel").click(CloseProductEditor);

    $("#product_editor >header>.actions>.save").click(async function () {
        try {
            const $this = $(this);

            const $main = $("#product_editor>main");
            const $nav = $("#product_editor>nav");

            const $tab_details = $nav.find(">.details");
            const $tab_pizza_flavors = $nav.find(">.pizza_flavors");
            const $tab_availability = $nav.find(">.availability");
            const $tab_seo = $nav.find(">.seo");

            const $form_details = $main.find(".details");
            const $form_seo = $main.find(".seo");
            const $form_pizza_flavors = $main.find(".pizza_flavors");
            const $pizza_quantity_flavors = $form_details.find(".pizza_quantity_flavors>.flavors_selectors");

            const details = $form_details.serializeFormJSON();
            const seo = $form_seo.serializeFormJSON();

            const dayShifts_data = $("#product_editor>main .availability form.dayShifts").serializeFormJSON();
            const daysOfWeek_data = $("#product_editor>main .availability form.daysOfWeek").serializeFormJSON();

            const availability_shifts = [];

            if (dayShifts_data.morning) availability_shifts.push("morning");
            if (dayShifts_data.afternoon) availability_shifts.push("afternoon");
            if (dayShifts_data.night) availability_shifts.push("night");

            const availability_weekdays = [];

            if (daysOfWeek_data.monday) availability_weekdays.push("monday");
            if (daysOfWeek_data.tuesday) availability_weekdays.push("tuesday");
            if (daysOfWeek_data.wednesday) availability_weekdays.push("wednesday");
            if (daysOfWeek_data.thursday) availability_weekdays.push("thursday");
            if (daysOfWeek_data.friday) availability_weekdays.push("friday");
            if (daysOfWeek_data.saturday) availability_weekdays.push("saturday");
            if (daysOfWeek_data.sunday) availability_weekdays.push("sunday");

            const selected_quantity_flavors = $pizza_quantity_flavors.find(">button.selected").map((i, elem) => Number($(elem).text())).get();

            $nav.find(">span").removeClass("warning");

            $pizza_quantity_flavors.find(">button")[0].setCustomValidity(!selected_quantity_flavors.length && details.is_pizza ? "Marque pelo menos uma opção" : "");

            if (!$form_details[0].checkValidity()) {
                $tab_details.addClass("warning").click();
                $form_details.find(`[type="submit"]`).click();
                return;
            }

            if (!$form_seo[0].checkValidity()) {
                $tab_seo.addClass("warning").click();
                $form_seo.find(`[type="submit"]`).click();
                return;
            }

            if (details.is_pizza == true) {
                if (!$form_pizza_flavors[0].checkValidity()) {
                    $tab_pizza_flavors.addClass("warning").click();
                    $form_pizza_flavors.find(`[type="submit"]`).click();
                    return;
                }

                details.pizza_quantity_flavors = selected_quantity_flavors;
            }

            details.id_printer = details.id_printer > 0 ? details.id_printer : null;

            if (company.use_shifts && availability_shifts.length === 0) {
                $tab_availability.addClass("warning").click();
                Swal.fire("Opss...", "O seu produto tem que ser vendido pelo menos em um turno do dia!", "warning");
                return;
            }

            if (availability_weekdays.length === 0) {
                $tab_availability.addClass("warning").click();
                Swal.fire("Opss...", "O seu produto tem que ser vendido pelo menos em um dia da semana!", "warning");
                return;
            }

            $this.addClass("loading");

            const images_tasks = task_list.filter(task => task.type === TasksTypes.image);

            const complements_tasks = task_list.filter(task => task.type === TasksTypes.complement_group);
            const complements_groups_items_tasks_count = task_list.filter(task => task.type === TasksTypes.complement_group).reduce((accumulator, task) => {
                return accumulator + (task.task_list || []).length;
            }, complements_tasks.length);

            const pizza_flavors_tasks = task_list.filter(task => task.type === TasksTypes.pizza_flavor);

            $("#product_editor-save").fadeIn(200).css("display", "flex");

            $("#product_editor-save main>section").show().removeClass("success active");
            $("#product_editor-save main>section>.stage").empty();
            $("#product_editor-save main>section>.progress").hide().css("width", "0%").removeClass("hide");

            if (!window.seo_thumbnail_loading) $("#product_editor-save main>section.thumbnail").hide();
            if (!images_tasks.length) $("#product_editor-save main>section.images").hide();
            if (!complements_groups_items_tasks_count) $("#product_editor-save main>section.complements").hide();
            if (!pizza_flavors_tasks.length) $("#product_editor-save main>section.pizza_flavors").hide();

            if (window.seo_thumbnail_loading) {
                $("#product_editor-save main>section.thumbnail").addClass("active");
                $("#product_editor-save main>section.thumbnail>.stage").text(`0/1`);
                $("#product_editor-save main>section.thumbnail>.progress").fadeIn(200);

                await new Promise((resolve) => {
                    const interval = setInterval(() => {
                        if (!!seo_thumbnail && !window.seo_thumbnail_loading) {
                            clearInterval(interval);
                            return resolve();
                        }
                    }, 100);

                    setTimeout(() => {
                        if (interval) {
                            clearInterval(interval);
                            return resolve();
                        }
                    }, 20000);
                });

                if (!seo_thumbnail && !product?.thumbnail) {
                    $tab_seo.addClass("warning").click();
                    Swal.fire("Opss...", "Não foi possível processar a thumbnail!", "error");
                    $("#product_editor-save").hide();
                    return $this.removeClass("loading");
                }

                $("#product_editor-save main>section.thumbnail").removeClass("active").addClass("success");
                $("#product_editor-save main>section.thumbnail>.stage").text(`1/1`);
                $("#product_editor-save main>section.thumbnail>.progress").css("width", "100%").addClass("hide");

                await Sleep(600);
            }

            $("#product_editor-save main>section.product").addClass("active");
            $("#product_editor-save main>section.product>.stage").text(`0/1`);
            $("#product_editor-save main>section.product>.progress").fadeIn(200);

            let product_data;

            await FetchAPI(product ? `/product/${product.id_product}` : "/product", {
                method: product ? "PUT" : "POST",
                body: {
                    ...details,
                    availability_shifts,
                    availability_weekdays,
                    thumbnail: seo_thumbnail || undefined,
                    keywords: (typeof seo.keywords === "string") ? [seo.keywords] : seo.keywords,
                    seo_title: seo.title,
                    seo_description: seo.description,
                }
            }).then(data => {
                product_data = data;
                if (product) console.log("updated product_data:", data);
                else console.log("created product_data:", data);
            }).catch(error => {
                if (error === "sku already in use") Swal.fire("Opss...", `O pdv informado já está em uso por outro produto!`, "error");
                else {
                    Swal.fire("Opss...", `Ocorreu um erro ao tentar ${product ? "atualizar" : "criar"} o produto!`, "error");
                    Swal.showValidationMessage(error);
                }
            }).finally(() => {
                $this.removeClass("loading");
            });

            if (!product_data) {
                $("#product_editor-save").hide();
                return console.error("product_data not set");
            }

            $("#product_editor-save main>section.product").removeClass("active").addClass("success");
            $("#product_editor-save main>section.product>.stage").text(`1/1`);
            $("#product_editor-save main>section.product>.progress").css("width", "100%").addClass("hide");

            await Sleep(600);

            if (images_tasks?.length) {
                $("#product_editor-save main>section.images").addClass("active");
                $("#product_editor-save main>section.images>.stage").text(`0/${images_tasks.length}`);
                $("#product_editor-save main>section.images>.progress").fadeIn(200);

                for (let index = 0; index < images_tasks.length; index++) {
                    try {
                        const task = images_tasks[index];

                        await task.promise.call({
                            product: product_data
                        });
                    } catch (err) {
                        console.error("Image Task Error:", err);

                        Swal.fire({
                            title: "Opss...",
                            text: "Não foi possível sincronizar uma imagem com o servidor!",
                            icon: "error",
                        });

                        Swal.showValidationMessage(err);
                    } finally {
                        $("#product_editor-save main>section.images>.progress").css("width", `${((index + 1) / images_tasks.length) * 100}%`);
                        $("#product_editor-save main>section.images>.stage").text(`${index + 1}/${images_tasks.length}`);
                    }
                }

                $("#product_editor-save main>section.images").removeClass("active").addClass("success");
                $("#product_editor-save main>section.images>.progress").css("width", `100%`).addClass("hide");

                await Sleep(600);
            }

            if (complements_tasks?.length) {
                $("#product_editor-save main>section.complements").addClass("active");
                $("#product_editor-save main>section.complements>.progress").fadeIn(200);

                let counter = 0;

                function UpdateProgress() {
                    $("#product_editor-save main>section.complements>.progress").css("width", `${counter / complements_groups_items_tasks_count * 100}%`);
                    $("#product_editor-save main>section.complements>.stage").text(`${counter}/${complements_groups_items_tasks_count}`);
                }

                UpdateProgress();

                for (let index = 0; index < complements_tasks.length; index++) {
                    try {
                        const task = complements_tasks[index];

                        const complement_group = await task.promise.call({
                            product: product_data
                        });

                        for (const item_index in task.task_list) {
                            try {
                                const item_task = task.task_list[item_index];

                                await item_task.promise.call({
                                    product: product_data,
                                    complement_group
                                });
                            } catch (err) {
                                console.error("Complement Item Task Error:", err);

                                Swal.fire({
                                    title: "Opss...",
                                    text: "Não foi possível sincronizar um item de um complemento com o servidor!",
                                    icon: "error",
                                });

                                Swal.showValidationMessage(err);
                            } finally {
                                counter++;
                                UpdateProgress();
                            }
                        }
                    } catch (err) {
                        console.error("Complement Task Error:", err);

                        Swal.fire({
                            title: "Opss...",
                            text: "Não foi possível sincronizar um complemento com o servidor!",
                            icon: "error",
                        });

                        Swal.showValidationMessage(err);
                    } finally {
                        counter++;
                        UpdateProgress();
                    }
                }

                $("#product_editor-save main>section.complements").removeClass("active").addClass("success");
                $("#product_editor-save main>section.complements>.progress").css("width", `100%`).addClass("hide");

                await Sleep(600);
            }

            if (pizza_flavors_tasks?.length) {
                $("#product_editor-save main>section.pizza_flavors").addClass("active");
                $("#product_editor-save main>section.pizza_flavors>.stage").text(`0/${pizza_flavors_tasks.length}`);
                $("#product_editor-save main>section.pizza_flavors>.progress").fadeIn(200);

                for (let index = 0; index < pizza_flavors_tasks.length; index++) {
                    try {
                        const task = pizza_flavors_tasks[index];

                        await task.promise.call({
                            product: product_data
                        });
                    } catch (err) {
                        console.error("PizzaFlavor Task Error:", err);

                        Swal.fire({
                            title: "Opss...",
                            text: "Não foi possível sincronizar um sabor da pizza com o servidor!",
                            icon: "error",
                        });

                        Swal.showValidationMessage(err);
                    } finally {
                        $("#product_editor-save main>section.pizza_flavors>.progress").css("width", `${index + 1 / images_tasks.length * 100}%`);
                        $("#product_editor-save main>section.pizza_flavors>.stage").text(`${index + 1}/${images_tasks.length}`);
                    }
                }

                $("#product_editor-save main>section.pizza_flavors").removeClass("active").addClass("success");
                $("#product_editor-save main>section.pizza_flavors>.progress").css("width", `100%`).addClass("hide");

                await Sleep(600);
            }

            $("#product_editor-save main>section.finally").addClass("active");
            $("#product_editor-save main>section.finally>.stage").text(`0/1`);
            $("#product_editor-save main>section.finally>.progress").fadeIn(200);

            FetchAPI(`/product/${product_data.id_product}`, { instance_check: true, }).then(new_data => {
                console.log("New Product Data:", new_data);

                if (product && product.id_category !== new_data.id_category) {
                    $(`.product-list>section[id_category="${product.id_category}"]>main>div[id_product="${new_data.id_product}"]`).remove();
                }

                let $section = $(`.product-list>section[id_category="${new_data.id_category}"]`);
                if ($section.length > 0) AddProduct($section, new_data);
                else {
                    $section = $(`.product-list>section>main>div[id_product="${new_data.id_product}"]`).parent().parent();
                    AddProduct($section, new_data);
                }

                $("#product_editor-save main>section.finally").removeClass("active").addClass("success");
                $("#product_editor-save main>section.finally>.stage").text(`1/1`);
                $("#product_editor-save main>section.finally>.progress").css("width", `100%`);
            }).catch(err => {
                console.error("Get new product data Error:", err);

                Swal.fire({
                    title: "Opss...",
                    text: "Não foi possível recuperar do servidor os novos dados do produto!",
                    icon: "error",
                });

                Swal.showValidationMessage(err);
            }).finally(() => {
                setTimeout(() => {
                    $("#product_editor-save").hide();
                    CloseProductEditor();
                }, 1000);
            })
        } catch (err) {
            Swal.fire("Opss...", "Ocorreu um erro!", "error");
            Swal.showValidationMessage(err);

            $("#product_editor-save").hide();
        }
    });

    if (product) LoadProduct(product);
    else {
        GenerateThumbnail();
        UpdatePreview();
    }

    $("#product_editor").fadeIn(200);
}

function CloseProductEditor() {
    $(".header").css("box-shadow", "");
    $("#product_editor").fadeOut(200);
    window.seo_thumb_id = null;
}