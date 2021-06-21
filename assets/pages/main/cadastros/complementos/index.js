var last_complement_filter_text;
var last_complement_filter_timeout;

$("#complement_filter>input").keyup(function (e) {
    const cur_val = $(this).val();

    if (e.keyCode == 13 || !cur_val) {
        last_complement_filter_text = cur_val;
        clearTimeout(last_complement_filter_timeout);
        SearchForComplement();
    } else {
        last_complement_filter_text = cur_val;
        clearTimeout(last_complement_filter_timeout);

        last_complement_filter_timeout = setTimeout(() => {
            if (last_complement_filter_text == cur_val) SearchForComplement();
        }, 1000);
    }
});

function SearchForComplement() {
    $(".page-header-filter-container>.spinner-border").fadeIn(200);
    $(".complement-list").empty();
    $(".page-header-filter-container>.spinner-border").fadeOut(200);

    NewTabInstance();

    lazy_loading.Reset({
        state: true,
    });
}

function addProductToComplement($complement, product) {
    const $product = $(`<div>
        <img class="image">
        <span class="name">Erro</span>
        <span class="price">R$ 00,00</span>
    </div>`);

    const complement_item = $complement.data();
    const product_complement_items = [];

    for (const complement of product.complements) {
        for (const item of complement.items) product_complement_items.push(item);
    }

    const product_complement_item = product_complement_items.find(item => item.name === complement_item.name);

    $product.find(">.image").attr("src", product.images[0]?.small || `${api_url}/static/images/no-image.svg`);
    $product.find(">.name").text(`${product.name} (${MoneyFormat(product.price)})`);
    $product.find(">.price").text(product_complement_item?.price ? MoneyFormat(product_complement_item.price) : "");

    // $product.on("click", function () {
    //     window.product_toLoad = product;
    //     $(`[for_panel="cadastros_produtos"]`).click();
    // });

    $complement.find(">main").append($product);
}

function addProductSkeletonToComplement($complement) {
    const $skeleton = $(`<div class="is_skeleton">
        <div class="image skeleton"></div>
        <span class="name skeleton">Erro</span>
        <span class="price skeleton">R$ 00,00</span>
    </div>`);

    $complement.find(">main").append($skeleton);
}

function AddComplementSkeleton() {
    const $skeleton = $(`<section class="is_skeleton">
        <header>
            <div class="left">
                <span class="name skeleton">.</span>
                <span class="quantity skeleton">Em <b>X</b> produtos</span>
            </div>
            <div class="right">
                <span class="price skeleton">R$ 00,00</span>
                <div class="switch_enable skeleton">
                    <span class="off">Pausar</span>
                    <span class="on">Ativado</span>
                </div>
            </div>
        </header>
        <main></main>
    </section>`);

    for (let i = 0; i < 5; i++) addProductSkeletonToComplement($skeleton);

    $(".complement-list").append($skeleton);

    return $skeleton;
}

