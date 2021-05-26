$("#configuracoes_empresa .reset").click(function (e) {
    e.preventDefault();

    $('#configuracoes_empresa .company-logo [name="photo"]').val("");
    LoadCompanyDataToForm();
});

$(`#configuracoes_empresa input:not([type="file"])`).on("change", function (e) {
    e.stopPropagation();

    $("#configuracoes_empresa .btn-primary").click();
});

$("#configuracoes_empresa").on("submit", function (e) {
    e.preventDefault();

    const formData = $(this).serializeFormJSON();
    if (!formData.image) delete formData.image;

    formData.is_online = !!formData.online_check;

    FetchAPI("/company", {
        method: "PUT",
        body: formData
    }).then(data => {
        company = data;
        $('#configuracoes_empresa .company-logo [name="photo"]').val("");

        LoadHeaderUserProfile();
        LoadCompanyDataToForm();
    }).catch(error => {
        if (!error) return;
        Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar a empresa!`, "error");
        Swal.showValidationMessage(error);
    });
});

$("#loading-wrapper-content").css("display", "flex").show();
FetchAPI(`/company/${company.id_company}`).then(data => {
    company = data;

    LoadCompanyDataToForm();
}).catch(error => {
    Swal.fire("Opss...", "Ocorreu um erro fatal ao tentar carregar os dados da sua empresa!", "error");
    Swal.showValidationMessage(error);
}).finally(() => {
    $("#loading-wrapper-content").fadeOut(400);
});

function LoadCompanyDataToForm() {
    $("#configuracoes_empresa")[0].reset();
    for (const key in company) {
        if (typeof company[key] == "string") $(`#configuracoes_empresa [name="${key}"]`).val(company[key]);
        if (typeof company[key] == "boolean") $(`#configuracoes_empresa [name="${key}"]`).prop("checked", company[key]);
    }
}

$("input.phone").inputmask({
    mask: ['(99) 9999-9999', '(99) 9 9999-9999'],
    keepStatic: true,
    clearIncomplete: true
});

$("input.cpf-cnpj").inputmask({
    mask: ['999.999.999-99', '99.999.999/9999-99'],
    keepStatic: true,
    clearIncomplete: true
});