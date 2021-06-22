import * as Store from "./Store.js";
import ShowError from "./ShowError.js";
import AuthSuccessfully from "./AuthSuccessfully.js";

import "../../../scripts/LoadColorPalette.js";
import "./LoadArt.js";
import "./AuthWithToken.js";

$(`form input[name="username"]`).val(Store.get("user")?.username);
$(`form input[name="remember"]`).prop("checked", !!localStorage.token);

$("label.password>div>i").click(function () {
    const $label = $(this).parent().parent();
    const $input = $label.find("input");

    $label.toggleClass("show-password");
    $input.attr("type", $label.hasClass("show-password") ? "text" : "password");
});

$("form>.right>.fixed-header>.toggle-theme").click(function () {
    window.darkMode.toggle();
});

$("form").on("submit", function (e) {
    e.preventDefault();

    $("form").addClass("loading");

    const form_data = $("form").serializeFormJSON();

    FetchAPI(`/user/login`, {
        body: form_data,
        method: "POST",
        headers: { Hostname: window.hostname },
        raw_error: true,
    }).then(AuthSuccessfully).catch(error => {
        ShowError(error);

        $("form").removeClass("loading");
    });
});