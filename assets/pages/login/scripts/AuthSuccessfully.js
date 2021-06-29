import * as Store from "./Store.js";

export default function AuthSuccessfully(user) {
    const form_data = $("form").serializeFormJSON();
    (form_data.remember ? localStorage : sessionStorage).setItem("token", user.token);

    FetchAPI(`/company/${user.id_company}`, {
        raw_error: true,
    }).then(company => {
        delete user.token;

        Store.set("user", user);
        Store.set("company", company);

        window.user = user;
        window.company = company;

        location.href = "../main/index/index.html";
    }).catch(error => {
        ShowError(error);

        $("#loading-wrapper").fadeOut(300);

        $("form").removeClass("disabled");
        $("form button").removeClass("loading");
    }).finally(() => {
        updater.initialize();
        tray.initialize();
        local_api.listen();
    })
}