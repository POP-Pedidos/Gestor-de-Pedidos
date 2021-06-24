var datatable_frete = $("#table-frete").DataTable({
    language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json"
    },
    ordering: false,
    searching: false,
    paging: false,
    info: false,
});

var datatable_blacklist = $("#table-blacklist").DataTable({
    language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json"
    },
    ordering: false,
    searching: false,
    paging: false,
    info: false,
});

$(".neighborhood.blacklist>.table-header button").on("click", function (e) {
    const selected_place = $("#blacklist-search").data("place");

    if (!selected_place) return;

    $(this).addClass("loading");

    FetchAPI("/neighborhood_blacklist", {
        method: "POST",
        body: {
            id_neighborhood: selected_place.id_neighborhood,
        }
    }).then(region => {
        AddRegionToBlackListTable(region);

        $("#blacklist-search").val("").trigger("keyup");
    }).catch(error => {
        if (error == "already exists") Swal.fire("Opss...", `O bairro "${selected_place.name}" já está na lista de bloqueados!`, "error");
        else {
            Swal.fire("Opss...", `Não foi possível adicionar o bairro "${selected_place.name}" porque ocorreu um erro!`, "error");
            Swal.showValidationMessage(error);
        }
    }).finally(() => {
        $(this).removeClass("loading");
    });
});

$(".neighborhood.frete>.table-header button").on("click", function (e) {
    const selected_place = $("#frete-search").data("place");
    if (!selected_place) return;

    const price = Number($(".neighborhood.frete>.table-header>.price").val());
    if (isNaN(price) || price < 0 || price > 1000) return;

    $(this).addClass("loading");

    FetchAPI("/neighborhood_delivery_cost", {
        method: "POST",
        body: {
            id_neighborhood: selected_place.id_neighborhood,
            price,
        }
    }).then(region => {
        AddRegionToFreteListTable(region);

        $("#frete-search").val("").trigger("keyup");
        $(".neighborhood.frete>.table-header>.price").val("");
    }).catch(error => {
        if (error == "already exists") Swal.fire("Opss...", `O bairro "${selected_place.name}" já está na lista de fretes customizados!`, "error");
        else {
            Swal.fire("Opss...", `Não foi possível adicionar o bairro "${selected_place.name}" porque ocorreu um erro!`, "error");
            Swal.showValidationMessage(error);
        }
    }).finally(() => {
        $(this).removeClass("loading");
    });
});

function DeleteBlacklist(region) {
    $(this).addClass("loading");

    Swal.fire({
        title: "Muita calma!!",
        html: `Você tem certeza que deseja remover o bairro <b>${region.neighborhood}</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
    }).then(result => {
        if (result.isConfirmed) {
            FetchAPI(`/neighborhood_blacklist/${region.id}`, {
                method: "DELETE",
            }).then(() => {
                datatable_blacklist.row($(`tr[id="${region.id}"]`)).remove().draw();
                $(`#table-blacklist tr[id="${region.id}"]`).remove();
                $(this).removeClass("loading");
            }).catch(error => {
                Swal.fire("Opss...", `Ocorreu um erro fatal ao tentar remover o bairro "${region.neighborhood}"!`, "error");
                Swal.showValidationMessage(error);
            });
        } else {
            $(this).removeClass("loading");
        }
    });
}

function DeleteFrete(region) {
    $(this).addClass("loading");

    Swal.fire({
        title: "Muita calma!!",
        html: `Você tem certeza que deseja remover o bairro <b>${region.neighborhood}</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
    }).then(result => {
        if (result.isConfirmed) {
            FetchAPI(`/neighborhood_delivery_cost/${region.id}`, {
                method: "DELETE",
            }).then(() => {
                datatable_frete.row($(`tr[id="${region.id}"]`)).remove().draw();
                $(`#table-frete tr[id="${region.id}"]`).remove();
                $(this).removeClass("loading");
            }).catch(error => {
                Swal.fire("Opss...", `Ocorreu um erro fatal ao tentar remover o bairro "${region.neighborhood}"!`, "error");
                Swal.showValidationMessage(error);
            });
        } else {
            $(this).removeClass("loading");
        }
    });
}

