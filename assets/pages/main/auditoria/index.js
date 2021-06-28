
function AddAuditSkeleton() {
    const $skeleton = $(`<section class="is_skeleton">
        <header>
            <div class="type-icon skeleton"></div>
            <div class="action-icon skeleton"></div>
            <div class="infos">
                <span class="title skeleton">.</span>
                <span class="time skeleton">.</span>
            </div>
        </header>
    </section>`);

    $(".audit-results").append($skeleton);

    return $skeleton;
}

function addAudit(audit) {
    try {
        const $audit = $(`<section>
        <header>
            <div class="type-icon"></div>
            <img class="action-icon"/>
            <div class="infos">
                <span class="title"></span>
                <span class="time"></span>
            </div>
            <i class="fas fa-chevron-right"></i>
        </header>
        <main>
            <div></div>
        </main>
    </section>`);

        $audit.attr("id_audit", audit.id);

        const action_icon = company.image?.small || "../../../images/pop-black-icon.jpg";

        const audit_targets = {
            company: {
                UPDATE: audit => {
                    function GetPrintStatusName(value) {
                        if (value === "wait_production") return "No Aceite";
                        else if (value === "wait_delivery") return "Foi Produzido";
                        else if (value === "finished") return "Foi Finalizado";
                        else return "Não imprimir";
                    }

                    function GetDeliveryTypeName(value) {
                        if (value === 0) return "Fixo";
                        else if (value === 1) return "Por quilômetro";
                        else return "Indefinido";
                    }

                    if (audit.changes.length == 1) {
                        const messages = {
                            subdomain: change => {
                                if (change.old_value) return `<b>${audit.username}</b> alterou o subdomínio ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`;
                                else return `<b>${audit.username}</b> alterou o subdomínio para <b>${change.new_value}</b>`;
                            },
                            name: change => `<b>${audit.username}</b> alterou o nome da empresa ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            "cpf-cnpj": change => `<b>${audit.username}</b> alterou o cpf/cnpj da empresa ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            phone: change => `<b>${audit.username}</b> alterou o telefone da empresa ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            whatsapp: change => {
                                if (change.old_value) return `<b>${audit.username}</b> alterou o numero de WhatsApp de <b>${FormatTell(change.old_value)}</b> para <b>${FormatTell(change.new_value)}</b>`;
                                else return `<b>${audit.username}</b> alterou o numero de WhatsApp para <b>${FormatTell(change.new_value)}</b>`;
                            },
                            image: change => `<b>${audit.username}</b> alterou o ícone da empresa`,
                            location: change => `A localização da empresa foi alterada de <b>${change.old_value?.lat},${change.old_value?.lng}</b> para <b>${change.new_value?.lat},${change.new_value?.lng}</b>`,
                            delivery_type: change => `<b>${audit.username}</b> alterou o tipo de cobrança da taxa de entrega de <b>${GetDeliveryTypeName(change.old_value)}</b> para <b>${GetDeliveryTypeName(change.new_value)}</b>`,
                            delivery_cost: change => `<b>${audit.username}</b> alterou o preço de cobrança da taxa de entrega de <b>${change.old_value ? MoneyFormat(change.old_value) : "Indefinido"}</b> para <b>${change.new_value ? MoneyFormat(change.new_value) : "Indefinido"}</b>`,
                            delivery_free_in: change => `<b>${audit.username}</b> alterou o valor mínimo de promoção de taxa de entrega de <b>${change.old_value ? MoneyFormat(change.old_value) : "Indefinido"}</b> para <b>${change.new_value ? MoneyFormat(change.new_value) : "Indefinido"}</b>`,
                            delivery_free_val: change => `<b>${audit.username}</b> alterou o valor da promoção de taxa de entrega de <b>${MoneyFormat(change.old_value || 0)}</b> para <b>${MoneyFormat(change.new_value || 0)}</b>`,
                            delivery_min: change => `<b>${audit.username}</b> alterou o preço mínimo elegível para entrega de <b>${MoneyFormat(change.old_value || 0)}</b> para <b>${MoneyFormat(change.new_value || 0)}</b>`,
                            website_primary_color: change => `<b>${audit.username}</b> alterou a cor primária do site de <b><font color="#${change.old_value}">${change.old_value}</font></b> para <b><font color="#${change.new_value}">${change.new_value}</font></b>`,
                            website_main_bg: change => `<b>${audit.username}</b> alterou a imagem de fundo do site`,
                            online_check: change => `<b>${audit.username}</b> <b>${change.new_value ? "ativou" : "desativou"}</b> a função abrir estabelecimento pelo gestor`,
                            use_discount_coupon: change => `<b>${audit.username}</b> <b>${change.new_value ? "ativou" : "desativou"}</b> os cupons de desconto`,
                            morning_shift_open: change => `<b>${audit.username}</b> alterou a hora de abertura do turno da <b>manhã</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            morning_shift_close: change => `<b>${audit.username}</b> alterou a hora de fechamento do turno da <b>manhã</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            afternoon_shift_open: change => `<b>${audit.username}</b> alterou a hora de abertura do turno da <b>tarde</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            afternoon_shift_close: change => `<b>${audit.username}</b> alterou a hora de fechamento do turno da <b>tarde</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            night_shift_open: change => `<b>${audit.username}</b> alterou a hora de abertura do turno da <b>noite</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            night_shift_close: change => `<b>${audit.username}</b> alterou a hora de fechamento do turno da <b>noite</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            use_withdrawal: change => `<b>${audit.username}</b> ${change.new_value ? "ativou" : "desativou"} a função <b>Trabalha com retirada</b>`,
                            use_delivery: change => `<b>${audit.username}</b> ${change.new_value ? "ativou" : "desativou"} a função <b>Trabalha com entrega</b>`,
                            license_expiration: change => `A data de expiração do plano foi alterada ${change.old_value ? `de <b>${new Date(change.old_value).toLocaleDateString()}</b>` : ""} para <b>${change.new_value ? new Date(change.new_value).toLocaleDateString() : "Indefinido"}</b>`,
                            print_delivery_copy: change => `<b>${audit.username}</b> alterou a impressão da <b>Via de entrega</b> de <b>${GetPrintStatusName(change.old_value)}</b> para <b>${GetPrintStatusName(change.new_value)}</b>`,
                            print_control_copy: change => `<b>${audit.username}</b> alterou a impressão da <b>Via de entrega</b> de <b>${GetPrintStatusName(change.old_value)}</b> para <b>${GetPrintStatusName(change.new_value)}</b>`,
                            print_production_copy: change => `<b>${audit.username}</b> alterou a impressão da <b>Via de produção</b> de <b>${GetPrintStatusName(change.old_value)}</b> para <b>${GetPrintStatusName(change.new_value)}</b>`,
                        }

                        const change = audit.changes[0];

                        if (["street", "street_number", "city", "neighborhood", "state"].includes(change.key)) {
                            return {
                                icon: "list",
                                title: `${audit.username ? `<b>${audit.username}</b> alterou` : "Foi alterado"} o endereço da empresa para <b>${change.key === "street" ? change.new_value : company.street}, ${change.key === "street_number" ? change.new_value : company.street_number} - ${change.key === "neighborhood" ? change.new_value : company.neighborhood}, ${change.key === "city" ? change.new_value : company.city} - ${change.key === "state" ? change.new_value : company.state}</b>`,
                                items: []
                            };
                        } else {
                            return {
                                icon: "list",
                                title: messages[change.key]?.(change) || `<b>${audit.username}</b> alterou algum dado da empresa`,
                                items: []
                            };
                        }
                    } else {
                        const messages = {
                            subdomain: change => {
                                if (change.old_value) return `O subdomínio foi alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`;
                                else return `O subdomínio foi alterado para <b>${change.new_value}</b>`;
                            },
                            name: change => `O nome foi alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            "cpf-cnpj": change => `O cpf/cnpj foi alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            phone: change => `Alterou o telefone ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            whatsapp: change => {
                                if (change.old_value) return `O numero de WhatsApp foi alterado de <b>${FormatTell(change.old_value)}</b> para <b>${FormatTell(change.new_value)}</b>`;
                                else return `O numero de WhatsApp foi alterado para <b>${FormatTell(change.new_value)}</b>`;
                            },
                            image: change => `O ícone foi alterado`,
                            location: change => `A localização foi alterada de <b>${change.old_value?.lat},${change.old_value?.lng}</b> para <b>${change.new_value?.lat},${change.new_value?.lng}</b>`,
                            delivery_type: change => `Mudou o tipo de cobrança da taxa de entrega de <b>${GetDeliveryTypeName(change.old_value)}</b> para <b>${GetDeliveryTypeName(change.new_value)}</b>`,
                            delivery_cost: change => `Mudou o preço de cobrança da taxa de entrega de <b>${change.old_value ? MoneyFormat(change.old_value) : "Indefinido"}</b> para <b>${change.new_value ? MoneyFormat(change.new_value) : "Indefinido"}</b>`,
                            delivery_free_in: change => `Mudou o valor mínimo de promoção de taxa de entrega de <b>${change.old_value ? MoneyFormat(change.old_value) : "Indefinido"}</b> para <b>${change.new_value ? MoneyFormat(change.new_value) : "Indefinido"}</b>`,
                            delivery_free_val: change => `Mudou o valor da promoção de taxa de entrega de <b>${MoneyFormat(change.old_value || 0)}</b> para <b>${MoneyFormat(change.new_value || 0)}</b>`,
                            delivery_min: change => `Mudou o preço mínimo elegível para entrega de <b>${MoneyFormat(change.old_value || 0)}</b> para <b>${MoneyFormat(change.new_value || 0)}</b>`,
                            website_primary_color: change => `Mudou a cor primária do site de <b><font color="#${change.old_value}">${change.old_value}</font></b> para <b><font color="#${change.new_value}">${change.new_value}</font></b>`,
                            website_main_bg: change => `Mudou a imagem de fundo do site`,
                            online_check: change => `Abrir o estabelecimento pelo gestor foi <b>${change.new_value ? "ativado" : "desativado"}</b>`,
                            use_discount_coupon: change => `<b>${change.new_value ? "Ativou" : "Desativou"}</b> os cupons de desconto`,
                            morning_shift_open: change => `Mudou a hora de abertura do turno da <b>manhã</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            morning_shift_close: change => `Mudou a hora de fechamento do turno da <b>manhã</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            afternoon_shift_open: change => `Mudou a hora de abertura do turno da <b>tarde</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            afternoon_shift_close: change => `Mudou a hora de fechamento do turno da <b>tarde</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            night_shift_open: change => `Mudou a hora de abertura do turno da <b>noite</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            night_shift_close: change => `Mudou a hora de fechamento do turno da <b>noite</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            use_withdrawal: change => `Trabalha com <b>retirada</b> foi <b>${change.new_value ? "ativado" : "desativado"}</b>`,
                            use_delivery: change => `Trabalha com <b>entrega</b> foi <b>${change.new_value ? "ativado" : "desativado"}</b>`,
                            license_expiration: change => `A data de expiração do plano foi alterada ${change.old_value ? `de <b>${new Date(change.old_value).toLocaleDateString()}</b>` : ""} para <b>${change.new_value ? new Date(change.new_value).toLocaleDateString() : "Indefinido"}</b>`,
                            print_delivery_copy: change => `Mudou a impressão da <b>Via de entrega</b> de <b>${GetPrintStatusName(change.old_value)}</b> para <b>${GetPrintStatusName(change.new_value)}</b>`,
                            print_control_copy: change => `Mudou a impressão da <b>Via de entrega</b> de <b>${GetPrintStatusName(change.old_value)}</b> para <b>${GetPrintStatusName(change.new_value)}</b>`,
                            print_production_copy: change => `Mudou a impressão da <b>Via de produção</b> de <b>${GetPrintStatusName(change.old_value)}</b> para <b>${GetPrintStatusName(change.new_value)}</b>`,
                        }

                        const items = audit.changes.map(change => messages[change.key]?.(change));

                        if (audit.changes.some(change => ["street", "street_number", "city", "neighborhood", "state"].includes(change.key))) {
                            items.push(`${audit.username ? `<b>${audit.username}</b> alterou` : "Foi alterado"} o endereço da empresa para <b>${change.key === "street" ? change.new_value : company.street}, ${change.key === "street_number" ? change.new_value : company.street_number} - ${change.key === "neighborhood" ? change.new_value : company.neighborhood}, ${change.key === "city" ? change.new_value : company.city} - ${change.key === "state" ? change.new_value : company.state}</b>`);
                        }

                        return {
                            icon: "list",
                            title: `<b>${audit.username}</b> alterou ${audit.changes?.length || ""} dado${audit.changes?.length ? "s" : ""} da empresa`,
                            items,
                        };
                    }
                },
                CREATE: () => {
                    return {
                        icon: "list",
                        title: `A empresa foi criada!`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `A empresa foi deletada!`,
                        items: []
                    };
                }
            },
            user: {
                UPDATE: audit => {
                    if (audit.changes.length == 1) {
                        const messages = {
                            username: change => `O nome de usuário ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}foi alterado para <b>${change.new_value}</b>`,
                            password: change => `A senha do usuário <b>${audit.username}</b> foi alterada`,
                            email: change => `O email do usuário <b>${audit.username}</b> foi alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            enabled: change => `O usuário <b>${audit.username}</b> foi <b>${change.new_value ? "habilitado" : "desabilitado"}</b>`,
                            id_company: change => `Agora o usuário <b>${audit.username}</b> faz parte da empresa!`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `<b>${audit.username}</b> alterou algum dado da empresa`,
                            items: []
                        };
                    } else {
                        const messages = {
                            username: change => `Nome de usuário alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            password: change => `A senha foi alterada`,
                            email: change => `O email foi alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            enabled: change => `O usuário foi <b>${change.new_value ? "habilitado" : "desabilitado"}</b>`,
                            id_company: change => `Agora o usuário <b>${audit.username}</b> faz parte da empresa!`,
                        }

                        return {
                            icon: "user",
                            title: `O usuário <b>${audit.username}</b> foi modificado`,
                            items: audit.changes.map(change => messages[change.key]?.(change))
                        };
                    }
                },
                CREATE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> foi criado`,
                        items: []
                    };
                },
                DELETE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> foi deletado`,
                        items: []
                    };
                },
                LOGIN: audit => {
                    const items = [];

                    if (audit.additional.internal_username) items.push(`Nome de usuário interno é <b>${audit.additional.internal_username}</b>`);
                    if (audit.additional.ip_address) items.push(`Endereço IP externo é <b>${audit.additional.ip_address}</b>`);
                    if (audit.additional.address) items.push(`Endereço do IP é <b>${audit.additional.address}</b>`);

                    return {
                        icon: "user",
                        title: `O usuário <b>${audit.username}</b>${audit.additional.internal_username ? `(${audit.additional.internal_username})` : (audit.additional.address ? ` de <b>${audit.additional.address}</b>` : "")} se autenticou`,
                        items,
                    };
                },
            },
            company_time: {
                UPDATE: audit => {
                    function GetDayOfWeekName(value) {
                        if (value === "Monday") return "Segunda";
                        else if (value === "Tuesday") return "Terça";
                        else if (value === "Wednesday") return "Quarta";
                        else if (value === "Thursday") return "Quinta";
                        else if (value === "Friday") return "Sexta";
                        else if (value === "Saturday") return "Sábado";
                        else if (value === "Sunday") return "Domingo";
                        else return "Indefinido";
                    }

                    if (audit.changes.length == 1) {
                        const messages = {
                            open: change => `O usuário <b>${audit.username}</b> alterou o horário <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b> para <b>${change.new_value ? "aberto" : "fechado"}</b>`,
                            opens: change => `O usuário <b>${audit.username}</b> alterou o horário de abertura <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            closes: change => `O usuário <b>${audit.username}</b> alterou o horário de fechamento <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `O usuário <b>${audit.username}</b> alterou o horário <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            open: change => `Horário <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b> alterado para <b>${change.new_value ? "aberto" : "fechado"}</b>`,
                            opens: change => `Horário de abertura <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b> alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            closes: change => `Horário de fechamento <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b> alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        return {
                            icon: "list",
                            title: `O usuário <b>${audit.username}</b> fez ${audit.changes?.length || ""} alteraç${audit.changes?.length ? "ões" : "ão"} no horário <b>${GetDayOfWeekName(audit.additional.dayOfWeek)}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change))
                        };
                    }
                },
            },
            category: {
                UPDATE: audit => {
                    if (audit.changes.length == 1) {
                        const messages = {
                            name: change => `O usuário <b>${audit.username}</b> alterou o nome da categoria <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            image: change => `O usuário <b>${audit.username}</b> alterou a imagem da categoria <b>${audit.additional.name}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `O usuário <b>${audit.username}</b> alterou a categoria <b>${audit.additional.name}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            name: change => `O nome alterado ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            image: change => `A imagem foi alterada`,
                        }

                        return {
                            icon: "list",
                            title: `O usuário <b>${audit.username}</b> fez ${audit.changes?.length || ""} alteraç${audit.changes?.length ? "ões" : "ão"} na categoria <b>${audit.additional.name}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change))
                        };
                    }
                },
                CREATE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> criou a categoria <b>${audit.additional.name}</b>`,
                        items: []
                    };
                },
                DELETE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> apagou a categoria <b>${audit.additional.name}</b>`,
                        items: []
                    };
                },
            },
            discount_coupon: {
                UPDATE: audit => {
                    if (audit.changes.length == 1) {
                        const messages = {
                            coupon: change => `O usuário <b>${audit.username}</b> alterou o nome do cupom de desconto <b>${audit.additional.coupon}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            discount: change => {
                                const is_percentual_key = audit.changes.find(change => change.key == "is_percentual");

                                return `O usuário <b>${audit.username}</b> alterou o desconto do cupom de desconto <b>${audit.additional.coupon}</b> de <b>${is_percentual_key.old_value ? `${Number(change.old_value)}%` : MoneyFormat(change.old_value)}</b> para <b>${is_percentual_key.new_value ? `${Number(change.new_value)}%` : MoneyFormat(change.new_value)}</b>`
                            },
                            is_percentual: change => {
                                const is_percentual_key = audit.changes.find(change => change.key == "is_percentual");

                                return `O usuário <b>${audit.username}</b> alterou o desconto do cupom de desconto <b>${audit.additional.coupon}</b> de <b>${is_percentual_key.old_value ? `${Number(change.old_value)}%` : MoneyFormat(change.old_value)}</b> para <b>${is_percentual_key.new_value ? `${Number(change.new_value)}%` : MoneyFormat(change.new_value)}</b>`
                            },
                            limit: change => `O usuário <b>${audit.username}</b> alterou o limite de usos do cupom de desconto <b>${audit.additional.coupon}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            min_price: change => `O usuário <b>${audit.username}</b> alterou o preço mínimo elegível do cupom de desconto <b>${audit.additional.coupon}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            in_delivery_cost: change => `O usuário <b>${audit.username}</b> configurou o cupom de desconto desconto <b>${audit.additional.coupon}</b> para <b>${change.new_value ? "não ser" : "ser também"}</b> aplicado ao preço do frete`,
                            enabled: change => `O usuário <b>${audit.username}</b> <b>${change.new_value ? "ativou" : "desativou"}</b> o cupom de desconto <b>${audit.additional.coupon}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `O usuário <b>${audit.username}</b> alterou o cupom de desconto <b>${audit.additional.coupon}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            coupon: change => `Mudou o nome ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            discount: change => {
                                const is_percentual_key = audit.changes.find(change => change.key == "is_percentual");

                                return `Mudou o desconto de <b>${is_percentual_key.old_value ? `${Number(change.old_value)}%` : MoneyFormat(change.old_value)}</b> para <b>${is_percentual_key.new_value ? `${Number(change.new_value)}%` : MoneyFormat(change.new_value)}</b>`
                            },
                            is_percentual: change => {
                                const is_percentual_key = audit.changes.find(change => change.key == "is_percentual");

                                return `Mudou o desconto de <b>${is_percentual_key.old_value ? `${Number(change.old_value)}%` : MoneyFormat(change.old_value)}</b> para <b>${is_percentual_key.new_value ? `${Number(change.new_value)}%` : MoneyFormat(change.new_value)}</b>`
                            },
                            limit: change => `Mudou o limite de usos ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            min_price: change => `Mudou o preço mínimo elegível ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            in_delivery_cost: change => `O desconto <b>${change.new_value ? "não será" : "será também"}</b> aplicado ao preço do frete`,
                            enabled: change => `Foi <b>${change.new_value ? "ativado" : "desativado"}</b>`,
                        }

                        return {
                            icon: "list",
                            title: `O usuário <b>${audit.username}</b> fez ${audit.changes?.length || ""} alteraç${audit.changes?.length ? "ões" : "ão"} no cupom de desconto <b>${audit.additional.coupon}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change))
                        };
                    }
                },
                CREATE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> criou o cupom de desconto <b>${audit.additional.coupon}</b>`,
                        items: []
                    };
                },
                DELETE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> apagou o cupom de desconto <b>${audit.additional.coupon}</b>`,
                        items: []
                    };
                },
            },
            order: {
                UPDATE: audit => {
                    function GetStatusName(value) {
                        if (value === 0) return "Aguardando aceite";
                        else if (value === 1) return "Aguardando produção";
                        else if (value === 2) return "Aguardando entrega";
                        else if (value === 3) return "Saiu para entrega";
                        else if (value === 10) return "Entregue";
                        else return "Recusado";
                    }

                    if (audit.username) {
                        return {
                            icon: "sticker",
                            title: `O usuário <b>${audit.username}</b> alterou o status do pedido <b>${audit.additional.order.order_company_sequence}</b> para <b>${GetStatusName(audit.additional.order.status)}</b>`,
                            items: []
                        };
                    } else {
                        return {
                            icon: "sticker",
                            title: `O status do pedido <b>${audit.additional.order.order_company_sequence}</b> foi alterado para <b>${GetStatusName(audit.additional.order.status)}</b>`,
                            items: []
                        };
                    }
                },
                CREATE: audit => {
                    return {
                        icon: "list",
                        title: `O pedido <b>${audit.additional.order.order_company_sequence}</b> do cliente <b>${audit.additional.order.name_client}</b> foi registrado`,
                        items: []
                    };
                }
            },
            printer: {
                UPDATE: audit => {
                    function GetPrintTypeName(value) {
                        if (value === "graphic") return "Gráfica";
                        else if (value === "text") return "Texto";
                        else return "Indefinido";
                    }

                    if (audit.changes.length == 1) {
                        const messages = {
                            name: change => `O usuário <b>${audit.username}</b> alterou o nome da impressora <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            device: change => `O usuário <b>${audit.username}</b> alterou o dispositivo de impressão da impressora <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            is_primary: change => `O usuário <b>${audit.username}</b> ${change.new_value ? `definiu a impressora <b>${audit.additional.name}</b> como dispositivo <b>primário</b>` : `configurou a impressora <b>${audit.additional.name}</b> como não <b>primária</b>`}`,
                            type: change => `O usuário <b>${audit.username}</b> alterou o tipo de impressão da impressora <b>${audit.additional.name}</b> para ${GetPrintTypeName(change.new_value)}`,
                            size: change => `O usuário <b>${audit.username}</b> alterou o tamanho da impressão da impressora <b>${audit.additional.name}</b> ${change.old_value ? `de ${change.old_value}mm ` : ""}para ${change.new_value}mm`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `O usuário <b>${audit.username}</b> alterou a impressora <b>${audit.additional.name}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            name: change => `Mudou o nome ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            device: change => `Mudou o dispositivo de impressão <b>${change.old_value}</b> para <b>${change.new_value}</b>`,
                            is_primary: change => change.new_value ? `Definiu como dispositivo <b>primário</b>` : `Não é mais um dispositivo <b>primário</b>`,
                            type: change => `Mudou o tipo de impressão para <b>${GetPrintTypeName(change.new_value)}</b>`,
                            size: change => `Mudou o tamanho da impressão de <b>${change.old_value}mm</b> para <b>${change.new_value}mm</b>`,
                        }

                        return {
                            icon: "list",
                            title: `O usuário <b>${audit.username}</b> fez ${audit.changes?.length || ""} alteraç${audit.changes?.length ? "ões" : "ão"} na impressora <b>${audit.additional.name}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change))
                        };
                    }
                },
                CREATE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> criou a impressora <b>${audit.additional.name}</b>`,
                        items: []
                    };
                },
                DELETE: audit => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> apagou a impressora <b>${audit.additional.name}</b>`,
                        items: []
                    };
                },
            },
            neighborhood_blacklist: {
                CREATE: () => {
                    return {
                        icon: "list",
                        title: `<b>${audit.username}</b> adicionou o bairro <b>${audit.additional.neighborhood}${audit.additional.city !== company.city ? `, ${audit.additional.city}` : ""}</b> na blacklist`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `<b>${audit.username}</b> removeu o bairro <b>${audit.additional.neighborhood}${audit.additional.city !== company.city ? `, ${audit.additional.city}` : ""}</b> da blacklist`,
                        items: []
                    };
                }
            },
            neighborhood_delivery_cost: {
                UPDATE: () => {
                    const price_key = audit.changes.find(change => change.key == "price");

                    return {
                        icon: "list",
                        title: `<b>${audit.username}</b> configurou a taxa de entrega do bairro <b>${audit.additional.neighborhood}${audit.additional.city !== company.city ? `, ${audit.additional.city}` : ""}</b>${price_key.old_value ? ` de <b>${MoneyFormat(price_key.old_value)}</b>` : ""} para <b>${MoneyFormat(price_key.new_value)}</b>`,
                        items: []
                    };
                },
                CREATE: () => {
                    const price_key = audit.changes.find(change => change.key == "price");
                    
                    return {
                        icon: "list",
                        title: `<b>${audit.username}</b> configurou a taxa de entrega do bairro <b>${audit.additional.neighborhood}${audit.additional.city !== company.city ? `, ${audit.additional.city}` : ""}</b>${price_key.old_value ? ` de <b>${MoneyFormat(price_key.old_value)}</b>` : ""} para <b>${MoneyFormat(price_key.new_value)}</b>`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `<b>${audit.username}</b> removeu a taxa de entrega do bairro <b>${audit.additional.neighborhood}${audit.additional.city !== company.city ? `, ${audit.additional.city}` : ""}</b>`,
                        items: []
                    };
                }
            },
            product: {
                UPDATE: audit => {
                    if (audit.changes.length == 1) {
                        const messages = {
                            order: change => `O usuário <b>${audit.username}</b> alterou a ordem de listagem do produto <b>${audit.additional.name}</b>`,
                            name: change => `O usuário <b>${audit.username}</b> alterou o nome do produto <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            description: change => `O usuário <b>${audit.username}</b> alterou a descrição do produto <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            sku: change => `O usuário <b>${audit.username}</b> alterou o SKU do produto <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            enabled: change => `O usuário <b>${audit.username}</b> Foi <b>${change.new_value ? "ativado" : "pausado"}</b>`,
                            keywords: change => `O usuário <b>${audit.username}</b> alterou as palavras chave do SEO do produto <b>${audit.additional.name}</b>${change.old_value ? ` de <b>${change.old_value.join(", ")}</b>` : ""} para <b>${change.new_value.join(", ")}</b>`,
                            price: change => `O usuário <b>${audit.username}</b> alterou o preço do produto <b>${audit.additional.name}</b> de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`,
                            is_pizza: change => `O usuário <b>${audit.username}</b> alterou o tipo do produto <b>${audit.additional.name}</b> de <b>${change.old_value ? "pizza" : "comum"}</b> para <b>${change.new_value ? "pizza" : "comum"}</b>`,
                            pizza_price_rule: change => `O usuário <b>${audit.username}</b> alterou o tipo de precificação da pizza <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            pizza_quantity_flavors: change => `O usuário <b>${audit.username}</b> alterou a quantidade de sabores da pizza <b>${audit.additional.name}</b> ${!!change.old_value ? `de <b>${change.old_value.join(", ")}</b> ` : ""}para <b>${change.new_value.join(", ")}</b>`,
                            seo_title: change => `O usuário <b>${audit.username}</b> alterou o titulo de SEO do produto <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            seo_description: change => `O usuário <b>${audit.username}</b> alterou a descrição de SEO do produto <b>${audit.additional.name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            availability_daysOfWeek: change => `O usuário <b>${audit.username}</b> alterou a disponibilidade do produto <b>${audit.additional.name}</b> nos dias da semana${change.old_value ? ` de <b>${change.old_value?.split(",").join(", ")}</b>` : ""} para <b>${change.new_value.split(",").join(", ")}</b>`,
                            availability_dayShifts: change => `O usuário <b>${audit.username}</b> alterou a disponibilidade do produto <b>${audit.additional.name}</b> dos turnos do dia${change.old_value ? ` de <b>${change.old_value?.split(",").join(", ")}</b>` : ""} para <b>${change.new_value.split(",").join(", ")}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `<b>${audit.username}</b> alterou algum dado do produto <b>${audit.additional.name}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            order: change => `Mudou a ordem de listagem`,
                            name: change => `Mudou o nome ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            description: change => `Mudou a descrição ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            sku: change => `Mudou o SKU ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            enabled: change => `Foi <b>${change.new_value ? "ativado" : "pausado"}</b>`,
                            keywords: change => `Mudou as palavras chave do SEO${change.old_value ? ` de <b>${change.old_value.join(", ")}</b>` : ""} para <b>${change.new_value.join(", ")}</b>`,
                            price: change => `Mudou o preço de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`,
                            is_pizza: change => `Mudou o tipo do produto de <b>${change.old_value ? "pizza" : "comum"}</b> para <b>${change.new_value ? "pizza" : "comum"}</b>`,
                            pizza_price_rule: change => `Mudou o tipo de precificação da pizza ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            pizza_quantity_flavors: change => `Mudou a quantidade de sabores da pizza ${change.old_value ? `de <b>${change.old_value.join(", ")}</b> ` : ""}para <b>${change.new_value.join(", ")}</b>`,
                            seo_title: change => `Mudou o titulo do SEO ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            seo_description: change => `Mudou a descrição do SEO ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            availability_daysOfWeek: change => `Mudou a disponibilidade nos dias da semana${change.old_value ? ` de <b>${change.old_value?.split(",").join(", ")}</b>` : ""} para <b>${change.new_value.split(",").join(", ")}</b>`,
                            availability_dayShifts: change => `Mudou a disponibilidade dos turnos do dia${change.old_value ? ` de <b>${change.old_value?.split(",").join(", ")}</b>` : ""} para <b>${change.new_value.split(",").join(", ")}</b>`,
                        }

                        return {
                            icon: "list",
                            title: `<b>${audit.username}</b> alterou ${audit.changes?.length || ""} dado${audit.changes?.length ? "s" : ""} do produto <b>${audit.additional.name}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change)),
                        };
                    }
                },
                CREATE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> criou o produto <b>${audit.additional.name}</b>`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> apagou o produto <b>${audit.additional.name}</b>`,
                        items: []
                    };
                }
            },
            product_image: {
                CREATE: () => {
                    return {
                        icon: "list",
                        title: `<b>${audit.username}</b> adicionou uma imagem no produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `<b>${audit.username}</b> apagou uma imagem do produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                }
            },
            product_pizza_flavor: {
                UPDATE: audit => {
                    if (audit.changes.length == 1) {
                        const messages = {
                            name: change => `O usuário <b>${audit.username}</b> alterou o nome do sabor de pizza <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            description: change => `O usuário <b>${audit.username}</b> alterou a descrição do sabor de pizza <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            price: change => `O usuário <b>${audit.username}</b> alterou o preço do sabor de pizza <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b> de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`,
                            order: change => `O usuário <b>${audit.username}</b> alterou a ordem de listagem do sabor de pizza <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `<b>${audit.username}</b> alterou algum dado do sabor de pizza <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            name: change => `Mudou o nome ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            description: change => `Mudou a descrição ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            price: change => `Mudou o preço de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`,
                            order: change => `Mudou a ordem de listagem ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        return {
                            icon: "list",
                            title: `<b>${audit.username}</b> alterou ${audit.changes?.length || ""} dado${audit.changes?.length ? "s" : ""} no sabor de pizza <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change)),
                        };
                    }
                },
                CREATE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> adicionou o sabor de pizza <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> apagou o sabor de pizza <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                }
            },
            product_complement_group: {
                UPDATE: audit => {
                    if (audit.changes.length == 1) {
                        const messages = {
                            name: change => `O usuário <b>${audit.username}</b> alterou o nome do grupo de complementos <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            required: change => `O usuário <b>${audit.username}</b> alterou a obrigatoriedade do grupo de complementos <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b> para <b>${change.new_value ? "obrigatório" : "opcional"}</b>`,
                            min: change => `O usuário <b>${audit.username}</b> alterou a quantidade minima do grupo de complementos <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            max: change => `O usuário <b>${audit.username}</b> alterou a quantidade máxima do grupo de complementos <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `<b>${audit.username}</b> fez alterações no grupo de complementos <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            name: change => `Mudou o nome ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            required: change => `Mudou a obrigatoriedade para <b>${change.new_value ? "obrigatório" : "opcional"}</b>`,
                            min: change => `Mudou a quantidade minima ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            max: change => `Mudou a quantidade máxima ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        return {
                            icon: "list",
                            title: `<b>${audit.username}</b> alterou ${audit.changes?.length || ""} dado${audit.changes?.length ? "s" : ""} no grupo de complementos <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change)),
                        };
                    }
                },
                CREATE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> adicionou o grupo de complementos <b>${audit.additional.name}</b> para o produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> apagou o grupo de complementos <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                }
            },
            product_complement_item: {
                UPDATE: audit => {
                    if (audit.changes.length == 1) {
                        const messages = {
                            name: change => `O usuário <b>${audit.username}</b> alterou o nome do complemento <b>${change.old_value || audit.additional.name}</b>${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""} para <b>${change.new_value}</b>`,
                            description: change => `O usuário <b>${audit.username}</b> alterou a descrição do complemento <b>${audit.additional.name}</b>${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""} ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            price: change => `O usuário <b>${audit.username}</b> alterou o preço do complemento <b>${audit.additional.name}</b> do produto${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""} de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`,
                            order: change => `O usuário <b>${audit.username}</b> alterou a ordem de listagem do complemento <b>${audit.additional.name}</b>${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""} ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            sku: change => `O usuário <b>${audit.username}</b> alterou o código PDV do complemento <b>${audit.additional.name}</b>${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""} ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            enabled: change => `O usuário <b>${audit.username}</b> ${change.old_value ? `<b>desativou</b> ` : "<b>ativou</b>"} o complemento <b>${audit.additional.name}</b>${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""} ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `<b>${audit.username}</b> fez alterações no complemento <b>${audit.additional.name}</b>${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""}`,
                            items: []
                        };
                    } else {
                        const messages = {
                            name: change => `Mudou o nome ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            description: change => `Mudou a descrição ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            price: change => `Mudou o preço de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`,
                            order: change => `Mudou a ordem de listagem ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            sku: change => `Mudou a ordem o código PDV ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            enabled: change => change.old_value ? `Foi <b>desativado</b> ` : "Foi <b>ativado</b>"
                        }

                        return {
                            icon: "list",
                            title: `<b>${audit.username}</b> alterou ${audit.changes?.length || ""} dado${audit.changes?.length ? "s" : ""} no complemento <b>${audit.additional.name}</b>${audit.additional.product_name ? ` do produto <b>${audit.additional.product_name}</b>` : ""}`,
                            items: audit.changes.map(change => messages[change.key]?.(change)),
                        };
                    }
                },
                CREATE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> adicionou o complemento <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                },
                DELETE: () => {
                    return {
                        icon: "list",
                        title: `O usuário <b>${audit.username}</b> apagou o complemento <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`,
                        items: []
                    };
                }
            },
            time: {
                UPDATE: audit => {
                    function GetDayOfWeekName(value = audit.additional.dayOfWeek) {
                        if (value === "Sunday") return "Domingo";
                        else if (value === "Monday") return "Segunda-Feira";
                        else if (value === "Tuesday") return "Terça-Feira";
                        else if (value === "Wednesday") return "Quarta-Feira";
                        else if (value === "Thursday") return "Quinta-Feira";
                        else if (value === "Friday") return "Sexta-Feira";
                        else if (value === "Saturday") return "Sábado";
                        else return "Indefinido";
                    }

                    if (audit.changes.length == 1) {
                        const messages = {
                            open: change => `O usuário <b>${audit.username}</b> alterou o dia da semana <b>${GetDayOfWeekName()}</b> para <b>${change.new_value ? "aberto" : "fechado"}</b>`,
                            opens: change => `O usuário <b>${audit.username}</b> alterou o horário de abertura do dia da semana <b>${GetDayOfWeekName()}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            closes: change => `O usuário <b>${audit.username}</b> alterou o horário de fechamento do dia da semana <b>${GetDayOfWeekName()}</b> ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        const change = audit.changes[0];

                        return {
                            icon: "list",
                            title: messages[change.key]?.(change) || `<b>${audit.username}</b> fez alterações no dia da semana <b>${GetDayOfWeekName()}</b>`,
                            items: []
                        };
                    } else {
                        const messages = {
                            open: change => `Mudou de <b>${change.old_value ? "aberto" : "fechado"}</b> para <b>${change.new_value ? "aberto" : "fechado"}</b>`,
                            opens: change => `Mudou o horário de abertura ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                            closes: change => `Mudou o horário de fechamento ${change.old_value ? `de <b>${change.old_value}</b> ` : ""}para <b>${change.new_value}</b>`,
                        }

                        return {
                            icon: "clock",
                            title: `<b>${audit.username}</b> alterou ${audit.changes?.length || ""} dado${audit.changes?.length ? "s" : ""} no dia da semana <b>${GetDayOfWeekName()}</b>`,
                            items: audit.changes.map(change => messages[change.key]?.(change)),
                        };
                    }
                },
                CREATE: (...args) => audit_targets.time.UPDATE(...args),
            },
        }

        const audit_target_data = audit_targets[audit.target]?.[audit.action_type]?.(audit);

        if (!!audit_target_data) {
            let type_icon_2 = "unknown";

            if (audit.action_type === "UPDATE") type_icon_2 = "updated";
            else if (audit.action_type === "CREATE" || audit.action_type === "LOGIN") type_icon_2 = "created";
            else if (audit.action_type === "DELETE") type_icon_2 = "deleted";

            $audit.find(".type-icon").addClass(`${audit_target_data.icon} ${type_icon_2}`);
            $audit.find(".action-icon").attr("src", action_icon);
            $audit.find(".infos>.title").html(audit_target_data.title);
            $audit.find(".infos>.time").text(FormatDate(audit.createdAt));

            if (!!audit_target_data.order_data) {
                LoadOrderOnElement($audit.find(">main>div"), audit_target_data.order_data, false);
            } else {
                for (let i = 0; i < audit_target_data.items.length; i++) {
                    const $change = $(`<div>
                    <span class="identifier">00 –</span>
                    <span class="action"></span>
                </div>`);

                    $change.find(".identifier").text(`${i + 1} -`);
                    $change.find(".action").html(audit_target_data.items[i]);

                    $audit.find(">main>div").append($change);
                }

            }

            if (audit_target_data.items.length > 0) {
                $audit.addClass("expandable");

                $audit.find(">header").on("click", function () {
                    if ($audit.hasClass("expand")) {
                        $audit.find(">main").css("max-height", `0px`);
                        $audit.removeClass("expand");
                    } else {
                        $(".audit-results>section").removeClass("expand");
                        $(".audit-results>section>main").css("max-height", `0px`);

                        $audit.find(">main").css("max-height", `${$audit.find(">main>div").outerHeight()}px`);
                        $audit.addClass("expand");
                    }
                });
            } else {
                $audit.find(">header>i").hide();
            }
        } else {
            console.warn("Unknown Audit:", audit);
            $audit.find(".type-icon").addClass("list deleted");
            $audit.find(".action-icon").attr("src", action_icon);
            $audit.find(".infos>.title").html(`<font color="red"><b>Ação desconhecida</b></font>`);
            $audit.find(".infos>.time").text(FormatDate(audit.createdAt));

            $audit.find(">header>i").hide();
        }

        $(".audit-results").append($audit);
    } catch (error) {
        console.error("Audit Error:", audit, error);
    }
}

