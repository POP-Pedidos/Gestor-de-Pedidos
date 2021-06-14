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

    $("#configuracoes_empresa .address>.details").toggleClass("no-address", !company.id_neighborhood || !company.location);

    if(company.id_neighborhood && company.location) {
        $("#configuracoes_empresa .address>.details>.street").text(`${company.street}, ${company.street_number}`);
        $("#configuracoes_empresa .address>.details>.city-state").text(`${company.city} - ${company.state}`);
        $("#configuracoes_empresa .address>.details>.complement").text(company.complement);
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

$(".company-address-editor .input-auto-complete[autocomplete-type] input").each(function () {
    $(this).inputAutoComplete("init");
});

(() => {
    const map = InitializeMap();

    const $state = $(`.company-address-editor input[name="state"]`);
    const $city = $(`.company-address-editor input[name="city"]`);
    const $neighborhood = $(`.company-address-editor input[name="neighborhood"]`);
    const $street = $(`.company-address-editor input[name="street"]`);
    const $street_number = $(`.company-address-editor input[name="street_number"]`);

    $state.on("place-change", (e, place_data) => {
        $city.inputAutoComplete("clear");

        if (place_data) {
            $city.inputAutoComplete("params", { id_state: place_data.id_state });

            if (place_data?.location) map.flyTo({
                center: [place_data.location.lng, place_data.location.lat],
                speed: 5,
            });
        }
    });

    $city.on("place-change", (e, place_data) => {
        $neighborhood.inputAutoComplete("clear");

        if (place_data) {
            $neighborhood.inputAutoComplete("params", { id_city: place_data.id_city });

            if (place_data?.location) map.flyTo({
                center: [place_data.location.lng, place_data.location.lat],
                speed: 5,
            });
        }
    });

    $("#configuracoes_empresa .address>i").on("click", function () {
        if (company.location) map.jumpTo({
            center: [company.location.lng, company.location.lat]
        });
    
        if (company.id_neighborhood) {
            $state.inputAutoComplete("set", company.id_state, company.state);
            $city.inputAutoComplete("set", company.id_city, company.city, { id_state: company.id_state });
            $city.inputAutoComplete("params", { id_state: company.id_state });
            $neighborhood.inputAutoComplete("set", company.id_neighborhood, company.neighborhood, { id_state: company.id_state, id_city: company.id_city });
            $neighborhood.inputAutoComplete("params", { id_state: company.id_state, id_city: company.id_city });
        }
    
        $street.val(company.street).keyup();
        $street_number.val(company.street_number).keyup();

        $(".content-page .company-address-editor").addClass("show");
        map.resize();
    });

    $(".company-address-editor>div>button.back").on("click", function () {
        $(".company-address-editor").removeClass("show");
    });

    $(".company-address-editor").on("mousedown", function () {
        if ($(this).hasClass("loading")) return;

        $(this).removeClass("show");
    });

    $(".company-address-editor>div").on("mousedown", function (e) {
        e.stopPropagation();
    });

    $(".company-address-editor form").on("submit", function (e) {
        e.preventDefault();

        const formData = $(this).serializeFormJSON();
        const id_neighborhood = $(this).find(`input[name="neighborhood"]`).data("selected");
        const location = map.getCenter();

        if (
            company.id_neighborhood == id_neighborhood &&
            formData.street === company.street &&
            formData.street_number == company.street_number &&
            location && company.location && location.lat === company.location.lat && location.lng === company.location.lng && 
            formData.complement == company.complement
        ) {
            $(".company-address-editor").removeClass("show");
            return;
        }

        $(".company-address-editor").addClass("loading");
        $(".company-address-editor form button").addClass("loading");

        FetchAPI("/company", {
            method: "PUT",
            body: {
                id_neighborhood,
                location,
                street: formData.street,
                street_number: formData.street_number,
                complement: formData.complement,
            }
        }).then(data => {
            company = data;
            $('#configuracoes_empresa .company-logo [name="photo"]').val("");

            LoadHeaderUserProfile();
            LoadCompanyDataToForm();
        }).catch(error => {
            if (!error) return;
            Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar a empresa!`, "error");
            Swal.showValidationMessage(error);
        }).finally(() => {
            $(".company-address-editor").removeClass("show loading");
            $(".company-address-editor form button").removeClass("loading");
        });
    });
})();