function UpdateFreteRegion(region, new_data) {
    FetchAPI(`/neighborhood_delivery_cost/${region.id}`, {
        method: "PUT",
        body: new_data,
    }).catch(error => {
        Swal.fire("Opss...", `Ocorreu um erro fatal ao tentar remover o bairro "${region.neighborhood}"!`, "error");
        Swal.showValidationMessage(error);
    });
}

function AddRegionToBlackListTable(region) {
    let region_name = region.neighborhood;

    if (company.city !== region.city && company.state !== region.state) region_name =  `${region.neighborhood}, ${region.city} - ${region.state}`;
    else if (company.city !== region.city) region_name = `${region.neighborhood}, ${region.city}`;

    const rowNode = datatable_blacklist.row.add([
        region_name,
        `<button class="btn btn-danger"><i class="fas fa-trash"></i><div class="spinner-border"></div></button>`
    ]).node();

    $(rowNode).find("button").on("click", function () {
        DeleteBlacklist.bind(this)(region);
    });

    $(rowNode).attr("id", region.id);

    datatable_blacklist.draw();
}

function AddRegionToFreteListTable(region) {
    let region_name = region.neighborhood;

    if (company.city !== region.city && company.state !== region.state) region_name = `${region.neighborhood}, ${region.city} - ${region.state}`;
    else if (company.city !== region.city) region_name = `${region.neighborhood}, ${region.city}`;

    const rowNode = datatable_frete.row.add([
        region_name,
        `<input type="number" class="price form-control" placeholder="Taxa em reais" step="0.01"/>`,
        `<button class="btn btn-danger"><i class="fas fa-trash"></i><div class="spinner-border"></div></button>`
    ]).node();

    $(rowNode).find("input").val(Number(region.price).toFixed(2));

    $(rowNode).find("input").on("change", function () {
        UpdateFreteRegion(region, { price: Number($(this).val()) || 0 });
    });

    $(rowNode).find("button").on("click", function () {
        DeleteFrete.bind(this)(region);
    });

    $(rowNode).attr("id", region.id);

    datatable_frete.draw();
}

$("#loading-wrapper-content").css("display", "flex").show();

FetchAPI("/neighborhood_blacklist", { instance_check: true, }).then(neighborhood_blacklist => {
    for (const region of neighborhood_blacklist) AddRegionToBlackListTable(region);
}).catch(error => {
    Swal.fire("Opss...", "Ocorreu um erro ao tentar listar as regiões!", "error");
    Swal.showValidationMessage(error);
}).finally(() => {
    $("#loading-wrapper-content").fadeOut(400);
});

FetchAPI("/neighborhood_delivery_cost", { instance_check: true, }).then(neighborhood_delivery_cost => {
    for (const region of neighborhood_delivery_cost) AddRegionToFreteListTable(region);
}).catch(error => {
    Swal.fire("Opss...", "Ocorreu um erro ao tentar listar as regiões!", "error");
    Swal.showValidationMessage(error);
}).finally(() => {
    $("#loading-wrapper-content").fadeOut(400);
});

$(".selectpicker").selectpicker({
    noneSelectedText: "Nada selecionado"
});

$("#switch_entrega, #switch_retirada").on("change", function (e) {
    const use_delivery = $("#frete_selector #switch_entrega").is(":checked");
    const use_withdrawal = $("#frete_selector #switch_retirada").is(":checked");

    if (!use_delivery && !use_withdrawal) {
        $(this).prop("checked", true);
    }
});

$(".entrega .delivery_fallback .radio-check>input").on("change", function () {
    const value = $(this).val();

    $(".entrega .delivery_fallback .delivery_cost_fallback").toggleClass("disabled", value != "0");
});

$(".frete-type .delivery_type").on("change", function () {
    const value = $(this).val();

    $("#frete_selector .delivery-cost-min-container").toggle(value === "1");
});

