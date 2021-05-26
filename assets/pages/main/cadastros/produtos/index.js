var seo_thumbnail = null;

var last_product_filter_text;
var last_product_filter_timeout;

$("#product_filter>input").keyup(function (e) {
    const cur_val = $(this).val();

    if (e.keyCode == 13 || !cur_val) {
        last_product_filter_text = cur_val;
        clearTimeout(last_product_filter_timeout);
        SearchForProduct();
    } else {
        last_product_filter_text = cur_val;
        clearTimeout(last_product_filter_timeout);

        last_product_filter_timeout = setTimeout(() => {
            if (last_product_filter_text == cur_val) SearchForProduct();
        }, 1000);
    }
});

function SearchForProduct() {
    $(".page-header-filter-container>.spinner-border").fadeIn(200);
    $(".product-list").empty();
    $(".page-header-filter-container>.spinner-border").fadeOut(200);

    NewTabInstance();

    lazy_loading.Reset({
        state: true,
    });
}

$("#btnModalProduto").click(() => ShowProductEditor());

function AddProductSection(category) {
    const $section = $(`<section>
        <header>
            <span class="category"></span>
        </header>
        <main></main>
    </section>`);

    $section.data({ sortable: category.sortable });

    $section.attr("id_category", category.id_category);
    $section.find(".category").text(category.name);

    $(".product-list").append($section);

    if (category.sortable != false) {
        new Sortable($section.find(">main")[0], {
            handle: ".move",
            animation: 200,
            onStart: function () {
                $section.find(">main>div").addClass("is-dragging");
            },
            onEnd: function (e) {
                $section.find(">main>div").removeClass("is-dragging");

                if (e.newIndex === e.oldIndex) return;

                const $this = $(e.item);
                const $move = $this.find(".move");

                const direction = e.newIndex > e.oldIndex ? "down" : "up";
                const product = $this.data();

                const $prev_elem = $this.prev();
                const $next_elem = $this.next();

                let new_order;

                if (direction === "up") {
                    new_order = $next_elem.data("order");
                } else if (direction === "down") {
                    new_order = $prev_elem.data("order");
                }

                if (!new_order) return;

                $move.addClass("loading");
                $section.addClass("freeze-loading");

                FetchAPI(`/product/${product.id_product}`, {
                    method: "PUT",
                    body: {
                        order: new_order,
                    }
                }).then(data => {
                    console.log("updated product_data:", data);

                    if (direction === "up") {
                        // tudo que está depois adiciona 1
                        $this.nextAll().each(function () {
                            $(this).attr("order", $(this).data("order") + 1);
                            $(this).data("order", $(this).data("order") + 1);
                        });
                    } else if (direction === "down") {
                        // tudo que estiver antes remove 1
                        $this.prevAll().each(function () {
                            $(this).attr("order", $(this).data("order") - 1);
                            $(this).data("order", $(this).data("order") - 1);
                        });
                    }

                    $this.data("setData")(data);
                    $this.attr("order", data.order);
                }).catch(error => {
                    if (!error) return;

                    Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar o produto!`, "error");
                    Swal.showValidationMessage(error);

                    if (direction === "up") {
                        $this.insertAfter($section.find(">main>div").eq(e.oldIndex));
                    } else if (direction === "down") {
                        $this.insertBefore($section.find(">main>div").eq(e.oldIndex));
                    }
                }).finally(() => {
                    $move.removeClass("loading");
                    $section.removeClass("freeze-loading");
                });
            }
        });
    }

    return $section;
}

function AddProductSectionSkeleton() {
    const $section = $(`<section>
        <header>
            <span class="category skeleton">.</span>
        </header>
        <main></main>
    </section>`);

    $(".product-list").append($section);

    return $section;
}

function AddProductSkeleton($section) {
    const $skeleton = $(`<div class="is_skeleton">
        <div class="move"></div>
        <div class="left">
            <div class="image skeleton"></div>
            <span class="name skeleton">.</span>
        </div>
        <div class="labelled_input skeleton">
            <span>R$</span>
            <input type="number" name="price" placeholder="0,00" min="0" max="100000" step=".01">
        </div>
        <div class="switch_enable skeleton">
            <div class="indicator"></div>
            <span class="off">Pausar</span>
            <span class="on">Ativado</span>
        </div>
    </div>`);

    $section.find(">main").append($skeleton);

    return $skeleton;
}

function AddProduct($section, product, $skeleton) {
    const $product = $(`<div id_product="${product.id_product}">
        <div class="move">
            <i class="fas fa-arrows-alt"></i>
            <div class="spinner-border"></div>
        </div>
        <div class="left">
            <img class="image">
            <span class="name"></span>
        </div>
        <div class="labelled_input">
            <span>R$</span>
            <input type="number" name="price" placeholder="0,00" min="0" max="100000" step=".01" required>
        </div>
        <div class="switch_enable">
            <input type="checkbox" ${product.enabled ? `checked ` : ""}hidden>
            <div class="indicator"></div>
            <span class="off">Pausar</span>
            <span class="on">Ativado</span>
        </div>
        <div class="options-btn">
            <img src="../../../images/options.svg">
            <div>
                <div>
                    <span class="edit"><i class="fas fa-edit"></i>Editar</span>
                    <span class="duplicate"><i class="fas fa-copy"></i>Duplicar</span>
                    <span class="delete"><i class="fas fa-trash"></i>Apagar</span>
                </div>
            </div>
        </div>
    </div>`);

    if ($section.data("sortable") != null && $section.data("sortable") == false) {
        $product.find(">.move").remove();
    }

    $product.data(product);
    $product.attr("order", product.order);

    $product.data("setData", (data) => {
        product = data;
        $product.data(product);
    });

    $product.find(".switch_enable").initSwitchEnable();

    $product.find(".image").attr("src", !!product.images?.length ? product.images[0].small : `${api_url}/static/img/no-image.svg`);
    $product.find(".name").text(product.name);
    $product.find(".labelled_input>input").val(Number(product.price).toFixed(2));

    $product.find(">.left").click(function () {
        ShowProductEditor(product);
    });

    $product.find(".switch_enable>input").change(function () {
        const $this = $(this);
        const enabled = $this.prop("checked");

        FetchAPI(`/product/${product.id_product}`, {
            body: { enabled },
            method: "PUT"
        }).then(new_data => {
            product = new_data;
        }).catch(error => {
            $this.prop("checked", product.enabled);
            Swal.fire("Opss...", `Ocorreu um erro ao tentar ${enabled ? "ativar" : "desativar"} o produto "${product.name}"!`, "error");
            Swal.showValidationMessage(error);
        });
    });

    $product.find(".labelled_input>input").change(function () {
        const $this = $(this);
        const price = $this.val();

        FetchAPI(`/product/${product.id_product}`, {
            body: { price },
            method: "PUT"
        }).then(new_data => {
            product = new_data;
        }).catch(error => {
            $this.val(product.price);
            Swal.fire("Opss...", `Ocorreu um erro ao tentar alterar o preço do produto "${product.name}"!`, "error");
            Swal.showValidationMessage(error);
        });
    });

    $product.find(".options-btn .edit").click(function () {
        ShowProductEditor(product);
    });

    $product.find(".options-btn .duplicate").click(function () {
        DuplicateProduct(product, $section);
    });

    $product.find(".options-btn .delete").click(function () {
        Swal.fire({
            title: "Muita calma!!",
            html: `Você tem certeza que deseja excluir o produto <b>${product.name}</b>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: () => {
                return new Promise((resolve) => {
                    FetchAPI(`/product/${product.id_product}`, {
                        method: "DELETE"
                    }).then(() => {
                        $product.remove();
                        resolve();
                        Swal.fire("Sucesso!", `O produto "${product.name}" foi apagado!`, "success");
                        if (!$section.find(">main>div").length) $section.find(">main").boo("Não há nada mais nada por aqui!");
                    }).catch(error => {
                        Swal.fire("Opss...", `Ocorreu um erro ao tentar apagar o produto "${product.name}"!`, "error");
                        Swal.showValidationMessage(error);
                    });
                });
            }
        });
    });

    $section.find(".boo-container").remove();

    const existent_product = $skeleton || $section.find(`>main>div[id_product="${product.id_product}"]`);

    if (!!existent_product.length) {
        existent_product.replaceWith($product);
    } else {
        $section.find(">main").append($product);
    }

    return $product;
}

FetchAPI(`/printers`).then(data => {
    printers = data;
});

function AddProductSkeletons($section, offset, max, page_limit) {
    const count = !!max ? (max - offset > page_limit ? page_limit : max - offset) : page_limit;
    let $skeletons = $();

    function add(el) {
        $skeletons = $skeletons.add(el);
    }

    for (let i = 0; i < count; i++) add(AddProductSkeleton($section));

    return $skeletons;
}

var lazy_loading = new LazyLoading({
    container: ".product-list-container",
    threshold: 0.3,
    doHandle: function (state) {
        const $element = $(".product-list>section:last-child>main>div:last-child");
        if (!$element.length) return true;
        if (state.max_categories == null) return true;

        if ($element.length) {
            return $element.offset().top - $element.height() - 400 < this.container.height();
        }
    },
    doLoop: 10,
    state: {
        page_limit: 10,

        product_offset: 0,
        max_products: null,

        category_offset: 0,
        max_categories: null,

        isLoading: false,
    }
});

lazy_loading.onHandle = async (state) => {
    if (state.isLoading) return false;

    if (state.max_categories != null && !categories[state.category_offset]) return false;

    if (state.category_offset === 0 && state.product_offset === 0) {
        FetchAPI(`/company/${company.id_company}/product`, {
            instance_check: true,
            params: { limit: 0 }
        }).then(data => {
            $(".product-list-container>.max-results").text(data.metadata.max > 0 ? `${data.metadata.max} resultado${!!data.metadata.max ? "s" : ""}` : "Nenhum resultado");
        }).finally(() => {
            $(".product-list-container .max-results").removeClass("skeleton");
        });

    }

    const search_filter = $("#product_filter>input").val();

    if (!!search_filter) {
        if (state.max_products != null && state.product_offset >= state.max_products) return;

        if (state.max_products == null) state.isLoading = true;

        const $section = (state.product_offset == 0) ? AddProductSection({ name: "Resultados da pesquisa", sortable: false }, { name: `"${search_filter}"` }) : $(".product-list>section:last-child");

        const $skeletons = AddProductSkeletons($section, state.product_offset, state.max_products, state.page_limit);

        const params = {
            search: search_filter,
            offset: state.product_offset,
            ignore_disabled: false,
            limit: state.page_limit,
        };

        FetchAPI(`/company/${company.id_company}/product`, {
            instance_check: true,
            params,
        }).then(data => {
            state.max_products = data.metadata.max;
            $(".product-list-container>.max-results").text(`${state.max_products} resultado${state.max_products > 1 ? "s" : ""}`);

            const products = data.results;

            if (!!products.length) {
                for (const product of products) AddProduct($section, product);
            } else {
                $section.find(">main").boo("Não há nada aqui!!");
            }

            state.product_offset += products.length;
        }).finally(() => {
            $skeletons.remove();
            state.isLoading = false;
        });
    } else {
        if (!state.max_categories || !categories || (categories?.length <= state.category_offset && categories?.length < state.max_categories)) {
            state.isLoading = true;

            const $section_skeleton = AddProductSectionSkeleton();
            const $skeletons = AddProductSkeletons($section_skeleton, 0, state.max_products, state.page_limit);

            await FetchAPI(`/company/${company.id_company}/categories`, {
                instance_check: true,
                params: {
                    include_disabled: true,
                    offset: state.category_offset,
                    limit: 100,
                }
            }).then(data => {
                state.max_categories = data.metadata.max;

                categories = [...categories, ...data.results];
            }).finally(() => {
                $section_skeleton.remove();
                $skeletons.remove();
                state.isLoading = false;

                lazy_loading.Trigger();
            });
        }

        if (state.max_categories === 0) {
            $(".product-list-container .page-header .skeleton").removeClass("skeleton");
            $(".product-list").boo("Não há nada aqui!");
            return;
        }

        const cur_category = categories[state.category_offset];
        if (!cur_category) return;

        state.max_products = cur_category.max_products;

        if (cur_category.max_products > 0) {
            const $section = (state.product_offset == 0) ? AddProductSection(cur_category) : $(".product-list>section:last-child");

            const $skeletons = AddProductSkeletons($section, state.product_offset, cur_category.max_products, state.page_limit);

            const params = {
                id_category: cur_category.id_category,
                offset: state.product_offset,
                ignore_disabled: false,
                limit: state.page_limit,
            };

            let skeleton_index = 0;

            FetchAPI(`/company/${company.id_company}/product`, {
                instance_check: true,
                params,
            }).then(data => {

                const products = data.results;

                for (const product of products) {
                    if ($skeletons[skeleton_index]) {
                        AddProduct($section, product, $($skeletons[skeleton_index]));

                        skeleton_index++;
                    } else AddProduct($section, product);
                }
            }).finally(() => {
                $skeletons.remove();
                $(".product-list-container .page-header .skeleton").removeClass("skeleton");
            });

            state.product_offset += state.page_limit;

            if (state.product_offset >= cur_category.max_products) {
                state.category_offset += 1;
                state.product_offset = 0;
            }
        } else {
            const $section = AddProductSection(cur_category);
            $section.find(">main").boo("Não há nada aqui!!");

            state.category_offset += 1;
            state.product_offset = 0;

            $(".product-list-container .page-header .skeleton").removeClass("skeleton");
        }
    }
}

categories = [];
lazy_loading.Init();

$(window).ready(function () {
    if (window.product_toLoad) {
        ShowProductEditor(window.product_toLoad);
        delete window.product_toLoad;
    }
});