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

module.exports = {
    MoneyFormat,
    TranslatePaymentMethod,
}