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

const ESC_COMMANDS = {
    ALIGN_CENTER: "\x1b\x61\x01",
    ALIGN_LEFT: "\x1b\x61\x00",
    ALIGN_RIGHT: "\x1b\x61\x02",
    TEXT_SIZE_NORMAL: "\x1b\x21\x00",
    TEXT_SIZE_LARGE: "\x1b\x21\x30",
    INVERTED_COLOR_ON: "\x1d\x42\x01",
    BEEPER: "\x1b\x42\x05\x05",
    CUT_PAPER: "\x1d\x56\x00",
}

module.exports = {
    MoneyFormat,
    TranslatePaymentMethod,
    CenterText,
    ESC_COMMANDS,
}