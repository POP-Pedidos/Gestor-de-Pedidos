$(".content-column.schedules  .scheduling-hours .days_of_week_calendar .calendar-content>.day_of_week").on("click", function () {
    OpenSchedulingTimesModal($(this).attr("day"));
});

$(".modal-schedules>div>.header>button.back").on("click", function () {
    $(".modal-schedules").removeClass("show");
});

$(".modal-schedules>div>.footer>button.cancel").on("click", function () {
    $(".modal-schedules").removeClass("show");
});

$("#switch_scheduling").on("change", function () {
    const use_scheduling = $(this).is(":checked");

    $(this).parent().parent().find(">span").text(use_scheduling ? "Ativado" : "Desativado");
    $(".content-column.schedules>.tabs>main .section.scheduling-hours").toggleClass("disabled", !use_scheduling);
    
    $(this).data("fetch")?.abort();

    const promise = FetchAPI("/company", {
        method: "PUT",
        body: { use_scheduling }
    });

    $(this).data("fetch", promise);

    company.use_scheduling = use_scheduling;

    promise.then(company_data => {
        company = company_data;
    }).catch(error => {
        if (!error) return;
        Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar as configurações de funcionamento!`, "error");
        Swal.showValidationMessage(error);
    });
});

function OpenSchedulingTimesModal(dayOfWeek, focus_id = null) {
    const $modal = $(".modal-schedules.scheduling");
    const $hours_container = $modal.find(".content>.hours-container");
    const $footer_alert = $modal.find(".footer-alert-message");

    const days_of_week_titles = {
        monday: "Segunda",
        tuesday: "Terça",
        wednesday: "Quarta",
        thursday: "Quinta",
        friday: "Sexta",
        saturday: "Sábado",
        sunday: "Domingo"
    }

    const original_scheduling_times = company.scheduling_times.filter(_day => _day.weekday === dayOfWeek);
    const scheduling_times = original_scheduling_times.map(ob => Object.assign({}, ob));

    function AddScheduling(scheduling, $scheduling) {
        if (!scheduling.element) Object.defineProperty(scheduling, "element", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: $scheduling
        });

        if (!scheduling_times.some(_scheduling => _scheduling === scheduling)) scheduling_times.push(scheduling);
        $hours_container.append($scheduling);
        $hours_container.scrollTop($scheduling.offset().top + $scheduling.height());
    }

    function UpdateScheduling(scheduling, assign_data) {
        const index = scheduling_times.findIndex(_scheduling => _scheduling === scheduling);
        if (index > -1) Object.assign(scheduling_times[index], assign_data);
    }

    function RemoveScheduling(scheduling) {
        const index = scheduling_times.findIndex(_scheduling => _scheduling === scheduling);

        if (index > -1) {
            scheduling_times[index].element.remove();
            scheduling_times.splice(index, 1);
        }
    }

    function ToggleNoneImage() {
        const hours_length = $hours_container.find(">div").length;

        if (!hours_length) $hours_container.append(`<img class="none" src="../../../images/clock-persons.svg">`);
        else $hours_container.find(">.none").remove();
    }

    $hours_container.empty();
    $modal.find(">.header>.title>b").text(days_of_week_titles[dayOfWeek]);

    for (const scheduling of scheduling_times) {
        const $scheduling = $(`<div>
            <div class="time-input">
                <input class="hours" type="number">
                <span>:</span>
                <input class="minutes" type="number">
            </div>
            <button class="remove"><i class="fas fa-trash"></i></button>
        </div>`);

        const $time_input = $scheduling.find(".time-input");

        const [hours, minutes] = MsToTime(scheduling.time);

        $time_input.find(".hours").val(String(hours).padStart(2, '0'));
        $time_input.find(".minutes").val(String(minutes).padStart(2, '0'));

        $scheduling.find("input").on("change keyup", function () {
            UpdateScheduling(scheduling, {
                time: GetTimeInputValue($time_input, true)
            });
        });

        $scheduling.find("button.remove").on("click", function () {
            RemoveScheduling(scheduling);
            ToggleNoneImage();
        });

        AddScheduling(scheduling, $scheduling);

        if (scheduling.id_scheduling === focus_id) {
            $scheduling.addClass("focus");
            $hours_container.scrollTop($scheduling.offset().top + $scheduling.height());
        }
    }

    ToggleNoneImage();

    $modal.find("button.add").off("click").on("click", function () {
        const $scheduling = $(`<div>
            <div class="time-input">
                <input class="hours" type="number">
                <span>:</span>
                <input class="minutes" type="number">
            </div>
            <button class="remove"><i class="fas fa-trash"></i></button>
        </div>`);

        const $time_input = $scheduling.find(".time-input");

        const scheduling = {
            weekday: dayOfWeek,
            time: null
        }

        $scheduling.find("input").on("change keyup", function () {
            UpdateScheduling(scheduling, {
                time: GetTimeInputValue($time_input, true)
            });
        });

        $scheduling.find("button.remove").on("click", function () {
            RemoveScheduling(scheduling);
            ToggleNoneImage();
        });

        AddScheduling(scheduling, $scheduling);
        ToggleNoneImage();
    });

    $modal.find("button.save").off("click").on("click", function () {
        $footer_alert.removeClass("show");
        $hours_container.find(".time-input").removeClass("error");

        const delete_ids = [];
        const promises_delete = [];
        const promises_post_put = [];

        const one_day = 24 * 60 * 60 * 1000;

        for (const scheduling of scheduling_times) {
            if (scheduling.time == null || scheduling.time > one_day) {
                scheduling.element.find(".time-input").addClass("error");
                $footer_alert.addClass("show");
                $footer_alert.find(">span").text("Defina um horário válido");
                return;
            }

            if (scheduling_times.some(_scheduling => _scheduling !== scheduling && _scheduling.time === scheduling.time)) {
                scheduling.element.find(".time-input").addClass("error");
                $footer_alert.addClass("show");
                $footer_alert.find(">span").text(`Este horário ${MsToTimeString(scheduling.time)} já está definido`);
                return;
            }

            if (scheduling.id_scheduling) {
                const old_scheduling = original_scheduling_times.find(_scheduling => _scheduling.id_scheduling === scheduling.id_scheduling);

                if (scheduling.time !== old_scheduling.time) {
                    promises_post_put.push(() => FetchAPI(`/scheduling_time/${scheduling.id_scheduling}`, {
                        method: "PUT",
                        body: { time: scheduling.time }
                    }));
                }
            } else {
                promises_post_put.push(() => FetchAPI(`/scheduling_time`, {
                    method: "POST",
                    body: scheduling
                }));
            }
        }

        for (const scheduling of original_scheduling_times) {
            if (!scheduling_times.some(_scheduling => _scheduling.id_scheduling === scheduling.id_scheduling)) {
                delete_ids.push(scheduling.id_scheduling);

                promises_delete.push(() => FetchAPI(`/scheduling_time/${scheduling.id_scheduling}`, {
                    method: "DELETE"
                }));
            }
        }

        $modal.find("button.save").addClass("loading");
        $modal.addClass("loading");

        Promise.all(promises_delete.map(p => p())).then(() => {
            Promise.all(promises_post_put.map(p => p())).then(new_scheduling_times => {
                for (const _new_scheduling_time of new_scheduling_times) {
                    const _scheduling_time = company.scheduling_times.find(_scheduling => _scheduling.id_scheduling === _new_scheduling_time.id_scheduling);

                    if (_scheduling_time) Object.assign(_scheduling_time, _new_scheduling_time);
                    else company.scheduling_times.push(_new_scheduling_time);
                }

                company.scheduling_times = company.scheduling_times.filter(_scheduling => !delete_ids.includes(_scheduling.id_scheduling));

                LoadSchedulingTimes();
                $modal.removeClass("show");
            }).catch(error => {
                if (!error) return;
                Swal.fire("Opss...", `Ocorreu um erro ao tentar sincronizar os horários de agendamento!`, "error");
                Swal.showValidationMessage(error);
            }).finally(() => {
                setTimeout(() => $modal.find("button.save").removeClass("loading"), 300);
                $modal.removeClass("loading");
            });
        }).catch(error => {
            if (!error) return;
            Swal.fire("Opss...", `Ocorreu um erro ao tentar apagar um dos horários de agendamento!`, "error");
            Swal.showValidationMessage(error);
            $modal.find("button.save").removeClass("loading");
            $modal.removeClass("loading");
        })
    });

    $modal.addClass("show");
}

function LoadSchedulingTimes() {
    $(".scheduling-hours .days_of_week_calendar .calendar-content>.day_of_week").empty();

    for (const scheduling of company.scheduling_times) {
        const $time = $(`<div class="time-marker">00:00</div>`);

        const scale = 100 / (24 * 60 * 60 * 1000);
        const cur_dayOfWeek = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();

        $time.text(MsToTimeString(scheduling.time));

        $time.css({
            bottom: `${100 - (scale * scheduling.time)}%`,
        });

        const $cur_time = $(`<div class="current-time-indicator"></div>`);

        const cur_time_interval = setInterval(() => {
            if (!$cur_time.length) return clearInterval(cur_time_interval);

            $cur_time.css({
                top: `${scale * GetCurrentTimeMs()}%`,
            });
        }, 60000);

        $cur_time.css({
            top: `${scale * GetCurrentTimeMs()}%`,
        });

        $time.on("click", function (e) {
            e.stopPropagation();
            OpenSchedulingTimesModal(scheduling.weekday, scheduling.id_scheduling);
        });

        $(`.scheduling-hours .days_of_week_calendar .calendar-content>.day_of_week[day="${scheduling.weekday}"]`).append($time);
        if (scheduling.weekday === cur_dayOfWeek) $(`.scheduling-hours .days_of_week_calendar .calendar-content>[day="${cur_dayOfWeek}"]`).append($cur_time);
    }
}

LoadSchedulingTimes();