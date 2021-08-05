$(".modal-printers>div>.header>button.back").on("click", function () {
    $(".modal-printers").removeClass("show");
});

$(".modal-printers>div>.footer>button.cancel").on("click", function () {
    $(".modal-printers").removeClass("show");
});

$(".modal-printers>div>.footer>button.save").on("click", function () {
    $(".modal-printers>div>form button[type=submit]").click();
});

$(".content-column.printers .devices .default-printer>div").on("click", function (e) {
    e.stopPropagation();
    $(this).toggleClass("show-dropdown");
});

$(document).off("click.printer-dropdown").on("click.printer-dropdown", function () {
    $(".content-column.printers .devices .default-printer>div").removeClass("show-dropdown");
});

$(".modal-printers>div select[name=type]").on("change", function () {
    const value = $(this).val();
    const $modal = $(".modal-printers>div");

    $modal.find("label.columns").toggle(value === "text").toggleClass("hidden", value !== "text");
    $modal.find("label.size").toggle(value === "graphic").toggleClass("hidden", value !== "graphic");
    $modal.find("label.font_scale").toggleClass("hidden", value !== "graphic");
    $modal.find("label.padding").toggleClass("hidden", value !== "graphic");

    $modal.find(".columns select").attr("disabled", value !== "text").selectpicker("refresh");
    $modal.find(".size select").attr("disabled", value !== "graphic").selectpicker("refresh");
    $modal.find(".font_scale select").attr("disabled", value !== "graphic").val("1").selectpicker("refresh");
    $modal.find(".padding select").attr("disabled", value !== "graphic").val("0").selectpicker("refresh");
});

function ShowCreatePrinterModal() {
    const $modal = $(".modal-printers>div");
    const $form = $modal.find("form");
    const $save_btn = $modal.find("button.save");
    const $delete_btn = $modal.find("button.delete");

    $(".modal-printers>div>.header>.title").text(`Nova impressora`);

    $form[0].reset();
    $delete_btn.hide();

    $modal.find("select[name=device]").empty();
    for (const printer_name of GetPrintersList()) {
        $modal.find("select[name=device]").append($("<option>").text(printer_name));
    }

    $modal.find("label.columns").hide();
    $modal.find("label.size").show().addClass("hidden");
    $modal.find("label.font_scale").addClass("hidden");
    $modal.find("label.padding").addClass("hidden");

    $modal.find("select[name=type]").selectpicker("refresh").val("").selectpicker("refresh").change();

    $modal.find("select").selectpicker("refresh").val("").selectpicker("refresh");

    $form.off("submit").on("submit", function (e) {
        e.preventDefault();

        const form_data = $form.serializeFormJSON();

        $save_btn.addClass("loading");
        $modal.addClass("loading");

        FetchAPI(`/printers`, {
            method: "POST",
            body: form_data
        }).then(new_printer => {
            printers.push(new_printer);
            AddLocalPrinter(new_printer.id_printer, new_printer.device);

            LoadPrinters();
            $(".modal-printers").removeClass("show");
        }).catch(error => {
            if (error == "already_exists") Swal.fire("Opss...", `Já existe uma impressora com o nome "${form_data.name}"!`, "error");
            else Swal.fire("Opss...", "Ocorreu um erro ao tentar adicionar a impressora!", "error");
            Swal.showValidationMessage(error);
        }).finally(() => {
            $save_btn.removeClass("loading");
            $modal.removeClass("loading");
        });
    });

    $(".modal-printers").addClass("show");
}

function LoadDefaultPrinter() {
    const $default_printer = $(".content-column.printers .devices .default-printer>div");
    const $dropdown = $default_printer.find(">.dropdown");
    const $name = $default_printer.find(".infos>.name");
    const $device = $default_printer.find(".infos>.device");

    $dropdown.empty();

    let promise;

    for (const printer of printers) {
        const $printer = $(`<span>`).text(printer.name);

        $printer.on("click", function () {
            $name.text(printer.name);
            $device.text(printer.device);

            promise?.abort();

            promise = FetchAPI(`/printers/${printer.id_printer}`, {
                method: "PUT",
                body: { is_primary: true }
            });

            promise.then(new_printer => {
                Object.assign(printer, new_printer);

                RemoveLocalPrinter(new_printer.id_printer);
                AddLocalPrinter(new_printer.id_printer, new_printer.device);

                LoadPrinters();
            }).catch(error => {
                Swal.fire("Opss...", `Ocorreu um erro ao tentar setar a impressora <b>${printer.name}</b> como principal!`, "error");
                Swal.showValidationMessage(error);

                LoadDefaultPrinter();
            });
        });

        $dropdown.append($printer);
    }

    const $new = $(`<span><i class="fas fa-plus"></i> Adicionar novo</span>`);

    $new.on("click", () => ShowCreatePrinterModal());

    $dropdown.append($new);

    $default_printer.toggleClass("selected", !!primary_printer);

    if (!!primary_printer) {
        $name.text(primary_printer.name);
        $device.text(primary_printer.device);
    } else {
        $name.text("Adicionar um dispositívo");
        $device.text("");
    }
}

