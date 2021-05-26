var datatable_discount_coupon = $("#table-cadastros-discount_coupon").DataTable({
    language: { url: "../../../scripts/dataTables.lang.json" },
    ordering: false,
    searching: false,
    paging: false,
    info: false,
});

$(".breadcrumb .badge").toggle(!company.use_discount_coupon);

$("#btnModalDiscountCoupon").on("click", function (e) {
    $("#frmDiscountCoupon")[0].reset();

    $("#modalDiscountCoupon").modal("show");
});

$("#frmDiscountCoupon").on("submit", function (e) {
    e.preventDefault();

    $("#frmDiscountCoupon button").addClass("loading");

    const formData = $(this).serializeFormJSON();

    FetchAPI("/discount_coupon", {
        method: "POST",
        body: formData,
    }).then(discount_coupon => {
        discount_coupons.push(discount_coupon);

        const rowNode = datatable_discount_coupon.row.add([
            discount_coupon.coupon,
            discount_coupon.is_percentual ? `${discount_coupon.discount}%` : MoneyFormat(discount_coupon.discount),
            discount_coupon.limit || "Ilimitado",
            0,
            `<div class="switch_enable"><input type="checkbox" onchange="enableCoupon(${discount_coupon.id_coupon}, this)" ${discount_coupon.enabled ? `checked ` : ""}hidden><div class="indicator"></div><span class="off">Pausar</span><span class="on">Ativado</span></div>`,
            `<button class="btn btn-danger" onclick="excluir(${discount_coupon.id_coupon}, this)"><i class="fas fa-trash"></i><div class="spinner-border"></div></button> <button class="btn btn-success" onclick="editar(${discount_coupon.id_coupon})"><i class="fas fa-edit"></i></button>`
        ]).node();

        $(rowNode).find(".switch_enable").initSwitchEnable();

        $(rowNode).attr("id_coupon", discount_coupon.id_coupon);

        datatable_discount_coupon.draw();

        $("#modalDiscountCoupon").modal("hide");
    }).catch(error => {
        console.error(error);
        if (error == "already_exists") Swal.fire("Opss...", `O cupom de desconto "${formData.name}" já existe!`, "error");
        else Swal.fire("Opss...", `Ocorreu um erro ao tentar adicionar o cupom de desconto!`, "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        $("#frmDiscountCoupon button").removeClass("loading");
    });
});

$("#frmEditDiscountCoupon").on("submit", function (e) {
    e.preventDefault();

    $("#frmEditDiscountCoupon .modal-footer>button").addClass("loading");

    const id_coupon = $(this).attr("id_coupon");
    const formData = $(this).serializeFormJSON();

    FetchAPI(`/discount_coupon/${id_coupon}`, {
        method: "PUT",
        body: formData,
    }).then(discount_coupon => {
        ArrayChange(discount_coupons, discount_coupon, val => val.id_coupon == discount_coupon.id_coupon);

        $(`tr[id_coupon="${id_coupon}"]>td:nth-child(1)`).text(discount_coupon.coupon);
        $(`tr[id_coupon="${id_coupon}"]>td:nth-child(2)`).text(discount_coupon.is_percentual ? `${discount_coupon.discount}%` : MoneyFormat(discount_coupon.discount));
        $(`tr[id_coupon="${id_coupon}"]>td:nth-child(3)`).text(discount_coupon.limit || "Ilimitado");
        $(`tr[id_coupon="${id_coupon}"]>td:nth-child(4)`).text(discount_coupon.total_uses);

        $("#modalEditDiscountCoupon").modal("hide");
    }).catch(error => {
        console.error(error);
        if (error == "already_exists") Swal.fire("Opss...", `O cupom de desconto "${formData.name}" já existe!`, "error");
        else Swal.fire("Opss...", `Ocorreu um erro ao tentar salvar a edição do cupom de desconto!`, "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        $("#frmEditDiscountCoupon .modal-footer>button").removeClass("loading");
    });
});

function enableCoupon(id_coupon, elem) {
    const enabled = elem.checked;
    const discount_coupon = discount_coupons.find(val => val.id_coupon == id_coupon);

    FetchAPI(`/discount_coupon/${id_coupon}`, {
        method: "PUT",
        body: { enabled },
    }).then(discount_coupon => {
        ArrayChange(discount_coupons, discount_coupon, val => val.id_coupon == discount_coupon.id_coupon);
        $(elem).prop("checked", discount_coupon.enabled);
    }).catch(error => {
        console.error(error);
        Swal.fire("Opss...", `Ocorreu um erro ao tentar ${enabled ? "ativar" : "desativar"} o cupom de desconto "${discount_coupon.coupon}"!`, "error");
        Swal.showValidationMessage(error);
        $(elem).prop("checked", !enabled);
    }).finally(() => {
        $("#frmEditDiscountCoupon .modal-footer>button").removeClass("loading");
    });
}

function editar(id) {
    const discount_coupon = discount_coupons.find(val => val.id_coupon == id);

    $("#frmEditDiscountCoupon")[0].reset();

    $("#frmEditDiscountCoupon select.category_selector").html("");
    $("#frmEditDiscountCoupon").find(".coupon").val(discount_coupon.coupon);
    $("#frmEditDiscountCoupon").find(".is_percentual").val(discount_coupon.is_percentual.toString()).selectpicker("refresh");
    $("#frmEditDiscountCoupon").find(".discount").val(discount_coupon.discount);
    $("#frmEditDiscountCoupon").find(".limit").val(discount_coupon.limit || "");
    $("#frmEditDiscountCoupon").find(".min_price").val(discount_coupon.min_price || "");
    $("#frmEditDiscountCoupon").find(".in_delivery_cost").prop("checked", discount_coupon.in_delivery_cost);
    $("#frmEditDiscountCoupon").attr("id_coupon", discount_coupon.id_coupon);

    $("#modalEditDiscountCoupon").modal("show");
}

function excluir(id_coupon, elem) {
    $(elem).addClass("loading");

    const coupon = discount_coupons.find(val => val.id_coupon == id_coupon);

    Swal.fire({
        title: "Muita calma!!",
        html: `Você tem certeza que deseja excluir o cupom de desconto <b>${coupon.coupon}</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
    }).then(result => {
        if (result.isConfirmed) {
            FetchAPI(`/discount_coupon/${id_coupon}`, {
                method: "DELETE",
            }).then(data => {
                ArrayRemoveIndex(discount_coupons, val => val.id_coupon == id_coupon);

                datatable_discount_coupon.row($(`tr[id_coupon="${id_coupon}"]`)).remove().draw();
            }).catch(error => {
                console.error(error);
                Swal.fire("Opss...", `Ocorreu um erro ao tentar remover o cupom <b>${coupon.coupon}</b>de desconto!`, "error");
                Swal.showValidationMessage(error);
            }).finally(() => {
                $(elem).removeClass("loading");
            });

        } else {
            $(elem).removeClass("loading");
        }
    });
}

$('.selectpicker').selectpicker({
    dropupAuto: false,
    noneSelectedText: "Nada selecionado"
});

$(".selectpicker.is_percentual").change(function () {
    $(this).parent().parent().find(".discount").attr("placeholder", $(this).val() == "true" ? "Porcentagem 0-100" : "Valor").attr("step", $(this).val() == "true" ? "1" : "0.01");
});

var lazy_loading = new LazyLoading({
    container: ".content-page",
    threshold: 0.3,
    doLoop: 3,
    state: {
        page_limit: 10,

        offset: 0,
        max: null,
        isLoading: false,
    },
    doHandle: function () {
        const $element = $(".table tbody>tr[id_coupon]:last-child");
        if (!$element.length) return true;

        if ($element.length) {
            return $element.offset().top - $element.height() - 400 < this.container.height();
        }
    },
});

lazy_loading.onHandle = async (state) => {
    if (state.isLoading) return;
    if (state.max != null && state.offset >= state.max) return;

    if (state.max == null) state.isLoading = true;

    FetchAPI(`/discount_coupon`, {
        instance_check: true,
        params: {
            offset: state.offset,
            limit: state.page_limit
        }
    }).then(discount_coupons_data => {
        state.max = discount_coupons_data.metadata.max;

        for (const discount_coupon of discount_coupons_data.results || []) {
            discount_coupons.push(discount_coupon);

            const rowNode = datatable_discount_coupon.row.add([
                discount_coupon.coupon,
                discount_coupon.is_percentual ? `${discount_coupon.discount}%` : MoneyFormat(discount_coupon.discount),
                discount_coupon.limit || "Ilimitado",
                discount_coupon.total_uses,
                `<div class="switch_enable"><input type="checkbox" onchange="enableCoupon(${discount_coupon.id_coupon}, this)" ${discount_coupon.enabled ? `checked ` : ""}hidden><div class="indicator"></div><span class="off">Pausar</span><span class="on">Ativado</span></div>`,
                `<button class="btn btn-danger" onclick="excluir(${discount_coupon.id_coupon}, this)"><i class="fas fa-trash"></i><div class="spinner-border"></div></button> <button class="btn btn-success" onclick="editar(${discount_coupon.id_coupon})"><i class="fas fa-edit"></i></button>`
            ]).node();

            $(rowNode).find(".switch_enable").initSwitchEnable();

            $(rowNode).attr("id_coupon", discount_coupon.id_coupon);
        }

        datatable_discount_coupon.draw();
    }).catch(errorMessage => {
        console.error(errorMessage);
        Swal.fire("Opss...", `Ocorreu um erro ao tentar listar os cupons de desconto salvos!`, "error");
        Swal.showValidationMessage(errorMessage);
    }).finally(() => {
        state.isLoading = false;

        $("#loading-wrapper-content").fadeOut(400);
        $(".max-results").text(`${state.max} resultado${!!state.max ? "s" : ""}`);
        if (state.max === 0) $(".complement-list").boo("Não há nada aqui!!");
    });

    state.offset += state.page_limit;
}

discount_coupons.splice(0, discount_coupons.length);
$("#loading-wrapper-content").css("display", "flex");
lazy_loading.Init();