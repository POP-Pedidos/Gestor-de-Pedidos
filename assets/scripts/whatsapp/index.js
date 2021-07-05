const $whatsappWebView = $("#whatsappWebView");
const message_times = [];

$whatsappWebView.attr("partition", `persist:whatsapp:${company.id_company}`);
$whatsappWebView.attr("webpreferences", "javascript=yes, contextIsolation=yes, nativeWindowOpen=yes");
$whatsappWebView.attr("preload", "../../../scripts/whatsapp/preload.js");
$whatsappWebView.attr("src", "https://web.whatsapp.com/");

whatsappWebView.addEventListener("dom-ready", function (event) {
    fetch("../../../scripts/whatsapp/inject/WaitAuth.js").then(res => res.text()).then(WaitAuth => {
        whatsappWebView.executeJavaScript(WaitAuth);
    });
});

whatsapp.onSendMessage((e, number, message) => {
    whatsappWebView.send("sendMessage", number, message);
});

whatsappWebView.addEventListener('ipc-message', async (event) => {
    try {
        if (event.channel === "authenticated") {
            fetch("../../../scripts/whatsapp/inject/ModuleRaid.js").then(res => res.text()).then(ModuleRaid => {
                whatsappWebView.executeJavaScript(ModuleRaid);

                fetch("../../../scripts/whatsapp/inject/ExposeStore.js").then(res => res.text()).then(ExposeStore => {
                    whatsappWebView.executeJavaScript(ExposeStore);

                    fetch("../../../scripts/whatsapp/inject/Utils.js").then(res => res.text()).then(Utils => {
                        whatsappWebView.executeJavaScript(Utils);

                        fetch("../../../scripts/whatsapp/inject/Functions.js").then(res => res.text()).then(Functions => {
                            whatsappWebView.executeJavaScript(Functions);

                            whatsappWebView.send("injected");
                        });
                    });
                });
            });

        } else if (event.channel === "connected") {
            tray.update({
                disconnect_whatsapp: true,
            });

        } else if (event.channel === "disconnected") {
            tray.update({
                disconnect_whatsapp: false,
            });

        } else if (event.channel === "user_id") {
            const [number] = event.args;

            if (number && number !== company.whatsapp) FetchAPI("/company", {
                method: "PUT",
                body: { whatsapp: number },
            }).then(data => {
                company = data;
            });

        } else if (event.channel === "onMessage") {
            const [msg, contact] = event.args;

            if (!msg || msg.isMe || msg.isStatusV3 || msg.isGroupMsg || !msg.isNewMsg || msg.isMedia || msg.id.fromMe || msg.type !== "chat") return;

            const delay_ms = 6 * 60 * 60 * 1000;  // 6h
            const number = msg.from?.user || msg.author?.user;
            const name = contact.pushname || contact.verifiedName || contact.name;
            const link = `https://${company.subdomain}.${domain}?tel=${number}`;

            if (Object.keys(message_times).includes(number)) {
                console.warn(`[WHATSAPP-IPC-MESSAGE] Message from "${name}"(${number}) was ignored because it is in the timeout list`);
                return;
            }

            message_times[number] = Date.now();
            setTimeout(() => delete message_times[number], delay_ms);

            try {
                const chat_messages = await fetchMessages(msg.from._serialized, {
                    filter: (_msg, args) => !_msg.isNotification && _msg.id.fromMe && (_msg.text || _msg.body)?.includes(args.link),
                    filter_args: { link },
                    limit: 1,
                });

                if (chat_messages.length > 0 && (Date.now() - new Date(0).setUTCSeconds(chat_messages[0].t)) < delay_ms) {
                    console.warn(`[WHATSAPP-IPC-MESSAGE] Message from "${name}"(${number}) was ignored because the last automatic welcome message was sent recently`);
                    return;
                }
            } catch (ex) {
                console.error(ex);
            }

            whatsappWebView.send("sendMessage", number, `Olá${name ? ` ${name}` : ""}, acesse o link e faça o seu pedido! 🏍️🚚🤩\n\n${link}`);
            local_api.sockets.broadcast("whatsapp:message", event.args);
        }
    } catch (error) {
        console.error("[WHATSAPP-IPC-MESSAGE]", error);
    } finally {
        if (event.channel === "onMessage") {
            const [msg, contact] = event.args;

            if (!msg || msg.isMe || msg.isStatusV3 || msg.isGroupMsg || !msg.isNewMsg || msg.isMedia || msg.id.fromMe) return;
        }

        local_api.sockets.broadcast("whatsapp:event", Object.assign({}, event));
        console.log("[WHATSAPP-IPC-MESSAGE]", event);
    }
});

