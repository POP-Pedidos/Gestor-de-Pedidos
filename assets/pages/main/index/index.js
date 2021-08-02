const userSession = JSON.parse(localStorage.user);

let company = JSON.parse(localStorage.company);
let categories = [];
let orders = [];
let sizes = [];
let times = [];
let printers = [];
let discount_coupons = [];

let primary_printer = null;

function logout() {
    sessionStorage.clear();
    localStorage.removeItem("company");
    localStorage.removeItem("token");
    location.href = "../../login/index.html";

    if (socket?.connected) socket.disconnect();
}

$("body").toggleClass("dark-mode", darkMode.isEnabled());
$("#change_theme>span").text(!!darkMode.isEnabled() ? "Tema escuro" : "Tema claro");

function toggleDarkTheme() {
    darkMode.toggle();

    $("body").toggleClass("dark-mode", darkMode.isEnabled());
    $("#change_theme>span").text(!!darkMode.isEnabled() ? "Tema claro" : "Tema escuro");
    whatsappWebView.send("setDarkMode", !!darkMode.isEnabled());
}

function LoadHeaderUserProfile() {
    $("#userSettings .user-name").text(company.name);
    $(".header-user-profile .user-id").text(`#${company.id_company}`);
    $(".header-user-profile .user-name").text(company.name);

    if (company.image) {
        $(".header-user>img").attr("src", company.image.small);
        $("#userSettings .avatar>img").attr("src", company.image?.small);
    }
}

$(".header-actions>.company-website-link").on("click", function () {
    window.open(`https://${company.subdomain || "www"}.${domain}/`, "_blank");
});

$(document).on("click", "#change_password", function () {
    Swal.mixin({
        input: 'text',
        confirmButtonText: 'Próximo &rarr;',
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        progressSteps: ['1', '2', '3'],
        preConfirm: () => {
            if ($('.swal2-input').val().length < 4) Swal.showValidationMessage("Digite uma senha de no mínimo 4 caracteres!");
        }
    }).queue([
        {
            title: 'Passo 1',
            text: 'Digite sua senha atual:'
        },
        {
            title: 'Passo 2',
            text: 'Digite sua nova senha:'
        },
    ]).then((result) => {
        if (!result.value) return;
        const old_pass = result.value[0];
        const new_pass = result.value[1];

        Swal.fire({
            icon: "question",
            title: `Confirmação!`,
            html: `Tem certeza que deseja alterar a sua senha?`,
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return FetchAPI(`/user/password`, {
                    body: {
                        old_pass,
                        new_pass
                    },
                    method: "PUT",
                }).then(() => {
                    Swal.fire("Sucesso!", `A senha foi alterada com sucesso!`, "success").then(() => logout());
                }).catch(error => {
                    if (error === "invalid password") {
                        Swal.fire("Opss...", `A senha atual digitada está incorreta!`, "error");
                    } else {
                        Swal.fire("Opss...", `Ocorreu um erro ao tentar alterar a senha!`, "error");
                        Swal.showValidationMessage(error);
                    }
                });
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    })
});

updater.on("update-downloaded", () => {
    $(".header-actions .update-available").fadeIn(300);
    console.log("Update downloaded!");


    new Notification("Nova atualização", {
        icon: window.icons.default,
        body: "A atualização está pronta, clique aqui para instalar"
    }).onclick = () => updater.installUpdate();
});

updater.on("checking-for-update", () => {
    console.log("Checking for update!");
});

updater.on("update-not-available", () => {
    console.log("Update not available!");
});

updater.on("error", (e, error) => {
    console.error("Update error:", error);
});

updater.on("download-progress", (e, progressObj) => {
    console.log("Update download progress:", progressObj);
});