$("#frete_selector input, #frete_selector select").on("change", function (e) {
    e.stopPropagation();

    const delivery_type = $("#frete_selector select.delivery_type").val();
    const delivery_cost = $("#frete_selector .delivery_cost").val() || null;
    const delivery_cost_min = $("#frete_selector .delivery_cost_min").val() || null;
    const delivery_fallback_type = $(`#frete_selector .delivery_fallback input[name="delivery_cost_fallback"]:checked`).val() || null;
    const delivery_cost_fallback = $("#frete_selector .delivery_cost_fallback").val() || null;
    const delivery_free_in = $("#frete_selector .delivery_free_in").val() || null;
    const delivery_free_val = $("#frete_selector .delivery_free_val").val() || null;
    const delivery_min = $("#frete_selector .delivery_min").val() || null;
    const use_delivery = $("#frete_selector #switch_entrega").is(":checked");
    const use_withdrawal = $("#frete_selector #switch_retirada").is(":checked");
    const delivery_time = $("#frete_selector .delivery_time").val() || null;
    console.log(delivery_time);
    FetchAPI("/company", {
        method: "PUT",
        body: {
            delivery_type,
            delivery_cost,
            delivery_fallback_type,
            delivery_cost_min,
            delivery_cost_fallback,
            delivery_free_in,
            delivery_free_val,
            delivery_min,
            use_delivery,
            use_withdrawal,
            delivery_time,
        },
    }).then(data => {
        company = data;
    }).catch(error => {
        if (!error) return;
        Swal.fire("Opss...", "Ocorreu um erro ao salvar a edição!", "error");
        Swal.showValidationMessage(error);
    });
});

$("#frete_selector .delivery_type").val(company.delivery_type).selectpicker("refresh");
$("#frete_selector .delivery_cost").val(company.delivery_cost?.toFixed(2));
$("#frete_selector .delivery_cost_min").val(company.delivery_cost_min?.toFixed(2));
$("#frete_selector .delivery-cost-min-container").toggle(company.delivery_type == 1);
$("#frete_selector .delivery_cost_fallback").val(company.delivery_cost_fallback?.toFixed(2));
$("#frete_selector .delivery_min").val(company.delivery_min?.toFixed(2));
$("#frete_selector #switch_entrega").prop("checked", company.use_delivery);
$("#frete_selector #switch_retirada").prop("checked", company.use_withdrawal);
if (company.delivery_fallback_type != null) {
    $(`#frete_selector .delivery_fallback .radio-check>input[value="${company.delivery_fallback_type}"]`).prop("checked", true);
    $(".entrega .delivery_fallback .delivery_cost_fallback").toggleClass("disabled", company.delivery_fallback_type != "0");
}
if (company.delivery_fallback_type != null && company.delivery_cost_fallback != null) $(`#frete_selector .delivery_fallback .delivery_cost_fallback>input`).val(company.delivery_cost_fallback.toFixed(2));

if (company.delivery_free_in != null && company.delivery_free_val != null) {
    $("#frete_selector .delivery_free_in").val(company.delivery_free_in?.toFixed(2));
    $("#frete_selector .delivery_free_val").val(company.delivery_free_val?.toFixed(2));
}

$("#frete-search").on("blur_place", function () {
    $(".neighborhood.frete>.table-header").addClass("none_selected");
});

$(".neighborhood.frete>.table-header>.price").keyup(function () {
    const price = Number($(".neighborhood.frete>.table-header>.price").val());

    $(".neighborhood.frete>.table-header").toggleClass("none_selected", price < 0 || !$("#frete-search").data("place"));
});

$("#blacklist-search").on("blur_place", function () {
    $(".neighborhood.blacklist>.table-header").addClass("none_selected");
});

$("#frete-search").on("place", function (e, place) {
    const price = Number($(".neighborhood.frete>.table-header>.price").val());

    $(".neighborhood.frete>.table-header").toggleClass("none_selected", price < 0);
});

$("#blacklist-search").on("place", function (e, place) {
    $(".neighborhood.blacklist>.table-header").removeClass("none_selected");
});

$("body>.place-results-container").remove();

new NeighborhoodInputAutoComplete("#frete-search");
new NeighborhoodInputAutoComplete("#blacklist-search");