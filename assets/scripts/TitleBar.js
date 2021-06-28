const $title_bar = $(`<div id="title-bar">
    <div class="program">
        <img>
        <span class="title">App</span>
    </div>
    <div class="controls">
        <button class="minimize">
            <svg width="10" height="10" x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1" /></svg>
        </button>
        <button class="maximize-restore">
            <svg class="maximize" width="11" height="11" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z"/></svg>
            <svg class="normalize" width="11" height="11" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z"/></svg>
        </button>
        <button class="close">
            <svg width="11" height="11" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z"/></svg>
        </button>
    </div>
</div>`);

$(`<style type="text/css">
    @media (prefers-color-scheme: dark) {
        #title-bar {
            color: white;
            background-color: #1a1a1a;
            border-color: black !important;
        }

        #title-bar>.controls>button>svg {
            fill: white;
        }

        #title-bar>.controls>button:hover {
            background-color: var(--color-tones-20);
        }
    }

    @media (prefers-color-scheme: light) {
        #title-bar {
            color: black;
            background-color: white;
        }

        #title-bar>.controls>button>svg {
            fill: black;
        }

        #title-bar>.controls>button:hover {
            background-color: var(--color-tints-40);
        }
    }

    #title-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 30px;
        padding: 0 0 1px 7px;
        border-bottom: none;
        user-select: none;
        -webkit-app-region: drag;
        z-index: 100000;
    }

    body {
        padding-top: 29px !important;
        height: calc(100vh - 29px) !important;
        min-height: calc(100vh - 29px) !important;
    }

    #title-bar>.program {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    #title-bar>.program>img {
        height: 19px;
        width: 19px;
    }
    #title-bar>.program>.title {
        font: 12px/32px "Segoe UI", Arial, sans-serif;
    }
    #title-bar>.controls {
        -webkit-app-region: no-drag;
        height: 100%;
        display: flex;
    }
    #title-bar>.controls>button {
        height: 100%;
        width: 46px;
        background-color: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    #title-bar>.controls>button.close:hover {
        background-color: #f94242;
    }
    #title-bar>.controls>button.maximize-restore>.normalize {
        display: block;
    }
    #title-bar>.controls>button.maximize-restore.maximized>.maximize {
        display: none;
    }
    #title-bar>.controls>button.maximize-restore:not(.maximized)>.normalize {
        display: none;
    }
</style>`).appendTo("head");


$title_bar.find(".title").text(document.title || window.app_name);
$title_bar.find(".program>img").attr("src", window.icons.default);

$title_bar.find(".controls>.maximize-restore").toggleClass("maximized", window.controls?.state() === "maximized");

window.controls.onTitleChanged(function (e, title) {
    $title_bar.find(".title").text(document.title);
});

window.controls.onMaximize(function () {
    $title_bar.find(".controls>.maximize-restore").addClass("maximized");
});

window.controls.onUnMaximize(function () {
    $title_bar.find(".controls>.maximize-restore").removeClass("maximized");
});

$title_bar.find(".controls>.minimize").on("click", function () {
    window.controls.minimize();
});

$title_bar.find(".controls>.maximize-restore").on("click", function () {
    if (window.controls?.state() === "maximized") window.controls.restore();
    else window.controls.maximize();
});

$title_bar.find(".controls>.close").on("click", function () {
    window.controls.hide();
});

$("body").prepend($title_bar);