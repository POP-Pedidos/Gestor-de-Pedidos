var table_configuracoes_horarios = $("#table-configuracoes-horarios").DataTable({
    language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json"
    },
    ordering: false,
    searching: false,
    paging: false,
    info: false,
});

var table_configuracoes_turnos = $("#table-configuracoes-turnos").DataTable({
    language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json"
    },
    ordering: false,
    searching: false,
    paging: false,
    info: false,
});

$("#table-configuracoes-horarios input, #table-configuracoes-turnos input").inputmask("datetime", {
    inputFormat: "HH:MM",
    max: "24:00",
    placeholder: "__:__",
    showMaskOnHover: false,
    clearIncomplete: true,
});

$("#table-configuracoes-turnos input").on("change", function () {
    const $table = $("#table-configuracoes-turnos");

    const morning_open = $table.find("input.morning-open").val();
    const morning_close = $table.find("input.morning-close").val();
    const afternoon_open = $table.find("input.afternoon-open").val();
    const afternoon_close = $table.find("input.afternoon-close").val();
    const night_open = $table.find("input.night-open").val();
    const night_close = $table.find("input.night-close").val();

    if (company.morning_shift_open == morning_open &&
        company.morning_shift_close == morning_close &&
        company.afternoon_shift_open == afternoon_open &&
        company.afternoon_shift_close == afternoon_close &&
        company.night_shift_open == night_open &&
        company.night_shift_close == night_close
    ) return;

    FetchAPI("/company", {
        method: "PUT",
        body: {
            morning_shift_open: morning_open || null,
            morning_shift_close: morning_close || null,
            afternoon_shift_open: afternoon_open || null,
            afternoon_shift_close: afternoon_close || null,
            night_shift_open: night_open || null,
            night_shift_close: night_close || null,
        }
    }).then(data => {
        company = data;
    }).catch(error => {
        if (!error) return;

        Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar os turnos!`, "error");
        Swal.showValidationMessage(error);
    });
});

$("#table-configuracoes-horarios input").on("change", function () {
    const $tr = $($(this).parent().parent("tr")[0] || $(this).parent().parent().parent("tr")[0]);

    const dayOfWeek = $tr.attr("dayOfWeek");

    const time_start = $tr.find("input.time_start").val();
    const time_close = $tr.find("input.time_close").val();
    const open = $tr.find(".custom-switch>input").is(":checked");

    const old_time = times.find(time => time.dayOfWeek == dayOfWeek);

    if (old_time?.open == open && old_time?.opens == time_start && old_time?.closes == time_close) return;

    FetchAPI(old_time ? `${api_url}/time/${dayOfWeek}` : `${api_url}/time`, {
        method: old_time ? "PUT" : "POST",
        body: {
            dayOfWeek,
            opens: time_start,
            closes: time_close,
            open,
        }
    }).then(data => {
        if (old_time) ArrayChange(times, data, val => val.id_time == data.id_time);
        else times.push(data);
    }).catch(error => {
        if (!error) return;
        
        Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar o horário "${dayOfWeek}"!`, "error");
        Swal.showValidationMessage(error);
    });
});

$("#loading-wrapper-content").css("display", "flex").show();

FetchAPI(`/time`, { instance_check: true, }).then(time_data => {
    times = time_data;

    for (const time of times) {
        $(`[dayOfWeek="${time.dayOfWeek}"] .custom-switch>input`).prop('checked', time.open || false);
        $(`[dayOfWeek="${time.dayOfWeek}"] .time_start`).val(time.opens || "");
        $(`[dayOfWeek="${time.dayOfWeek}"] .time_close`).val(time.closes || "");
    }

    $("#table-configuracoes-turnos input.morning-open").val(company.morning_shift_open);
    $("#table-configuracoes-turnos input.morning-close").val(company.morning_shift_close);
    $("#table-configuracoes-turnos input.afternoon-open").val(company.afternoon_shift_open);
    $("#table-configuracoes-turnos input.afternoon-close").val(company.afternoon_shift_close);
    $("#table-configuracoes-turnos input.night-open").val(company.night_shift_open);
    $("#table-configuracoes-turnos input.night-close").val(company.night_shift_close);
}).catch(error => {
    Swal.fire("Opss...", "Ocorreu um erro fatal ao tentar listar os horários!", "error");
    Swal.showValidationMessage(error);
}).finally(() => {
    $("#loading-wrapper-content").fadeOut(400);
});