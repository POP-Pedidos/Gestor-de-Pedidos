$(document).on("keyup change", ".input-label>input", function () {
    $(this).toggleClass("not-empty", !!$(this).val());
});

$(document).on("focus", ".input-label>input", function () {
    $(this).parent().addClass("focus");
});

$(document).on("blur", ".input-label>input", function () {
    $(this).parent().removeClass("focus");
});