function LoadPrinters() {
    const $content = $(".content-column.printers .devices .printers-list");

    $content.empty();

    for (const printer of printers) {
        const $printer = $(`<div class="printer">
            <i class="fas fa-pen"></i>
            <img src="../../../images/printer-solid.svg">
            <span class="name"></span>
            <span class="device"></span>
        </div>`);

        $printer.find(".name").text(printer.name);
        $printer.find(".device").text(printer.device);

        $printer.on("click", function () {
            const $modal = $(".modal-printers>div");
            const $form = $modal.find("form");
            const $save_btn = $modal.find("button.save");
            const $delete_btn = $modal.find("button.delete");

            $modal.find(">.header>.title").html(`Impressora <b></b>`);
            $modal.find(">.header>.title>b").text(printer.name);

            $modal.find("[name=name]").val(printer.name);

            $modal.find("select[name=device]").empty();
            for (const printer_name of GetPrintersList()) {
                $modal.find("select[name=device]").append($("<option>").text(printer_name));
            }

            $modal.find("label.columns").toggle(printer.type === "text");
            $modal.find("label.size").toggle(printer.type === "graphic");

            $modal.find("select[name=font_scale]").attr("disabled", printer.type !== "graphic");
            $modal.find("select[name=padding]").attr("disabled", printer.type !== "graphic");

            $modal.find("select[name=device]").selectpicker("refresh").val(printer.device).selectpicker("refresh");
            $modal.find("select[name=size]").selectpicker("refresh").val(printer.size).selectpicker("refresh");
            $modal.find("select[name=type]").selectpicker("refresh").val(printer.type).selectpicker("refresh").change();
            $modal.find("select[name=columns]").selectpicker("refresh").val(printer.size).selectpicker("refresh");
            $modal.find("select[name=font_scale]").selectpicker("refresh").val(printer.font_scale).selectpicker("refresh");
            $modal.find("select[name=padding]").selectpicker("refresh").val(printer.padding).selectpicker("refresh");

            $delete_btn.off("submit").on("click", function () {
                $delete_btn.addClass("loading");
                $modal.addClass("loading");

                FetchAPI(`/printers/${printer.id_printer}`, {
                    method: "DELETE"
                }).then(() => {
                    const index = printers.findIndex(_printer => _printer === printer);
                    printers.splice(index, 1);
                    RemoveLocalPrinter(printer.id_printer);

                    LoadPrinters();
                    $(".modal-printers").removeClass("show");
                }).catch(error => {
                    if (error === "in_use") Swal.fire("Opss...", `A impressora <b>${printer.name}</b> não pode ser apagada pois está sendo usado por um produto!`, "error");
                    else Swal.fire("Opss...", `Ocorreu um erro ao tentar apagar a impressora <b>${printer.name}</b>!`, "error");
                    Swal.showValidationMessage(error);
                }).finally(() => {
                    $delete_btn.removeClass("loading");
                    $modal.removeClass("loading");
                });
            });

            $form.off("submit").on("submit", function (e) {
                e.preventDefault();

                const form_data = $form.serializeFormJSON();

                $save_btn.addClass("loading");
                $modal.addClass("loading");

                FetchAPI(`/printers/${printer.id_printer}`, {
                    method: "PUT",
                    body: form_data
                }).then(new_printer => {
                    Object.assign(printer, new_printer);
                    LoadPrinters();
                    $(".modal-printers").removeClass("show");
                }).catch(error => {
                    if (error == "already_exists") Swal.fire("Opss...", `Já existe uma impressora com o nome "${form_data.name}"!`, "error");
                    else Swal.fire("Opss...", "Ocorreu um erro ao tentar adicionar a impressora!", "error");
                    Swal.showValidationMessage(error);
                }).finally(() => {
                    $save_btn.removeClass("loading");
                    $modal.removeClass("loading");
                });
            });

            $(".modal-printers").addClass("show");
        });

        $content.append($printer);
    }


    const $new = $(`<div class="new">
        <i class="fas fa-plus" aria-hidden="true"></i>
        <span>Adicionar</span>
    </div>`);

    $new.on("click", () => ShowCreatePrinterModal());

    $content.append($new);
}