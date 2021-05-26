var datatable_categorias = $("#table-cadastros-categorias").DataTable({
    language: { url: "../../../scripts/dataTables.lang.json" },
    ordering: false,
    searching: false,
    paging: false,
    info: false,
});

$("#btnModalCategories").on("click", function (e) {
    $("#frmCategory")[0].reset();

    $("#frmCategory").find(".form-image-selector>img").attr("src", "../../../images/image-upload.png").removeClass("selected");
    $("#frmCategory").find(".form-image-selector>span").text("Selecione uma imagem");
    
    $("#modalCategory").modal("show");
});

$("#frmCategory .form-image-selector").click(function (e) {
    const $this = $(this);
    const query = $("#frmCategory input.name").val();

    ImageSelectorModal({ query, maxWidth: 500 }, base64 => {
        $this.find(">img").attr("src", base64).addClass("selected");
        $this.find(">input").val(base64);
        $this.find(">span").text("Selecionar uma outra imagem");
    });
});

$("#frmEditCategory .form-image-selector").click(function (e) {
    const $this = $(this);
    const query = $("#frmEditCategory input.name").val();

    ImageSelectorModal({ query, maxWidth: 500 }, base64 => {
        $this.find(">img").attr("src", base64).addClass("selected");
        $this.find(">input").val(base64);
        $this.find(">span").text("Selecionar uma outra imagem");
    });
});

$("#frmCategory").on("submit", function (e) {
    e.preventDefault();

    $("#frmCategory .modal-footer>button").addClass("loading");

    const formData = $(this).serializeFormJSON();

    FetchAPI(`/category`, { method: "POST", body: formData }).then(category_data => {
        categories.push(category_data);

        const rowNode = datatable_categorias.row.add([
            `<img src="${category_data.image || `${api_url}/static/images/no-image.svg`}" width="32" />`,
            category_data.name,
            `<button class="btn btn-danger" onclick="DeleteCategory(${category_data.id_category}, this)"><i class="fas fa-trash"></i><div class="spinner-border"></div></button> <button class="btn btn-success" onclick="EditCategory(${category_data.id_category})"><i class="fas fa-edit"></i></button>`
        ]).node();

        $(rowNode).attr("id_category", category_data.id_category);

        datatable_categorias.draw();

        $("#modalCategory").modal("hide");
    }).catch(errorMessage => {
        if (errorMessage == "already exists") Swal.fire("Opss...", `A categoria "${formData.name}" já existe!`, "error");
        else {
            Swal.fire("Opss...", "Ocorreu um erro ao tentar criar a categoria!", "error");
            Swal.showValidationMessage(errorMessage);
        }
    }).finally(() => {
        $("#frmCategory .modal-footer>button").removeClass("loading");
    });
});

$("#frmEditCategory").on("submit", function (e) {
    e.preventDefault();

    $("#frmEditCategory .modal-footer>button").addClass("loading");

    const formData = $(this).serializeFormJSON();

    const edit_category_id = $(this).attr("id_category");

    FetchAPI(`/category/${edit_category_id}`, { method: "PUT", body: formData }).then(category_data => {
        ArrayChange(categories, category_data, val => val.id_category == category_data.id_category);

        $(`tr[id_category="${edit_category_id}"]>td:nth-child(1)>img`).attr("src", category_data.image);
        $($(`tr[id_category="${edit_category_id}"]>td:nth-child(2)`)).text(category_data.name);

        $("#modalEditCategory").modal("hide");
        $("#frmEditCategory")[0].reset();
    }).catch(error => {
        if (!error) {
            $("#modalEditCategory").modal("hide");
            $("#frmEditCategory")[0].reset();
            return;
        }

        if (error == "already exists") Swal.fire("Opss...", `A categoria "${edit_category_id}" já existe!`, "error");
        else {
            Swal.fire("Opss...", "Ocorreu um erro ao salvar a edição da categoria!", "error");
            Swal.showValidationMessage(error);
        }
    }).finally(() => {
        $("#frmEditCategory .modal-footer>button").removeClass("loading");
    });
});

