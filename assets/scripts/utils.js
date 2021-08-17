const FetchAPI = (uri, config = {}) => {
    const controller = new AbortController();

    const promise = new Promise(async (resolve, reject) => {
        if (!uri.startsWith("http")) uri = `${api_url}${uri}`;

        const url = new URL(uri);

        if (config.params) {
            Object.keys(config.params).forEach(key => config.params[key] === undefined && delete config.params[key]);

            url.search = new URLSearchParams(config.params);
        }

        config.raw_error = !!config.raw_error ? String(config.raw_error) == "true" : false;

        config.headers = Object.assign({
            "Authorization": `Bearer ${sessionStorage.token || localStorage.token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }, config.headers);

        config.body = JSON.stringify(config.body);

        config.signal = controller.signal;

        function ErrorHandler(error, raw) {
            if (typeof logout === "function" && error === "invalid token" || error === "expired token") {
                Swal.fire("Opss!", `A sua sessão não é válida!<br>É necessário logar novamente!`, "warning").then(() => logout());
            } else if (typeof logout === "function" && error === "expired plan") {
                Swal.fire("Opss!", `O seu plano expirou!<br>É necessário logar novamente!`, "warning").then(() => logout());
            }
            else reject(config.raw_error ? raw : error);
        }

        const tab_instance_id = window.tab_instance;
        let check_interval;

        if (config.instance_check === true) {
            check_interval = setInterval(() => {
                if (tab_instance_id !== window.tab_instance) controller.abort();
            }, 100);
        }

        fetch(url, config)
            .then(response => {
                if ((response.status >= 200 && response.status < 300) || [400, 401, 409].includes(response.status)) return Promise.resolve(response);
                else return Promise.reject(new Error(response.statusText));
            })
            .then(response => response.json())
            .then(json => {
                if (config.instance_check === true && tab_instance_id !== window.tab_instance) return;

                if (json && json.success) resolve(json.data);
                else ErrorHandler(json.error, json);
            }).catch(err => {
                if (config.instance_check === true && tab_instance_id !== window.tab_instance) return;

                if (err.name !== "AbortError") ErrorHandler(err.message || err, err);
            }).finally(() => {
                clearInterval(check_interval);
            });
    });

    promise.abort = () => controller.abort();

    return promise
}

function FormatTell(number) {
    function pad(count, padRight = 0) {
        return number.slice(number.length - (count + padRight), number.length - padRight);
    }

    if (number.length === 13) {
        return `(${pad(2, 9)}) ${pad(1, 8)} ${pad(4, 4)}-${pad(4)}`;
    } else if (number.length === 12) {
        return `(${pad(2, 8)}) ${pad(4, 4)}-${pad(4)}`;
    } else {
        return number;
    }
}

function nFormatter(num, digits = 2) {
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "K" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

(function ($) {
    $.fn.serializeFormJSON = function () {

        let o = {};
        let a = this.serializeArray();

        $.each(a, function () {
            if (this.value === "on") this.value = true;
            else if (this.value === "off") this.value = false;

            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });

        this.find('input[type=checkbox]:not(:checked)').map(function () {
            o[this.name] = false;
        });

        return o;
    };
})(jQuery);

(function ($) {
    $.fn.boo = function (message = "") {
        this.html(`<div class="boo-container"><div class="boo-wrapper"><div class="boo"><div class="face"></div></div><div class="shadow"></div><h1>Ops!</h1><p>${message}</p></div></div>`)
        return this.find(">.boo-container");
    };
})(jQuery);

function MoneyFormat(money, is_currency = true, fractionDigits = 2) {
    let money_str = new Intl.NumberFormat("pt-BR", {
        style: is_currency ? "currency" : "decimal",
        currency: 'BRL',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(money);

    return money_str;
}

function MakeID(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function RemainMillisecondsToTimeString(miliseconds) {
    var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

    total_seconds = parseInt(Math.floor(miliseconds / 1000));
    total_minutes = parseInt(Math.floor(total_seconds / 60));
    total_hours = parseInt(Math.floor(total_minutes / 60));
    days = parseInt(Math.floor(total_hours / 24));

    seconds = parseInt(total_seconds % 60);
    minutes = parseInt(total_minutes % 60);
    hours = parseInt(total_hours % 24);

    // { d: days, h: hours, m: minutes, s: seconds };
    if (days > 1) {
        return `${days} Dias e ${hours} Horas`;
    } else if (hours >= 1) {
        return `${hours} Horas e ${minutes} Minutos`;
    } else if (minutes >= 1) {
        return `${minutes} Minutos`;
    } else if (seconds >= 1) {
        return `${seconds} Segundos`;
    } else {
        return `Agora`;
    }
};

function FormatDate(date, time = true) {
    if (!date) return null;

    const cur_date = new Date();
    const cur_day = new Intl.DateTimeFormat("pt-br", { day: 'numeric' }).format(cur_date);

    const datetime = new Date(date);

    const day = new Intl.DateTimeFormat("pt-br", { day: 'numeric' }).format(datetime);
    const month = new Intl.DateTimeFormat("pt-br", { month: 'long' }).format(datetime);
    const year = new Intl.DateTimeFormat("pt-br", { year: 'numeric' }).format(datetime);
    const hours = new Intl.DateTimeFormat("pt-br", { hour: 'numeric' }).format(datetime);
    const minutes = new Intl.DateTimeFormat("pt-br", { minute: 'numeric' }).format(datetime);

    let final_string = "";

    const today = cur_day == day;
    const yesterday = cur_day == day + 1;

    if (today) final_string += `Hoje`;
    else if (yesterday) final_string += `Ontem`;
    else final_string += `${day} de ${month} de ${year}`;

    if (time == true) final_string += ` as ${`00${hours}`.slice(-2)}:${`00${minutes}`.slice(-2)}`;

    return final_string;
}

function FormatSimpleDate(date) {
    if (!date) return null;
    date = new Date(date);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

function FormatCnpjCpf(cnpjcpf) {
    if (!cnpjcpf || cnpjcpf.length < 5) return cnpjcpf;

    const cnpjCpf = cnpjcpf.replace(/\D/g, "");

    if (cnpjCpf.length === 11) return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3-\$4");
    else return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3/\$4-\$5");
}

function DateTimeFormat(date) {
    if (!date) return "";

    return new Date(date).toLocaleString();
}

function NumberToExtenso(val, c = false) {
    if (!val) return "";
    val = val.toString();

    var ex = [
        ["zero", "um", "dois", "tr?s", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
        ["dez", "vinte", "trinta", "quarenta", "cinq?enta", "sessenta", "setenta", "oitenta", "noventa"],
        ["cem", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
        ["mil", "milh?o", "bilh?o", "trilh?o", "quadrilh?o", "quintilh?o", "sextilh?o", "setilh?o", "octilh?o", "nonilh?o", "decilh?o", "undecilh?o", "dodecilh?o", "tredecilh?o", "quatrodecilh?o", "quindecilh?o", "sedecilh?o", "septendecilh?o", "octencilh?o", "nonencilh?o"]
    ];
    var a, n, v, i, n = val.replace(c ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = "real", d = "centavo", sl;
    for (var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []) {
        j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
        if (!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
        for (a = -1, l = v.length; ++a < l; t = "") {
            if (!(i = v[a] * 1)) continue;
            i % 100 < 20 && (t += ex[0][i % 100]) ||
                i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
            s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
                ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("?o", "?es") : ex[3][t]) : ""));
        }
        a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
        a && r.push(a + (c ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
    }
    return r.join(e);
}

function diff_minutes(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

function ArrayAssign(array, new_data, where) {
    const index = array.findIndex(where);

    if (array[index]) array[index] = Object.assign(array[index], new_data);
}

function ArrayRemoveIndex(array, where, length = 1) {
    return array.splice(array.findIndex(where), length);
}

function ArrayChange(array, new_data, where) {
    const index = array.findIndex(where);
    if (array[index]) array[index] = new_data;

    return array ? array[index] : null;
}

function randomChoice(val) {
    return val[Math.floor(Math.random() * val.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function DateSubtract(d1, d2 = new Date()) {
    return Math.abs(d1 - d2);
}

function MillisecondsToTimeString(milliseconds) {
    var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

    total_seconds = parseInt(Math.floor(milliseconds / 1000));
    total_minutes = parseInt(Math.floor(total_seconds / 60));
    total_hours = parseInt(Math.floor(total_minutes / 60));
    days = parseInt(Math.floor(total_hours / 24));

    seconds = parseInt(total_seconds % 60);
    minutes = parseInt(total_minutes % 60);
    hours = parseInt(total_hours % 24);

    // { d: days, h: hours, m: minutes, s: seconds };
    if (days > 1) {
        return `Ha ${days} Dias e ${hours} Horas atrás`;
    } else if (hours >= 1) {
        return `Ha  ${hours} Horas e ${minutes} Minutos atrás`;
    } else if (minutes >= 1) {
        return `Ha  ${minutes} Minutos atrás`;
    } else if (seconds >= 1) {
        return `Ha  ${seconds} Segundos atrás`;
    } else {
        return `Agora mesmo`;
    }
}

function MillisecondsToDate(milliseconds) {
    var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

    total_seconds = parseInt(Math.floor(milliseconds / 1000));
    total_minutes = parseInt(Math.floor(total_seconds / 60));
    total_hours = parseInt(Math.floor(total_minutes / 60));

    days = parseInt(Math.floor(total_hours / 24));
    hours = parseInt(total_hours % 24);
    minutes = parseInt(total_minutes % 60);
    seconds = parseInt(total_seconds % 60);

    // { d: days, h: hours, m: minutes, s: seconds };
    if (days >= 1) {
        return `Há ${days} dia${days > 1 ? "s" : ""}`;
    } else if (hours >= 1) {
        return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
    } else if (minutes >= 1) {
        return `Há ${minutes} min`;
    } else {
        return `Há ${seconds} seg`;
    }
}

function LatencyToColor(latency, max = 500) {
    if (latency < 0 || latency > max) latency = max;
    const perc = (latency / max) * 100;

    let r, g, b = 0;
    if (perc < 50) {
        r = 255;
        g = Math.round(5.1 * perc);
    } else {
        g = 255;
        r = Math.round(510 - 5.10 * perc);
    }
    let h = r * 0x100 + g * 0x10000 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

function AddLocalPrinter(id, device) {
    let local_data = [];
    try {
        local_data = JSON.parse(localStorage.getItem("printers")) || [];
    } catch { }

    const existent_printer = local_data.findIndex(printer => printer.id === id);

    if (existent_printer > -1) local_data[existent_printer].device = device;
    else local_data.push({ id, device });

    localStorage.setItem("printers", JSON.stringify(local_data));
}

function RemoveLocalPrinter(id) {
    let local_data = [];
    try {
        local_data = JSON.parse(localStorage.getItem("printers")) || [];
    } catch { }

    local_data = local_data.filter(printer => printer.id === id);

    localStorage.setItem("printers", JSON.stringify(local_data));
}

function GetLocalPrinter(id) {
    let local_data = [];
    try {
        local_data = JSON.parse(localStorage.getItem("printers")) || [];
    } catch { }

    return local_data.find(printer => printer.id == id)?.device;
}

(function () {
    LevenshteinDistance = function (a, b) {
        if (a.length == 0) return b.length;
        if (b.length == 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    };
})();


function ArrayMove(array, where, dislocation = 1) {
    const index = array.findIndex(where);

    const value = array[index];
    if (!value) return;

    array[index] = array[index + dislocation];
    array[index + dislocation] = value;

    return array ? array : null;
}

function hexBrightness(hex, percent) {
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length == 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    const r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
        ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

const Sleep = (time = 1000) => {
    return new Promise((resolve) => setTimeout(resolve, Number(time)));
}

class LazyLoading {
    constructor(props = {}) {
        this.handlers = [];
        this.destroy_handlers = [];

        this.props = props;
        this.container = $(props.container);
        this.threshold = this.props.threshold || 0.2;
        this.doHandle = this.props.doHandle;
        this.doLoop = parseInt(this.props.doLoop);

        this.state = typeof this.props.state === "object" ? Object.assign({}, this.props.state) : null;

        if (typeof this.props.doHandle === "function") this.doHandle = this.props.doHandle;
        else if (!!this.props.doHandle) throw new Error("doHandle is not a function");
    }

    Init() {
        this.tab_instance = window.tab_instance;
        this.scroll_event_namespace = `scroll.${this.tab_instance}`;
        this.container = $(this.props.container);

        this.container.on(this.scroll_event_namespace, (e) => this.handleEvent(e));

        if (this.doHandle) this.container.trigger(this.scroll_event_namespace);

        this.instance_check_interval = setInterval(() => {
            if (!$(this.props.container).length || window.tab_instance !== this.tab_instance) {
                clearInterval(this.instance_check_interval);
                this.Destroy();
            }
        }, 100);
    }

    Trigger() {
        this.container.trigger(this.scroll_event_namespace);
    }

    addState(obj) {
        this.state = Object.assign(this.state, obj);
    }

    Reset(destroy_options) {
        this.Destroy({ state: true, ...destroy_options });
        this.Init();
    }

    handleEvent(e) {
        const container = this.container[0];

        this.scroll_top = container.scrollTop;
        this.scroll_max = container.scrollHeight - container.clientHeight;

        if (this.scroll_top >= (this.scroll_max - (this.scroll_max * this.props.threshold))) {
            for (let i = 0; i < (this.doLoop || 1); i++) {
                if (this.doHandle && this.doHandle.bind(this)(this.state) === false) return;

                for (const handler of this.handlers) {
                    try {
                        handler.bind(this)(this.state);
                    } catch (ex) {
                        throw ex;
                    }
                }
            }
        }
    }

    Destroy(destroy_options = { state: true }) {
        this.container.unbind(this.scroll_event_namespace);

        clearInterval(this.instance_check_interval);

        if (!!destroy_options.state) {
            this.state = typeof this.props.state === "object" ? Object.assign({}, this.props.state) : null;
        }
    }

    set onHandle(callback) {
        if (typeof callback === "function") this.handlers.push(callback);
        else throw new Error("onHandle is not a function");
    }
}