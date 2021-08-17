function LoadDashboard() {
    $(".dashboard-results-container .breadcrumb>h3>span").text(company.name || "Mundo");
    $("#dashboard .free-alert").toggle(company.license_type.startsWith("free"));
    $("#dashboard .remain_plan_time").toggle(company.license_type.startsWith("free"));

    function RemoveDashSkeleton() {
        $(".dashboard-results-container .filter-date").removeClass("skeleton");
        $(".dashboard-results-container .breadcrumb>h3").removeClass("skeleton");
    }

    FetchAPI(`/analytics`, {
        instance_check: true,
        params: {
            start_date: $(".filter-date.start>input").val(),
            end_date: $(".filter-date.end>input").val(),
        }
    }).then(analytics_data => {
        console.log("analytics:", analytics_data);

        LoadAnalytics(analytics_data);
    }).catch(error => {
        Swal.fire("Opss...", "Ocorreu um erro ao tentar carregar os dados da dashboard!", "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        RemoveDashSkeleton();
    });

    SearchForProduct();

    for (let i = 0; i < 4; i++) AddClientSkeleton();

    FetchAPI(`/analytics/client`, {
        instance_check: true,
        params: {
            limit: 15,
            start_date: $(".filter-date.start>input").val(),
            end_date: $(".filter-date.end>input").val(),
        }
    }).then(client_data => {
        console.log("client_data:", client_data);

        LoadClients(client_data);
    }).catch(error => {
        Swal.fire("Opss...", "Ocorreu um erro ao tentar carregar os clientes na dashboard!", "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        RemoveDashSkeleton();
    });

    FetchAPI(`/analytics/order`, {
        instance_check: true,
        params: {
            start_date: $(".filter-date.start>input").val(),
            end_date: $(".filter-date.end>input").val(),
        }
    }).then(orders_data => {
        console.log("orders_data:", orders_data);

        LoadOrdersGraph(orders_data);
    }).catch(error => {
        Swal.fire("Opss...", "Ocorreu um erro ao tentar carregar os ganhos e vendas na dashboard!", "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        RemoveDashSkeleton();
    });

    FetchAPI(`/analytics/user_actions`, {
        instance_check: true,
        params: {
            start_date: $(".filter-date.start>input").val(),
            end_date: $(".filter-date.end>input").val(),
        }
    }).then(user_actions_data => {
        console.log("user_actions_data:", user_actions_data);

        LoadUserActionsGraph(user_actions_data);
    }).catch(error => {
        Swal.fire("Opss...", "Ocorreu um erro ao tentar carregar as visitas e clicks na dashboard!", "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        RemoveDashSkeleton();
    });

    const $analytics = $(".dashboard-results-container .orders>header>.analytics");
    $analytics.find(">.max-results").addClass("skeleton");
    $analytics.find(">div").addClass("skeleton");

    lazy_loading.Reset({
        state: true,
    });
}

function AddOrderSkeleton() {
    const $order = $(`<div class="is_skeleton">
        <header>
            <div class="indicator">
                <span class="skeleton">#00</span>
            </div>
            <div class="infos">
                <div class="left">
                    <span class="client_name skeleton">Erro</span>
                    <span class="status skeleton">Erro</span>
                </div>
                <div class="right">
                    <span class="timer skeleton">Há 00 dias</span>
                    <span class="total_price skeleton">R$ 00,00</span>
                </div>
            </div>
        </header>
        <main></main>
    </div>`);

    $(".dashboard-results-container .orders>main").append($order);

    return $order;
}

function LoadAnalytics(analytics) {
    const default_plan_days = 30;

    $(".dashboard-results-container .total_visitors h4").animateValue(0, analytics.company_visits, 1000, nFormatter);
    $(".dashboard-results-container .total_clicks h4").animateValue(0, analytics.products_visits, 1000, nFormatter);

    $(".dashboard-results-container .total_sales h4").animateValue(0, analytics.sales.quantity, 1000, nFormatter);
    $(".dashboard-results-container .total_earning h4").animateValue(0, analytics.sales.money, 1000, MoneyFormat);

    $(".dashboard-results-container .ticket_medium h4").animateValue(0, (analytics.sales.money / analytics.sales.quantity) || 0, 1000, MoneyFormat);

    $(".dashboard-results-container .total_new_clients h4").animateValue(0, analytics.new_clients, 1000, nFormatter);

    if (!!company.license_expiration) {
        const remain_plan_milliseconds = new Date(company.license_expiration) - new Date();
        const remain_plan_percentage = remain_plan_milliseconds / (default_plan_days * 24 * 60 * 60 * 1000);

        $(".dashboard-results-container .remain_plan_time .chart>span").animateValue(0, parseInt(remain_plan_percentage * 100), 1000, n => `${n}%`)
        $(".dashboard-results-container .remain_plan_time .chart").data("easyPieChart").update(remain_plan_percentage * 100);

        $(".dashboard-results-container .remain_plan_time h5").text(RemainMillisecondsToTimeString(remain_plan_milliseconds));
    }
    else {
        $(".dashboard-results-container .remain_plan_time h5").text("Indeterminado");
        $(".dashboard-results-container .remain_plan_time .chart>span").animateValue(0, 100, 1000, n => `${n}%`);
        $(".dashboard-results-container .remain_plan_time .chart").data("easyPieChart").update(100);
    }

    const accepted_percentage = (analytics.sales.quantity / (analytics.sales.quantity + analytics.refused_orders)) || 0;
    const refused_percentage = (analytics.refused_orders / (analytics.sales.quantity + analytics.refused_orders)) || 0;

    if (!accepted_percentage && !refused_percentage) $(".dashboard-results-container .accepted_refused").parent().hide();
    else {
        $(".dashboard-results-container .accepted_refused>main>.accepted")
            .animateValue(50, parseInt(accepted_percentage * 100), 1000, n => `${n}%`)
            .css("width", `${accepted_percentage * 100}%`).text(`${parseInt(accepted_percentage * 100)}%`);

        $(".dashboard-results-container .accepted_refused>main>.refused")
            .animateValue(50, parseInt(refused_percentage * 100), 1000, n => `${n}%`)
            .css("width", `${refused_percentage * 100}%`).text(`${parseInt(refused_percentage * 100)}%`);
    }

    const delivery_percentage = (analytics.order_delivery_type.delivery / (analytics.order_delivery_type.delivery + analytics.order_delivery_type.withdrawal)) || 0;
    const withdrawn_percentage = (analytics.order_delivery_type.withdrawal / (analytics.order_delivery_type.delivery + analytics.order_delivery_type.withdrawal)) || 0;

    if (!delivery_percentage && !withdrawn_percentage) $(".dashboard-results-container .delivery_withdrawn").parent().hide();
    else {
        $(".dashboard-results-container .delivery_withdrawn>main>.delivery")
            .animateValue(50, parseInt(delivery_percentage * 100), 1000, n => `${n}%`)
            .css("width", `${delivery_percentage * 100}%`).text(`${parseInt(delivery_percentage * 100)}%`);

        $(".dashboard-results-container .delivery_withdrawn>main>.withdrawn")
            .animateValue(50, parseInt(withdrawn_percentage * 100), 1000, n => `${n}%`)
            .css("width", `${withdrawn_percentage * 100}%`).text(`${parseInt(withdrawn_percentage * 100)}%`);
    }

    $(".info-tiles .skeleton").removeClass("skeleton");
    $("#product_search.skeleton").removeClass("skeleton");
    $(".competition-graph .skeleton").removeClass("skeleton");
}

function AddProductSkeleton() {
    const $product = $(`<div class="top-product is_skeleton">
        <div class="avatar skeleton"></div>
        <div class="agent-details">
            <h6 class="skeleton">Erro</h6>
            <span class="description skeleton">Erro</span>
            <div class="progress skeleton">
                <div class="progress-bar"></div>
            </div>
        </div>
        <div class="right">
            <h5 class="quantity skeleton">00 vendidos</h5>
            <h5 class="total skeleton">R$ 00,00</h5>
        </div>
    </div>`);

    $(".dashboard-results-container .top-products-container").append($product);
}

function LoadProducts(products_data, is_search = false) {
    $(".dashboard-results-container .top-products-container").empty();
    $(".card.top-products").removeClass("is_skeleton");

    if (!!products_data?.results.length) {
        products_data.results = products_data.results.map(product => Object.assign({ points: GetProductPoints(product) }, product)).sort((a, b) => a.points > b.points ? -1 : 1);
        const max_points = products_data.results.reduce((max, cur) => cur.points > max ? max + cur.points : max, 0);

        for (const product of products_data.results) {
            const offset = $(".top-products-container>.top-product").length || 0;

            const $product = $(`<div class="top-product">
                <img src="https://api.poppedidos.com.br/static/images/no-image.svg" class="avatar" />
                <div class="agent-details">
                    <h6>Erro</h6>
                    <span class="description"></span>
                    <div class="progress"><div class="progress-bar"></div></div>
                </div>
                <div class="right">
                    <h5 class="quantity">00 vendidos</h5>
                    <h5 class="total">R$ 00,00</h5>
                </div>
            </div>`);

            if (!!product.images?.length) $product.find(">img").attr("src", product.images[0].small);

            $product.find("h6").text(product.name);
            $product.find(".description").html(`${is_search ? "" : `Top <b>${offset + 1}</b> — `}<b>${product.analytics.total_clicks || 0}</b> clicks`);
            $product.find(".right>.quantity").animateValue(0, product.analytics.total_quantity || 0, 1000, n => `${n} vendido${!!n ? "s" : ""}`);
            $product.find(".right>.total").animateValue(0, product.analytics.total_price, 1000, MoneyFormat);

            $(".top-products-container").append($product);

            window.requestAnimationFrame(() => {
                $product.find(".progress-bar").css("width", `0%`);
                window.requestAnimationFrame(() => {
                    $product.find(".progress-bar").css("width", `${product.points * 100 / max_points}%`)
                });
            });
        }
    } else {
        $(".top-products-container").html(`<img src="../../../images/empty-folder.svg"/>`);
    }
}

function AddClientSkeleton() {
    const $client = $(`<div class="top-client is_skeleton">
        <div class="avatar skeleton"></div>
        <div class="details">
            <h6 class="skeleton">Error</h6>
            <span class="address skeleton">Erro</span>
            <div class="progress skeleton">
                <div class="progress-bar" style="width: 100%"></div>
            </div>
        </div>
        <div class="right">
            <h5 class="quantity skeleton">00 pedidos</h5>
            <h5 class="total skeleton">R$ 00,00</h5>
        </div>
    </div>`);

    $(".dashboard-results-container .top-clients-container").append($client);
}

function LoadClients(client_data) {
    $(".dashboard-results-container .top-clients-container").empty();
    $(".card.top-clients").removeClass("is_skeleton");

    if (!!client_data?.results.length) {
        client_data.results = client_data.results.map(client => Object.assign({ points: GetClientPoints(client) }, client)).sort((a, b) => a.points > b.points ? -1 : 1);
        const max_points = client_data.results.reduce((max, cur) => cur.points > max ? max + cur.points : max, 0);

        for (const client of client_data?.results || []) {
            const $client = $(`<div class="top-client">
                <div class="avatar skeleton"></div>
                <div class="details">
                    <h6>Error</h6>
                    <span class="phone">Erro</span>
                    <span class="address">Erro</span>
                    <div class="progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
                <div class="right">
                    <h5 class="quantity">00 pedidos</h5>
                    <h5 class="total">R$ 00,00</h5>
                </div>
            </div>`);

            let images = ["user01", "user02", "user03", "user04"];

            GetGenderByName(client.name_client).then(gender => {
                if (gender === "male") {
                    images = ["user01", "user03"];
                } else if (gender === "female") {
                    images = ["user02", "user04"];
                }
            }).finally(() => {
                const $img = $(`<img class="avatar" />`);

                $img.attr("src", `../../../images/${images[randomInt(0, images.length - 1)]}.svg`);

                $client.find(".avatar").replaceWith($img);
            });

            $client.find(".details>h6").text(client.name_client);
            $client.find(".details>.phone").text(client.phone_client);
            $client.find(".details>.address").text(client.state ? `${client.street_name}, ${client.street_number} - ${client.neighborhood}, ${client.city} - ${client.state}` : "");
            $client.find(".right>.quantity").animateValue(0, client.total_quantity, 1000, n => `${n} pedido${!!n ? "s" : ""}`);
            $client.find(".right>.total").animateValue(0, client.total_price || 0, 1000, MoneyFormat);

            $(".top-clients-container").append($client);

            window.requestAnimationFrame(() => {
                $client.find(".progress-bar").css("width", `0%`);
                window.requestAnimationFrame(() => {
                    $client.find(".progress-bar").css("width", `${client.points * 100 / max_points}%`);
                });
            });
        }
    } else {
        $(".dashboard-results-container .top-clients-container").html(`<img src="../../../images/empty-folder2.svg"/>`);
    }
}

function GetProductPoints(product) {
    return (parseFloat(product.analytics.total_price || 0) * 10) + ((product.analytics.total_quantity || 0) / 20) + ((product.analytics.total_clicks || 0) / 1000);
}

function GetClientPoints(client) {
    return ((client.total_quantity || 0) / 20) + ((client.total_clicks || 0) / 1000);
}

function LoadOrdersGraph(orders_data) {
    Highcharts.chart("sales_and_earnings", {
        chart: {
            zoomType: 'x',
            type: 'area',
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: {
            title: {
                text: null
            }
        },
        plotOptions: {
            area: {
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        tooltip: {
            formatter: function () {
                const date = new Date(this.x);

                const year = date.getFullYear();
                const month = ("0" + (date.getMonth() + 1)).slice(-2);
                const day = ("0" + date.getDate()).slice(-2);

                if (this.colorIndex === 0) {
                    return `<b>${day}/${month}/${year}</b><br/>${this.series.name}: ${MoneyFormat(this.y)}`;
                } else {
                    return `<b>${day}/${month}/${year}</b><br/>${this.series.name}: ${this.y}`;
                }
            }
        },

        series: [
            {
                name: "Ganhos",
                data: orders_data.map(data => [new Date(data[2]).getTime(), data[1]]),
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
            },
            {
                name: "Vendas",
                data: orders_data.map(data => [new Date(data[2]).getTime(), data[0]]),
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[1]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[1]).setOpacity(0).get('rgba')]
                    ]
                },
            }
        ]
    });
}

function LoadUserActionsGraph(user_actions_data) {
    // console.log(user_actions_data.map(data => [new Date(data[2]).getTime(), data[0]]));
    Highcharts.chart('visits_and_clicks', {
        chart: {
            zoomType: 'x',
            type: 'column'
        },

        title: {
            text: null
        },

        xAxis: {
            type: 'datetime',
        },

        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: null
            },
        },

        tooltip: {
            formatter: function () {
                const date = new Date(this.x);

                const year = date.getFullYear();
                const month = ("0" + (date.getMonth() + 1)).slice(-2);
                const day = ("0" + date.getDate()).slice(-2);

                return `<b>${day}/${month}/${year}</b><br/>${this.series.name}: ${this.point.y}`;
            }
        },

        plotOptions: {
            column: {
                stacking: 'normal',
            }
        },

        series: [{
            name: 'Visitas',
            data: user_actions_data.map(data => [new Date(...String(data[2]).split("-")).getTime(), data[0]]),
            borderRadiusTopLeft: '6px',
            borderRadiusTopRight: '6px'
        }, {
            name: 'Click em produtos',
            data: user_actions_data.map(data => [new Date(...String(data[2]).split("-")).getTime(), data[1]]),
        }]
    });

}

$(".page-header .filter-options, .page-header .filter-date>input").on("change", function (e, value) {
    $(".dashboard-results-container .orders>main").empty();
    $(".dashboard-results-container .orders>header>.max-results").empty();

    $(".top-products-container").empty();
    $(".top-clients-container").empty();

    $(".dashboard-results-container>.main-container>.row>div").show();

    $("#sales_and_earnings").html(`<span class="spinner-border"></span>`);
    $("#visits_and_clicks").html(`<span class="spinner-border"></span>`);

    $(".info-tiles .info-icon, .info-tiles p, .info-tiles h2, .info-tiles h4, .info-tiles h5").addClass("skeleton");
    $(".competition-graph>p, .competition-graph>main, .competition-graph>footer>div").addClass("skeleton");
    $(".remain_plan_time>.chart").addClass("skeleton");

    lazy_loading.max = undefined;
    lazy_loading.offset = 0;

    LoadDashboard();
});

$(".remain_plan_time>.chart").easyPieChart({
    barColor: "#0cb50c",
    trackColor: "rgba(150, 150, 150, 0.3)",
    scaleColor: false,
    lineWidth: 25,
    size: 300,
});

function AddOrder(order) {
    const $order = $(`<div>
        <header>
            <div class="indicator">
                <span>#00</span>
            </div>
            <div class="infos">
                <div class="left">
                    <span class="client_name">Erro</span>
                    <span class="status">Erro</span>
                </div>
                <div class="right">
                    <span class="timer">Há 00 dias</span>
                    <span class="total_price">R$ 00,00</span>
                </div>
            </div>
        </header>
        <main>
            <div></div>
        </main>
    </div>`);

    if (order.status < 0) {
        $order.find(".status").text("Recusado");
        $order.addClass("refused");
    } else if (order.status == 10) {
        $order.find(".status").text("Entregue");
        $order.addClass("finished");
    }

    $order.find(".indicator>span").text(`#${order.order_company_sequence}`);
    $order.find(".client_name").text(order.name_client);
    $order.find(".timer").text(MillisecondsToDate(DateSubtract(new Date(order.createdAt))));
    $order.find(".total_price").text(MoneyFormat(order.total));

    LoadOrderOnElement($order.find(">main>div"), order, false);

    $order.find(">header").on("click", function () {
        if ($order.hasClass("expand")) {
            $order.find(">main").css("max-height", `0px`);
            $order.removeClass("expand");
        } else {
            $(".dashboard-results-container .orders>main>div").removeClass("expand");
            $(".dashboard-results-container .orders>main>div>main").css("max-height", `0px`);

            $order.find(">main").css("max-height", `${$order.find(">main>div").outerHeight()}px`);
            $order.addClass("expand");
        }
    });

    $(".dashboard-results-container .orders>main").append($order);
}

var last_order_filter_text;
var last_order_filter_timeout;

$("#order_search>input").keyup(function (e) {
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

var last_product_filter_text;
var last_product_filter_timeout;

$("#product_search>input").keyup(function (e) {
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
    $(".dashboard-results-container .top-products-container").empty();

    for (let i = 0; i < 4; i++) AddProductSkeleton();

    const search = $("#product_search>input").val();
    const params = {
        analytics: true,
        order_by_analytics: true,
        limit: 15,
        start_date: $(".filter-date.start>input").val(),
        end_date: $(".filter-date.end>input").val(),
    }

    if (!!search) {
        params.search = search;
    } else {
        params.exclude_empty_analytics = true;
    }

    FetchAPI(`/company/${company.id_company}/product`, {
        instance_check: true,
        params,
    }).then(products_data => {
        console.log("products_data:", products_data);

        LoadProducts(products_data, !!search);
    }).catch(error => {
        Swal.fire("Opss...", "Ocorreu um erro ao tentar carregar os produtos na dashboard!", "error");
        Swal.showValidationMessage(error);
    });
}

$(".dashboard-results-container .orders .filter-options.status").on("change", function (e, value) {
    SearchForOrder();
});

function SearchForOrder() {
    $(".dashboard-results-container .orders>main").empty();
    $(".dashboard-results-container .orders>header>.max-results").empty();

    const $analytics = $(".dashboard-results-container .orders>header>.analytics");
    $analytics.find(">.max-results").addClass("skeleton");
    $analytics.find(">div").addClass("skeleton");

    lazy_loading.Reset({
        state: true,
    });
}

(() => {
    let min_date = new Date(company.createdAt);
    const max_date = new Date();
    const days = (max_date - min_date) / 24 / 60 / 60 / 1000;

    if (days > 31) min_date = new Date(max_date - (31 * 24 * 60 * 60 * 1000));

    const min = FormatSimpleDate(min_date);
    const max = FormatSimpleDate(max_date);

    $(".filter-date.start>input").val(min).attr("min", min).attr("max", max);
    $(".filter-date.end>input").val(max).attr("min", min).attr("max", max);
})();

var lazy_loading = new LazyLoading({
    container: ".content-page",
    threshold: 0.3,
    doHandle: function () {
        const $element = $("main-container .orders>main>div:last-child");

        if ($element.length) {
            return $element.offset().top - $element.height() - 400 < this.container.height();
        }
    },
    state: {
        page_limit: 10,

        offset: 0,
        max: null,
        isLoading: false,
        request: null,
    }
});

lazy_loading.onHandle = (state) => {
    if (state.isLoading) return;
    if (state.max != null && state.offset >= state.max) return;

    state.isLoading = true;

    const $skeletons = AddOrderSkeletons(state.offset, state.max, state.page_limit);
    const $analytics = $(".dashboard-results-container .orders>header>.analytics");

    state.request = FetchAPI(`/order`, {
        instance_check: true,
        params: {
            status: $(".dashboard-results-container .orders .filter-options.status").data("value") || "-1,10",
            search: $("#order_search>input").val(),
            offset: state.offset,
            limit: state.page_limit,
            order: "createdAt DESC",
            start_date: $(".filter-date.start>input").val(),
            end_date: $(".filter-date.end>input").val(),
            payment_analytics: true
        }
    });

    state.request.then(orders_data => {
        state.max = orders_data.metadata.max;

        $analytics.show();
        $analytics.find(">.max-results").removeClass("skeleton").text(`${state.max} resultado${state.max > 1 ? "s" : ""}`)
        $analytics.find(">div").removeClass("skeleton");
        $analytics.find(">.money>span").text(MoneyFormat(orders_data.analytics.money || 0));
        $analytics.find(">.credit>span").text(MoneyFormat(orders_data.analytics.credit || 0));
        $analytics.find(">.debit>span").text(MoneyFormat(orders_data.analytics.debit || 0));

        $skeletons.remove();

        for (const order of orders_data.results) AddOrder(order);

        state.offset += orders_data.results.length;

        if (state.max === 0) $(".dashboard-results-container .orders>main").html(`<img src="../../../images/order.svg"/>`);
    }).catch(error => {
        $analytics.hide();
        $(".dashboard-results-container .orders>main").html(`<img src="../../../images/order.svg"/>`);

        Swal.fire("Opss...", "Ocorreu um erro ao tentar carregar os pedidos na dashboard!", "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        state.isLoading = false;
    });

}

lazy_loading.Init();

LoadDashboard();

function AddOrderSkeletons(offset, max, page_limit) {
    const count = !!max ? (max - offset > page_limit ? page_limit : max - offset) : page_limit;
    let $skeletons = $();

    function add(el) {
        $skeletons = $skeletons.add(el);
    }

    for (let i = 0; i < count; i++) add(AddOrderSkeleton());

    return $skeletons;
}