$(".content-column.schedules  .opening-hours .days_of_week_calendar .calendar-content>.day_of_week").on("click", function () {
    if ($(this).data("dragging")) return;
    OpenDaysOfWeekModal($(this).attr("day"));
});

function FindWeekDaysShiftsConflict(weekday_shifts) {
    const one_day = 24 * 60 * 60 * 1000;

    for (const weekday of weekday_shifts) {
        if (weekday.end - weekday.start < 60 * 60 * 1000) return [weekday, "O turno deve ter no mínimo uma hora de duração", "any"];
        if (weekday.start >= one_day) return [weekday, "Defina um horário inicial válido", "start"];
        if (weekday.end > one_day) return [weekday, "Defina um horário final válido", "end"];


        const conflict = weekday_shifts.find(_weekday => _weekday !== weekday && (
            (_weekday.start <= weekday.start && _weekday.end >= weekday.start) ||
            (_weekday.start > weekday.start && _weekday.end < weekday.end) ||
            (_weekday.start <= weekday.end && _weekday.end >= weekday.end)
        ));

        if (conflict) return weekday;
    }
}

function OpenDaysOfWeekModal(dayOfWeek, focus_id = null) {
    const $modal = $(".modal-schedules.opening-hours");
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

    const original_weekday_shifts = company.weekday_shifts.filter(_day => _day.weekday === dayOfWeek);
    const weekday_shifts = original_weekday_shifts.map(ob => Object.assign({}, ob));

    function AddShift(shift, $shift) {
        if (!shift.element) Object.defineProperty(shift, "element", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: $shift
        });

        if (!weekday_shifts.some(_shift => _shift === shift)) weekday_shifts.push(shift);
        $hours_container.append($shift);
    }

    function UpdateShift(shift, assign_data) {
        const index = weekday_shifts.findIndex(_shift => _shift === shift);
        if (index > -1) Object.assign(weekday_shifts[index], assign_data);
    }

    function RemoveShift(shift) {
        const index = weekday_shifts.findIndex(_shift => _shift === shift);

        if (index > -1) {
            weekday_shifts[index].element.remove();
            weekday_shifts.splice(index, 1);
        }
    }

    function ToggleNoneImage() {
        const hours_length = $hours_container.find(">div").length;

        if (!hours_length) $hours_container.append(`<img class="none" src="../../../images/clock-persons.svg">`);
        else $hours_container.find(">.none").remove();
    }

    $hours_container.empty();
    $modal.find(">div>.header>.title>b").text(days_of_week_titles[dayOfWeek]);

    for (const shift of weekday_shifts) {
        const $shift = $(`<div>
            <div class="time-inputs-container">
                <span>Das</span>
                <div class="time-input start">
                    <input class="hours" type="number">
                    <span>:</span>
                    <input class="minutes" type="number">
                </div>
                <span>até as</span>
                <div class="time-input end">
                    <input class="hours" type="number">
                    <span>:</span>
                    <input class="minutes" type="number">
                </div>
            </div>
            <button class="remove"><i class="fas fa-trash"></i></button>
        </div>`);

        const $time_input_start = $shift.find(".time-input.start");
        const $time_input_end = $shift.find(".time-input.end");

        const [hours_start, minutes_start] = MsToTime(shift.start);
        const [hours_end, minutes_end] = MsToTime(shift.end);

        $time_input_start.find(".hours").val(String(hours_start).padStart(2, '0'));
        $time_input_start.find(".minutes").val(String(minutes_start).padStart(2, '0'));

        $time_input_end.find(".hours").val(String(hours_end).padStart(2, '0'));
        $time_input_end.find(".minutes").val(String(minutes_end).padStart(2, '0'));

        $time_input_start.find("input").on("change keyup", function () {
            UpdateShift(shift, {
                start: GetTimeInputValue($time_input_start, true)
            });
        });

        $time_input_end.find("input").on("change keyup", function () {
            UpdateShift(shift, {
                end: GetTimeInputValue($time_input_end, true)
            });
        });

        $shift.find("button.remove").on("click", function () {
            RemoveShift(shift);
            ToggleNoneImage();
        });

        AddShift(shift, $shift);

        if (shift.id_shift === focus_id) {
            $shift.addClass("focus");
            $hours_container.scrollTop($shift.offset().top + $shift.height());
        }
    }

    ToggleNoneImage();

    $modal.find("button.add").off("click").on("click", function () {
        const $shift = $(`<div>
            <div class="time-inputs-container">
                <span>Das</span>
                <div class="time-input start">
                    <input class="hours" type="number">
                    <span>:</span>
                    <input class="minutes" type="number">
                </div>
                <span>até as</span>
                <div class="time-input end">
                    <input class="hours" type="number">
                    <span>:</span>
                    <input class="minutes" type="number">
                </div>
            </div>
            <button class="remove"><i class="fas fa-trash"></i></button>
        </div>`);

        const $time_input_start = $shift.find(".time-input.start");
        const $time_input_end = $shift.find(".time-input.end");

        const shift = {
            weekday: dayOfWeek,
            start: null,
            end: null
        }

        $time_input_start.find("input").on("change keyup", function () {
            UpdateShift(shift, {
                start: GetTimeInputValue($time_input_start, true)
            });
        });

        $time_input_end.find("input").on("change keyup", function () {
            UpdateShift(shift, {
                end: GetTimeInputValue($time_input_end, true)
            });
        });

        $shift.find("button.remove").on("click", function () {
            RemoveShift(shift);
            ToggleNoneImage();
        });

        AddShift(shift, $shift);
        ToggleNoneImage();
    });

    $modal.find("button.save").off("click").on("click", function () {
        $footer_alert.removeClass("show");
        $hours_container.find(".time-input").removeClass("error");

        const delete_ids = [];
        const promises_delete = [];
        const promises_post_put = [];

        for (const shift of weekday_shifts) {
            if (shift.start == null) {
                shift.element.find(".time-input.start").addClass("error");
                $footer_alert.addClass("show");
                $footer_alert.find(">span").text("Defina um horário inicial válido");
                return;
            }

            if (shift.end == null) {
                shift.element.find(".time-input.end").addClass("error");
                $footer_alert.addClass("show");
                $footer_alert.find(">span").text("Defina um horário final válido");
                return;
            }

            const conflict = FindWeekDaysShiftsConflict(weekday_shifts);

            if (conflict) {
                if (Array.isArray(conflict)) {
                    $footer_alert.addClass("show");
                    $footer_alert.find(">span").text(conflict[1]);

                    if (conflict[2] === "start") {
                        conflict[0].element.find(".time-input.start").addClass("error");
                    } else if (conflict[2] === "end") {
                        conflict[0].element.find(".time-input.end").addClass("error");
                    } else {
                        conflict[0].element.find(".time-input").addClass("error");
                    }
                } else {
                    $footer_alert.addClass("show");
                    $footer_alert.find(">span").text("Os horários estão em conflito entre si");

                    shift.element.find(".time-input").addClass("error");
                }

                return;
            }

            if (shift.id_shift) {
                const old_shift = original_weekday_shifts.find(_shift => _shift.id_shift === shift.id_shift);

                if (shift.start !== old_shift.start || shift.end !== old_shift.end) {
                    promises_post_put.push(() => FetchAPI(`/weekday_shift/${shift.id_shift}`, {
                        method: "PUT",
                        body: {
                            start: shift.start,
                            end: shift.end
                        }
                    }));
                }
            } else {
                promises_post_put.push(() => FetchAPI(`/weekday_shift`, {
                    method: "POST",
                    body: shift
                }));
            }
        }

        for (const shift of original_weekday_shifts) {
            if (!weekday_shifts.some(_shift => _shift.id_shift === shift.id_shift)) {
                delete_ids.push(shift.id_shift);

                promises_delete.push(() => FetchAPI(`/weekday_shift/${shift.id_shift}`, {
                    method: "DELETE"
                }));
            }
        }

        $modal.find("button.save").addClass("loading");
        $modal.addClass("loading");

        Promise.all(promises_delete.map(p => p())).then(() => {
            Promise.all(promises_post_put.map(p => p())).then(new_weekday_shifts => {
                for (const _new_weekday_shift of new_weekday_shifts) {
                    const _weekday_shift = company.weekday_shifts.find(_shift => _shift.id_shift === _new_weekday_shift.id_shift);

                    if (_weekday_shift) Object.assign(_weekday_shift, _new_weekday_shift);
                    else company.weekday_shifts.push(_new_weekday_shift);
                }

                company.weekday_shifts = company.weekday_shifts.filter(_shift => !delete_ids.includes(_shift.id_shift));

                LoadDaysOfWeek();
                $modal.removeClass("show");
            }).catch(error => {
                if (!error) return;
                Swal.fire("Opss...", `Ocorreu um erro ao tentar sincronizar os horários de semana!`, "error");
                Swal.showValidationMessage(error);
            }).finally(() => {
                setTimeout(() => $modal.find("button.save").removeClass("loading"), 300);
                $modal.removeClass("loading");
            });
        }).catch(error => {
            if (!error) return;
            Swal.fire("Opss...", `Ocorreu um erro ao tentar apagar um dos horários de semana!`, "error");
            Swal.showValidationMessage(error);
            $modal.find("button.save").removeClass("loading");
            $modal.removeClass("loading");
        })
    });

    $modal.addClass("show");
}

