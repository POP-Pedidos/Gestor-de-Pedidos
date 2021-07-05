async function printOrder(order) {
    let cur_status;

    const order_data = { ...order };

    if (order.status === 1) cur_status = "wait_production";
    else if (order.status === 2) cur_status = "wait_delivery";
    else if (order.status === 10) cur_status = "finished";

    order_data.address = order.delivery_type !== "withdrawal" ? `${order.street_name}, ${order.street_number} - ${order.neighborhood}, ${order.city} - ${order.state}` : null;
    order_data.dt_accept = new Date(order.dt_accept).toISOString();

    const primary_printer_device = {
        ...primary_printer,
        device: GetLocalPrinter(primary_printer?.id_printer) || primary_printer?.device,
    };

    if (!!company.print_control_copy && company.print_control_copy === cur_status) {
        await printService.printControlCopy(primary_printer_device, order_data, company);
    }

    if (!!company.print_production_copy && company.print_production_copy === cur_status) {
        const printer_items = [];

        for (const item of order_data.items || []) {
            if (!item.product.id_printer) continue;

            if (printer_items[item.product.id_printer]) printer_items[item.product.id_printer].push(item);
            else printer_items[item.product.id_printer] = [item];
        }

        for (const id_printer in printer_items) {
            const printer = {
                ...primary_printer_device,
                ...printers.find(printer => printer.id_printer == id_printer),
            };

            printer.device = GetLocalPrinter(id_printer) || printer.device;
            order_data.items = printer_items[id_printer];

            await printService.printProductionCopy(printer, order_data, company);
        }
    }

    if (!!company.print_delivery_copy && company.print_delivery_copy === cur_status) {
        await printService.printDeliveryCopy(primary_printer_device, order_data, company);
    }
}

function UpdateOrderStatus(order, new_status) {
    return new Promise((resolve, reject) => {
        if (!order) return reject("missing order");
        const body = {
            status: new_status,
        }

        if (new_status > 0) body.dt_accept = new Date();
        if (new_status < 0) body.dt_refuse = new Date();

        const promise = FetchAPI(`/order/${order.id_order}`, {
            method: "PUT",
            body,
        });

        promise.then(resolve).catch(reject);
    });
}

