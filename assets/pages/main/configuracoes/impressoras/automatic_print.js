(() => {
    let promise;

    $(".content-column.printers .print>.section>form select").on("change", function () {
        const $form = $(".content-column.printers .print>.section>form");

        const form_data = $form.serializeFormJSON();

        for (const key in form_data) {
            form_data[key] = !!form_data[key] ? Number(form_data[key]) : null;
        }

        promise?.abort();

        promise = FetchAPI(`/company/printer_options`, {
            method: "PUT",
            body: form_data
        });

        promise.then(new_options => {
            company.print_options = new_options;
        }).catch(error => {
            Swal.fire("Opss...", "Ocorreu um erro ao tentar as configurações de impressão automática!", "error");
            Swal.showValidationMessage(error);
        })
    });

    for (const key in company.print_options || {}) {
        $(`.content-column.printers .print>.section>form select[name="${key}"]`).val(company.print_options[key]);
    }
})();