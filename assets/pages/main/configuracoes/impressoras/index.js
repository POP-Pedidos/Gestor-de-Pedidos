var table_configuracoes_impressoras = $("#table-configuracoes-impressoras").DataTable({
    language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json"
    },
    ordering: false,
    searching: false,
    paging: false,
    info: false,
});

$("#btnModalImpressora").on("click", function (e) {
    $("#frmImpressora select.device").empty();
    for (const printer_name of GetPrintersList()) {
        $("#frmImpressora select.device").append(`<option>${printer_name}</option>`);
    }
    $("#frmImpressora select.device").selectpicker("refresh");
    $("#frmImpressora select.device").val("");
    $("#frmImpressora select.device").selectpicker("refresh");

    $("#frmImpressora select.size").selectpicker("refresh");
    $("#frmImpressora select.size").val("");
    $("#frmImpressora select.size").selectpicker("refresh");

    $("#frmImpressora select.type").selectpicker("refresh");
    $("#frmImpressora select.type").val("");
    $("#frmImpressora select.type").selectpicker("refresh");

    $("#frmImpressora select.columns").selectpicker("refresh");
    $("#frmImpressora select.columns").val("");
    $("#frmImpressora select.columns").selectpicker("refresh");

    $("#frmImpressora select.font_scale").selectpicker("refresh");
    $("#frmImpressora select.font_scale").val("");
    $("#frmImpressora select.font_scale").selectpicker("refresh");

    $("#frmImpressora select.padding").selectpicker("refresh");
    $("#frmImpressora select.padding").val("");
    $("#frmImpressora select.padding").selectpicker("refresh");

    $("#frmImpressora .form-group.columns").hide();
    $("#frmImpressora .form-group.font_scale").hide();
    $("#frmImpressora .form-group.size").hide();
    $("#frmImpressora .form-group.padding").hide();

    $("#frmImpressora select.columns").attr("disabled", true);
    $("#frmImpressora select.size").attr("disabled", true);
    $("#frmImpressora select.font_scale").attr("disabled", true);
    $("#frmImpressora select.padding").attr("disabled", true);

    $("#modalImpressora").modal("show");
});

