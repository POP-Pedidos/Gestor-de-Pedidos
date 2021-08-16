$(".selectpicker").selectpicker({
    noneSelectedText: "Nada selecionado",
});

$("#loading-wrapper-content").css("display", "flex").show();

FetchAPI(`/printers`, { instance_check: true }).then(printers_data => {
    printers = printers_data;

    LoadPrinters();
    LoadDefaultPrinter();
}).catch(error => {
    Swal.fire("Opss...", "Ocorreu um erro fatal ao tentar listar as impressoras!", "error");
    Swal.showValidationMessage(error);
}).finally(() => {
    $("#loading-wrapper-content").hide()
});