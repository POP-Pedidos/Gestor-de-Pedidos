$("#switch_system_startup").on("change", function () {
    app.setOpenAtLogin($(this).is(":checked"));
});

$("#switch_background").on("change", function () {
    app.setBackgroundRunning($(this).is(":checked"));
});

$("#switch_system_startup").prop("checked", app.openAtLogin());
$("#switch_background").prop("checked", app.backgroundRunning());