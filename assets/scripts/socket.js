const socket = io(api_url, {
    path: "/socket/company",
    query: {
        Hostname: window.hostname,
        Authorization: `Bearer ${sessionStorage.token || localStorage.token}`
    },
    transports: ['websocket', 'polling', 'flashsocket'],
});

console.warn("[Socket] token query is deprecated!");

socket.on('connect', function () {
    console.log("Connected to (" + api_url + ")!");
    if (window.cur_tab === "pedidos" && typeof GetOrders === "function") GetOrders();
    $(".header-actions>.connection>span").text("Checando").parent().removeClass("down");
    $(".user-settings .avatar .status").removeClass("offline online away").addClass("online");

    company.is_online = true;
});

socket.on("reconnect", () => {
    console.log("Reconnected to (" + api_url + ")! Checking for new updates...");
    $(".user-settings .avatar .status").removeClass("offline online away").addClass("online");
});

socket.on('connect_failed', function () {
    console.log("Failed to connect to (" + api_url + ")!");
    $(".header-actions>.connection>span").text("FAIL").parent().addClass("down");
    $(".user-settings .avatar .status").removeClass("offline online away").addClass("offline");
});

socket.on('error', function (error) {
    console.log("Socket error:", error);
    $(".header-actions>.connection>span").text("ERRO").parent().addClass("down");
    $(".user-settings .avatar .status").removeClass("offline online away").addClass("offline");
});

socket.on('disconnect', function () {
    console.log("Connection lost!");
    $(".header-actions>.connection>span").text("OFFLINE").parent().addClass("down");
    $(".user-settings .avatar .status").removeClass("offline online away").addClass("offline");
});

socket.on("new_order", (order) => {
    orders.push(order);

    if (!!$(".container-food_pedidos>.left").length) FetchAPI(`/order`, {
        params: { limit: 0 }
    }).then(orders_data => {
        $(".container-food_pedidos>.left .orders>span").text(`Pedidos: ${orders_data.metadata.max}`);
        $(".container-food_pedidos>.left .total_price>span").text(`Total: ${MoneyFormat(orders_data.metadata.total)}`);
    });

    if (orders.length == 1 && typeof viewOrder === "function") {
        const $order = addOrder(order);
        $order.click();
    } else {
        const $order = addOrder(order);
        $order.insertBefore(".container-food_pedidos>.left>.list>div:first-child");
    }
});

socket.on("status_updated", (online) => {
    if (company.online_check && online == false) SetStatus(true);
});

function GetLatency(callback) {
    if (socket.disconnected) return null;
    const t1 = Date.now();
    socket.emit("latency", () => callback(Date.now() - t1));
}

function CheckLatencyLoop() {
    GetLatency(latency => {
        if (!latency) return;
        if (latency > 9999) {
            $(".header-actions>.connection>span").text("9999+ ms").parent().addClass("down");
        } else {
            $(".header-actions>.connection").css("background-color", LatencyToColor(latency, 600)).removeClass("down");
            $(".header-actions>.connection>span").text(`${latency} ms`);
        }
    });

    setTimeout(CheckLatencyLoop, 1000);
}

CheckLatencyLoop();

async function SetStatus(online) {
    return new Promise((resolve) => {
        if (typeof online !== "boolean") return resolve(false);

        socket.emit("online_status", online, () => {
            company.is_online = online;
            console.log(`Status alterado para "${online ? "Online" : "Offline"}"`);

            $(".user-settings .avatar .status").removeClass("offline online away").addClass(online ? "online" : "offline");

            resolve(true);
        });
    });
}