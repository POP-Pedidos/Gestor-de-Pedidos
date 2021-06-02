const $whatsappWebView = $("#whatsappWebView");
const message_times = [];

$whatsappWebView.attr("partition", "persist:whatsapp");
$whatsappWebView.attr("webpreferences", "javascript=yes");
$whatsappWebView.attr("preload", "../../../scripts/whatsapp/preload.js");
$whatsappWebView.attr("src", "https://web.whatsapp.com/");

whatsappWebView.addEventListener("dom-ready", function (event) {
    fetch("../../../scripts/whatsapp/inject/WaitAuth.js").then(res => res.text()).then(WaitAuth => {
        whatsappWebView.executeJavaScript(WaitAuth);
    });
});
whatsappWebView.addEventListener('ipc-message', (event) => {
    console.log("[WHATSAPP-IPC-MESSAGE]", event);

    switch (event.channel) {
        case "authenticated": {
            fetch("../../../scripts/whatsapp/inject/ModuleRaid.js").then(res => res.text()).then(ModuleRaid => {
                whatsappWebView.executeJavaScript(ModuleRaid);

                fetch("../../../scripts/whatsapp/inject/ExposeStore.js").then(res => res.text()).then(ExposeStore => {
                    whatsappWebView.executeJavaScript(ExposeStore);

                    fetch("../../../scripts/whatsapp/inject/Utils.js").then(res => res.text()).then(Utils => {
                        whatsappWebView.executeJavaScript(Utils);

                        fetch("../../../scripts/whatsapp/inject/Functions.js").then(res => res.text()).then(Functions => {
                            whatsappWebView.executeJavaScript(Functions);
                        });
                    });
                });
            });
        }
        case "user_id": {
            const [number] = event.args;

            if (number && number !== company.whatsapp) FetchAPI("/company", {
                method: "PUT",
                body: { whatsapp: number },
            }).then(data => {
                company = data;
            });
        }
        case "onMessage": {
            const [msg, contact] = event.args;

            if (!msg || msg.isMe || msg.isStatusV3 || msg.isGroupMsg || !msg.isNewMsg || msg.isMedia || msg.id.fromMe) return;

            const number = msg.from?.user || msg.author?.user;
            // const text = msg.text || msg.body;

            if (Object.keys(message_times).includes(number)) return;

            whatsappWebView.send("sendMessage", number, `Olá,${contact.pushname ? ` ${contact.pushname}` : ""} para acessar nossa lista de produtos acesse o link abaixo, não é necessário baixar nenhum aplicativo, o link irá mostrar nossa lista completa, e por lá mesmo você pode selecionar o que deseja e realizar o seu pedido! 🤩\n\nhttps://${company.subdomain}.${domain}?tel=${number}`);

            message_times[number] = Date.now();
            setTimeout(() => delete message_times[number], 6 * 60 * 60 * 1000); // 6h
        }
    }
})


