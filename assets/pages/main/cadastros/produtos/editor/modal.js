$("#modalAddComplement .add_complement").click(function (e) {
    e.preventDefault();

    AddItemToComplementEditor();
});

$("#modalAddComplement form.complements").submit(function (e) {
    e.preventDefault();
});

$("#modalAddComplement .required input").change(function () {
    const value = $(this).val() == "true";

    const $min = $("#modalAddComplement .quantity .quantity_selector.min");
    const $max = $("#modalAddComplement .quantity .quantity_selector.max");

    const $min_input = $min.find("input");
    const $max_input = $max.find("input");
    const $min_value = $min.find(".value>span");
    const $min_remove = $min.find(".remove");
    const $max_remove = $max.find(".remove");

    if (value) {
        $min_value.text(1);
        $min_input.val(1);
        $min_input.attr("min", 1);
        $min.removeAttr("disabled");

        $min_remove.addClass("hide");

        $max_input.attr("min", 1);
    } else {
        $min_input.val(0);
        $min_value.text(0);
        $min.attr("disabled", true);
        $min_input.attr("min", 1);
        $max_input.attr("min", 1);
        if (Number($max_input.val()) != 1) $max_remove.removeClass("hide");
    }
});

$("#modalAddComplement .quantity input").change(function () {
    const $min = $("#modalAddComplement .quantity .quantity_selector.min");
    const $max = $("#modalAddComplement .quantity .quantity_selector.max");

    const $min_input = $min.find("input");
    const $min_value = $min.find(".value>span");
    const $max_input = $max.find("input");
    const $max_value = $max.find(".value>span");
    const $max_remove = $max.find(".remove");

    if (Number($min_input.val()) >= Number($max_input.val())) {
        $max_input.attr("min", $min_input.val()).val($min_input.val());
        $max_value.text($min_value.text());

        $max_remove.addClass("hide");
    } else if (!$min.attr("disabled")) {
        $max_input.attr("min", $min_input.val());
        $max_remove.removeClass("hide");
    }
});

$("#modalAddComplement .modal-content>footer>.save").click(function () {
    const $form_options = $("#modalAddComplement form.options");
    const $form_complements = $("#modalAddComplement form.complements");

    if (!$form_options[0].checkValidity()) $("#modalAddComplement .tabs>nav>span:first").click();
    if (!$form_complements[0].checkValidity()) {
        $("#modalAddComplement .tabs>nav>span:last").click();
        $form_complements.find(`>button[type="submit"]`).click();
        return;
    }

    $form_options.find(`>button[type="submit"]`).click();
});

var group_items;

