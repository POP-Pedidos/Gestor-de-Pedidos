

var filter_status = "opened";
var filter_today = false;

var last_order_filter_text;
var last_order_filter_timeout;

$(".container-food_pedidos>.left>header>.input-search>input").keyup(function (e) {
    const cur_val = $(this).val();

    if (e.keyCode == 13 || !cur_val) {
        last_order_filter_text = cur_val;
        clearTimeout(last_order_filter_timeout);
        SearchForOrder();
    } else {
        last_order_filter_text = cur_val;
        clearTimeout(last_order_filter_timeout);

        last_order_filter_timeout = setTimeout(() => {
            if (last_order_filter_text == cur_val) SearchForOrder();
        }, 1000);
    }
});

async function SearchForOrder() {
    const search_term = $(".container-food_pedidos>.left>header>.input-search>input").val();

    if (!!search_term?.length) $(".container-food_pedidos>.left>footer>.status-filter>div").removeClass("selected");
    else $(".container-food_pedidos>.left>header>.input-search>input").val("");

    addOrderInfosSkeleton();

    $(".container-food_pedidos>.left>.list").empty().addClass("is_skeleton");
    orders.splice(0, orders.length);

    NewTabInstance();

    lazy_loading.Reset({
        state: true,
    });
}

$(".container-food_pedidos>.left>footer>.status-filter>div").click(function () {
    $(".container-food_pedidos>.left>header>.input-search>input").val("");

    $(this).parent().find(">div.selected").removeClass("selected");
    $(this).addClass("selected");
});

$(".container-food_pedidos>.left>footer>.status-filter>div.pending").click(function () {
    filter_status = "opened";
    filter_today = false;

    SearchForOrder();
});

$(".container-food_pedidos>.left>footer>.status-filter>div.wait_production").click(function () {
    filter_status = [1];
    filter_today = false;

    SearchForOrder();
});

$(".container-food_pedidos>.left>footer>.status-filter>div.wait_delivery").click(function () {
    filter_status = [2];
    filter_today = false;

    SearchForOrder();
});

$(".container-food_pedidos>.left>footer>.status-filter>div.in_delivery").click(function () {
    filter_status = [3];
    filter_today = false;

    SearchForOrder();
});

$(".container-food_pedidos>.left>footer>.status-filter>div.finished").click(function () {
    filter_status = [10];
    filter_today = true;

    SearchForOrder();
});

$(".container-food_pedidos>.left>footer>.status-filter>div.refused").click(function () {
    filter_status = "refused";
    filter_today = true;

    SearchForOrder();
});

var lazy_loading = new LazyLoading({
    container: ".container-food_pedidos>.left>.list",
    threshold: 0.3,
    doHandle: function () {
        const $element = this.container.find(">div:last-child");

        if ($element.length) {
            return $element.offset().top - $element.height() - 400 < this.container.height();
        }
    },
    state: {
        page_limit: 10,
        offset: 0,
        max: null,
        isLoading: false,
    }
});

lazy_loading.onHandle = async (state) => {
    if (state.isLoading) return;
    if (state.max != null && state.offset >= state.max) return;

    if (state.max == null) state.isLoading = true;

    const $skeletons = AddOrderSkeletons(state.offset, state.max, state.page_limit);
    const params = {
        offset: state.offset,
        limit: state.page_limit,
    };
    
    const search_term = $(".container-food_pedidos>.left>header>.input-search>input").val();

    if (!!search_term) params.term = search_term;
    else {
        params.status = Array.isArray(filter_status) ? filter_status.join(",") : filter_status;
        params.today = filter_today || undefined;
    }

    FetchAPI(`/order`, {
        instance_check: true,
        params,
    }).then(async orders_data => {
        state.max = orders_data.metadata.max;

        $skeletons.remove();

        for (const order of orders_data.results || []) {
            orders.push(order);
            addOrder(order);
        }

        $(".container-food_pedidos>.left .orders>span").text(`Pedidos: ${orders_data.metadata.max}`);
        $(".container-food_pedidos>.left .total_price>span").text(`Total: ${MoneyFormat(orders_data.metadata.total)}`);

        if (state.isLoading) {
            if (!!orders?.length) {
                await viewOrder(orders[0]);
            } else {
                $(".container-food_pedidos>.left>.list").html(`<div class="none-founded">
                    <img src="../../img/none-founded.svg"/>
                    <span>Nada encontrado, por enquanto!</span>
                </div>`);

                $(".container-food_pedidos>.order-infos").boo("Nenhum pedido!");
            }
        }
    }).catch(error => {
        Swal.fire("Opss...", "Ocorreu um erro ao tentar listar os orders!", "error");
        Swal.showValidationMessage(error);
        $(".container-food_pedidos").boo("Ocorreu um erro!");
        console.error(error);
    }).finally(() => {
        $(".container-food_pedidos>.left>.list").removeClass("is_skeleton");
        $("#loading-wrapper-content").fadeOut(200);
        state.isLoading = false;

        lazy_loading.Trigger();
    });

    state.offset += state.page_limit;

    $(".container-food_pedidos>.left>header>.input-search").removeClass("skeleton");
    $(".container-food_pedidos>.left>footer>.status-filter>div").removeClass("skeleton");
    $(".container-food_pedidos>.left>footer>.analytics>div>span").removeClass("skeleton");
}

lazy_loading.Init();

FetchAPI(`/printers`, { instance_check: true, }).then(data => {
    printers = data;
    primary_printer = data.find(printer => printer.is_primary);
});

orders.splice(0, orders.length);
addOrderInfosSkeleton();

function AddOrderSkeletons(offset, max, page_limit) {
    const count = !!max ? (max - offset > page_limit ? page_limit : max - offset) : page_limit;
    let $skeletons = $();

    function add(el) {
        $skeletons = $skeletons.add(el);
    }

    for (let i = 0; i < count; i++) add(AddOrderSkeleton());

    return $skeletons;
}