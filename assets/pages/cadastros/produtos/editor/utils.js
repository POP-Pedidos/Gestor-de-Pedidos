var cur_product;

var task_list = []; // as tasks/promises que serão executadas no final do processo

var TasksTypes = {
    // product: 1,
    image: 2,
    complement_group: 3,
    complement_item: 4,
    pizza_flavor: 5,
}

var $default_product_editor;

var selected_images = [];

$(window).ready(function () {
    $default_product_editor = $("#product_editor").clone();
});

function AddTask(promise, type, list = task_list) {
    if (!promise || !promise instanceof Promise) throw new Error("Missing promise");
    if (!type || !Object.values(TasksTypes).find(_type => _type === type)) throw new Error("Missing TaskType");

    const task = {
        type,
        promise
    }

    task.remove = () => {
        const index = list.findIndex(_task => _task === task);
        if (index > -1) list.splice(index, 1);
    }

    task.AddTask = (promise, type) => {
        if (!task.task_list) task.task_list = [];
        return AddTask(promise, type, task.task_list);
    }

    if (list.task_list) list.task_list.push(task);
    else list.push(task);

    return task;
}

function ResetEditor() {
    $("#product_editor").replaceWith($default_product_editor.clone());

    const $category_selector = $("#product_editor select.category_selector");
    const $printers_selector = $("#product_editor select.printers_selector");
    const $seo_keywords = $("#product_editor select.seo_keywords");

    task_list = []
    selected_images = [];
    cur_product = null;
    seo_thumbnail = null;

    $category_selector.selectpicker({
        noneSelectedText: "Nada selecionado"
    });

    $printers_selector.selectpicker({
        noneSelectedText: "Não Imprimir"
    });

    $printers_selector.append($("<option>").attr("value", "0").text("Não Imprimir"));

    $seo_keywords.tagsinput({
        trimValue: true,
        maxTags: 10,
        maxChars: 15,
    });

    for (const category of categories) $category_selector.append($("<option>").attr("value", category.id_category).text(category.name));
    for (const printer of printers) $printers_selector.append($("<option>").attr("value", printer.id_printer).text(printer.name));

    $category_selector.selectpicker("val", "").selectpicker("refresh");
    $printers_selector.selectpicker("val", "0").selectpicker("refresh");

    $("#product_editor").initTabs();
    $("#product_editor").find("[only_pizza]").toggle(false);

    $("#product_editor>main>form").submit(e => e.preventDefault());

    $(".labelled_input.discount_input>span").on("click", function () {
        const $container = $(this).parent();
        const $input_discount = $container.find(`>input[name="discount"]`);
        const $input_discount_type = $container.find(`>input[name="discount_type"]`);
        const $title_small = $container.parent().find(">span>small");

        $container.toggleClass("currency");

        if ($container.hasClass("currency")) {
            $input_discount.attr("max", "100000");
            $input_discount.attr("step", "0.01");

            $input_discount_type.val("currency");

            $title_small.text("(Reais)");
        } else {
            $input_discount.attr("max", "100");
            $input_discount.attr("step", "1");

            $input_discount_type.val("percentage");

            $title_small.text("(Porcentagem)");
        }
    });
}

function LoadProduct(product) {
    if (!product) return;

    task_list = [];
    selected_images = [];
    cur_product = product;
    seo_thumbnail = null;

    console.log("LoadProduct:", product);

    $("#product_editor header>.name").text(product.name);
    $("#product_editor header>.identification").text(`#${product.id_product}`);
    $("#product_editor header>.published").css("display", "flex");

    $(`#product_editor [name="name"]`).val(product.name).keypress();
    $(`#product_editor [name="brand"]`).val(product.brand);
    $(`#product_editor .details [name="description"]`).val(product.description).keypress();
    $(`#product_editor [name="price"]`).val(product.price.toFixed(2));
    $(`#product_editor [name="discount"]`).val(product.discount);
    $(`#product_editor [name="sku"]`).val(product.sku).keypress();
    $(`#product_editor [name="quantity_type"][value="${product.quantity_type}"]`).prop("checked", true);

    $(`#product_editor [name="is_pizza"]`).prop("checked", product.is_pizza).change();
    $(`#product_editor [name="pizza_price_rule"][value="${product.pizza_price_rule}"]`).prop("checked", true);

    $(`#product_editor [name="title"]`).val(product.seo_title || product.name.slice(0, 64)).keypress();
    $(`#product_editor .seo [name="description"]`).val(product.seo_description || product.description.slice(0, 180)).keypress();

    if (product.discount_type !== "percentage") $("#product_editor .details .discount_input>span.money").click();

    for (const keyword of product.keywords || []) $("#product_editor select.seo_keywords").tagsinput("add", keyword);
    for (const flavor of product.pizza_flavors || []) AddPizzaFlavor(flavor);
    for (const quantity of product.pizza_quantity_flavors || []) $("#product_editor .flavors_selectors>button").filter((i, elem) => elem.innerText == quantity).addClass("selected");
    for (const group of product.complements || []) AddComplementGroup(group);
    for (const image of product.images || []) AddImageToList(image);

    $("#product_editor select.category_selector").selectpicker("val", product.id_category);
    if (product.id_printer > 0) $("#product_editor select.printers_selector").selectpicker("val", product.id_printer);

    for (const dayShift in product.availability_dayShifts) {
        const checked = product.availability_dayShifts[dayShift];

        $(`#product_editor .availability .dayShifts>.list>div`).eq(dayShift).toggleClass("selected", checked)
            .find("input").prop("checked", checked);
    }

    for (const daysOfWeek in product.availability_daysOfWeek) {
        const checked = product.availability_daysOfWeek[daysOfWeek];

        $(`#product_editor .availability .daysOfWeek>.list>div`).eq(daysOfWeek).toggleClass("selected", checked)
            .find("input").prop("checked", checked);
    }

    if (product.thumbnail) LoadThumbnail(product.thumbnail);
    else GenerateThumbnail();

    UpdatePreview();
}