$("#frmImpressora").on("submit", function (e) {
    e.preventDefault();

    $("#frmImpressora .modal-footer>button").addClass("loading");

    const formData = $(this).serializeFormJSON();

    FetchAPI("/printers", {
        method: "POST",
        body: formData
    }).then(printer => {
        printers.push(printer);
        AddLocalPrinter(printer.id_printer, printer.device);

        const switch_id = `switch_${MakeID(10)}`;
        const rowNode = table_configuracoes_impressoras.row.add([
            printer.name,
            printer.device,
            `<div class="custom-switch"><input type="radio" name="primary_printer" id="${switch_id}" ${printer.is_primary ? "checked" : ""} onchange="setDefaultPrinter(${printer.id_printer})"/><label for="${switch_id}">Toggle</label></div>`,
            `<button class="btn btn-danger" onclick="excluirImpressora(${printer.id_printer}, this)"><i class="fas fa-trash"></i><div class="spinner-border"></div></button> <button class="btn btn-success" onclick="editarImpressora(${printer.id_printer})"><i class="fas fa-edit"></i></button>`
        ]).node();

        $(rowNode).attr("id_printer", printer.id_printer);
        table_configuracoes_impressoras.draw();

        $("#modalImpressora").modal("hide");
        $("#frmImpressora")[0].reset();
    }).catch(error => {
        if (error == "already_exists") Swal.fire("Opss...", `Já existe uma impressora com o nome "${formData.name}"!`, "error");
        else Swal.fire("Opss...", "Ocorreu um erro ao tentar adicionar a impressora!", "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        $("#frmImpressora .modal-footer>button").removeClass("loading");
    });
});

$("#frmEditImpressora").on("submit", function (e) {
    e.preventDefault();

    $("#frmEditImpressora .modal-footer>button").addClass("loading");

    const edit_printer_id = $(this).attr("id_printer");
    const formData = $(this).serializeFormJSON();
    
    FetchAPI(`/printers/${edit_printer_id}`, {
        method: "PUT",
        body: formData
    }).then(printer => {
        AddLocalPrinter(printer.id_printer, printer.device);
        ArrayChange(printers, printer, val => val.id_printer == printer.id_printer);

        $(`tr[id_printer="${edit_printer_id}"]>td:nth-child(1)`).text(printer.name);
        $(`tr[id_printer="${edit_printer_id}"]>td:nth-child(2)`).text(printer.device);

        $("#modalEditImpressora").modal("hide");
        $("#frmEditImpressora")[0].reset();
    }).catch(error => {
        if (error == "already_exists") Swal.fire("Opss...", `Já existe uma impressora com o nome "${formData.name}"!`, "error");
        else Swal.fire("Opss...", "Ocorreu um erro ao salvar a edição da impressora!", "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        $("#frmEditImpressora .modal-footer>button").removeClass("loading");
    });
});

function setDefaultPrinter(id_printer) {
    const printer = printers.find(printer => printer.id_printer == id_printer);

    FetchAPI(`/printers/${id_printer}`, {
        method: "PUT",
        body: { is_primary: true }
    }).then(printer => {
        ArrayChange(printers, printer, val => val.id_printer == printer.id_printer);
    }).catch(error => {
        Swal.fire("Opss...", `Ocorreu um erro ao tentar setar a impressora <b>${printer.name}</b> como principal!`, "error");
        Swal.showValidationMessage(error);
    });
}

function excluirImpressora(id_printer, elem) {
    $(elem).addClass("loading");

    const printer = printers.find(printer => printer.id_printer = id_printer);

    Swal.fire({
        title: "Muita calma!!",
        html: `Você tem certeza que deseja excluir a impressora <b>${id_printer}</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
    }).then(result => {
        if (result.isConfirmed) {
            FetchAPI(`/printers/${id_printer}`, {
                method: "DELETE",
                body: { is_primary: true }
            }).then(data => {
                table_configuracoes_impressoras.row($(`tr[id_printer="${id_printer}"]`)).remove().draw();

                ArrayRemoveIndex(printers, val => val.id_printer == id_printer);
                RemoveLocalPrinter(id_printer);
            }).catch(error => {
                if (error === "in_use") Swal.fire("Opss...", `A impressora <b>${printer.name}</b> não pode ser apagada pois está sendo usado por um produto!`, "error");
                else Swal.fire("Opss...", `Ocorreu um erro ao tentar apagar a impressora <b>${printer.name}</b>!`, "error");
                Swal.showValidationMessage(error);
            }).finally(() => {
                $(elem).removeClass("loading");
            });
        } else {
            $(elem).removeClass("loading");
        }
    });
}

function editarImpressora(id) {
    const printer = printers.find(val => val.id_printer == id);

    $("#frmEditImpressora").find(".name").val(printer.name);
    $("#frmEditImpressora").attr("id_printer", printer.id_printer);

    $("#frmEditImpressora select.device").empty();
    for (const printer_name of GetPrintersList()) {
        $("#frmEditImpressora select.device").append(`<option>${printer_name}</option>`);
    }

    $("#frmEditImpressora select.columns").attr("disabled", printer.type !== "text");
    $("#frmEditImpressora select.size").attr("disabled", printer.type !== "graphic");
    $("#frmEditImpressora select.font_scale").attr("disabled", printer.type !== "graphic");
    $("#frmEditImpressora select.padding").attr("disabled", printer.type !== "graphic");

    $("#frmEditImpressora select.device").selectpicker("refresh");
    $("#frmEditImpressora select.device").val(printer.device);
    $("#frmEditImpressora select.device").selectpicker("refresh");

    $("#frmEditImpressora select.size").selectpicker("refresh");
    $("#frmEditImpressora select.size").val(printer.size);
    $("#frmEditImpressora select.size").selectpicker("refresh");

    $("#frmEditImpressora select.type").selectpicker("refresh");
    $("#frmEditImpressora select.type").val(printer.type);
    $("#frmEditImpressora select.type").selectpicker("refresh");

    $("#frmEditImpressora select.columns").selectpicker("refresh");
    $("#frmEditImpressora select.columns").val(printer.size);
    $("#frmEditImpressora select.columns").selectpicker("refresh");

    $("#frmEditImpressora select.font_scale").selectpicker("refresh");
    $("#frmEditImpressora select.font_scale").val(printer.font_scale);
    $("#frmEditImpressora select.font_scale").selectpicker("refresh");

    $("#frmEditImpressora select.padding").selectpicker("refresh");
    $("#frmEditImpressora select.padding").val(printer.padding);
    $("#frmEditImpressora select.padding").selectpicker("refresh");

    $("#frmEditImpressora .form-group.columns").toggle(printer.type === "text");
    $("#frmEditImpressora .form-group.font_scale").toggle(printer.type === "graphic");
    $("#frmEditImpressora .form-group.size").toggle(printer.type === "graphic");
    $("#frmEditImpressora .form-group.padding").toggle(printer.type === "graphic");

    $("#modalEditImpressora").modal("show");
}

$("#loading-wrapper-content").css("display", "flex").show();

FetchAPI(`/printers`, { instance_check: true, }).then(printers_data => {
    printers = printers_data;
    primary_printer = printers.filter(printer => !!printer.is_primary);

    printers.forEach(printer => {
        const local_printer = GetLocalPrinter(printer.id_printer);
        if (local_printer) printer.device = local_printer;

        const switch_id = `switch_${MakeID(10)}`;
        const rowNode = table_configuracoes_impressoras.row.add([
            printer.name,
            printer.device,
            `<div class="custom-switch"><input type="radio" name="primary_printer" id="${switch_id}" ${printer.is_primary ? "checked" : ""} onchange="setDefaultPrinter(${printer.id_printer})"/><label for="${switch_id}">Toggle</label></div>`,
            `<button class="btn btn-danger" onclick="excluirImpressora(${printer.id_printer}, this)"><i class="fas fa-trash"></i><div class="spinner-border"></div></button> <button class="btn btn-success" onclick="editarImpressora(${printer.id_printer})"><i class="fas fa-edit"></i></button>`
        ]).node();

        $(rowNode).attr("id_printer", printer.id_printer);
    });

    table_configuracoes_impressoras.draw();
}).catch(error => {
    Swal.fire("Opss...", "Ocorreu um erro fatal ao tentar listar as impressoras!", "error");
    Swal.showValidationMessage(error);
}).finally(() => {
    $("#loading-wrapper-content").fadeOut(400);
});

$(".selectpicker").selectpicker({
    noneSelectedText: "Nada selecionado",
});

$("select.selectpicker.type").on("change", function () {
    const value = $(this).val();

    $(".form-group.columns").toggle(value === "text");
    $(".form-group.font_scale").toggle(value === "graphic");
    $(".form-group.size").toggle(value === "graphic");
    $(".form-group.padding").toggle(value === "graphic");

    $("select.columns").attr("disabled", value !== "text");
    $("select.size").attr("disabled", value !== "graphic");
    $("select.font_scale").attr("disabled", value !== "graphic");
    $("select.padding").attr("disabled", value !== "graphic");

    $("select.size").selectpicker("refresh");
    $("select.font_scale").selectpicker("refresh");
    $("select.columns").selectpicker("refresh");
    $("select.padding").selectpicker("refresh");
});