var NeighborhoodInputAutoComplete = class {
    constructor(elem) {
        this.elem = $(elem);
        this.promise = null;

        this._InputHandler = e => this.InputHandler(e);
        this._FocusHandler = e => this.FocusHandler(e);
        this._BlurHandler = e => this.BlurHandler(e);

        this.elem.on("keyup", this._InputHandler);
        this.elem.on("focus", this._FocusHandler);
        this.elem.on("blur", this._BlurHandler);

        this.results_elem = $(`<div class="place-results-container">
            <span class="title">Resultados</span>
            <div class="results"></div>
        </div>`);

        this.elem.data("results_elem", this.results_elem);

        this.ResizeResultsElem();

        $("body").append(this.results_elem);

        $(window).on("resize", (e) => {
            this.ResizeResultsElem();
        });
    }

    StopPendingRequest() {
        try {
            this.promise.abort();
        } catch { }
    }

    unBind() {
        StopPendingRequest();

        this.elem.off("keyup", this._InputHandler);
        this.elem.off("focus", this._FocusHandler);
        this.elem.off("blur", this._BlurHandler);
    }

    SetLoading() {
        this.results_elem.find(".results").empty();

        for (let i = 0; i < 5; i++) {
            const $place = $(`<div class="is_skeleton"><span class="skeleton">.</span></div>`);
            this.results_elem.find(".results").append($place);
        }
    }

    InputHandler(e) {
        const text = this.elem.val();
        this.results_elem.toggleClass("show", !!text);

        clearInterval(this.check_interval);
        this.elem.data("place", null);
        this.elem.trigger("blur_place");
        this.results_elem.find(">.zero-results").remove();
        this.StopPendingRequest();
        this.SetLoading();

        if (e.keyCode == 13) this.Search(text);
        else this.check_interval = setTimeout(() => {
            if (this.last_text === text) this.Search(text);
        }, 500);

        this.last_text = text;
    }

    ResizeResultsElem() {
        let height = $(window).height() - (this.elem.offset().top + this.elem.outerHeight()) - 40;
        if (height > 400) height = 400;

        this.results_elem.css("top", `${this.elem.offset().top + this.elem.outerHeight()}px`);
        this.results_elem.css("left", `${this.elem.offset().left}px`);
        this.results_elem.css("width", `${this.elem.outerWidth()}px`);
        this.results_elem.css("max-height", `${height}px`);
    }

    FocusHandler() {
        this.ResizeResultsElem();

        if (this.elem.val() && this.results_elem.find(".results>div").length > 0) this.results_elem.addClass("show");
    }

    BlurHandler() {
        this.results_elem.removeClass("show");
    }

    Search(text) {
        if (!text) return;

        this.promise = FetchAPI(`${places_url}/neighborhood`, {
            instance_check: true,
            params: { search: text, id_city: company.id_city }
        });

        this.promise.then(data => {
            this.results_elem.find(".results").empty();

            if (data.results.length > 0) for (const neighborhood of data.results) this.AddPlaceResult(neighborhood);
            else this.results_elem.append(`<span class="zero-results">Nenhum resultado!</span>`);

            this.results_elem.addClass("show");
        }).catch(error => {
            Swal.fire("Opss...", `Ocorreu um erro ao tentar pesquisar o local!`, "error");
            Swal.showValidationMessage(error);

            this.results_elem.removeClass("show");
        });
    }

    AddPlaceResult(neighborhood) {
        const $place = $(`<div><i class="fas fa-map-marker-alt"></i><span></span></div>`);
        $place.find("span").text(neighborhood.name);

        $place.on("click", () => {
            this.elem.val(neighborhood.name);
            this.elem.data("place", neighborhood);
            this.elem.trigger("place", [neighborhood]);
        });

        this.results_elem.find(".results").append($place);
    }
}