function CheckExportEnabled() {
    $(".audit-results-container>.header-infos>button.export").addClass("disabled");

    FetchAPI(`/order`, {
        instance_check: true,
        params: {
            limit: 0,
            start_date: $(".filter-date.start>input").val(),
            end_date: $(".filter-date.end>input").val(),
        }
    }).then(data => {
        if (data.metadata.max > 0) {
            $(".audit-export-modal .total_export").text(data.metadata.max);
            $(".audit-results-container>.header-infos>button.export").removeClass("disabled");
        }
    });
}

CheckExportEnabled();

$(".audit-results-container>.header-infos>button.export").click(function () {
    const start = $(".filter-date.start>input").val().split("-");
    const end = $(".filter-date.end>input").val().split("-");
    const start_date = new Date(start[0], start[1] - 1, start[2]);
    const end_date = new Date(end[0], end[1] - 1, end[2]);
    const days = (end_date - start_date) / 24 / 60 / 60 / 1000;

    $(".audit-export-modal").toggleClass("invalid-days", days > 31);
    $(".audit-export-modal .warning>span").text(days);

    $(".audit-export-modal .from>.date").text(`${start_date.getDate()} de ${start_date.toLocaleDateString("pt-BR", { month: "short" })}`);
    $(".audit-export-modal .to>.date").text(`${end_date.getDate()} de ${end_date.toLocaleDateString("pt-BR", { month: "short" })}`);

    $(".audit-export-modal>.loading .progress-bar").css("width", `0%`);
    $(".audit-export-modal").removeClass("loading success").fadeIn(200).css("display", "flex");
});

$(".audit-export-modal").click(function () {
    if (!$(this).hasClass("loading")) {
        $(this).fadeOut(200);
    }
});

$(".audit-export-modal>div").click(function (e) {
    e.stopPropagation();
});

$(".audit-export-modal>div>main>div").click(async function () {
    const file_type = $(this).attr("file-type");
    const start = $(".filter-date.start>input").val().split("-");
    const end = $(".filter-date.end>input").val().split("-");
    const start_date = new Date(start[0], start[1] - 1, start[2]);
    const end_date = new Date(end[0], end[1] - 1, end[2]);

    let out_dir;
    let file_type_text = "Indefinido";

    switch (file_type) {
        case "xls":
            file_type_text = "XLS (Excel)";
            out_dir = await internalAsync.showSaveDialog({ title: "Salvar exportação", filter: ".xls Files (*.xls)|*.xls", default_ext: ".xls" });
            break;
        case "html":
            file_type_text = "HTML";
            out_dir = await internalAsync.showSaveDialog({ title: "Salvar exportação", filter: ".html Files (*.html)|*.html", default_ext: ".html" });
            break;
    }

    $(".audit-export-modal.loading .file-type").text(file_type_text);
    $(".audit-export-modal>.loading .progress-bar").css("width", `0%`);

    $(".audit-export-modal").addClass("loading");

    const metadata = {};
    const results = [];

    while (!metadata.max || results.length < metadata.max) {
        console.log("loop");
        await FetchAPI(`/order`, {
            params: {
                offset: results.length,
                relationships: true,
                start_date: $(".filter-date.start>input").val(),
                end_date: $(".filter-date.end>input").val(),
            }
        }).then(data => {
            console.log("data", data);
            metadata.max = data.metadata.max;

            for (const order of data.results) results.push(order);

            $(".audit-export-modal>.loading .progress-bar").css("width", `${(results.length / metadata.max) * 100}%`);
        }).catch(error => {
            Swal.fire("Opss...", "Ocorreu um erro ao tentar listar os pedidos!", "error");
            Swal.showValidationMessage(error);
        });
        console.log("sleep");
        await Sleep(100);
    }

    $(".audit-export-modal>.success .file_output").show();
    console.log("1111");
    switch (file_type) {
        case "xls":
            const orders_data = XLSX.utils.json_to_sheet(results.map(order => {
                let text_payment_method = "Dinheiro";
                if (order.payment_method == "credit") text_payment_method = "Cartão de crédito";
                else if (order.payment_method == "debit") text_payment_method = "Débito";

                let text_delivery_type = "Entrega";
                if (order.delivery_type == "withdrawal") text_delivery_type = "Retirada";

                return {
                    "ID": order.id_order,
                    "Data": DateTimeFormat(order.createdAt),
                    "Método": text_delivery_type,
                    "Método de pagamento": text_payment_method,
                    "Cupom de desconto": order.discount_coupon?.coupon,
                    "Cliente": order.name_client,
                    "Telefone": order.phone_client,
                    "CPF/CNPJ na nota": order["cpf-cnpj_note"],
                    "Rua": order.street_name,
                    "Número": order.street_number,
                    "Bairro": order.neighborhood,
                    "Cidade": order.city,
                    "Estado": order.state,
                    "Complemento do endereço": order.complement,
                    "Observação": order.observation,
                    "Coordenadas": order.location,
                    "Status": order.status,
                    "Subtotal": order.subtotal,
                    "Taxa de entrega": order.delivery_cost,
                    "Desconto": order.discount,
                    "Desconto Cupom": order.coupon_discount,
                    "Total": order.total,
                    "Produto integrado": order.id_integrated,
                    "URL": `https://${company.subdomain}.${domain}/pedido/${order.secret_id_order}`,
                }
            }));

            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, orders_data, "Pedidos");

            const file_content = XLSX.write(workbook, { type: 'base64', bookType: "xls" });

            await internalAsync.writeFile(out_dir, file_content);

            break;
        case "html":
            await internalAsync.generateOrdersHTMLReport(out_dir, {
                orders: results,
                company,
                range_dates: {
                    start: start_date,
                    end: end_date,
                }
            });
            break;
    }
    console.log("222");
    $(".audit-export-modal").removeClass("loading");
    $(".audit-export-modal").addClass("success");

    $(".audit-export-modal>.success .file_output").on("click", function () {
        internal.startProcess(out_dir);
    });
});