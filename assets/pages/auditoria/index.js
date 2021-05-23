
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

    const action_icon = company.image?.small || "../../img/pop-black-icon.jpg";

    let type_icon_1 = "list";
    let type_icon_2 = "";
    let info_message = `<font color="red"><b>Ação desconhecida</b></font>`;
    const changes_text = [];
    let order_to_load = null;

    if (audit.action_type === "UPDATE") type_icon_2 = "updated";
    else if (audit.action_type === "CREATE") type_icon_2 = "created";
    else if (audit.action_type === "DELETE") type_icon_2 = "deleted";
    else if (audit.action_type === "LOGIN") {
        type_icon_1 = "user";
        type_icon_2 = "created";
    }

    switch (audit.target) {
        case "company": {
            if (audit.action_type === "UPDATE") {
                if (audit.changes.length == 1 && audit.changes[0].key === "is_online") {
                    info_message = `Status da empresa alterado para <b>${audit.changes[0].new_value ? "Online" : "Offline"}</b>`;
                } else {
                    info_message = `<b>${audit.username}</b> alterou dados da empresa`;

                    for (const change of audit.changes) {
                        switch (change.key) {
                            case "subdomain":
                                changes_text.push(`Mudou o subdomínio de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "name":
                                changes_text.push(`Mudou o nome de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "cpf-cnpj":
                                changes_text.push(`Mudou o cpf/cnpj de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "phone":
                                changes_text.push(`Mudou o telefone de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "image":
                                changes_text.push(`Mudou o ícone para <b>${change.new_value}</b>`);
                                break;

                            case "address":
                                changes_text.push(`Mudou o endereço de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "delivery_type":
                                function GetDeliveryName(type) {
                                    let delivery_name = "";

                                    if (type === 0) delivery_name = "Fixo";
                                    else if (type === 1) delivery_name = "Por quilômetro";

                                    return delivery_name;
                                }

                                changes_text.push(`Mudou o tipo de cobrança da taxa de entrega de <b>${GetDeliveryName(change.old_value)}</b> para <b>${GetDeliveryName(change.new_value)}</b>`);
                                break;

                            case "delivery_cost":
                                changes_text.push(`Mudou o preço de cobrança da taxa de entrega de <b>${change.old_value ? MoneyFormat(change.old_value) : "Indefinido"}</b> para <b>${change.new_value ? MoneyFormat(change.new_value) : "Indefinido"}</b>`);
                                break;

                            case "delivery_free_in":
                                changes_text.push(`Mudou o valor mínimo de promoção de taxa de entrega de <b>${change.old_value ? MoneyFormat(change.old_value) : "Indefinido"}</b> para <b>${change.new_value ? MoneyFormat(change.new_value) : "Indefinido"}</b>`);
                                break;

                            case "delivery_free_val":
                                changes_text.push(`Mudou o valor da promoção de taxa de entrega de <b>${MoneyFormat(change.old_value || 0)}</b> para <b>${MoneyFormat(change.new_value || 0)}</b>`);
                                break;

                            case "delivery_min":
                                changes_text.push(`Mudou o preço mínimo elegível para entrega de <b>${MoneyFormat(change.old_value || 0)}</b> para <b>${MoneyFormat(change.new_value || 0)}</b>`);
                                break;

                            case "website_primary_color":
                                changes_text.push(`Mudou a cor primária do site de <b><font color="#${change.old_value}">${change.old_value}</font></b> para <b><font color="#${change.new_value}">${change.new_value}</font></b>`);
                                break;

                            case "website_main_bg":
                                changes_text.push(`Mudou a imagem de fundo do site`);
                                break;

                            case "use_discount_coupon":
                                changes_text.push(`Os cupons de desconto foram <b>${change.new_value ? "ativados" : "desativados"}</b>`);
                                break;

                            case "online_check":
                                changes_text.push(`Abrir o estabelecimento pelo gestor foi <b>${change.new_value ? "ativado" : "desativado"}</b>`);
                                break;

                            case "morning_shift_open":
                                changes_text.push(`Mudou a hora de abertura do turno da <b>manhã</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "morning_shift_close":
                                changes_text.push(`Mudou a hora de fechamento do turno da <b>manhã</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "afternoon_shift_open":
                                changes_text.push(`Mudou a hora de abertura do turno da <b>tarde</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "afternoon_shift_close":
                                changes_text.push(`Mudou a hora de fechamento do turno da <b>tarde</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "night_shift_open":
                                changes_text.push(`Mudou a hora de abertura do turno da <b>noite</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "night_shift_close":
                                changes_text.push(`Mudou a hora de fechamento do turno da <b>noite</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "use_withdrawal":
                                changes_text.push(`Mudou para <b>${change.new_value ? "trabalha" : "não trabalha"}</b> com <b>retirada</b>`);
                                break;

                            case "use_delivery":
                                changes_text.push(`Mudou para <b>${change.new_value ? "trabalha" : "não trabalha"}</b> com <b>entrega</b>`);
                                break;

                            case "license_expiration":
                                changes_text.push(`Mudou a data de expiração do plano ${change.old_value ? `de <b>${new Date(change.old_value).toLocaleDateString()}</b>` : ""} para <b>${change.new_value ? new Date(change.new_value).toLocaleDateString() : "Indefinido"}</b>`);
                                break;

                            case "print_delivery_copy": {
                                function GetName(value) {
                                    if (value === "wait_production") return "No Aceite";
                                    else if (value === "wait_delivery") return "Foi Produzido";
                                    else if (value === "finished") return "Foi Finalizado";
                                    else return "Não imprimir";
                                }

                                changes_text.push(`Mudou a impressão da <b>Via de entrega</b> de <b>${GetName(change.old_value)}</b> para <b>${GetName(change.new_value)}</b>`);
                            } break;

                            case "print_control_copy": {
                                function GetName(value) {
                                    if (value === "wait_production") return "No Aceite";
                                    else if (value === "wait_delivery") return "Foi Produzido";
                                    else if (value === "finished") return "Foi Finalizado";
                                    else return "Não imprimir";
                                }

                                changes_text.push(`Mudou a impressão da <b>Via de controle</b> de <b>${GetName(change.old_value)}</b> para <b>${GetName(change.new_value)}</b>`);
                            } break;

                            case "print_production_copy": {
                                function GetName(value) {
                                    if (value === "wait_production") return "No Aceite";
                                    else if (value === "wait_delivery") return "Foi Produzido";
                                    else if (value === "finished") return "Foi Finalizado";
                                    else return "Não imprimir";
                                }

                                changes_text.push(`Mudou a impressão da <b>Via de produção</b> de <b>${GetName(change.old_value)}</b> para <b>${GetName(change.new_value)}</b>`);
                            } break;
                            default:
                                changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                                break;
                        }
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `A empresa foi criada!`;
            else if (audit.action_type === "DELETE") info_message = `A empresa foi deletada!`;
        } break;

        case "user": {
            if (audit.action_type === "UPDATE") {
                type_icon_1 = "user";

                if (audit.changes.length == 1 && audit.changes[0] === "password") {
                    info_message = `A senha do usuário <b>${audit.username}</b> foi alterada`;
                } else {
                    info_message = `O usuário <b>${audit.username}</b> foi atualizado`;
                }
            }
            else if (audit.action_type === "CREATE") info_message = `O usuário <b>${audit.username}</b> foi criado`;
            else if (audit.action_type === "DELETE") info_message = `O usuário <b>${audit.username}</b> foi deletado`;
            else if (audit.action_type === "LOGIN") {
                info_message = `O usuário <b>${audit.username}</b> se autenticou`;

                if (audit.additional) {
                    if (audit.additional.internal_username) changes_text.push(`Nome de usuário interno é <b>${audit.additional.internal_username}</b>`);
                    if (audit.additional.ip_address) changes_text.push(`Endereço IP externo é <b>${audit.additional.ip_address}</b>`);
                    if (audit.additional.address) changes_text.push(`Endereço do IP é <b>${audit.additional.address}</b>`);
                }
            }
        } break;

        case "company_time": {
            const daysOfWeek_translations = {
                "Monday": "Segunda",
                "Tuesday": "Terça",
                "Wednesday": "Quarta",
                "Thursday": "Quinta",
                "Friday": "Sexta",
                "Saturday": "Sábado",
                "Sunday": "Domingo",
            };

            info_message = `O usuário <b>${audit.username}</b> atualizou o horário <b>${daysOfWeek_translations[audit.additional.dayOfWeek]}</b>`;

            if (audit.action_type === "UPDATE") {
                for (const change of audit.changes) {
                    switch (change.key) {
                        case "open":
                            changes_text.push(`Mudou para <b>${change.new_value ? "aberto" : "fechado"}</b>`);
                            break;

                        case "opens":
                            changes_text.push(`Mudou o horário de abertura de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "closes":
                            changes_text.push(`Mudou o horário de fechamento de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;
                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
        } break;

        case "category": {

            if (audit.action_type === "UPDATE") {
                if (audit.changes.length == 1 && audit.changes[0].key === "image") {
                    info_message = `<b>${audit.username}</b> alterou a imagem da categoria <b>${audit.additional.name}</b>`;
                } else {
                    info_message = `<b>${audit.username}</b> alterou a categoria <b>${audit.additional.name}</b>`;

                    for (const change of audit.changes) {
                        switch (change.key) {
                            case "name":
                                changes_text.push(`Mudou o nome de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                                break;

                            case "image":
                                changes_text.push(`Alterou o ícone`);
                                break;
                            default:
                                changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                                break;
                        }
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> criou a categoria <b>${audit.additional.name}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou a categoria <b>${audit.additional.name}</b>`;
        } break;

        case "discount_coupon": {

            if (audit.action_type === "UPDATE") {
                info_message = `<b>${audit.username}</b> alterou o cupom de desconto <b>${audit.additional.coupon}</b>`;

                for (const change of audit.changes) {
                    switch (change.key) {
                        case "coupon":
                            changes_text.push(`Mudou o nome de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "discount", "is_percentual":
                            const is_percentual_key = audit.changes.find(change => change.key == "is_percentual");

                            if (!!is_percentual_key) {
                                changes_text.push(`Mudou o desconto de <b>${is_percentual_key.old_value ? `${Number(change.old_value)}%` : MoneyFormat(change.old_value)}</b> para <b>${is_percentual_key.new_value ? `${Number(change.new_value)}%` : MoneyFormat(change.new_value)}</b>`);
                            } else {
                                changes_text.push(`Mudou o desconto de <b>${audit.additional.is_percentual ? `${Number(change.old_value)}%` : MoneyFormat(change.old_value)}</b> para <b>${audit.additional.is_percentual ? `${Number(change.new_value)}%` : MoneyFormat(change.new_value)}</b>`);
                            }
                            break;

                        case "limit":
                            changes_text.push(`Mudou o limite de usos de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "min_price":
                            changes_text.push(`Mudou o preço mínimo elegível de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "in_delivery_cost":
                            changes_text.push(`O desconto <b>${change.new_value ? "não será" : "será também"}</b> aplicado ao preço do frete`);
                            break;

                        case "enabled":
                            changes_text.push(`Foi <b>${change.new_value ? "ativado" : "desativado"}</b>`);
                            break;
                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> criou o cupom de desconto <b>${audit.additional.coupon}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou o cupom de desconto <b>${audit.additional.coupon}</b>`;
        } break;

        case "order": {

            type_icon_1 = "sticker";

            order_to_load = audit.additional.order;

            if (audit.action_type === "UPDATE") {
                if (audit.changes.length == 1) {
                    const change = audit.changes[0];

                    if (change.key === "status") {
                        order_to_load.status = change.new_value;

                        let status = "Recusado";
                        if (change.new_value == 0) status = "Aguardando aceite";
                        else if (change.new_value == 1) status = "Aguardando produção";
                        else if (change.new_value == 2) status = "Aguardando entrega";
                        else if (change.new_value == 3) status = "Saiu para entrega";
                        else if (change.new_value == 10) status = "Entregue";

                        info_message = `<b>${audit.username}</b> alterou o status do pedido <b>${order_to_load.order_company_sequence}</b> do cliente <b>${order_to_load.name_client}</b> para <b>${status}</b>`;
                    }
                } else {
                    info_message = `<b>${audit.username}</b> atualizou o pedido <b>${order_to_load.order_company_sequence}</b> do cliente <b>${order_to_load.name_client}</b>`;
                }
            }
            else if (audit.action_type === "CREATE") {
                info_message = `O pedido <b>${order_to_load.order_company_sequence}</b> do cliente <b>${order_to_load.name_client}</b> foi registrado`;
            }

        } break;

        case "printer": {

            if (audit.action_type === "UPDATE") {
                info_message = `<b>${audit.username}</b> modificou a impressora <b>${audit.additional.name}</b>`;

                for (const change of audit.changes) {
                    switch (change.key) {
                        case "name":
                            changes_text.push(`Mudou o nome de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "device":
                            changes_text.push(`Mudou o dispositivo de impressão <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "is_primary":
                            if (change.new_value) changes_text.push(`Definiu como dispositivo <b>primário</b>`);
                            else changes_text.push(`Não é mais um dispositivo <b>primário</b>`);
                            break;
                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> criou a impressora <b>${audit.additional.name}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou a impressora <b>${audit.additional.name}</b>`;
        } break;

        case "product": {

            if (audit.action_type === "UPDATE") {
                info_message = `<b>${audit.username}</b> alterou o produto <b>${audit.additional.name}</b>`;

                for (const change of audit.changes) {
                    switch (change.key) {
                        case "order":
                            changes_text.push(`Mudou a ordem de listagem de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "name":
                            changes_text.push(`Mudou o nome <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "description":
                            changes_text.push(`Mudou a descrição de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "sku":
                            changes_text.push(`Mudou o sku de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "enabled":
                            changes_text.push(`Foi <b>${change.new_value ? "ativado" : "pausado"}</b>`);
                            break;

                        case "keywords":
                            changes_text.push(`Mudou as palavras chave do SEO de <b>${change.old_value.split(",").join(", ")}</b> para <b>${change.new_value.split(",").join(", ")}</b>`);
                            break;

                        case "price":
                            changes_text.push(`Mudou o preço de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`);
                            break;

                        case "is_pizza":
                            changes_text.push(`Mudou o tipo do produto de <b>${change.old_value ? "pizza" : "comum"}</b> para <b>${change.new_value ? "pizza" : "comum"}</b>`);
                            break;

                        case "pizza_price_rule":
                            changes_text.push(`Mudou o tipo de precificação da pizza de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "pizza_quantity_flavors":
                            changes_text.push(`Mudou a quantidade de sabores da pizza ${!!change.old_value ? `de <b>${change.old_value.split(",").join(", ")}</b> ` : ""}para <b>${change.new_value.split(",").join(", ")}</b>`);
                            break;

                        case "seo_title":
                            changes_text.push(`Mudou o titulo do SEO de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "seo_description":
                            changes_text.push(`Mudou a descrição do SEO de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "availability_daysOfWeek":
                            changes_text.push(`Mudou a disponibilidade nos dias da semana de <b>${change.old_value.split(",").join(", ")}</b> para <b>${change.new_value.split(",").join(", ")}</b>`);
                            break;

                        case "availability_dayShifts":
                            changes_text.push(`Mudou a disponibilidade dos turnos do dia de <b>${change.old_value.split(",").join(", ")}</b> para <b>${change.new_value.split(",").join(", ")}</b>`);
                            break;
                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> criou o produto <b>${audit.additional.name}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou o produto <b>${audit.additional.name}</b>`;
        } break;

        case "regions_blacklist": {
            if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> adicionou o endereço <b>${audit.additional.address}</b> na blacklist`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> removeu o endereço <b>${audit.additional.address}</b> da blacklist`;
        } break;

        case "neighborhood_blacklist": {
            if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> adicionou o bairro <b>${audit.additional.name}</b> na blacklist`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> removeu o bairro <b>${audit.additional.name}</b> da blacklist`;
        } break;

        case "time": {

            type_icon_1 = "clock";

            let time_day_name = "";

            if (audit.additional.dayOfWeek == "Sunday") time_day_name = "Domingo";
            else if (audit.additional.dayOfWeek == "Monday") time_day_name = "Segunda-Feira";
            else if (audit.additional.dayOfWeek == "Tuesday") time_day_name = "Terça-Feira";
            else if (audit.additional.dayOfWeek == "Wednesday") time_day_name = "Quarta-Feira";
            else if (audit.additional.dayOfWeek == "Thursday") time_day_name = "Quinta-Feira";
            else if (audit.additional.dayOfWeek == "Friday") time_day_name = "Sexta-Feira";
            else if (audit.additional.dayOfWeek == "Saturday") time_day_name = "Sábado";

            if (audit.action_type === "UPDATE" || audit.action_type === "CREATE") {
                info_message = `<b>${audit.username}</b> fez alterações no dia da semana <b>${time_day_name}</b>`;

                for (const change of audit.changes) {
                    switch (change.key) {
                        case "open":
                            changes_text.push(`Mudou de <b>${change.old_value ? "aberto" : "fechado"}</b> para <b>${change.new_value ? "aberto" : "fechado"}</b>`);
                            break;

                        case "opens":
                            changes_text.push(`Mudou o horário de abertura de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "closes":
                            changes_text.push(`Mudou o horário de fechamento de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
        } break;

        case "product_image": {
            if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> adicionou uma imagem no produto <b>${audit.additional.product_name}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou uma imagem do produto <b>${audit.additional.product_name}</b>`;
        } break;

        case "product_pizza_flavor": {

            if (audit.action_type === "UPDATE") {
                info_message = `<b>${audit.username}</b> fez alterações no sabor de pizza <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`;

                for (const change of audit.changes) {
                    switch (change.key) {
                        case "name":
                            changes_text.push(`Mudou o nome de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "description":
                            changes_text.push(`Mudou a descrição de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "price":
                            changes_text.push(`Mudou o preço de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`);
                            break;

                        case "order":
                            changes_text.push(`Mudou a ordem de listagem de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> adicionou o sabor <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou o sabor de pizza <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`;
        } break;

        case "product_complement_group": {

            if (audit.action_type === "UPDATE") {
                info_message = `<b>${audit.username}</b> fez alterações no grupo de complementos <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`;

                for (const change of audit.changes) {
                    switch (change.key) {
                        case "name":
                            changes_text.push(`Mudou o nome de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "required":
                            changes_text.push(`Mudou a obrigatoriedade para <b>${change.new_value ? "obrigatório" : "opcional"}</b>`);
                            break;

                        case "min":
                            changes_text.push(`Mudou a quantidade minima de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "max":
                            changes_text.push(`Mudou a quantidade máxima de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> adicionou o grupo de complementos <b>${audit.additional.name}</b> para o produto <b>${audit.additional.product_name}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou o grupo de complementos <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`;
        } break;

        case "product_complement_item": {

            if (audit.action_type === "UPDATE") {
                console.log(audit)
                if (!!audit.additional?.name) {
                    info_message = `<b>${audit.username}</b> ${audit.additional.enabled ? "ativou" : "desativou"} todos os complementos <b>${audit.additional.name}</b>`;
                } else {
                    info_message = `<b>${audit.username}</b> fez alterações no complemento <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`;
                }

                for (const change of audit.changes) {
                    switch (change.key) {
                        case "name":
                            changes_text.push(`Mudou o nome de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "description":
                            changes_text.push(`Mudou a descrição de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        case "price":
                            changes_text.push(`Mudou o preço de <b>${MoneyFormat(change.old_value)}</b> para <b>${MoneyFormat(change.new_value)}</b>`);
                            break;

                        case "order":
                            changes_text.push(`Mudou a ordem de listagem de <b>${change.old_value}</b> para <b>${change.new_value}</b>`);
                            break;

                        default:
                            changes_text.push(`<font color="gray">Mudou a chave <b>${change.key}</b> de <b>${change.old_value}</b> para <b>${change.new_value}</b></font>`);
                            break;
                    }
                }
            }
            else if (audit.action_type === "CREATE") info_message = `<b>${audit.username}</b> adicionou o complemento <b>${audit.additional.name}</b> no produto <b>${audit.additional.product_name}</b>`;
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> apagou o complemento <b>${audit.additional.name}</b> do produto <b>${audit.additional.product_name}</b>`;
        } break;

        case "regions_delivery_cost": {

            if (audit.action_type === "UPDATE" || audit.action_type === "CREATE") {
                info_message = `<b>${audit.username}</b> configurou o frete por localidade do endereço <b>${audit.additional.address}</b> para <b>${audit.additional.price}</b>`;
            }
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> removeu o endereço <b>${audit.additional.address}</b> da lista de fete por localidade`;
        } break;

        case "neighborhood_delivery_cost": {

            if (audit.action_type === "UPDATE" || audit.action_type === "CREATE") {
                info_message = `<b>${audit.username}</b> configurou a taxa de entrega do bairro <b>${audit.additional.name}</b> para <b>${audit.additional.price}</b>`;
            }
            else if (audit.action_type === "DELETE") info_message = `<b>${audit.username}</b> removeu a taxa de entrega do bairro <b>${audit.additional.name}</b>`;
        } break;
    }

    let hax_expand = changes_text.length > 0;

    $audit.find(".type-icon").addClass(`${type_icon_1} ${type_icon_2}`);
    $audit.find(".action-icon").attr("src", action_icon);
    $audit.find(".infos>.title").html(info_message);
    $audit.find(".infos>.time").text(FormatDate(audit.createdAt));

    if (!!order_to_load) {
        hax_expand = true;
        LoadOrderOnElement($audit.find(">main>div"), order_to_load, false);
    } else {
        for (let i = 0; i < changes_text.length; i++) {
            const $change = $(`<div>
                <span class="identifier">00 –</span>
                <span class="action"></span>
            </div>`);

            $change.find(".identifier").text(`${i + 1} -`);
            $change.find(".action").html(changes_text[i]);

            $audit.find(">main>div").append($change);
        }

    }

    $audit.find(">header>i").toggle(hax_expand);

    if (hax_expand) {
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
    }

    $(".audit-results").append($audit);
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