function SendOrderStatusMessage(order) {
    const payment_name_translations = {
        money: "Dinheiro",
        debit: "Cartão de Débito",
        credit: "Cartão de Crédito",
    }

    const company_address = `${company.street}, ${company.street_number} - ${company.neighborhood}, ${company.city} - ${company.state}`;
    const order_address = order.delivery_type !== "withdrawal" ? `${order.street_name}, ${order.street_number} - ${order.neighborhood}, ${order.city} - ${order.complement || order.state}` : null;
    const payment_name = payment_name_translations[order.payment_method] || "Unknown";

    let message = `O status do seu pedido foi alterado para "${order.status}"`;

    function AppendItems() {
        for (const item of order.items) {
            if (item.product.is_pizza) {
                message += `\n● *${item.quantity}x* ${item.product.name} ${item.total > 0 ? `_(${MoneyFormat(item.total)})_` : ""}`;
            } else {
                message += `\n● *${item.quantity}x* ${item.product.name} _(${MoneyFormat(item.total)})_`;
            }

            if (!!item.pizza_flavors.length) {
                message += `\n↳ Sabores:`;
                const total_flavors = item.pizza_flavors.reduce((accumulator, flavor) => accumulator + flavor.quantity, 0);

                for (const pizza of item.pizza_flavors) {
                    message += `\n    ↳ *${pizza.quantity}/${total_flavors}* ${pizza.name}`;
                }
            }

            for (const complement_group of item.complements) {
                message += `\n↳ ${complement_group.name}:`;

                for (const complement of complement_group.items) {
                    message += `\n    ↳ *${complement.quantity}x* ${complement.name} _(${MoneyFormat(complement.price)})_`;
                }
            }

            message += `\n`;
        }
    }

    if (order.status < 0) {
        message = `🔴 *O SEU PEDIDO FOI RECUSADO*!`;
        message += `\n_Acompanhe abaixo o seu pedido_\n`;

        message += `\n👤 ${order.name_client}`;
        message += `\n📞 ${order.phone_client}`;
        message += `\n💵 ${payment_name}`;

        if (order.delivery_type === "delivery") {
            message += `\n🏡 _${order_address}_`;
        } else if (order.delivery_type === "withdrawal") {
            message += `\n🏡 *Retirada*: ${company_address}`;
        }

        message += `\n\n*――――――« ITENS »――――――*`;
        AppendItems();

        message += `\n*―――――――« Total »―――――――*`;

        if (order.discount_coupon) message += `\n*Cupom de desconto*: ${order.discount_coupon.is_percentual ? `${order.discount_coupon.discount}%` : MoneyFormat(order.discount_coupon.discount)} _(${order.discount_coupon.coupon})_`;
        message += `\n*Taxa de Entrega*: _${MoneyFormat(order.delivery_cost)}_`;
        message += `\n*Valor Total*: _${MoneyFormat(order.total)}_`;

    } else if (order.status == 1) {
        message = `\n☑️ *SEU PEDIDO FOI CONFIRMADO*, e está aguardando produção!`;
        message += `\n_Acompanhe abaixo o seu pedido_\n`;

        message += `\n👤 ${order.name_client}`;
        message += `\n📞 ${order.phone_client}`;
        message += `\n💵 ${payment_name}`;

        if (order.delivery_type === "delivery") {
            message += `\n🏡 _${order_address}_`;
        } else if (order.delivery_type === "withdrawal") {
            message += `\n🏡 *Retirada*: ${company_address}`;
        }

        message += `\n\n*――――――« ITENS »――――――*`;
        AppendItems();

        message += `\n*―――――――« Total »―――――――*`;

        if (order.discount_coupon) {
            message += `\n*Cupom de desconto*: ${order.discount_coupon.is_percentual ? `${order.discount_coupon.discount}%` : MoneyFormat(order.discount_coupon.discount)} _(${order.discount_coupon.coupon})_`;
        }

        message += `\n*Taxa de Entrega*: _${MoneyFormat(order.delivery_cost)}_`;
        message += `\n*Valor Total*: _${MoneyFormat(order.total)}_`;

        message += `\n\n⚠️ *ATENÇÃO*: Para solicitar alterações no seu pedido nos faça uma ligação para o telefone disponibilizado no site!`
        message += `\n\n_Para acompanhar o seu pedido acesse o link abaixo_`;
        message += `\nhttps://${company.subdomain}.${domain}/pedido/${order.secret_id_order}`;
    } else if (order.status == 2) {
        if (cur_order.delivery_type === "withdrawal") {
            message = `😛 O seu pedido *está pronto*, faça a retirada dele!\n`;
            message += `\n🏡 _${company_address}_`;
        } else return;
    } else if (order.status == 3) {
        message = `🚚 O seu pedido *saiu para a entrega* ao destinatário!\n`;
        message += `\n🏡 _${order_address}_`;
    } else if (order.status == 10) {
        message = `📬 O seu pedido foi *finalizado*!\n😘 Obrigado pela preferência!`;
    }

    message_times[order.phone_client] = Date.now();
    whatsappWebView.send("sendMessage", order.phone_client, message);
}