$(".filter-options.target").on("change", function (e, value) {
    $(".audit-results-container>.header-infos>button.export").toggle(value == "order");
});

$(".filter-options, .filter-date>input").on("change", function (e, value) {
    console.log("filter:", value);

    $(".audit-results").empty();

    NewTabInstance();

    CheckExportEnabled();

    lazy_loading.Reset({
        state: true,
    });
});

(() => {
    let min_date = new Date(company.createdAt);
    const max_date = new Date();
    const days = (max_date - min_date) / 24 / 60 / 60 / 1000;

    if (days > 31) min_date = new Date(max_date - (31 * 24 * 60 * 60 * 1000));

    const min = min_date.toISOString().split("T")[0];
    const max = max_date.toISOString().split("T")[0];

    $(".filter-date.start>input").val(min).attr("min", min).attr("max", max);
    $(".filter-date.end>input").val(max).attr("min", min).attr("max", max);
})();


var lazy_loading = new LazyLoading({
    container: ".audit-results-container",
    threshold: 0.3,
    doHandle: function () {
        const $element = $(".audit-results>section:last-child");

        if ($element.length) {
            return $element.offset().top - $element.height() - 400 < this.container.height();
        }
    },
    state: {
        page_limit: 10,

        offset: 0,
        max: null,
        isLoading: false,
    }
});

