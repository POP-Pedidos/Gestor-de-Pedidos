$(".content-column.schedules .section.shifts .timeline").on("click", function () {
    if ($(this).hasClass("empty")) {
        OpenShiftModal($(this).parent().parent().attr("shift"));
    }
});

$(".modal-schedules.shifts>div>.content .radio-checkmark>.checkmark>input").on("change", function () {
    $(this).parent().parent().toggleClass("unchecked", !$(this).is(":checked"));
});

$(".modal-schedules.shifts .radio-checkmark input").on("change", function () {
    $(".modal-schedules.shifts .time-inputs-container").toggleClass("disabled", $(this).is(":checked") && $(this).val() !== "custom");
});

$("#switch_shifts").on("change", function () {
    const use_shifts = $(this).is(":checked");

    $(this).parent().parent().find(">span").text(use_shifts ? "Ativado" : "Desativado");
    $(".content-column.schedules>.tabs>main .section.shifts").toggleClass("disabled", !use_shifts);

    $(this).data("fetch")?.abort();

    const promise = FetchAPI("/company", {
        method: "PUT",
        body: { use_shifts }
    });

    $(this).data("fetch", promise);

    company.use_shifts = use_shifts;

    promise.then(company_data => {
        company = company_data;
    }).catch(error => {
        if (!error) return;
        Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar as configurações de turnos!`, "error");
        Swal.showValidationMessage(error);
    });
});

function FindShiftsConflict(assign_name, assign_data) {
    const one_day = 24 * 60 * 60 * 1000;

    const shifts = {
        morning: company.shifts.find(shift => shift.name === "morning"),
        afternoon: company.shifts.find(shift => shift.name === "afternoon"),
        night: company.shifts.find(shift => shift.name === "night"),
    }

    if (shifts[assign_name]) Object.assign(shifts[assign_name], assign_data);
    else shifts[assign_name] = assign_data;

    if (assign_data.end - assign_data.start < 60 * 60 * 1000) return ["O turno deve ter no mínimo uma hora de duração", "any"];
    if (assign_data.start >= one_day) return ["Defina um horário inicial válido", "start"];
    if (assign_data.end > one_day) return ["Defina um horário final válido", "end"];

    if (assign_name === "morning") {
        if (shifts.afternoon && shifts.afternoon.start <= assign_data.end)
            return ["O horário final da manhã deve ser menor que o horário inicial da tarde", "end"];

        if (shifts.night && shifts.night.start <= assign_data.end)
            return ["O horário final da manhã deve ser menor que o horário inicial da noite", "end"];
    } else if (assign_name === "afternoon") {
        if (shifts.night && shifts.night.start <= assign_data.end)
            return ["O horário final da tarde deve ser menor que o horário inicial da manhã", "end"];

        if (shifts.morning && shifts.morning.end >= assign_data.start)
            return ["O horário inicial da tarde deve ser menor que o horário final da manhã", "start"];
    } else if (assign_name === "night") {
        if (shifts.morning && shifts.morning.end >= assign_data.start)
            return ["O horário inicial da noite deve ser maior que o horário final da manhã", "start"];

        if (shifts.afternoon && shifts.afternoon.end >= assign_data.start)
            return ["O horário inicial da tarde deve ser menor que o horário final da tarde", "start"];
    }
}

function OpenShiftModal(shift_name) {
    const $modal = $(".modal-schedules.shifts");
    const $time_inputs = $modal.find(".content .time-input");
    const $time_input_start = $modal.find(".content .time-input.open");
    const $time_input_end = $modal.find(".content .time-input.close");
    const $footer_alert = $modal.find(".footer-alert-message");

    const shift_titles = {
        morning: "Manhã",
        afternoon: "Tarde",
        night: "Noite"
    }

    const shift = company.shifts.find(shift => shift.name === shift_name);

    $time_inputs.removeClass("error");
    $time_inputs.find(">input").val("");
    $footer_alert.removeClass("show");

    $modal.find(".header>.title>b").text(shift_titles[shift_name]);
    $modal.find("input[name=shift][value=closed]").prop("checked", !shift).change();
    $modal.find("input[name=shift][value=custom]").prop("checked", shift).change();

    if (shift) {
        const [hours_start, minutes_start] = MsToTime(shift.start);
        const [hours_end, minutes_end] = MsToTime(shift.end);

        $time_input_start.find(".hours").val(String(hours_start).padStart(2, '0'));
        $time_input_start.find(".minutes").val(String(minutes_start).padStart(2, '0'));

        $time_input_end.find(".hours").val(String(hours_end).padStart(2, '0'));
        $time_input_end.find(".minutes").val(String(minutes_end).padStart(2, '0'));
    }

    $modal.find("button.save").off("click").on("click", function () {
        $time_inputs.removeClass("error");
        $footer_alert.removeClass("show");

        const form_data = $(".modal-schedules.shifts form").serializeFormJSON();
        const open_time = form_data.shift === "custom" ? GetTimeInputValue($time_input_start) : null;
        const close_time = form_data.shift === "custom" ? GetTimeInputValue($time_input_end) : null;

        const start_ms = TimeToMs(open_time);
        const end_ms = TimeToMs(close_time);

        if (form_data.shift === "custom") {
            if (!start_ms) {
                $(".modal-schedules.shifts .time-input.open").addClass("error");
                $(".modal-schedules.shifts .footer-alert-message").addClass("show");
                $(".modal-schedules.shifts .footer-alert-message>span").text("Defina um horário válido");

                return;
            }

            if (!end_ms) {
                $(".modal-schedules.shifts .time-input.close").addClass("error");
                $(".modal-schedules.shifts .footer-alert-message").addClass("show");
                $(".modal-schedules.shifts .footer-alert-message>span").text("Defina um horário válido");

                return;
            }

            const conflict = FindShiftsConflict(shift_name, { start: start_ms, end: end_ms });

            if (conflict) {
                $(".modal-schedules.shifts .footer-alert-message").addClass("show");
                $(".modal-schedules.shifts .footer-alert-message>span").text(conflict[0]);

                if (conflict[1] === "start") {
                    $(".modal-schedules.shifts .time-input.open").addClass("error");
                } else if (conflict[1] === "end") {
                    $(".modal-schedules.shifts .time-input.close").addClass("error");
                } else {
                    $(".modal-schedules.shifts .time-input").addClass("error");
                }

                return;
            }

            $modal.find(".footer>.save").addClass("loading");
            $modal.addClass("loading");

            FetchAPI(shift ? `/shift/${shift.id_shift}` : `/shift`, {
                method: shift ? "PUT" : "POST",
                body: {
                    name: shift_name,
                    start: start_ms,
                    end: end_ms
                }
            }).then(data => {
                if (shift) Object.assign(shift, data);
                else company.shifts.push(data);

                LoadShifts();
                $modal.removeClass("show");
            }).catch(error => {
                if (!error) return;
                Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar o turno "${shift_name}"!`, "error");
                Swal.showValidationMessage(error);
            }).finally(() => {
                setTimeout(() => $modal.find(".footer>.save").removeClass("loading"), 300);
                $modal.removeClass("loading");
            });
        } else if (shift) {
            $modal.find(".footer>.save").addClass("loading");
            $modal.addClass("loading");

            FetchAPI(`/shift/${shift.id_shift}`, {
                method: "DELETE",
            }).then(() => {
                company.shifts = company.shifts.filter(_shift => _shift !== shift);

                LoadShifts();
                $modal.removeClass("show");
            }).catch(error => {
                if (!error) return;
                Swal.fire("Opss...", `Ocorreu um erro ao tentar remover o turno "${shift_name}"!`, "error");
                Swal.showValidationMessage(error);
            }).finally(() => {
                setTimeout(() => $modal.find(".footer>.save").removeClass("loading"), 300);
                $modal.removeClass("loading");
            });
        }
    });

    $modal.addClass("show");
}

function LoadShifts() {
    $(".content-column.schedules .section.shifts .timeline").empty();
    $(".content-column.schedules .section.shifts>.content .timeline").addClass("empty");

    for (const shift of company.shifts) {
        const $marker = $(`<div class="marker">
            <div class="linker linker-morning"></div>
            <span class="left">00:00</span>
            <span class="right">00:00</span>
            <div class="linker linker-night"></div>
        </div>`);

        if (shift.name !== "afternoon") $marker.find(">.linker").remove();

        const scale = 100 / (24 * 60 * 60 * 1000);

        $marker.css({
            left: `${scale * shift.start}%`,
            width: `${(scale * shift.end) - (scale * shift.start)}%`
        });

        $marker.find(".left").text(MsToTimeString(shift.start));
        $marker.find(".right").text(MsToTimeString(shift.end));

        $marker.on("click", () => {
            OpenShiftModal(shift.name);
        });

        $(`.content-column.schedules .section.shifts>.content>[shift="${shift.name}"] .timeline`).append($marker).removeClass("empty");
    }
}

LoadShifts();