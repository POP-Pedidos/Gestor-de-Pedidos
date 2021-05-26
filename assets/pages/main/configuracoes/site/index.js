var url = `https://${company.subdomain}.${domain}/`;

var selected_options = {}

function LoadConfig() {
    $("#website_config .input>.url").text(url);
    $("#website_config iframe").attr("src", url);
    $("#website_config>.configs section.subdomain>div>input").val(company.subdomain);
    $("#website_config>.configs section.primary-color>.color").css("background-color", `#${company.website_primary_color || "0cb50c"}`);
    $("#website_config>.configs section.primary-color>.color>input").val(`#${company.website_primary_color || "0cb50c"}`);
    $("#website_config>.configs section.icon>img").attr("src", company.image?.small || "../../images/pop-black-icon.jpg");
    $("#website_config>.configs section.home-bg>img").attr("src", company.website_main_bg || `${api_url}/static/images/pop-bg.jpg`);
}

LoadConfig();

$("#website_config>.iframe-window>header>i.back").click(function () {
    GetIframeWindow().history.back();
});

$("#website_config>.iframe-window>header>i.right").click(function () {
    GetIframeWindow().history.forward();
});

$("#website_config>.iframe-window>header>i.reload").click(function () {
    GetIframeWindow().location.reload();
    LoadConfig();
});

$("#website_config>.iframe-window>header>i.home").click(function () {
    GetIframeWindow().location.href = url;
    LoadConfig();
});

function GetIframeWindow() {
    return $("#website_config iframe")?.[0]?.contentWindow;
}

$("#website_config>.configs section.primary-color").click(function () {
    $(this).find("input")[0].click();
});

$("#website_config>.configs section.primary-color>.color>input").change(function () {
    $(this).parent().css("background-color", this.value);

    selected_options.website_primary_color = this.value;

    GetIframeWindow().document.documentElement.style.setProperty("--primary-color", this.value);
    GetIframeWindow().document.documentElement.style.setProperty("--light-primary-color", hexBrightness(this.value, 75));

    CheckSave();
});

$("#website_config>.configs section.home-bg").click(function () {
    ImageSelectorModal({ maxWidth: 930, maxHeight: 600 }, base64 => {
        $(this).find("img").attr("src", base64);

        selected_options.website_main_bg = base64;

        GetIframeWindow().document.querySelector("body>header>.bg").style.backgroundImage = `url(${base64})`;

        CheckSave();
    });
});

$("#website_config>.configs section.icon").click(function () {
    ImageSelectorModal({ query: company.name, maxWidth: 210 }, base64 => {
        $(this).find("img").attr("src", base64);

        selected_options.image = base64;

        GetIframeWindow().document.querySelectorAll("img[company-icon]").forEach(elem => elem.src = base64);

        CheckSave();
    });
});

$("#website_config>.configs section.subdomain>div>input").keyup(function () {
    const text = $(this).val().replace(/[^a-zA-Z0-9\_\-\.]/g, "");

    selected_options.subdomain = text;

    $(this).val(text);

    CheckSave();
});

function CheckSave() {
    let disabled = true;

    if (company.subdomain != selected_options.subdomain) disabled = false;
    if (company.website_primary_color != selected_options.primary_color) disabled = false;
    if (selected_options.icon_base64) disabled = false;
    if (selected_options.main_bg_base64) disabled = false;

    $("#website_config>.configs button.save").prop("disabled", disabled);
}

$("#website_config>.configs button.save").click(function () {
    FetchAPI(`/company`, {
        method: "PUT",
        body: selected_options
    }).then(data => {
        company = data;

        selected_options = {}

        Swal.fire("Sucesso!", "Todas as alterações foram salvas com sucesso!", "success");
    }).catch(error => {
        if (error == "subdomain already in use") {
            Swal.fire("Opss...", `Não foi possível criar o subdomínio "${selected_options.subdomain}" pois ele já está em uso!`, "error");
        } else {
            Swal.fire("Opss...", "Ocorreu um erro ao tentar salvar a edição!", "error");
            Swal.showValidationMessage(error);
        }
    });
});

var last_checked_href;
var url_checker_interval = setInterval(() => {
    const frame_window = GetIframeWindow();
    if (!frame_window) return clearInterval(url_checker_interval);

    let href = frame_window.location.href;
    if (!!href && !!selected_options.subdomain) href = href.replace(`${company.subdomain}.${domain}`, `${selected_options.subdomain}.${domain}`);

    if (href != last_checked_href) $("#website_config .input>.url").text(href);

    last_checked_href = href;
}, 100);