function AddItemToComplementEditor(item) {
    const switch_id = `switch_${Math.random()}`;
    const $item = $(`<div class="item row">
        <div class="flex-fill">
            <div class="row mt-3">
                <div class="d-flex flex-column mr-4 flex-fill">
                    <h5>Nome do complemento</h5>
                    <input class="form-control name" type="text" minLength="2" maxLength="60" required>
                    <small>0/60</small>
                </div>
                <div class="d-flex flex-column">
                    <h5>Preço</h5>
                    <div class="labelled_input">
                        <span>R$</span>
                        <input class="price" type="number" placeholder="0,00" min="0" step=".01">
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column">
                <h5>Descrição <small>(Opcional)</small></h5>
                <textarea class="form-control desc" type="text" maxLength="120"></textarea>
                <small>0/120</small>
            </div>
        </div>
        
        <div class="actions">
            <div class="custom-switch enable">
                <input type="checkbox" id="${switch_id}" checked>
                <label for="${switch_id}">Toggle</label>
            </div>
            <button class="delete"><i class="fas fa-trash"></i></button><br/>
        </div>
    </div>`);

    if (item) {
        $item.find(".name").val(item.name);
        $item.find(".price").val(item.price);
        $item.find(".desc").val(item.description);
        $item.find(".enable>input").prop("checked", item.enabled);
    }

    const group_item = {
        ...item,
        name: $item.find("input.name").val(),
        price: !!$item.find("input.price").val() ? Number($item.find("input.price").val()) : 0,
        description: !!$item.find("textarea.desc").val() ? $item.find("textarea.desc").val() : null,
    };

    group_items.push(group_item);

    $item.find("input.name").on("keyup change", function () {
        group_item.name = $(this).val();
    });

    $item.find("input.price").on("keyup change", function () {
        group_item.price = !!$item.find("input.price").val() ? Number($item.find("input.price").val()) : 0;
    });

    $item.find("textarea.desc").on("keyup change", function () {
        group_item.description = !!$(this).val() ? $(this).val() : null;
    });

    $item.find("input.name").on("blur", function () {
        CheckDuplicatedGroupItems();
    });

    $item.find("input.name").on("keyup", function () {
        this.setCustomValidity("");
    });

    $item.find(".actions>.delete").click(function () {
        $item.remove();

        group_items.splice(group_items.findIndex(item => item === group_item), 1);
    });

    $item.find(".enable>input").change(function () {
        const $this = $(this);
        const enabled = $this.prop("checked");
        for (const _item of group_items) {
            if (_item === group_item) {
                if (_item.enabled) {
                    _item.enabled = enabled;
                } else {
                    _item.enabled = enabled;
                }
            }
        }
    });

    $(".modal").scrollTop($(".modal")[0].scrollHeight);

    $("#modalAddComplement .complements_list").append($item);
}

function ShowComplementGroupEditor(group) {
    group_items = [];

    $("#modalAddComplement form.options").unbind("submit");
    $("#modalAddComplement footer>.cancel").unbind("click");

    $("#modalAddComplement .complements_list").empty();
    $("#modalAddComplement form.options")[0].reset();

    const $options = $("#modalAddComplement form.options");

    if (group) {
        for (const item of group.items || []) AddItemToComplementEditor(item);

        $options.find(`[name="name"]`).val(group.name);

        $options.find(`[name="required"][value="${group.required}"]`).prop("checked", true).change();

        $options.find(".quantity_selector.min>input").val(group.min).change();
        $options.find(".quantity_selector.max>input").val(group.max).change();
    } else {
        $(`#modalAddComplement .required input[value="false"]`).prop("checked", true).change();
        $options.find(".quantity_selector.max>input").val(1).change();
    }

    $("#modalAddComplement footer>.cancel").on("click", function () {
        $("#modalAddComplement").modal("hide");
    });

    $("#modalAddComplement form.options").on("submit", function (e) {
        e.preventDefault();

        if (CheckDuplicatedGroupItems()) return;

        const form_data = $(this).serializeFormJSON();
        form_data.required = form_data.required == "true";
        form_data.items = group_items;
        console.log(group_items)

        if (group?.id_group) {
            form_data.group_task = AddTask(function () {
                return FetchAPI(`/product/${this.product.id_product}/complement/${group.id_group}`, {
                    method: "PUT",
                    body: {
                        name: group.name || "",
                        required: Boolean(group.required),
                        min: Number(group.min || 0),
                        max: Number(group.max || 1)
                    }
                });
            }, TasksTypes.complement_group);
        } else {
            form_data.group_task = AddTask(function () {
                return FetchAPI(`/product/${this.product.id_product}/complement`, {
                    method: "POST",
                    body: {
                        name: form_data.name || "",
                        required: Boolean(form_data.required),
                        min: Number(form_data.min || 0),
                        max: Number(form_data.max || 1)
                    }
                });
            }, TasksTypes.complement_group);
        }

        for (const item of group_items) {
            const existent_item = item.id_item ? group?.items?.find(_item => _item.id_item === item.id_item) : null;

            if (existent_item) {
                const modificated = item.name != existent_item.name || item.description != existent_item.description || item.price != existent_item.price || item.enabled != existent_item.enabled;

                if (modificated) form_data.group_task.AddTask(function () {
                    return FetchAPI(`/product/${this.product.id_product}/complement/${this.complement_group.id_group}/item/${item.id_item}`, {
                        method: "PUT",
                        body: item,
                    });
                }, TasksTypes.complement_item);
            } else {
                form_data.group_task.AddTask(function () {
                    return FetchAPI(`/product/${this.product.id_product}/complement/${this.complement_group.id_group}/item`, {
                        method: "POST",
                        body: item,
                    });
                }, TasksTypes.complement_item);
            }
        }

        for (const item of group?.items || []) {
            if (!group_items.find(_item => _item.id_item === item.id_item)) {
                console.log("ADD DELETE", item.id_item);
                form_data.group_task.AddTask(function () {
                    return FetchAPI(`/product/${this.product.id_product}/complement/${group.id_group}/item/${item.id_item}`, {
                        method: "DELETE",
                    });
                }, TasksTypes.complement_item);
            }
        }

        if (group?.group_task) group.group_task.remove();

        AddComplementGroup(Object.assign(group || {}, form_data));

        $("#modalAddComplement").modal("hide");
    });

    $("#modalAddComplement").modal({ backdrop: "static", keyboard: false });
    $("#modalAddComplement .tabs").initTabs();
}

