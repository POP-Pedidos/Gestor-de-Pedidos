$("body").toggleClass("dark-mode", !!localStorage.dark_mode);

let saved_user;

try {
    saved_user = JSON.parse(localStorage.user);
} catch { }

if (saved_user) {
    $(`#frmLogin input[name="username"]`).val(saved_user.username);
}

$("#frmLogin").on("submit", function (e) {
    e.preventDefault();

    $("#frmLogin").addClass("disabled");
    $("#frmLogin button").addClass("loading");

    const form_data = $("#frmLogin").serializeFormJSON();
    const remember = $("#remember_pwd").is(":checked");

    FetchAPI(`/user/login`, {
        body: form_data,
        method: "POST",
        headers: { username: encodeURIComponent(window.username) },
        raw_error: true,
    }).then(user => {
        console.log("user:", user);

        (remember ? localStorage : sessionStorage).setItem("token", user.token);

        LoadCompany(user);
    }).catch(error => {
        ShowError(error);

        $("#frmLogin").removeClass("disabled");
        $("#frmLogin button").removeClass("loading");
    });
});

if (localStorage.token) {
    if (saved_user) {
        $(`#frmLogin input[name="password"]`).val("**********");
        $("#remember_pwd").prop("checked", true);
    }

    $("#frmLogin").addClass("disabled");
    $("#frmLogin button").addClass("loading");

    FetchAPI(`/user/token`, {
        method: "POST",
        body: { token: localStorage.token },
        headers: { username: encodeURIComponent(window.username) },
        raw_error: true,
    }).then(user => {
        console.log("user:", user);

        LoadCompany(user);
    }).catch(error => {
        ShowError(error);

        $(`#frmLogin input[name="password"]`).val("");
        $("#remember_pwd").prop("checked", false);

        localStorage.removeItem("token");

        $("#loading-wrapper").fadeOut(300);

        $("#frmLogin").removeClass("disabled");
        $("#frmLogin button").removeClass("loading");
    });
}

function LoadCompany(user) {
    $("#loading-wrapper").css("display", "flex").show();

    FetchAPI(`/company/${user.id_company}`, {
        raw_error: true,
    }).then(company => {
        console.log("company:", company);

        delete user.token;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("company", JSON.stringify(company));

        setTimeout(() => location.href = "../../pages/index/index.html", 500);
    }).catch(error => {
        ShowError(error);

        $("#loading-wrapper").fadeOut(300);

        $("#frmLogin").removeClass("disabled");
        $("#frmLogin button").removeClass("loading");
    });
}

function ShowError(error) {
    const error_message = error.error || error.message || error;

    let error_display_message = `Ocorreu um erro!`;

    if (error_message === "user not found") {
        error_display_message = "Este usuário não existe!";
    } else if (error_message === "invalid token") {
        error_display_message = "A sessão é inválida!";
    } else if (error_message === "expired token") {
        error_display_message = "A sessão expirou!";
    } else if (error_message === "invalid password") {
        error_display_message = "A senha está incorreta!";
    } else if (error_message === "company blocked") {
        error_display_message = "Empresa desativada!";
        Swal.fire({
            icon: 'error',
            title: 'Opss...',
            text: 'A sua empresa foi bloqueado por um administrador, e por isso você não pode entrar no painel!',
            footer: '<a target="_blank" href="https://api.whatsapp.com/send?phone=553438264315&text=Ol%C3%A1%2C%20preciso%20de%20um%20suporte!">Entrar em contato com o suporte</a>'
        })
        Swal.showValidationMessage(error.data);
    } else if (error_message === "expired plan") {
        error_display_message = "O seu plano expirou!";
    } else if (error_message === "internal server error") {
        error_display_message = "Erro Interno!";
    } else if (error_message) {
        Swal.fire("Opss...", "Ocorreu um erro ao tentar fazer o login!", "error");
        Swal.showValidationMessage(error_message);
    }

    $(".feedback").html(`<div class="alert alert-danger animate__animated animate__bounce" role="alert">${error_display_message}</div>`);
    setTimeout(() => $(".feedback").html(""), 5000);
}