whatsappWebView.addEventListener('crashed', function () {
    dialog.showMessageBox({
        title: "Erro no WhatsApp",
        type: 'error',
        message: 'A janela do WhatsApp foi terminada inesperadamente!',
    });
});

whatsappWebView.evaluate = async (fn, ...args) => {
    return await whatsappWebView.executeJavaScript(`
        (async () => {
            const evaluate_fn = ${fn.toString()}

            return await evaluate_fn(${args.map(arg => typeof arg !== "function" ? JSON.stringify(arg) : arg).join(",")})
        })();
    `);
}

async function fetchMessages(chatId, options = {}) {
    if (!options.limit) options.limit = 10;
    if (!options.filter) options.filter = m => !m.isNotification;

    let messages = await whatsappWebView.evaluate(async (chatId, limit, filter, filter_args) => {
        const chat = window.Store.Chat.get(chatId);
        let msgs = chat.msgs.models.filter(msg => filter(msg, filter_args));

        while (msgs.length < limit) {
            const loadedMessages = await chat.loadEarlierMsgs();
            if (!loadedMessages) break;
            msgs = [...loadedMessages.filter(msg => filter(msg, filter_args)), ...msgs];
        }

        msgs.sort((a, b) => (a.t > b.t) ? 1 : -1);
        if (msgs.length > limit) msgs = msgs.splice(msgs.length - limit);
        return msgs.map(m => window.WWebJS.getMessageModel(m));

    }, chatId, options.limit, options.filter, options.filter_args);

    return messages;
}

function SendOrderStatusMessage(order) {
    const payment_name_translations = {
        money: "Dinheiro",
        debit: "Cartão de Débito",
        credit: "Cartão de Crédito",
    }

    const company_address = `${company.street}, ${company.street_number} - ${company.neighborhood}, ${company.city} - ${company.state}${company.complement ? ` - ${company.complement}` : ""}`;
    const order_address = order.delivery_type !== "withdrawal" ? `${order.street_name}, ${order.street_number} - ${order.neighborhood}, ${order.city} - ${order.complement || order.state}` : null;
    const payment_name = payment_name_translations[order.payment_method] || "Unknown";
    const discount = order.discount + order.coupon_discount;

    let message = `O status do seu pedido foi alterado para "${order.status}"`;

    function AppendItems() {
        for (const item of order.items) {
            item.pizza_price_rule = item.pizza_price_rule || item.product.pizza_price_rule;

            if (!!item.pizza_flavors.length) {
                message += `\n● *${item.quantity}x* ${item.product.name} ${item.total > 0 ? `_(${MoneyFormat(item.total)})_` : ""}`;
            } else {
                message += `\n● *${item.quantity}x* ${item.product.name} _(${MoneyFormat(item.total)})_`;
            }

            if (!!item.pizza_flavors.length) {
                message += `\n↳ Sabores:`;
                const total_flavors = item.pizza_flavors.reduce((accumulator, flavor) => accumulator + flavor.quantity, 0);

                for (const flavor of item.pizza_flavors) {
                    if (item.pizza_price_rule === "average") {
                        message += `\n    ↳ *${flavor.quantity}/${total_flavors}* ${flavor.name} _(${MoneyFormat(flavor.price / total_flavors)})_`;
                    } else if (item.pizza_price_rule === "biggest_price") {
                        const biggest_price = Math.max(...item.pizza_flavors.map(item => item.price));

                        message += `\n    ↳ *${flavor.quantity}/${total_flavors}* ${flavor.name} _(${MoneyFormat((biggest_price / total_flavors) * flavor.quantity)})_`;
                    } else {
                        message += `\n    ↳ *${flavor.quantity}/${total_flavors}* ${flavor.name} _(${MoneyFormat(flavor.price * flavor.quantity)})_`;
                    }
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

        message += `\n*Taxa de Entrega*: _${MoneyFormat(order.delivery_cost)}_`;
        if (discount > 0) message += `\n*Desconto*: _${MoneyFormat(discount)}_`;
        message += `\n*Valor Total*: _${MoneyFormat(order.total)}_`;

    } else if (order.status == 1) {
        message = `\n✅ *SEU PEDIDO FOI CONFIRMADO*, e está aguardando produção!`;
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
        if (discount > 0) message += `\n*Desconto*: _${MoneyFormat(discount)}_`;
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

    const phone_id = `55${order.phone_client?.replace(/\W/g, "")}`;
    whatsappWebView.send("sendMessage", phone_id, message);
}