lazy_loading.onHandle = (state) => {
    if (state.isLoading) return;
    if (state.max != null && state.offset >= state.max) return;

    const $skeletons = AddAuditSkeletons(state.offset, state.max, state.page_limit);

    if (state.max == null) state.isLoading = true;

    FetchAPI(`/audit`, {
        instance_check: true,
        params: {
            offset: state.offset,
            limit: state.page_limit,
            action: $(".filter-options.actions").data("value") || "ALL",
            target: $(".filter-options.target").data("value") || "all",
            start_date: $(".filter-date.start>input").val(),
            end_date: $(".filter-date.end>input").val(),
        }
    }).then(audits_data => {
        state.max = audits_data.metadata.max;
        $(".audit-results-container>.header-infos>.max-results").text(`${audits_data.metadata.max} resultados`);

        $skeletons.remove();

        for (const audit of audits_data.results) addAudit(audit);

        if (state.max === 0) $(".audit-results-container>.audit-results").boo("Nenhum registro foi encontrado!");
    }).catch(error => {
        console.error(error);
        Swal.fire("Opss...", `Ocorreu um erro ao tentar listar os dados da auditoria!`, "error");
        Swal.showValidationMessage(error);
    }).finally(() => {
        $(".audit-results-container .max-results").removeClass("skeleton");
        $(".audit-results-container .filter-options").removeClass("skeleton");
        $(".audit-results-container .filter-date").removeClass("skeleton");
        $(".audit-results-container .breadcrumb .breadcrumb-item").removeClass("skeleton");
        state.isLoading = false;

        lazy_loading.Trigger();
    });

    state.offset += state.page_limit;
}

lazy_loading.Init();

function AddAuditSkeletons(offset, max, page_limit) {
    const count = !!max ? (max - offset > page_limit ? page_limit : max - offset) : page_limit;
    let $skeletons = $();

    function add(el) {
        $skeletons = $skeletons.add(el);
    }

    for (let i = 0; i < count; i++) add(AddAuditSkeleton());

    return $skeletons;
}