function GenerateThumbnail(image) {
    $("#product_editor .thumbnail_preview").replaceWith($(`<div class="thumbnail_preview skeleton">`));

    const seo_thumb_id = Math.random();
    window.seo_thumb_id = seo_thumb_id;

    async function Generate() {
        console.time(`GenerateThumbnail-${seo_thumb_id}`);

        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!window.seo_thumbnail_loading) {
                    clearInterval(interval);
                    return resolve();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                resolve();
            }, 5000);
        });

        window.seo_thumbnail_loading = true;

        const details = $("#product_editor>main .details").serializeFormJSON();
        const seo = $("#product_editor>main .seo").serializeFormJSON();

        const thumb_data = {
            name: seo.title || details.name,
            description: seo.description || details.description || company.address,
            price: details.is_pizza ? null : Number(details.discount) > 0 ? details.price - ((details.price) * details.discount / 100) : details.price,
            old_price: details.is_pizza ? null : Number(details.discount) > 0 ? details.price : undefined,
            image: image || selected_images[0],
        };

        const promise = internalAsync.generateProductThumbnail(thumb_data);

        const timeout = setTimeout(() => {
            if (window.seo_thumb_id != seo_thumb_id) return;
            Swal.fire("Opss...", `Não foi possível processar a thumbnail do produto porque demorou de mais!`, "error");
        }, 20000);

        promise.then(base64 => {
            if (window.seo_thumb_id != seo_thumb_id) return;

            clearTimeout(timeout);

            seo_thumbnail = `data:image/png;base64,${base64}`;
            LoadThumbnail(seo_thumbnail);
        }).catch(error => {
            if (window.seo_thumb_id != seo_thumb_id) return;

            Swal.fire("Opss...", `Ocorreu um erro e não foi possível processar a thumbnail do produto!`, "error");
            Swal.showValidationMessage(error);
        }).finally(() => {
            console.timeEnd(`GenerateThumbnail-${seo_thumb_id}`);

            if (window.seo_thumb_id != seo_thumb_id) return;

            window.seo_thumbnail_loading = false;
        });
    }

    setTimeout(() => {
        if (seo_thumb_id === window.seo_thumb_id) Generate();
    }, 1000);
}

function LoadThumbnail(image_url) {
    $("#product_editor .thumbnail_preview").replaceWith($(`<div class="thumbnail_preview skeleton">`));

    const image = new Image();

    image.onload = () => $("#product_editor .thumbnail_preview").replaceWith(image);
    image.onerror = () => GenerateThumbnail();

    image.classList.add("thumbnail_preview");

    image.src = image_url;
}

function UpdatePreview() {
    const title = $("#product_editor form.seo .config .title").val();
    const desc = $("#product_editor form.seo .config .desc").val();

    $("#product_editor form.seo .preview .title").text(title || "Novo produto");
    $("#product_editor form.seo .preview .desc").text(desc || company.address || "Aqui ficará a descrição do seu novo produto! 🥰");

    $("#product_editor form.seo .preview .path").html(`${company.subdomain}.${domain}<span> › produto</span><i class="arrow"></i>`);
    $("#product_editor form.seo .preview .link").text(`${company.subdomain}.${domain}/produto`);

    $("#product_editor form.seo .preview img.icon").attr("src", company.image?.small || "../../img/pop-black-icon.jpg");
}

function UpdateImageSelectorActions() {
    const $list = $("#product_editor .image_selector>.container>.list");

    $list.find(">div>.actions>button").show();

    $list.find(">div:first-child>.actions>.move-prev").hide();
    $list.find(">div:last-child>.actions>.move-next").hide();
}

