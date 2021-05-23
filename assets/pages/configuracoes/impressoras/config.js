$(".print-options .close").on("click", function () {
    $(".print-options").fadeOut(300);
});

$(".print-options").on("mousedown", function () {
    $(".print-options").fadeOut(300);
});

$(".print-options>div").on("mousedown", function (e) {
    e.stopPropagation();
});

$(".printers-config-btn").on("click", function () {
    $(`.print-options>div>form [name="print_control_copy"]`).selectpicker("val", company.print_control_copy || "none").selectpicker("refresh");
    $(`.print-options>div>form [name="print_delivery_copy"]`).selectpicker("val", company.print_delivery_copy || "none").selectpicker("refresh");
    $(`.print-options>div>form [name="print_production_copy"]`).selectpicker("val", company.print_production_copy || "none").selectpicker("refresh");

    $(".print-options").fadeIn(300).css("display", "flex");
});

$(".print-options>div>form").on("submit", (e) => {
    e.preventDefault();
    $(".print-options .close").click();
});

$(".print-options .selectpicker").on("change", function () {
    const data = $(".print-options>div>form").serializeFormJSON();
    Object.keys(data).forEach(key => data[key] = (data[key] === "none" ? null : data[key]));

    FetchAPI("/company", {
        method: "PUT",
        body: data
    }).then(data => {
        company = data;
    }).catch(error => {
        if (!error) return;
        Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar a empresa!`, "error");
        Swal.showValidationMessage(error);
    });
});