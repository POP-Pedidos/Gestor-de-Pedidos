(() => {
    function setLoading($element, loading = true, subtitles = false) {
        if (loading === true) {
            $element.empty();
            $element.css({ overflow: "hidden" });

            for (let i = 0; i < 5; i++) {
                const $skeleton = $(`<div class="is_skeleton">
                    <span class="title skeleton">.</span>
                    <span class="subtitle skeleton">.</span>
                </div>`);

                if (!subtitles) $skeleton.find(".subtitle").remove();

                $element.append($skeleton);
            }
        } else {
            $element.css({ overflow: "" });
            $element.find(".is_skeleton").remove();
        }
    }

    function autoComplete($input, type) {
        const $auto_complete = $(`<div class="auto-complete-results"></div>`);

        $input.attr("autocomplete", Math.random());
        $input.data("auto-complete-element", $auto_complete);

        function setSelected($input, autocomplete_data) {
            $input.val(autocomplete_data.name).change();

            $input.data("autocomplete_data", autocomplete_data);

            if (type === "state") $input.data("selected", autocomplete_data.id_state);
            else if (type === "city") $input.data("selected", autocomplete_data.id_city);
            else if (type === "neighborhood") $input.data("selected", autocomplete_data.id_neighborhood);
            else if (type === "agent") $input.data("selected", autocomplete_data.id_agent);
            else if (type === "company") $input.data("selected", autocomplete_data.id_company);

            $input.parent().removeClass("required-alert");

            $input.trigger("place-change", autocomplete_data);
        }

        function search($input) {
            const value = $input.val();
            const old_value = $input.data("old-value");
            const results_element = $input.data("auto-complete-element");
            const search_timeout = $input.data("search-timeout");
            const search_params = $input.data("search-params") || {};

            if (!value) {
                setLoading(results_element, false);
                $input.parent().addClass("required-alert").removeClass("has-results");
                $auto_complete.empty().removeClass("show");
                return;
            }

            if (value === old_value) return;
            if (search_timeout) clearTimeout(search_timeout);
            
            const timeout = setTimeout(() => {
                if (type === "state") {
                    setLoading(results_element, true, true);

                    FetchAPI(`${places_url}/state`, {
                        params: {
                            search: value,
                            ...search_params,
                        }
                    }).then(states => {
                        if (states.results.length > 0) {
                            for (const state of states.results) {
                                const $result = $(`<div>
                                    <span class="title"></span>
                                    <span class="subtitle"></span>
                                </div>`);

                                $result.data(state);
                                $result.find(".title").text(state.name);
                                $result.find(".subtitle").text(state.uf);

                                results_element.append($result);
                            }

                            $input.parent().addClass("has-results");
                        } else {
                            if ($input.prop("required")) $input.parent().addClass("required-alert");
                            $input.parent().removeClass("has-results");
                        }
                    }).finally(() => {
                        setLoading(results_element, false);
                    });
                } else if (type === "city") {
                    setLoading(results_element, true, true);

                    FetchAPI(`${places_url}/city`, {
                        params: {
                            search: value,
                            ...search_params,
                        }
                    }).then(cities => {
                        if (cities.results.length > 0) {
                            for (const city of cities.results) {
                                const $result = $(`<div>
                                        <span class="title"></span>
                                    </div>`);

                                $result.data(city);
                                $result.find(".title").text(city.name);

                                results_element.append($result);
                            }

                            $input.parent().addClass("has-results");
                        } else {
                            if ($input.prop("required")) $input.parent().addClass("required-alert");
                            $input.parent().removeClass("has-results");
                        }
                    }).finally(() => {
                        setLoading(results_element, false);
                    });
                } else if (type === "neighborhood") {
                    setLoading(results_element, true, true);

                    FetchAPI(`${places_url}/neighborhood`, {
                        params: {
                            search: value,
                            ...search_params,
                        }
                    }).then(neighborhoods => {
                        if (neighborhoods.results.length > 0) {
                            for (const neighborhood of neighborhoods.results) {
                                const $result = $(`<div>
                                    <span class="title"></span>
                                </div>`);

                                $result.data(neighborhood);
                                $result.find(".title").text(neighborhood.name);

                                results_element.append($result);
                            }

                            $input.parent().addClass("has-results");
                        } else {
                            if ($input.prop("required")) $input.parent().addClass("required-alert");
                            $input.parent().removeClass("has-results");
                        }
                    }).finally(() => {
                        setLoading(results_element, false);
                    });
                } else if (type === "agent") {
                    setLoading(results_element, true, false);

                    FetchAPI(`/agent`, {
                        params: {
                            search: value,
                            ...search_params,
                        }
                    }).then(agents => {
                        if (agents.results.length > 0) {
                            for (const agent of agents.results) {
                                const $result = $(`<div>
                                    <span class="title"></span>
                                </div>`);

                                $result.data(agent);
                                $result.find(".title").text(agent.name);

                                results_element.append($result);
                            }

                            $input.parent().addClass("has-results");
                        } else {
                            if ($input.prop("required")) $input.parent().addClass("required-alert");
                            $input.parent().removeClass("has-results");
                        }
                    }).finally(() => {
                        setLoading(results_element, false);
                    });
                } else if (type === "company") {
                    setLoading(results_element, true, true);

                    FetchAPI(`/company`, {
                        params: {
                            search: value,
                            ...search_params,
                        }
                    }).then(companies => {
                        if (companies.results.length > 0) {
                            for (const company of companies.results) {
                                const $result = $(`<div>
                                    <span class="title"></span>
                                    <span class="subtitle"></span>
                                </div>`);

                                $result.data(company);
                                $result.find(".title").text(company.name);
                                $result.find(".subtitle").text(company.corporate_name);

                                results_element.append($result);
                            }

                            $input.parent().addClass("has-results");
                        } else {
                            if ($input.prop("required")) $input.parent().addClass("required-alert");
                            $input.parent().removeClass("has-results");
                        }
                    }).finally(() => {
                        setLoading(results_element, false);
                    });
                }
            }, 500);

            $input.data("search-timeout", timeout);
            $input.data("old-value", value);
        }

        $auto_complete.on("mouseenter", ">div", function () {
            $auto_complete.find(">div").removeClass("active");
            $(this).addClass("active");
        });

        $auto_complete.on("mouseleave", ">div", function () {
            $(this).removeClass("active");
        });

        $auto_complete.on("click", ">div", function () {
            const autocomplete_data = $(this).data();

            setSelected($input, autocomplete_data);
        });

        $input.on("keyup", () => {
            if ($input.data("selected")) {
                $input.data("selected", null);
                $input.data("autocomplete_data", null);
                $input.trigger("place-change", null);
            }

            $input.parent().removeClass("has-results required-alert");

            $auto_complete.addClass("show");

            search($input);
        });

        $input.on("focus", () => {
            const top = $input.offset().top + $input.outerHeight() + 3;
            const left = $input.offset().left;
            const width = $input.outerWidth();

            $auto_complete.css({
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
            }).addClass("show");

            $input.parent().removeClass("required-alert");

            if ($input.data("selected") && !$input.data("autocomplete_data")) search($input);
        });

        $input.on("blur", () => {
            $auto_complete.removeClass("show");

            if ($input.prop("required") && !$input.data("selected")) $input.parent().addClass("required-alert");

            for (const elem of $auto_complete.find(">div")) {
                const autocomplete_data = $(elem).data();
                if (autocomplete_data?.name === $input.val()) setSelected($input, autocomplete_data);
            }
        });

        $input.on("place-change", function (e, autocomplete_data) {
            if (!autocomplete_data) {
                $auto_complete.empty().removeClass("show");
                $input.parent().removeClass("has-results");
            }
        });

        $input.on("clear", function () {
            $input.val("").change();
            $input.parent().removeClass("required-alert");
            $input.data("selected", null);
            $input.data("autocomplete_data", null);
            $input.trigger("place-change", null);
        });

        $input.on("setSelectedPlace", function (e, id, name) {
            if (!!id && !!name) {
                $input.val(name).change();
                $input.data("selected", id);
            }
        });

        $input.on("setSearchParams", function (e, params = {}) {
            $input.data("search-params", params);
        });

        $("body").append($auto_complete);

        return $input;
    }

    $.fn.inputAutoComplete = function (message, ...args) {
        const type = this.parent().attr("autocomplete-type");

        if (message === "init") autoComplete(this, type);
        if (message === "set") this.trigger("setSelectedPlace", args);
        if (message === "params") this.trigger("setSearchParams", args);
        if (message === "clear") this.trigger("clear");

        return this;
    }
})()