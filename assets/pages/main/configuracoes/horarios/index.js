$(".content-column.schedules>.tabs").initTabs();

$("#switch_online").prop("checked", company.online_check >= 1);
$("#switch_just_time").prop("checked", company.online_check >= 2);
$("#switch_scheduling").prop("checked", company.use_scheduling);

$(".content-column.schedules .only_schedule").toggleClass("disabled", company.online_check < 2);
$(".content-column.schedules>.tabs>main .section.scheduling-hours").toggleClass("disabled", !company.use_scheduling);

$(".content-column.schedules .online_check>.switch>span").text(company.online_check >= 1 ? "Ativado" : "Desativado");
$(".content-column.schedules .only_schedule>.switch>span").text(company.online_check >= 2 ? "Ativado" : "Desativado");
$(".content-column.schedules .use_scheduling>.switch>span").text(company.use_scheduling ? "Ativado" : "Desativado");

function TimeToMs(time) {
    if (!time) return null;
    const [hours, minutes, seconds] = time.split(":").map(Number);

    const hours_ms = (hours || 0) * 60 * 60 * 1000;
    const minutes_ms = (minutes || 0) * 60 * 1000;
    const seconds_ms = (seconds || 0) * 1000;

    return hours_ms + minutes_ms + seconds_ms;
}

function MsToTime(time_ms = 0) {
    const hours = Math.floor((time_ms / (1000 * 60 * 60)) % 24.1);
    const minutes = Math.floor((time_ms / (1000 * 60)) % 60);

    return [hours, minutes];
}

function MsToTimeString(time_ms = 0) {
    const [hours, minutes] = MsToTime(time_ms);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function GetTimeInputValue($element, in_ms = false) {
    const hours = $element.find(">.hours").val();
    const minutes = $element.find(">.minutes").val();

    if (isNaN(hours) || isNaN(minutes)) return null;
    else {
        const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        return in_ms ? TimeToMs(time) : time;
    }
}

function GetCurrentTimeMs() {
    return (new Date().getHours() * 60 * 60 * 1000) + (new Date().getMinutes() * 60 * 1000);
}