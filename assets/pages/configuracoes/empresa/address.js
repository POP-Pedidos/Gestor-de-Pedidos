var autocomplete;

function initMap() {
    const input = document.querySelector("#configuracoes_empresa input.address");

    autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.setTypes(["establishment", "geocode"]);
    autocomplete.setComponentRestrictions({ "country": "br" });

    autocomplete.addListener("place_changed", function () {
        const place = autocomplete.getPlace();
        const selected_place = FormatPlaceResponse(place);

        FetchAPI("/company", {
            method: "PUT",
            body: selected_place
        }).then(data => {
            company = data;
        }).catch(error => {
            if (!error) return;
            Swal.fire("Opss...", `Ocorreu um erro ao tentar atualizar a empresa!`, "error");
            Swal.showValidationMessage(error);
        });
    });

    setTimeout(() => {
        input.value = company.address;
    }, 1000);
}

function FormatPlaceResponse(place) {
    function GetType(type_name, long_name = true) {
        const component = place.address_components.find(component => component.types.includes(type_name));

        return !!component ? long_name ? component.long_name : component.short_name : null;
    }

    return {
        place_id: place.place_id,
        address: place.formatted_address,
        city: GetType("administrative_area_level_2"),
        neighborhood: GetType("neighborhood") || GetType("sublocality_level_1"),
        state: GetType("administrative_area_level_1"),
        street: GetType("street_address") || GetType("route"),
        street_number: GetType("street_number"),
        postal_code: GetType("postal_code"),
        location: `${place.geometry.location.lat()},${place.geometry.location.lng()}`,
    }
}

initMap();