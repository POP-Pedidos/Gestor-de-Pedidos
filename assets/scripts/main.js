const loadFile = (file) => {
	$(".content-page").load(file);
}

function NewTabInstance() {
	window.tab_instance = randomInt(1, Number.MAX_SAFE_INTEGER);
}

function ChangeTab(for_panel) {
	$(".content-page").show().empty();
	$("#whatsappWebView").hide();
	LoadOrders = undefined;

	$(".page-wrapper .sidebar-wrapper").removeClass("no-transition");
	$("#loading-wrapper").hide();
	$("#loading-wrapper-content").hide();

	window.cur_tab = for_panel;

	NewTabInstance();

	if (for_panel === "dashboard") {
		document.title = "POP Pedidos";
		loadFile("../dashboard/index.html")

	} else if (for_panel === "configuracoes_empresa") {
		document.title = "POP Pedidos | Configurações - Empresa";
		loadFile("../configuracoes/empresa/index.html");

	} else if (for_panel === "configuracoes_site") {
		document.title = "POP Pedidos | Configurações - Site";
		loadFile("../configuracoes/site/index.html");

	} else if (for_panel === "configuracoes_horarios") {
		document.title = "POP Pedidos | Configurações - Horários";
		loadFile("../configuracoes/horarios/index.html");

	} else if (for_panel === "configuracoes_impressoras") {
		document.title = "POP Pedidos | Configurações - Impressoras";
		loadFile("../configuracoes/impressoras/index.html");

	} else if (for_panel === "configuracoes_entrega") {
		document.title = "POP Pedidos | Configurações - Entrega";
		loadFile("../configuracoes/entrega/index.html");

	} else if (for_panel === "configuracoes_whatsapp") {
		document.title = "POP Pedidos | Configurações - WhatsApp";
		loadFile("../configuracoes/whatsapp/index.html");

	} else if (for_panel === "cadastros_categorias") {
		document.title = "POP Pedidos | Cadastros - Categorias";
		loadFile("../cadastros/categorias/index.html");

	} else if (for_panel === "cadastros_produtos") {
		document.title = "POP Pedidos | Cadastros - Produtos";
		loadFile("../cadastros/produtos/index.html");

	} else if (for_panel === "editar_complementos") {
		document.title = "POP Pedidos | Editar Complementos";
		loadFile("../cadastros/complementos/index.html");

	} else if (for_panel === "cadastros_tamanhos") {
		document.title = "POP Pedidos | Cadastros - Tamanhos";
		loadFile("../cadastros/tamanhos/index.html");

	} else if (for_panel === "cadastros_discount_cupom") {
		document.title = "POP Pedidos | Cadastros - Cupom de desconto";
		loadFile("../cadastros/discount_coupon/index.html");

	} else if (for_panel === "auditoria") {
		document.title = "POP Pedidos | Auditoria";
		loadFile("../auditoria/index.html");

	} else if (for_panel === "pedidos") {
		document.title = "POP Pedidos | Pedidos";
		loadFile("../pedidos/index.html");

	} else if (for_panel === "whatsapp") {
		document.title = "POP Pedidos | Whatsapp";
		$(".content-page").hide();
		$("#whatsappWebView").show();

	} else {
		document.title = "POP Pedidos";
		loadFile("../dashboard/index.html");
	}
}

