export default function ShowError(error) {
    const error_message = error.error || error.message || error;

    if (error_message === "user not found") {
        Swal.fire({
            icon: "error",
            title: "Opss...",
            text: "Este usuário não existe!",
            heightAuto: false
        });
    } else if (error_message === "invalid token") {
        Swal.fire({
            icon: "error",
            title: "Opss...",
            text: "A sessão é inválida!",
            heightAuto: false
        });
    } else if (error_message === "expired token") {
        Swal.fire("Opss...", "A sessão expirou!", "error");
        Swal.fire({
            icon: "error",
            title: "Opss...",
            text: "Este usuário não existe!",
            heightAuto: false
        });
    } else if (error_message === "invalid password") {
        Swal.fire({
            icon: "error",
            title: "Opss...",
            text: "A senha está incorreta!",
            heightAuto: false
        });
    } else if (error_message === "company blocked") {
        Swal.fire({
            icon: 'error',
            title: 'Opss...',
            text: 'A sua empresa foi bloqueado por um administrador, e por isso você não pode entrar no painel!',
            footer: 'Entre em contato com o financeiro',
            heightAuto: false
        })
        Swal.showValidationMessage(error.data);
    } else if (error_message === "expired plan") {
        Swal.fire({
            icon: "error",
            title: "Opss...",
            text: "O seu plano expirou!",
            heightAuto: false
        });
    } else if (error_message === "internal server error") {
        Swal.fire({
            icon: "error",
            title: "Opss...",
            text: "Erro Interno!",
            heightAuto: false
        });
    } else if (error_message) {
        Swal.fire({
            icon: "error",
            title: "Opss...",
            text: "Ocorreu um erro ao tentar fazer o login!",
            heightAuto: false
        });
        Swal.showValidationMessage(error_message);
    }
}