function addComplement(complement) {
    const $complement = $(`<section>
        <header>
            <div class="left">
                <span class="name"></span>
                <span class="quantity skeleton">Em <b>X</b> produtos</span>
            </div>
            <div class="right">
                <span class="price">R$ 00,00</span>
                <input class="form-control input-cod-pdv" placeholder="Código PDV" />
                <div class="switch_enable">
                    <input type="checkbox" checked hidden>
                    <div class="indicator"></div>
                    <span class="off">Pausar</span>
                    <span class="on">Ativado</span>
                </div>
            </div>
        </header>
        <main></main>
        <footer>
            <button class="load-more" style="display: none;">Ver mais produtos<i class="fas fa-arrow-right"></i></button>
        </footer>
    </section>`);

    complement.products = [];

    $complement.data(complement);

    $complement.find(">header>.left>.name").text(complement.name);

    $complement.find(".input-cod-pdv").val(complement.sku);

    $complement.find(">header>.right>.price").text(`${MoneyFormat(complement.min_price)}${complement.max_price != complement.min_price ? ` - ${MoneyFormat(complement.max_price, false)}` : ""}`);

    $complement.find(">header>.right>.switch_enable>input").prop("checked", complement.enabled);

    $complement.find(".input-cod-pdv").on("change", function () {
        const $this = $(this);
        const codPDV = $this.val();

        FetchAPI(`/company/${company.id_company}/complement/items`, {
            params: { name: complement.name },
            body: { "sku": codPDV },
            method: "PUT",
        }).then(() => {
            for (const product of complement.products) {
                for (const group of product.complements) {
                    for (const item of group.items) {
                        if (item.name == complement.name) {
                            item.sku = codPDV;
                        }
                    }
                }
            }
        }).catch(errorMessage => {
            Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar o codigo do PDV o complemento item ${complement.name}!`, "error");
            Swal.showValidationMessage(errorMessage);
        });
    });

    $complement.find(">header>.right>.switch_enable>input").on("change", function () {
        const $this = $(this);
        const $switch = $this.parent();
        const enabled = $this.is(":checked");

        $switch.addClass("disabled");

        FetchAPI(`/company/${company.id_company}/complement/items`, {
            params: { name: complement.name },
            body: { enabled },
            method: "PUT",
        }).then(() => {
            console.log(complement.products)
            for (const product of complement.products) {
                for (const group of product.complements) {
                    for (const item of group.items) {
                        if (item.name == complement.name) {
                            item.enabled = enabled;
                        }
                    }
                }
            }
        }).catch(errorMessage => {
            $this.prop("checked", !enabled);

            Swal.fire("Opss...", `Ocorreu um erro ao tentar ${enabled ? "ativar" : "pausar"} o complemento item ${complement.name}!`, "error");
            Swal.showValidationMessage(errorMessage);
        }).finally(() => {
            $switch.removeClass("disabled");
        });
    });

    $complement.find(">footer .load-more").click(function () {
        const page_limit = 5;

        const offset = $complement.find(">main>div").length;

        const skeletons_count = !!complement.max_products ? (complement.max_products - offset > page_limit ? page_limit : complement.max_products - offset) : page_limit;
        for (let i = 0; i < skeletons_count; i++) addProductSkeletonToComplement($complement);

        FetchAPI(`/company/${company.id_company}/product`, {
            instance_check: true,
            params: { complement_item: complement.name, offset, limit: page_limit }
        }).then(products => {
            complement.max_products = products.metadata.max;
            complement.products = [...complement.products, ...products.results];

            $complement.find(">header>.left>.quantity").removeClass("skeleton");
            $complement.find(">header>.left>.quantity>b").text(complement.max_products);

            for (const product of products.results) addProductToComplement($complement, product);
        }).catch(errorMessage => {
            Swal.fire("Opss...", `Ocorreu um erro ao tentar listar mais produtos!`, "error");
            Swal.showValidationMessage(errorMessage);
        }).finally(() => {
            $complement.find(">main>div.is_skeleton").remove();

            if (offset + page_limit >= complement.max_products) $(this).remove();
            else $(this).show();
        });
    });

    $complement.find(">footer .load-more").click();

    $(".complement-list").append($complement);
}

var lazy_loading = new LazyLoading({
    container: ".content-page",
    threshold: 0.3,
    doLoop: 10,
    state: {
        page_limit: 5,

        offset: 0,
        max: null,
        isLoading: false,
    },
    doHandle: function () {
        const $element = $(".complement-list>section:last-child");
        if (!$element.length) return true;

        if ($element.length) {
            return $element.offset().top - $element.height() - 400 < this.container.height();
        }
    },
});

lazy_loading.onHandle = async (state) => {
    if (state.isLoading) return;
    if (state.max != null && state.offset >= state.max) return;

    if (state.max == null) state.isLoading = true;

    const $skeletons = AddComplementSkeletons(state.offset, state.max, state.page_limit);

    const search_filter = $("#complement_filter>input").val();

    FetchAPI(`/company/${company.id_company}/complement/items`, {
        instance_check: true,
        params: {
            search: search_filter || "",
            offset: state.offset,
            limit: state.page_limit
        }
    }).then(complement_data => {
        state.max = complement_data.metadata.max;

        for (const complement of complement_data.results) addComplement(complement);
    }).catch(errorMessage => {
        console.error(errorMessage);
        Swal.fire("Opss...", `Ocorreu um erro ao tentar listar os complementos!`, "error");
        Swal.showValidationMessage(errorMessage);
    }).finally(() => {
        state.isLoading = false;
        $skeletons.remove();

        $(".max-results").text(`${state.max} resultado${!!state.max ? "s" : ""}`).removeClass("skeleton");
        if (state.max === 0) $(".complement-list").boo("Não há nada aqui!!");
    });

    state.offset += state.page_limit;
}

lazy_loading.Init();
$(".max-results").text("000 resultados").addClass("skeleton");

function AddComplementSkeletons(offset, max, page_limit) {
    const count = !!max ? (max - offset > page_limit ? page_limit : max - offset) : page_limit;
    let $skeletons = $();

    function add(el) {
        $skeletons = $skeletons.add(el);
    }

    for (let i = 0; i < count; i++) add(AddComplementSkeleton());

    return $skeletons;
}