jQuery(function ($) {
	// Dropdown menu
	$(".sidebar-menu>ul>li").click(function () {
		$(".sidebar-submenu").slideUp(200);

		if ($(this).hasClass("sidebar-dropdown")) {
			if ($(this).hasClass("open")) {
				$(this).removeClass("open");
			}
			else {
				$(".sidebar-menu>ul>li").removeClass("open");
				$(this).addClass("open");
				$(this).find(".sidebar-submenu").slideDown(200);
			}
		} else {
			if ($(this).hasClass("active")) {
				$(this).removeClass("active");
			} else {
				if (!$(this).hasClass("sidebar-dropdown")) {
					$(".sidebar-submenu>ul>li>a").removeClass("current-page");
					$(".sidebar-menu>ul>li>a").removeClass("current-page");
					$(this).find(">a").addClass("current-page");
				}
				$(this).addClass("active");
			}

			$(".sidebar-menu>ul>li").removeClass("active").removeClass("open");
		}
	});

	$(".sidebar-submenu").click(function (e) {
		e.stopPropagation();
		$(this).slideDown(200);
	});

	$(".sidebar-submenu>ul>li>a").click(function () {
		$(".sidebar-menu>ul>li").removeClass("active");
		$(".sidebar-submenu>ul>li>a").removeClass("current-page");
		$(".sidebar-menu>ul>li>a").removeClass("current-page");
		$(this).parent().parent().parent().parent().addClass("active");
		$(this).addClass("current-page");
	});

	//toggle sidebar
	$("#toggle-sidebar").click(function () {
		$(".page-wrapper").toggleClass("toggled");
	});



	// Pin sidebar on click
	$("#pin-sidebar").click(function () {
		$(".page-wrapper").toggleClass("pinned");
	});

	$(function () {
		// When the window is resized, 
		$(window).resize(function () {
			// When the width and height meet your specific requirements or lower
			if ($(window).width() <= 768) {
				$(".page-wrapper").removeClass("pinned");
			}
		});
		// When the window is resized, 
		$(window).resize(function () {
			// When the width and height meet your specific requirements or lower
			if ($(window).width() >= 768) {
				$(".page-wrapper").removeClass("toggled");
			}
		});
	});


	$("a[for_panel]").click(function (e) {
		e.preventDefault();

		const for_panel = $(this).attr("for_panel");

		ChangeTab(for_panel);
	});

	$(document).on("keyup keypress", "textarea, input", function () {
		const $input = $(this);
		const $small = $input.next();

		if ($small.is("small")) {
			const length = $input.val().length;
			const max = Number($input.attr("maxlength"));

			$small.text(`${length}/${max}`);
		}
	});

	$(document).on("focus", ".labelled_input>input", function () {
		$(this).parent().addClass("focus");
	});

	$(document).on("blur", ".labelled_input>input", function () {
		$(this).parent().removeClass("focus");
	});

	$(document).on("click", ".switch-option>button", function () {
		const $this = $(this);

		$this.parent().find(">button").removeClass("active");
		$this.addClass("active");
	});

	$(document).on("click", ".tabs>nav>span", function (e) {
		const index = $(this).index();

		$(this).parent().find(">span").removeClass("active");
		$(this).addClass("active");

		$(this).parent().parent().find(">main>*").removeClass("show").eq(index).addClass("show");

		let $indicator = $(this).parent().find(">.indicator");
		if ($indicator.length == 0) {
			$indicator = $(`<div class="indicator" style="transition: 0s;"></div>`);
			$(this).parent().append($indicator);
			setTimeout(() => $indicator.css("transition", ""), 50);
		}

		$indicator.css("left", `${e.target.offsetLeft}px`);
		$indicator.css("width", `${e.target.offsetWidth}px`);
	});

	$.fn.initTabs = function () {
		const $first = this.find(">nav>span:first-child");

		const interval = setInterval(() => {
			if ($first.is(':visible')) {
				$first.click();
				clearInterval(interval);
			}
		}, 5);

		return this;
	};

	$(document).on("click", ".quantity_selector>div", function () {
		const input = $(this).parent().find(">input");

		let cur_var = Number(input.val());

		if ($(this).hasClass("add")) cur_var += 1;
		else if ($(this).hasClass("remove")) cur_var -= 1;

		input.val(cur_var).trigger("pre_change");
	});

	$(document).on("pre_change change", ".quantity_selector>input", function (e, ignore) {
		if (ignore) return;

		const $this = $(this);
		const value_elem = $this.parent().find(".value>span");

		let cur_var = Number($this.val());

		const min = Number($this.attr("min"));
		const max = Number($this.attr("max"));

		if (cur_var < min) cur_var = min;
		if (cur_var > max) cur_var = max;

		$this.parent().find(">.remove").toggleClass("hide", cur_var <= min);
		$this.parent().find(">.add").toggleClass("hide", cur_var >= max);

		value_elem.text(cur_var);
		$this.val(cur_var).trigger("change", true);
	});

	$(document).on("click", ".switch_enable>span", function () {
		const $input = $(this).parent().find("input");
		const old_enabled = $input.prop("checked");
		const enabled = $(this).hasClass("on") && !$(this).hasClass("off");

		if (old_enabled == enabled) return;

		$input.prop("checked", enabled).change();
		$(this).parent().find("div.indicator").width($(this).outerWidth());
	});

	$(document).on("click", function () {
		$(".filter-options").removeClass("expand");
	});

	$(document).on("click", ".filter-options", function (e) {
		e.stopPropagation();

		if ($(this).hasClass("expand")) {
			$(".filter-options").removeClass("expand");
		} else {
			$(".filter-options").removeClass("expand");
			$(this).addClass("expand");
		}

	});

	$(document).on("click", ".filter-options>.options", function (e) {
		e.stopPropagation();
	});

	$(document).on("click", ".filter-options>.options>span", function () {
		$(".filter-options").removeClass("expand");
		const $filter = $(this).parent().parent();

		const value = $(this).attr("value") || $(this).text();

		$(this).parent().find(">span").removeClass("selected");
		$(this).addClass("selected");

		$filter.find(">.option>span").text($(this).text());
		$filter.data("value", value);
		$filter.trigger("change", [value]);
	});

	$.fn.initSwitchEnable = function () {
		const $this = $(this);

		if ($this.hasClass("switch_enable")) {
			const interval = setInterval(() => {
				if ($this.is(':visible')) {
					const $indicator = $this.find(">div.indicator");

					const enabled = $this.find(">input").is(":checked");

					$indicator.css("transition", "0s");
					$indicator.width($this.find(`>span.${enabled ? "on" : "off"}`).outerWidth());
					$indicator.css("transition", "");

					clearInterval(interval);
				}
			}, 5);
		}

		return this;
	};

	$.fn.animateValue = function (start = 0, end = 100, duration = 1000, formatter = null) {
		let startTimestamp = null;

		const step = (timestamp) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);

			const value = Math.floor(progress * (end - start) + start);

			this.text(typeof formatter === "function" ? formatter(value) : value);

			if (progress < 1) window.requestAnimationFrame(step);
		};

		window.requestAnimationFrame(step);

		return this;
	}

	setTimeout(() => {
		FetchAPI(`/order`, {
			params: {
				status: "opened",
				limit: 1,
			}
		}).then(orders_data => {
			if (orders.length == 0) orders = orders_data.results;
		});
	}, 1000);

	const alert_audio = new Audio("../../../sounds/alert.wav");

	setInterval(() => {
		if (!sessionStorage.token && !localStorage.token) return;

		const has_pendent_accept = !!orders?.find(order => order.status === 0);

		if (has_pendent_accept && alert_audio.paused) {
			taskbar.flashFrame(true);
			alert_audio.play();
		} else if (!has_pendent_accept && !alert_audio.paused) {
			taskbar.flashFrame(false);
			alert_audio.pause();
			alert_audio.currentTime = 0;
		}

		$(".page-wrapper .sidebar-wrapper .sidebar-menu ul li>a>i.alert").toggle(has_pendent_accept);
	}, 300);
});