function GetOpenTimeMessage(ms = 0) {
    const hours = Math.round(ms / 60 / 60 / 1000);
    const minutes = Math.round(ms / 60 / 1000);

    if (hours > 0) return `Aberto por ${hours}h`;
    else if (minutes > 0) return `Aberto por ${minutes}min`;
    else return `Fechado`;
}

function LoadDaysOfWeek() {
    $(".opening-hours .days_of_week_calendar .calendar-content>.day_of_week").empty();
    $(`.opening-hours .days_of_week_calendar>.header>div>.open-hours`).addClass("closed").text(GetOpenTimeMessage(0));

    for (const time of company.weekday_shifts) {
        const $time = $(`<div class="marker">
            <span class="left">00:00</span>
            <span class="right">00:00</span>
        </div>`);

        const scale = 100 / (24 * 60 * 60 * 1000);
        const cur_dayOfWeek = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();

        $time.css({
            top: `${scale * time.start}%`,
            height: `${(scale * time.end) - (scale * time.start)}%`
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

        $time.find(".left").text(MsToTimeString(time.start));
        $time.find(".right").text(MsToTimeString(time.end));

        // HandleResize($time, time);

        $time.on("click", function (e) {
            e.stopPropagation();
            OpenDaysOfWeekModal(time.weekday, time.id_shift);
        });

        const open_total_time = company.weekday_shifts.reduce((acc, shift) => shift.weekday === time.weekday ? (acc + (shift.end - shift.start)) : acc, 0);
        $(`.opening-hours .days_of_week_calendar>.header>[day="${time.weekday}"]>.open-hours`).toggleClass("closed", open_total_time <= 0).text(GetOpenTimeMessage(open_total_time));

        $(`.opening-hours .days_of_week_calendar .calendar-content>.day_of_week[day="${time.weekday}"]`).append($time);
        if (time.weekday === cur_dayOfWeek) $(`.opening-hours .days_of_week_calendar .calendar-content>[day="${cur_dayOfWeek}"]`).append($cur_time);
    }
}

function HandleResize($element, time) {
    let dragging = false;
    let animation_frame;
    let container_height;
    let element_height;
    let element_top;

    const time_open = TimeToMs(time.start);
    const time_close = TimeToMs(time.end);
    const original_element_top = 0;
    const original_element_bottom = 0;

    const $container = $element.parent();

    $element.on("mousedown", (e) => {
        dragging = (e.offsetY <= 4) ? "top" : ((e.offsetY >= e.target.clientHeight - 4) ? "bottom" : false);

        if (dragging) {
            $element.css("pointer-events", "none");
            $container.css("cursor", "row-resize");
            $container.on("mousemove", MouseMove);
        }

        $container.data("dragging", dragging);
    });

    $(document).on("mouseup", (e) => {
        if (dragging) {
            dragging = false;

            setTimeout(() => $container.data("dragging", false), 100);
            $element.css("pointer-events", "");
            $container.css("cursor", "");
            $container.on("mousemove", MouseMove);
        }
    });

    function MouseMove(e) {
        if (animation_frame) cancelAnimationFrame(animation_frame);
        if (dragging) animation_frame = requestAnimationFrame(() => {
            container_height = $container.height();
            element_height = parseFloat($element[0].style.height);
            element_top = parseFloat($element[0].style.top);

            let percentage = ((e.offsetY - 3) / container_height) * 100;
            if (percentage < 0) percentage = 0;
            else if (percentage > 100) percentage = 100;

            if (dragging === "top") {
                $element.css({
                    height: `${element_height - percentage + element_top}%`,
                    top: `${percentage}%`
                });
            } else if (dragging === "bottom") {
                $element.css("height", `${percentage - element_top}%`);
            }

            const one_day = (24 * 60 * 60 * 1000);
            const element_bottom = (element_height + element_top) - 100;

            $element.find(".left").text(MsToTime(time_open + ((one_day * (original_element_top + element_top) / 100))));
            $element.find(".right").text(MsToTime(time_close + ((one_day * (original_element_bottom + element_bottom) / 100))));

            offsetY = e.pageY;
        });
    }
}

LoadDaysOfWeek();