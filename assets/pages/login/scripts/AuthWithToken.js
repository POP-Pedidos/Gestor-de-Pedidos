import * as Store from "./Store.js";
import ShowError from "./ShowError.js";
import AuthSuccessfully from "./AuthSuccessfully.js";

if (localStorage.token) {
    if (Store.get("user")) {
        $(`form input[name="password"]`).val("**********");
        $("#remember_pwd").prop("checked", true);
    }

    $("form").addClass("loading");

    FetchAPI(`/user/token`, {
        method: "POST",
        body: { token: localStorage.token },
        headers: { username: encodeURIComponent(window.hostname) },
        raw_error: true,
    }).then(AuthSuccessfully).catch(error => {
        ShowError(error);

        $("form")[0].reset();
        localStorage.removeItem("token");

        $("form").removeClass("loading");
    });
}