async function viewOrder(order, transition = true) {
    cur_order = order;

    if (transition) {
        $(".container-food_pedidos>.order-infos").fadeOut(80);
        await Sleep(80);
        $(".container-food_pedidos>.order-infos").fadeIn(80);
    }

    const $left = $(".container-food_pedidos>.left");

    $left.find(`>.list>div`).removeClass("active");
    $left.find(`>.list>[id_order="${order.id_order}"]`).addClass("active");

    const $order_infos = $(".container-food_pedidos>.order-infos");

    LoadOrderOnElement($order_infos, order, true);

    $order_infos.find(">.infos .actions>div>.accept").click(function () {
        let new_status = order.status >= 0 ? order.status + 1 : 1;
        if (new_status > 3) new_status = 10;
        else if (order.delivery_type === "withdrawal" && new_status == 3) new_status = 10;

        const Change = () => {
            return new Promise((resolve, reject) => {
                $(this).addClass("loading");

                UpdateOrderStatus(order, new_status).then(new_order => {
                    Object.assign(order, new_order);

                    if (orderIsOnFilters(new_order)) {
                        const $order = addOrder(new_order);
                        $order.addClass("active");
                        viewOrder(new_order);
                    } else {
                        $(`.container-food_pedidos>.left>.list>[id_order="${order.id_order}"]`).remove();

                        orders = orders.filter(_order => _order.id_order !== order.id_order);

                        if (!!orders?.length) {
                            const $status_message = $(`<div class="order-status-message"><img src="../../../images/attendant.svg"/></div>`);

                            $(".container-food_pedidos>.order-infos").html($status_message);
                        } else {
                            $(".container-food_pedidos>.left>.list").html(`<div class="none-founded">
                                <img src="../../../images/none-founded.svg"/>
                                <span>Nada encontrado, por enquanto!</span>
                            </div>`);

                            $(".container-food_pedidos>.order-infos").boo("Nenhum pedido!");
                        }
                    }

                    SendOrderStatusMessage(new_order);
                    printOrder(new_order);
                }).catch(error => {
                    Swal.fire("Opss...", "Ocorreu um erro ao tentar alterar o status do pedido!", "error");
                    Swal.showValidationMessage(error);
                }).finally(resolve);
            });
        }

        if (order.status < 0 && new_status === 1) {
            Swal.fire({
                title: "Muita calma!!",
                html: `Voçê tem certeza que deseja aceitar o pedido <b>${order.order_company_sequence}</b>?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: () => Change(),
            });

        } else Change();
    });

    $order_infos.find(">.infos .actions>div>.refuse").click(function () {
        Swal.fire({
            title: "Muita calma!!",
            html: `Voçê tem certeza que deseja recusar o pedido <b>${order.order_company_sequence}</b>?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: () => {
                return new Promise((resolve) => {
                    const new_status = -(order.status + 1);

                    UpdateOrderStatus(order, new_status).then(new_order => {
                        Object.assign(order, new_order);

                        $(`.container-food_pedidos>.left>.list>[id_order="${order.id_order}"]`).remove();

                        orders = orders.filter(_order => _order.id_order !== order.id_order);

                        if (!!orders?.length) {
                            if (!orderIsOnFilters(new_order)) {
                                const $status_message = $(`<div class="order-status-message"><img src="../../../images/attendant.svg"/></div>`);

                                $(".container-food_pedidos>.order-infos").html($status_message);
                            }
                        } else {
                            $(".container-food_pedidos>.left>.list").html(`<div class="none-founded">
                                <img src="../../../images/none-founded.svg"/>
                                <span>Nada encontrado, por enquanto!</span>
                            </div>`);

                            $(".container-food_pedidos>.order-infos").boo("Nenhum pedido!");
                        }

                        SendOrderStatusMessage(new_order);
                        printOrder(new_order);
                    }).catch(error => {
                        Swal.fire("Opss...", "Ocorreu um erro ao tentar recusar o pedido!", "error");
                        Swal.showValidationMessage(error);
                    }).finally(resolve);
                });
            }
        });
    });
}

function AddOrderSkeleton() {
    const $order = $(`<div class="is_skeleton">
        <div class="infos">
            <div class="left">
                <span class="order_id skeleton">#${randomInt(1000, 100000)}</span>
                <span class="client_name skeleton">.</span>
                <span class="info skeleton">.</span>
            </div>
            <div class="right">
                <span class="timer skeleton">Há 00 horas</span>
                <span class="total_price skeleton">.</span>
            </div>
        </div>
    </div>`);

    $(".container-food_pedidos>.left>.list").append($order);

    return $order;
}

function addOrderInfosSkeleton() {
    const $order_infos = $(`<div class="infos">
        <div class="info">
            <div class="client_info">
                <div class="icon-key-value order-identifier">
                    <div class="rounded-icon skeleton"></div>
                    <div class="infos">
                        <span class="title skeleton">Pedido</span>
                        <a class="value skeleton" target="_blank">.</a>
                    </div>
                </div>
				<div class="icon-key-value client-info is_skeleton">
					<div class="rounded-icon skeleton"></div>
					<div class="infos">
						<span class="name skeleton">Nome do cliente</span>
						<span class="phone skeleton">.</span>
					</div>
				</div>
                <div class="icon-key-value client-address is_skeleton">
                    <div class="rounded-icon skeleton"></div>
                    <div class="infos">
                        <span class="title skeleton">Endereço</span>
                        <a class="address skeleton" target="_blank">.</a>
                    </div>
                </div>
            </div>
            <div class="actions">
                <div>
                    <button type="button" class="btn btn-success accept skeleton">
                        <span>Aceitar</span>
                    </button>
                    <button type="button" class="btn btn-danger refuse skeleton">
                        <span>Recusar</span>
                    </button>
                    <button type="button" class="btn btn-secondary print skeleton">
                        <span>Impressão</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="history">
            <div class="step accept">
                <div class="trace-line"></div>
                <div class="icon skeleton">
                    <i class="fas fa-check"></i>
                </div>
                <div class="infos">
                    <span class="title skeleton">Aguardando aceite</span>
                    <span class="date skeleton">00/00/0000 00:00:00</span>
                </div>
            </div>
            <div class="step production">
                <div class="trace-line"></div>
                <div class="icon skeleton">
                    <i class="fas fa-box"></i>
                </div>
                <div class="infos">
                    <span class="title skeleton">Aguardando produção</span>
                    <span class="date skeleton">00/00/0000 00:00:00</span>
                </div>
            </div>
            <div class="step delivery">
                <div class="trace-line"></div>
                <div class="icon skeleton">
                    <i class="fas fa-forward"></i>
                </div>
                <div class="infos">
                    <span class="title skeleton">Aguardando entrega</span>
                    <span class="date skeleton">00/00/0000 00:00:00</span>
                </div>
            </div>
        </div>
        <div class="list-items">
            <div>
                <header>
                    <span class="quantity skeleton">1x</span>
                    <span class="name skeleton">.</span>
                    <span class="price skeleton">R$ 00,00</span>
                </header>
            </div>
            <div>
                <header>
                    <span class="quantity skeleton">1x</span>
                    <span class="name skeleton">.</span>
                    <span class="price skeleton">R$ 00,00</span>
                </header>
            </div>
            <div>
                <header>
                    <span class="quantity skeleton">1x</span>
                    <span class="name skeleton">.</span>
                    <span class="price skeleton">R$ 00,00</span>
                </header>
                <main>
                    <div>
                        <span class="quantity skeleton">1x</span>
                        <span class="name skeleton">.</span>
                        <span class="price skeleton">R$ 00,00</span>
                    </div>
                </main>
            </div>
        </div>
    </div>
    <div class="bottom">
        <div class="left">
            <div class="icon-key-value payment-method is_skeleton">
                <div class="rounded-icon skeleton"></div>
                <div class="infos">
                    <span class="title skeleton">Pagamento</span>
                    <span class="value skeleton">.</span>
                </div>
            </div>
            <div class="icon-key-value discount-coupon is_skeleton">
                <div class="rounded-icon skeleton"></div>
                <div class="infos">
                    <span class="title skeleton">Cupom de desconto</span>
                    <span class="value skeleton">.</span>
                </div>
            </div>
        </div>
        <div class="price">
            <span class="skeleton">.</span>
            <span class="skeleton">.</span>
            <span class="skeleton">.</span>
            <span class="skeleton">.</span>
        </div>
    </div>`);

    $(".container-food_pedidos>.order-infos").html($order_infos);
}

function orderIsOnFilters(order) {
    let in_status = false;
    const search_term = $(".container-food_pedidos>.left>header>.input-search>input").val();

    if (!!search_term) {
        in_status = true;
    } else if (Array.isArray(filter_status)) {
        in_status = filter_status.includes(order.status);
    } else {
        if (filter_status === "opened") {
            in_status = order.status >= 0 && order.status < 10;
        } else if (filter_status === "refused") {
            in_status = order.status < 10;
        }
    }

    return in_status;
}

function addOrder(order) {
    if (!orderIsOnFilters(order)) return;

    const $order = $(`<div>
        <div class="indicator"></div>
        <div class="infos">
            <div class="left">
                <span class="order_id">#0</span>
                <span class="client_name"></span>
                <span class="info"></span>
            </div>
            <div class="right">
                <span class="timer"></span>
                <span class="total_price"></span>
            </div>
        </div>
    </div>`);

    let status_class = {
        "0": "waiting",
        "1": "wait_production",
        "2": "wait_delivery",
        "3": "in_delivery",
        "10": "finished",
    }

    $order.addClass(status_class[order.status] || "refused");
    $order.attr("id_order", order.id_order);
    $order.find(".order_id").text(`#${order.order_company_sequence}`);
    $order.find(".client_name").text(order.name_client);

    if (order.delivery_type !== "withdrawal") $order.find(".infos>.left>.info").text(`${order.street_name || order.neighborhood || order.city}, ${order.street_number || order.state}`);
    else $order.find(".infos>.left>.info").html(`<span class="withdrawal">Retirada</span>`);

    $order.find(".infos>.right>.timer").text(MillisecondsToDate(DateSubtract(new Date(order.createdAt))));
    $order.find(".infos>.right>.total_price").text(MoneyFormat(order.total));

    const interval = setInterval(() => {
        if (!$order.length) clearInterval(interval);

        $order.find(".timer").text(MillisecondsToDate(DateSubtract(new Date(order.createdAt))));
    }, 5000);

    $order.on("click", () => {
        $order.parent().find(">.active").removeClass("active");

        viewOrder(order);
    });

    if (order.status === 0) {
        const open_orders = orders?.filter(order => order.status === 0) || [];

        setTimeout(() => {
            $order.addClass("new");
        }, open_orders?.length * 50);
    }

    const $existent = $(`.container-food_pedidos>.left>.list>[id_order="${order.id_order}"]`);

    if (!!$existent.length) $existent.replaceWith($order);
    else $(".container-food_pedidos>.left>.list").append($order);

    return $order;
}