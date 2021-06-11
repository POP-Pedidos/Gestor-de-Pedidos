function InitializeMap() {
    const $map_container = $(".company-address-editor .map-container");
    const $map = $map_container.find(">.map-content");

    if ($map.data("map")) return $map.data("map");

    mapboxgl.accessToken = "pk.eyJ1IjoiamFvdml0dWJyIiwiYSI6ImNrbnVueDl5dTBieGoycGw0bGN1aTBsd24ifQ.Qnq3uyK0TMPEggR-YjVTsQ";
    
    const map = new mapboxgl.Map({
        container: $map[0],
        style: "mapbox://styles/jaovitubr/ckprcdsls0ai817s9zx9tpbr3",
        center: [-55.93555397627117, -8.272111872941013],
        zoom: 12,
        attributionControl: false,
        scrollZoom: { around: "center" }
    });

    $map.data({ map });

    const $coordinates = $map_container.find(".coordinates");

    map.on("load", function () {
        $(".company-address-editor>div>.map").removeClass("loading");
        map.resize();

        function onDown(e) {
            $map_container.addClass("dragging");
        }

        function onUp(e) {
            $map_container.removeClass("dragging");
            $("#map>.footer>button").attr("disabled", false);
        }

        function onMove(e) {
            const coords = map.getCenter();

            $coordinates.show().html(`Latitude: ${coords.lat}<br>Longitude: ${coords.lng}`);
        }

        map.on("move", onMove);
        onMove();

        map.on("mouseover", onUp);

        map.on("mousedown", onDown);
        map.on("mouseup", onUp);

        map.on("touchstart", onDown);
        map.on("touchend", onUp);

    });

    return map;
}