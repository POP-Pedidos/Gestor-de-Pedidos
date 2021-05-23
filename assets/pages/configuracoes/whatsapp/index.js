var MessageEditor = class {
    constructor($container, $preview) {
        this.$container = $container;
        this.$preview = $preview;

        this.$backdrop = $container.find(">.backdrop");
        this.$highlights = $container.find(">.backdrop>.highlights");
        this.$mark_info = $container.find(">.mark-info");
        this.$suggestions = $container.find(">.text-suggestions");
        this.$textarea = $container.find(">textarea");

        this.#setLogicalKeys();

        this.#setOrderKeys({
            "id_order": 1001,
            "secret_id_order": "12345678-1234-1234-1234-123456789123",
            "order_company_sequence": 6,
            "id_company": company.id_company,
            "dt_accept": new Date().toISOString(),
            "dt_refuse": new Date().toISOString(),
            "name_client": "Joãozin Silva",
            "phone_client": "(34) 9 9999-9999",
            "cpf-cnpj_note": "888.888.888-88",
            "payment_method": "money",
            "cash_change": 10,
            "street_name": "R. Primeiro Segundo",
            "street_number": 176,
            "neighborhood": "Andorinhas",
            "city": company.city,
            "state": company.state,
            "location": company.location,
            "complement": "Em frente a padaria",
            "status": 1,
            "observation": "Entregar depois das 11h",
            "address": `R. Primeiro Segundo, 176 - Andorinhas, ${company.city} - ${company.state}`,
            "subtotal": 58.9,
            "discount": 13,
            "coupon_discount": 5,
            "delivery_type": "delivery",
            "delivery_cost": 2,
            "total": 42.9,
            "integrated": null,
            "id_integrated": null,
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString(),
            "discount_coupon": null,
            "items": [
                {
                    "complements": [],
                    "pizza_flavors": [],
                    "price": 3.5,
                    "quantity": 2,
                    "total": 6.79,
                    "observation": "",
                    "enabled": true,
                    "product": {
                        "id_product": 84,
                        "name": "Coca Cola Lata",
                        "price": 3.5,
                        "is_pizza": false,
                        "pizza_price_rule": null,
                        "pizza_quantity_flavors": [],
                    }
                },
                {
                    "price": 28.9,
                    "quantity": 1,
                    "total": 26.01,
                    "observation": "",
                    "product": {
                        "name": "Estados Unidos",
                        "price": 28.9,
                        "is_pizza": true,
                        "pizza_price_rule": "average",
                    },
                    "complements": [
                        {
                            "name": "Hamburguer",
                            "items": [
                                {
                                    "name": "Estados Unidos",
                                    "price": 28.9,
                                    "quantity": 2,
                                }
                            ]
                        },
                        {
                            "name": "Molhos",
                            "items": [
                                {
                                    "name": "Estados Unidos",
                                    "price": 28.9,
                                    "quantity": 1,
                                }
                            ]
                        },
                        {
                            "name": "Adicionais",
                            "items": [
                                {
                                    "name": "Estados Unidos",
                                    "price": 28.9,
                                    "quantity": 1,
                                },
                                {
                                    "name": "Estados Unidos",
                                    "price": 28.9,
                                    "quantity": 1,
                                }
                            ]
                        }
                    ],
                    "pizza_flavors": [
                        {
                            "name": "1111111",
                            "price": 10,
                            "quantity": 1
                        },
                        {
                            "name": "1111111",
                            "price": 10,
                            "quantity": 1
                        }
                    ]
                }
            ],
        });

        this.$textarea.on({
            "input": e => this.#handleInput(),
            "scroll": e => this.#handleScroll(e),
            "mousemove": e => this.#handleMouseMove(e),
        });

        this.#handleInput();
        this.#handleCaretSuggestions();
    }

    #handleCaretSuggestions() {
        if (this.lastCaretSuggestionCall) cancelAnimationFrame(this.lastCaretSuggestionCall);

        this.lastCaretSuggestionCall = requestAnimationFrame(() => {
            const caret_pos = this.$textarea[0].selectionStart;

            if (caret_pos !== this.last_caret_pos) {
                const text = this.$textarea.val();
                const left_text = text.slice(0, caret_pos);

                if (/.*{{(\w?)+}?}?$/g.test(left_text)) {
                    this.#handleInput();
                    this.#showSuggestions(text);
                } else this.$suggestions.removeClass("show");
            }

            this.last_caret_pos = caret_pos;
        });
    }

    #handleInput() {
        const text = this.$textarea.val();

        this.$mark_info.removeClass("show");
        this.$suggestions.removeClass("show");

        this.#applyHighlights(text);
        this.#showSuggestions(text);
        this.#showPreview(text);
    }

    #showSuggestions(text) {
        const caret_pos = this.$textarea[0].selectionStart;
        const left_text = text.slice(0, caret_pos);
        const right_text = text.slice(caret_pos, text.length);
        const key_name = left_text.split("{{").slice(-1)[0];
        const has_close_arrows = right_text.startsWith("}}");
        const full_key_name = (key_name + right_text).split("}}")[0];
        const is_valid_full_key_name = /^{{\w+}}.*/g.test(`{{${full_key_name}}}`);

        this.$suggestions.removeClass("show");

        if (/.*{{(\w?)+}?}?$/g.test(left_text)) {
            this.$suggestions.empty();

            const matches = Object.keys(this.keys).filter(key => key.startsWith(key_name.replace(/\W+/g, "")));
            if (!matches?.length) return;
            if (matches.length === 1 && has_close_arrows && !!this.keys[key_name]) return;
            if (matches.length === 1 && is_valid_full_key_name && !!this.keys[full_key_name]) return;

            for (const key of matches) {
                const text = `{{${key}}}`;

                const $element = $(`<div>
                    <span class="tag"></span>
                    <span class="name"></span>
                </div>`);

                $element.find(">.tag").html(text.replace(`{{${key_name}`, `<span>{{${key_name}</span>`));
                $element.find(">.name").text(this.keys_name[key]);

                this.$suggestions.append($element);
            }

            const offset = this.$highlights.find(".suggestions_anchor")[0].getBoundingClientRect();
            const offset_container = this.$container[0].getBoundingClientRect();

            this.$mark_info.removeClass("show");
            this.$suggestions.addClass("show").css({
                top: offset.top + offset.height - offset_container.top,
                left: offset.left - offset_container.left,
            });
        }
    }

    #handleMouseMove(e) {
        if (this.lastMouseMoveCall) cancelAnimationFrame(this.lastMouseMoveCall);

        this.lastMouseMoveCall = requestAnimationFrame(() => {
            const $mark = this.#GetHighlightsMathMouseElement(e);

            this.$mark_info.removeClass("show");

            if ($mark) {
                const offset = $mark[0].getBoundingClientRect();
                const offset_container = this.$container[0].getBoundingClientRect();

                this.$mark_info.addClass("show").css({
                    top: offset.top + offset.height - offset_container.top,
                    left: offset.left - offset_container.left,
                });

                const key_name = $mark.text().replace(/\W+/g, "");

                this.$mark_info.find(".name").text(this.keys_name[key_name] || key_name);
                this.$mark_info.find(".value").text(this.keys[key_name]?.());
            }
        });
    }

    #GetHighlightsMathMouseElement(e) {
        const highlights_marks = this.$highlights.find(">mark.match").get();

        for (const elem of highlights_marks) {
            const offset = elem.getBoundingClientRect();

            if (
                e.clientX >= offset.left &&
                e.clientX <= offset.left + offset.width &&
                e.clientY >= offset.top &&
                e.clientY <= offset.top + offset.height
            ) return $(elem);
        }
    }

    #handleScroll() {
        const scrollTop = this.$textarea.scrollTop();
        const scrollLeft = this.$textarea.scrollLeft();

        this.$backdrop.scrollTop(scrollTop);
        this.$backdrop.scrollLeft(scrollLeft);
    }

    #applyHighlights(text) {
        const caret_pos = this.$textarea[0].selectionStart;
        const left_text = text.slice(0, caret_pos);
        const last_char_pos = left_text.lastIndexOf("{{");
        text = `${text.substring(0, last_char_pos)}<span class="suggestions_anchor">{{</span>${text.substring(last_char_pos + 2)}`;

        text = this.#applyLogicalHighlights(text);

        text = text.replace(/{{\w+}}/g, "<mark>$&</mark>");
        text = text.replace(/<span .*{{<\/span>\w+}}/g, "<mark>$&</mark>");

        text = text.replace(/\n/g, "</br>");

        const $text = $("<div>").html(text);

        for (const mark of $text.find("mark").get()) {
            const $mark = $(mark);
            const key_name = $mark.text().replace(/\W+/g, "");

            if (typeof this.keys[key_name] === "function") $mark.addClass("match");
        }

        this.$highlights.html($text.html());
    }

    #applyLogicalHighlights(text) {
        text = text.replace(/{\[SE .* ENTAO\]}((.|\n)*?){\[FIM-SE\]}/g, `<mark logic="if">$&</mark>`);

        return text;
    }

    #setOrderKeys(order) {
        order.payment_name = "Unknown";
        if (order.payment_method === "money") order.payment_name = "Dinheiro";
        else if (order.payment_method === "debit") order.payment_name = "Cartão de Débito";
        else if (order.payment_method === "credit") order.payment_name = "Cartão de Crédito";

        this.keys = {
            "nome_cliente": () => order.name_client,
            "telefone_cliente": () => order.phone_client,
            "tipo_pagamento": () => order.payment_name,
            "endereço_cliente": () => order.address,
            "endereço_empresa": () => company.address,
            "url": () => `https://${company.subdomain}.${domain}/pedido/${order.secret_id_order}`,
            "link": () => `https://${company.subdomain}.${domain}/pedido/${order.secret_id_order}`,
            "total": () => MoneyFormat(order.total),
            "taxa_entrega": () => MoneyFormat(order.delivery_cost),
            "itens": () => {
                let message = "";

                for (const item of order.items) {
                    if (item.product.is_pizza) {
                        message += `\n● *${item.quantity}x* ${item.product.name} ${item.total > 0 ? `_(${MoneyFormat(item.total)})_` : ""}`;
                    } else {
                        message += `\n● *${item.quantity}x* ${item.product.name} _(${MoneyFormat(item.total)})_`;
                    }

                    if (!!item.pizza_flavors.length) {
                        message += `\n↳ Sabores:`;

                        for (const pizza of item.pizza_flavors) {
                            message += `\n    ↳ ${pizza.name}`;
                        }
                    }

                    for (const complement_group of item.complements) {
                        message += `\n↳ ${complement_group.name}:`;

                        for (const complement of complement_group.items) {
                            message += `\n    ↳ ${complement.name} _(${MoneyFormat(complement.price)})_`;
                        }
                    }

                    message += `\n`;
                }

                return message;
            }
        }

        this.keys_name = {
            "nome_cliente": "Nome do cliente",
            "telefone_cliente": "Telefone do cliente",
            "tipo_pagamento": "Tipo de pagamento",
            "endereço_cliente": "Endereço do cliente",
            "endereço_empresa": "Endereço da empresa",
            "url": "Link do pedido",
            "link": "Link do pedido",
            "total": "Valor total",
            "taxa_entrega": "Taxa de entrega",
            "itens": "Itens do pedido",
        }
    }

    #showPreview(text) {
        let final_string = this.LoadString(text);
        final_string = final_string.replace(/\n/g, "</br>");

        this.$preview.html(final_string);
    }

    #setLogicalKeys() {
        this.logical_tags = {
            "SE .* ENTAO": () => { },
            "SENAO": () => { },
            "FIM-SE": () => { },
        }
    }

    #getLogicalKey(key_name) {
        for (const key in this.logical_tags) {
            if (new RegExp(key).text(key_name)) return this.logical_tags[key];
        }
    }

    #processLogicKeys(text) {

        return text;
    }

    LoadString(text) {
        text = this.#processLogicKeys(text);

        for (const key in this.keys) {
            try {
                const value = this.keys[key]?.();
                text = text.replace(new RegExp(`{{${key}}}`, "g"), value);
            } catch { }
        }

        return text;
    }
}

new MessageEditor($(".whatsapp-message-editor-container>.editor"), $(".whatsapp-message-editor-container>.preview"));