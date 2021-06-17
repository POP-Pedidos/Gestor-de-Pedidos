function MoneyFormat(money, is_currency = true, fractionDigits = 2) {
    let money_str = new Intl.NumberFormat("pt-BR", {
        style: is_currency ? "currency" : "decimal",
        currency: "BRL",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(money);

    return money_str;
}

function TranslatePaymentMethod(payment_method) {
    return {
        "money": "Dinheiro",
        "credit": "Crédito",
        "debit": "Débito",
    }[payment_method];
}

function CenterText(text, characters, character = " ") {
    const total_character_count = characters - text.length;
    const left_character_count = Math.floor(total_character_count / 2);
    const right_character_count = Math.ceil(total_character_count / 2);

    const left_text = Array.from({ length: left_character_count }, () => character).join("");
    const right_text = Array.from({ length: right_character_count }, () => character).join("");

    return `${left_text}${text}${right_text}`;
}

function NormalizeText(text) {
    if(!text) return text;
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

module.exports = {
    MoneyFormat,
    TranslatePaymentMethod,
    CenterText,
    NormalizeText,
}