function AddImageToList(image) {
    const is_new = typeof image === "string" && /data:.*;base64,/.test(image);

    let task;

    if (is_new) {
        task = AddTask(function () {
            return FetchAPI(`/product/${this.product.id_product}/image`, {
                method: "POST",
                body: { base64: image }
            });
        }, TasksTypes.image);
    }

    selected_images.push(is_new ? image : image.medium);

    const $image = $(`<div><img>
        <div class="actions">
            <button class="move-prev" type="button" hidden><i class="fas fa-angle-left"></i></button>
            <button class="delete" type="button"><i class="fas fa-trash"></i></button>
            <button class="move-next" type="button" hidden><i class="fas fa-chevron-right"></i></button>
        </div>
    </div>`);

    $image.find(">img").attr("src", is_new ? image : image.medium);

    $image.on("click", ">.actions>.move-prev", function () {
        console.warn("Image prev not implemented");

        $image.insertBefore($image.prev());

        const cur_index = selected_images.findIndex(img => img === image);
        array_move(selected_images, cur_index, cur_index - 1);

        UpdateImageSelectorActions();
        GenerateThumbnail();
    });

    $image.on("click", ">.actions>.move-next", function () {
        console.warn("Image prev next implemented");

        $image.insertAfter($image.next());

        const cur_index = selected_images.findIndex(img => img === image);
        array_move(selected_images, cur_index, cur_index + 1);

        UpdateImageSelectorActions();
        GenerateThumbnail();
    });

    $image.on("click", ">.actions>.delete", function () {
        if (task) if (task) task.remove();

        if (!is_new && image?.id) {
            task = AddTask(function () {
                return FetchAPI(`/product/${this.product.id_product}/image/${image.id}`, {
                    method: "DELETE",
                });
            }, TasksTypes.image);
        }

        selected_images.splice(selected_images.findIndex(img => img === image), 1);

        $image.fadeOut(300, () => {
            $image.remove();
            UpdateImageSelectorActions();
        });

        if (selected_images?.length == 1) GenerateThumbnail();
    });

    $("#product_editor .image_selector .list").append($image);

    if (is_new && selected_images.length === 1) GenerateThumbnail();

    UpdateImageSelectorActions();
}

function AddPizzaFlavor(flavor) {
    let task;

    function TaskUpdate() {
        if (task) task.remove();

        task = AddTask(function () {
            return FetchAPI(`/product/${this.product.id_product}/pizza_flavor${flavor ? `/${flavor.id}` : ""}`, {
                method: flavor ? "PUT" : "POST",
                body: {
                    name: $item.find("input.name").val() || flavor?.name,
                    price: $item.find("input.price").val() || flavor?.price,
                    description: $item.find("textarea.desc").val() || flavor?.description,
                }
            });
        }, TasksTypes.pizza_flavor);
    }

    const $list = $("#product_editor .pizza_flavors>.list");

    const $item = $(`<div class="item row flex-nowrap">
        <div class="flex-fill">
            <div class="row mt-3 flex-nowrap">
                <div class="d-flex flex-column mr-4 flex-fill">
                    <h5>Nome do sabor</h5>
                    <input type="text" class="form-control name" minlength="5" maxLength="45" required>
                    <small>0/45</small>
                </div>
                <div class="d-flex flex-column">
                    <h5>Preço</h5>
                    <div class="labelled_input">
                        <span>R$</span>
                        <input class="price" type="number" placeholder="0,00" min="0" step=".01">
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column">
                <h5>Descrição <small>(Opcional)</small></h5>
                <textarea type="text" class="form-control desc" maxLength="120"></textarea>
                <small>0/120</small>
            </div>
        </div>
        <div class="actions">
            <button class="delete"><i class="fas fa-trash"></i></button>
        </div>
    </div>`);

    if (flavor) {
        $item.find("input.name").val(flavor.name);
        $item.find("input.price").val(flavor.price.toFixed(2));
        $item.find("textarea.desc").val(flavor.description);
    } else {
        TaskUpdate();
    }

    $item.find(".actions>.delete").on("click", function () {
        $item.remove();
        if (task) task.remove();

        if (flavor?.id) {
            task = AddTask(function () {
                return FetchAPI(`/product/${this.product.id_product}/pizza_flavor/${flavor.id}`, {
                    method: "DELETE"
                });
            }, TasksTypes.pizza_flavor);
        }
    });

    $item.find("input.name, input.price, textarea.desc").on("keyup change", TaskUpdate);

    $list.append($item);
}

function DuplicateProduct(product, $section) {
    const $skeleton = AddProductSkeleton($section);

    FetchAPI(`/product`, {
        method: "POST",
        body: product,
    }).then(new_product => {
        const $product = AddProduct($section, new_product);

        $skeleton.replaceWith($product);
    }).catch(error => {
        Swal.fire("Opss...", `Ocorreu um erro ao tentar duplicar o produto!`, "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        $("#product_duplicate").fadeOut(200);
    });
}

function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
};