function EditCategory(id) {
    const category = categories.find(val => val.id_category == id);

    $("#frmCategory")[0].reset();

    $("#frmEditCategory").find(".name").val(category.name);

    $("#frmEditCategory").find(".form-image-selector>img").attr("src", "../../../images/image-upload.png").removeClass("selected");
    $("#frmEditCategory").find(".form-image-selector>span").text("Selecione uma imagem");

    if (category.image) {
        $("#frmEditCategory").find(".form-image-selector>img").attr("src", category.image);
        $("#frmEditCategory").find(".form-image-selector>span").text("Selecionar uma outra imagem");
    }

    $("#frmEditCategory").attr("id_category", category.id_category);
    $("#modalEditCategory").modal("show");
}

function DeleteCategory(id, elem) {
    $(elem).addClass("loading");

    const category = categories.find(val => val.id_category == id);

    Swal.fire({
        title: "Muita calma!!",
        html: `Voçê tem certeza que deseja apagar permanentemente a categoria <b>${category.name}</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: () => {
            return new Promise((resolve) => {
                FetchAPI(`/category/${id}`, { method: "DELETE" }).then(() => {
                    ArrayRemoveIndex(categories, val => val.id_category == id);
                    $(`tr[id_category="${id}"]`).remove();

                    Swal.fire("Sucesso!!", `A categoria <b>${category.name}</b> foi apagada com sucesso!`, "success");
                }).catch(errorMessage => {
                    Swal.fire("Opss...", `Ocorreu um erro ao tentar remover a categoria <b>${category.name}</b>!`, "error");
                    Swal.showValidationMessage(errorMessage);
                }).finally(() => {
                    resolve();
                    $(elem).removeClass("loading");
                });
            });
        }
    });
}


var lazy_loading = new LazyLoading({
    container: ".content-page",
    threshold: 0.3,
    doLoop: 3,
    state: {
        page_limit: 10,

        offset: 0,
        max: null,
        isLoading: false,
    },
    doHandle: function () {
        const $element = $(".table tbody>tr[id_category]:last-child");
        if (!$element.length) return true;

        if ($element.length) {
            return $element.offset().top - $element.height() - 400 < this.container.height();
        }
    },
});

lazy_loading.onHandle = async (state) => {
    if (state.isLoading) return;
    if (state.max != null && state.offset >= state.max) return;

    if (state.max == null) state.isLoading = true;

    FetchAPI(`/company/${company.id_company}/categories`, {
        instance_check: true,
        params: {
            offset: state.offset,
            limit: state.page_limit
        }
    }).then(categories_data => {
        state.max = categories_data.metadata.max;

        for (const category of categories_data.results || []) {
            categories.push(category);

            const rowNode = datatable_categorias.row.add([
                `<img src="${category.image || `${api_url}/static/images/no-image.svg`}" width="32" />`,
                category.name,
                `<button class="btn btn-danger" onclick="DeleteCategory(${category.id_category}, this)"><i class="fas fa-trash"></i><div class="spinner-border"></div></button> <button class="btn btn-success" onclick="EditCategory(${category.id_category})"><i class="fas fa-edit"></i></button>`
            ]).node();

            $(rowNode).attr("id_category", category.id_category);
        }

        datatable_categorias.draw();
    }).catch(errorMessage => {
        console.error(errorMessage);
        Swal.fire("Opss...", `Ocorreu um erro ao tentar listar as categorias!`, "error");
        Swal.showValidationMessage(errorMessage);
    }).finally(() => {
        state.isLoading = false;

        $("#loading-wrapper-content").fadeOut(400);
        $(".max-results").text(`${state.max} resultado${!!state.max ? "s" : ""}`);
        if (state.max === 0) $(".complement-list").boo("Não há nada aqui!!");

        lazy_loading.Trigger();
    });

    state.offset += state.page_limit;
}

$("#loading-wrapper-content").css("display", "flex").show();
lazy_loading.Init();