function CheckDuplicatedGroupItems() {
    console.log("CHECK");
    const inputs_el = $("#modalAddComplement input.name").get();
    const values = inputs_el.map(elem => elem.value);

    for (const input of inputs_el) input.setCustomValidity("");

    for (const value_index in values) {
        const value = values[value_index];
        const dup_index = values.findIndex((_value, _index) => _value === value && _index < value_index);

        if (dup_index > -1) {
            console.log(inputs_el[value_index])
            inputs_el[value_index].setCustomValidity("Este complemento já existe!");
            $("#modalAddComplement footer>.save").click();
            return true;
        }
    }

    return false;
}

function AddComplementGroup(group) {
    if (!group.id_group && !group._id_group) group._id_group = MakeID(20);

    const $group = $(`<div class="group" id_group="${group.id_group || group._id_group}">
        <header>
            <h3>Erro</h3>
            <div>
                <span>${group.required ? "Obrigatório" : "Opcional"}</span>
                <div class="options-btn">
                    <img src="../../../images/options.svg">
                    <div>
                        <div>
                            <span class="edit"><i class="fas fa-edit"></i>Editar</span>
                            <span class="delete"><i class="fas fa-trash"></i>Apagar</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <main></main>
    </div>`);

    $group.find("h3").text(group.name);

    for (const item of group.items) {
        const $item = $(`<div class="item">
            <div>
                <i class="fas fa-exclamation-circle" data-toggle="tooltip" title="Item pausado!"></i>
                <span class="name"></span>
                <span class="price"></span>
            </div>
            <span class="desc"></span>
        </div>`);

        $item.find(">div>i").toggle(item.enabled == false).tooltip();

        if (item.enabled == null) {
            FetchAPI(`/company/${company.id_company}/complement/items`, {
                instance_check: true,
                params: { name: item.name }
            }).then(data => {
                $item.find(">div>i").toggle(data.enabled == false);
            });
        }

        $item.find(".name").text(item.name);
        $item.find(".price").text(MoneyFormat(item.price));
        $item.find(".desc").text(item.description);

        $group.find("main").append($item);
    }

    $group.find(".options-btn .edit, header>h3").click(function () {
        ShowComplementGroupEditor(group);
    });

    $group.find(".options-btn .delete").click(function () {
        $group.remove();

        if (group.group_task) {
            group.group_task.remove();
            delete group.group_task;
        } else {
            AddTask(function () {
                return FetchAPI(`/product/${this.product.id_product}/complement/${group.id_group}`, {
                    method: "DELETE"
                });
            }, TasksTypes.complement_group);
        }
    });


    const $existent_group = $(`#product_editor .complements>.list>.group[id_group="${group.id_group || group._id_group}"]`);

    if (!!$existent_group.length) $existent_group.replaceWith($group);
    else $(`#product_editor .complements>.list`).append($group);
}