function LoadOrderOnElement($element, order, actions = true) {
	const $order_infos = $(`<div class="infos">
		<div class="info">
			<div class="client_info">
				<div class="icon-key-value order-identifier">
					<div class="rounded-icon"><i class="fas fa-pizza-slice"></i></div>
					<div class="infos">
						<span class="title">Pedido</span>
						<a class="value" target="_blank"></a>
					</div>
				</div>
				<div class="icon-key-value client-info">
					<div class="rounded-icon"><i class="fas fa-user"></i></div>
					<div class="infos">
						<span class="name"></span>
						<span class="phone"></span>
					</div>
				</div>
				<div class="icon-key-value client-address">
					<div class="rounded-icon"><i class="fas fa-motorcycle"></i></div>
					<div class="infos">
						<span class="title">Endereço</span>
						<a class="address" target="_blank"></a>
						<span class="complement"></span>
						<span class="reference"></span>
					</div>
				</div>
				<div class="icon-key-value delivery-type">
					<div class="rounded-icon"><i class="fas fa-motorcycle"></i></div>
					<div class="infos">
						<span class="title">Tipo</span>
						<span class="value">Retirada</span>
					</div>
				</div>
			</div>
			<div class="actions">
				<div>
					<button type="button" class="btn btn-success accept">
						<span>Aceitar</span>
						<div class="spinner-border"></div>
					</button>
					<button type="button" class="btn btn-danger refuse">
						<span>Recusar</span>
					</button>
					<button type="button" class="btn btn-secondary print">
						<span>Impressão</span>
					</button>
				</div>
			</div>
		</div>
		<div class="history">
			<div class="step accept">
				<div class="trace-line"></div>
				<div class="icon">
					<i class="fas fa-check"></i>
				</div>
				<div class="infos">
					<span class="title"></span>
					<span class="date"></span>
				</div>
			</div>
			<div class="step production">
				<div class="trace-line"></div>
				<div class="icon">
					<i class="fas fa-box"></i>
				</div>
				<div class="infos">
					<span class="title"></span>
					<span class="date"></span>
				</div>
			</div>
			<div class="step delivery">
				<div class="trace-line"></div>
				<div class="icon">
					<i class="fas fa-forward"></i>
				</div>
				<div class="infos">
					<span class="title"></span>
					<span class="date"></span>
				</div>
			</div>
		</div>
		<div class="list-items"></div>
	</div>
	<div class="bottom">
		<div class="left">
			<div class="icon-key-value payment-method">
				<div class="rounded-icon"><i class="far fa-credit-card"></i></div>
				<div class="infos">
					<span class="title">Pagamento</span>
					<span class="value"></span>
				</div>
			</div>
			<div class="icon-key-value cash-change">
				<div class="rounded-icon"><i class="fas fa-dollar-sign"></i></div>
				<div class="infos">
					<span class="title">Troco para</span>
					<span class="value"></span>
				</div>
			</div>
			<div class="icon-key-value discount-coupon">
				<div class="rounded-icon"><i class="fas fa-tag"></i></div>
				<div class="infos">
					<span class="title">Cupom de desconto</span>
					<span class="value"></span>
				</div>
			</div>
			<div class="icon-key-value observations">
				<div class="rounded-icon"><i class="fas fa-info-circle"></i></div>
				<div class="infos">
					<span class="title">Observações</span>
					<span class="value"></span>
				</div>
			</div>
		</div>
		<div class="price">
			<table>
				<tr>
					<th>Subtotal</th>
					<td class="subtotal"></td>
				</tr>
				<tr class="discount">
					<th>Desconto</th>
					<td class="discount"></td>
				</tr>
				<tr>
					<th>Taxa de entrega</th>
					<td class="frete"></td>
				</tr>
				<tr class="coupon_discount">
					<th>Cupom de desconto</th>
					<td class="coupon_discount"></td>
				</tr>
				<tr>
					<th>Total</th>
					<td class="total"></td>
				</tr>
			</table>
		</div>
	</div>`);

	let $print_options = $("body>.order-print-options");

	$element.addClass("order-infos");

	$element.html($order_infos);

	$print_options.remove();
	$print_options = $(`<div class="order-print-options">
		<div>
			<header>
				<h4>Impressão</h4>
				<button class="close btn btn-danger"><i class="fas fa-times"></i></button>
			</header>
			<main>
				<div value="control">
					<img src="../../../images/box-analytics.png" />
					<span>Controle</span>
				</div>
				<div value="production">
					<img src="../../../images/box-todo.png" />
					<span>Produção</span>
				</div>
				<div value="delivery">
					<img src="../../../images/box-delivery.png" />
					<span>Entrega</span>
				</div>
			</main>
		</div>
	</div>`);

	if (order.items.every(item => !item.product.id_printer)) $print_options.find(`[value="production"]`).addClass("disabled");

	$print_options.find(".close").on("click", function () {
		$print_options.fadeOut(300);
	});

	$print_options.on("mousedown", function () {
		$print_options.fadeOut(300);
	});

	$print_options.find(">div").on("mousedown", function (e) {
		e.stopPropagation();
	});

	$print_options.find("main>div").on("click", function () {
		const value = $(this).attr("value");

		const order_data = { ...order };
		order_data.address = order.delivery_type !== "withdrawal" ? `${order.street_name}, ${order.street_number} - ${order.neighborhood}, ${order.city} - ${order.state}` : null;
		order_data.dt_accept = new Date(order.dt_accept).toISOString();

		const primary_printer_device = {
			...primary_printer,
			device: GetLocalPrinter(primary_printer?.id_printer) || primary_printer?.device,
		};

		if (value === "control") {
			printService.printControlCopy(primary_printer_device, order_data, company);
		} else if (value === "delivery") {
			printService.printDeliveryCopy(primary_printer_device, order_data, company);
		} else if (value === "production") {
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

				printService.printProductionCopy(printer, order_data, company);
			}
		}

		$print_options.fadeOut(200);
	});

	$order_infos.find(".actions>div>.print").on("click", function () {
		$print_options.fadeIn(300).css("display", "flex");
	});

	$("body").append($print_options);

	order.address = order.delivery_type !== "withdrawal" ? `${order.street_name}, ${order.street_number} - ${order.neighborhood}, ${order.city} - ${order.state}` : null;

	$element.find(".order-identifier .value").text(`#${order.order_company_sequence}`)
		.attr("href", `https://${company.subdomain}.${domain}/pedido/${order.secret_id_order}`);

	$element.find(".client-info .name").text(order.name_client);
	$element.find(".client-info .phone").text(order.phone_client);

	$element.find(".client-address").toggle(order.delivery_type !== "withdrawal");
	$element.find(".client-address .address").text(`${order.address} ${order.suplier || ""}`)
		.attr("href", `https://maps.google.com/maps?q=${order.address}&hl=pt-BR;z=14&amp;output=embed`);

	$element.find(".client-address .complement").text(order.complement)
	$element.find(".client-address .reference").text(order.reference)

	$element.find(".delivery-type").toggle(order.delivery_type === "withdrawal");

	const $list_items = $element.find(".list-items");

	$list_items.empty();

	$list_items.toggleClass("is_multiplication", company.multiply_complements);

	$list_items.append(`<header class="list-title">
		<span class="quantity">Qtde</span>
		<span class="name">Produto</span>
		<span class="total">Subtotal (R$)</span>
	</header>`);

	if (company.multiply_complements && (order.items.some(item => item.complements?.length > 0) || order.items.some(item => item.pizza_flavors?.length > 1))) {
		$list_items.append(`<div class="multiplication-alert">
			<i class="fas fa-exclamation-triangle"></i>
			<span>Os sabores e complementos estão sendo multiplicados!</span>
		</div>`);
	}

	for (const item of order.items || []) {
		const {
			product,
			complements,
			pizza_flavors,
			pizza_price_rule,
		} = item;

		if (!product) continue;

		const $product = $(`
            <div>
                <header>
                    <span class="quantity"></span>
                    <span class="name">
                        <span></span>
                        <small></small>
                    </span>
                    <span class="price"></span>
                </header>
            </div>
        `);

		if (item.observation) {
			const $observation = $(`<div class="observation">
                <span class="title">Observação:</span>
                <span class="text">Nenhum</span>
            </div>`);

			$observation.find(".text").text(item.observation);

			$product.append($observation);
		}

		const $main = $("<main>");

		for (const flavor of pizza_flavors || []) {
			const $optional = $(`<div>
                <span class="quantity"></span>
                <span class="name"></span>
                <span class="price"></span>
            </div>`);

			const total_flavors = item.pizza_flavors.reduce((accumulator, flavor) => accumulator + flavor.quantity, 0);

			$optional.find(".quantity").text(pizza_flavors.length > 1 ? `${flavor.quantity}/${total_flavors}` : `${(company.multiply_complements ? flavor.quantity * item.quantity : flavor.quantity) || 1} x`);

			$optional.find(".name").text(`Sabor ${flavor.name}`);
			$optional.find(".price").attr("title", `Valor unitário: ${MoneyFormat(flavor.price)}\nValor total: ${MoneyFormat(flavor.price * flavor.quantity)}`);
			
			product.pizza_price_rule = pizza_price_rule || product.pizza_price_rule;
			
			if (product.pizza_price_rule === "average") {
				$optional.find(".price").text(MoneyFormat((flavor.price / total_flavors) * flavor.quantity, false));
			} else if (product.pizza_price_rule === "biggest_price") {
				const biggest_price = Math.max(...item.pizza_flavors.map(item => item.price));

				$optional.find(".price").text(MoneyFormat((biggest_price / total_flavors) * flavor.quantity, false));
			} else {
				$optional.find(".price").text(MoneyFormat(flavor.price * flavor.quantity, false));
			}

			$main.append($optional);
		}

		for (const complement of complements || []) {
			for (const complement_item of complement.items || []) {
				const $optional = $(`<div>
                    <span class="quantity"></span>
                    <span class="name"></span>
                    <span class="price"></span>
                </div>`);

				$optional.find(".quantity").text(`${complement.required === false ? "+ " : ""}${(company.multiply_complements ? complement_item.quantity * item.quantity : complement_item.quantity) || 1} x`);

				$optional.find(".name").text(complement_item.name);
				$optional.find(".price")
					.text(MoneyFormat(complement_item.price * complement_item.quantity * item.quantity, false))
					.attr("title", `Valor unitário: ${MoneyFormat(complement_item.price)}\nValor total: ${MoneyFormat(complement_item.price * complement_item.quantity * item.quantity)}`);

				$main.append($optional);
			}
		}

		$product.find(".quantity").text(`${item.quantity || 1} x`);

		$product.find(".name>span").text(product.name);

		if (product.is_pizza) {
			let pizza_price_rule = "?";

			if (product.pizza_price_rule === "average") pizza_price_rule = "Média dos sabores";
			if (product.pizza_price_rule === "biggest_price") pizza_price_rule = "Sabor mais caro";

			$product.find(".name>small").text(`(${pizza_price_rule})`);
		}

		$product.find(".name>small").text("");
		$product.find(".price")
			.text(MoneyFormat(item.price * item.quantity, false))
			.attr("title", `Valor unitário: ${MoneyFormat(product.price)}\nValor total: ${MoneyFormat(item.price * item.quantity)}`);

		$product.append($main);

		$list_items.append($product);
	}

	$element.find(".price .subtotal").text(MoneyFormat(order.subtotal));
	$element.find(".price .frete").text(MoneyFormat(order.delivery_cost));

	$element.find(".price tr.discount").toggle(order.discount > 0);
	$element.find(".price td.discount").text(MoneyFormat(order.discount));

	$element.find(".price tr.coupon_discount").toggle(order.coupon_discount > 0);
	$element.find(".price td.coupon_discount").text(MoneyFormat(order.coupon_discount));

	$element.find(".price .total").text(MoneyFormat(order.total));

	$element.find(".bottom .observations").toggle(!!order.observation);
	$element.find(".bottom .observations .value").text(order.observation);

	let text_payment_method = "Dinheiro"
	if (order.payment_method == "credit") text_payment_method = "Cartão de crédito";
	if (order.payment_method == "debit") text_payment_method = "Débito";
	$element.find(".bottom .payment-method .value").text(text_payment_method);

	$element.find(".bottom .cash-change").toggle(!!order.cash_change);
	$element.find(".bottom .cash-change .value").text(MoneyFormat(order.cash_change));

	$element.find(".bottom .discount-coupon").toggle(!!order.discount_coupon);
	if (!!order.discount_coupon) {
		$element.find(".bottom .discount-coupon .value").text(`${order.discount_coupon.coupon} (${order.discount_coupon.is_percentual ? `${order.discount_coupon.discount}%` : MoneyFormat(order.discount_coupon.discount)} OFF)`);
	}

	$element.find(".history>.step").removeClass("active").removeClass("success").removeClass("refused");
	$element.find(".history>.step .title").text("");
	$element.find(".history>.step .date").text("");
	$element.find(">.infos .actions").show();
	$element.find(">.infos .actions>div>button").removeClass("loading").show();

	const status = order.status > -1 ? order.status : Math.abs(order.status + 1);

	if (status == 0) {
		$element.find(">.infos .actions .accept>span").text("Aceitar");
		$element.find(">.right>.infos .actions .refuse>span").text("Recusar");

		$element.find(".history>.step.accept").addClass("active");

		$element.find(".history>.step.accept .title").text("Aguardando aceite");
		$element.find(".history>.step.production .title").text("Aguardando produção");
		$element.find(".history>.step.delivery .title").text("Aguardando entrega");
	} else if (status == 1) {
		$element.find(">.infos .actions .accept>span").text("Foi produzido");
		$element.find(">.infos .actions .refuse>span").text("Cancelar");

		$element.find(".history>.step.accept").addClass("success");
		$element.find(".history>.step.production").addClass("active");

		$element.find(".history>.step.accept .title").text("Aceito");
		$element.find(".history>.step.production .title").text("Aguardando produção");
		$element.find(".history>.step.delivery .title").text("Aguardando entrega");

		$element.find(".history>.step.accept .date").text(DateTimeFormat(order.status_times.find(status => status.status == 1)?.createdAt));
	} else if (status == 2) {
		$element.find(">.infos .actions .accept>span").text(order.delivery_type == "withdrawal" ? "Foi retirado" : "Saiu para a entrega");
		$element.find(">.infos .actions .refuse>span").text("Cancelar");

		$element.find(".history>.step.accept").addClass("success");
		$element.find(".history>.step.production").addClass("success");
		$element.find(".history>.step.delivery").addClass("active");

		$element.find(".history>.step.accept .title").text("Aceito");
		$element.find(".history>.step.production .title").text("Produzido");
		$element.find(".history>.step.delivery .title").text("Aguardando entrega");

		$element.find(".history>.step.accept .date").text(DateTimeFormat(order.status_times.find(status => status.status == 1)?.createdAt));
		$element.find(".history>.step.production .date").text(DateTimeFormat(order.status_times.find(status => status.status == 2)?.createdAt));
	} else if (status == 3) {
		$element.find(">.infos .actions .accept>span").text("Foi entregue");
		$element.find(">.infos .actions .refuse>span").text("Cancelar");

		$element.find(".history>.step.accept").addClass("success");
		$element.find(".history>.step.production").addClass("success");
		$element.find(".history>.step.delivery").addClass("active");

		$element.find(".history>.step.accept .title").text("Aceito");
		$element.find(".history>.step.production .title").text("Produzido");
		$element.find(".history>.step.delivery .title").text("Saiu para entrega");

		$element.find(".history>.step.accept .date").text(DateTimeFormat(order.status_times.find(status => status.status == 1)?.createdAt));
		$element.find(".history>.step.production .date").text(DateTimeFormat(order.status_times.find(status => status.status == 3)?.createdAt));
	} else if (status == 10) {
		$element.find(">.infos .actions").hide();

		$element.find(".history>.step.accept").addClass("success");
		$element.find(".history>.step.production").addClass("success");
		$element.find(".history>.step.delivery").addClass("success");

		$element.find(".history>.step.accept .title").text("Aceito");
		$element.find(".history>.step.production .title").text("Produzido");
		$element.find(".history>.step.delivery .title").text("Entregue");

		$element.find(".history>.step.accept .date").text(DateTimeFormat(order.status_times.find(status => status.status == 1)?.createdAt));
		$element.find(".history>.step.production .date").text(DateTimeFormat(order.status_times.find(status => status.status == 3)?.createdAt));
		$element.find(".history>.step.delivery .date").text(DateTimeFormat(order.status_times.find(status => status.status == 10)?.createdAt));
	}

	if (order.status < 0) {
		$element.find(".history>.step.active .title").text("Recusado");
		$element.find(".history>.step.active .date").text(DateTimeFormat(order.dt_refuse));
		$element.find(".history>.step.active").removeClass("active").addClass("refused");

		$element.find(">.infos .actions .accept>span").text("Aceitar pedido");
		$element.find(">.infos .actions .refuse").hide();
	}

	if (!actions) $element.find(">.infos .actions").hide();
}
