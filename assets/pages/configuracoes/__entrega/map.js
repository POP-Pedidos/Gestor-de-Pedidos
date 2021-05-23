class DeliveryMap {
    constructor(map_selector) {
        this.company_location = new google.maps.LatLng(...company.location.split(",").map(n => parseFloat(n)));

        this.map = new google.maps.Map(document.querySelector(map_selector), {
            center: this.company_location,
            zoom: 16,
            mapTypeId: 'roadmap',
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false
        });

        const styledMapType = new google.maps.StyledMapType(
            [{
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }]
                },
                {
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#bdbdbd"
                    }]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#eeeeee"
                    }]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#e5e5e5"
                    }]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#ffffff"
                    }]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#dadada"
                    }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                },
                {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#e5e5e5"
                    }]
                },
                {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#eeeeee"
                    }]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#c9c9c9"
                    }]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#b3e5fb"
                    }]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#5494c0"
                    }]
                }
            ], {
                name: "Styled Map"
            });

        this.map.mapTypes.set("styled_map", styledMapType);
        this.map.setMapTypeId("styled_map");
    }

    drawRangeCircles() {
        function drawCircle(point, radius, dir) {
            var d2r = Math.PI / 180; // degrees to radians
            var r2d = 180 / Math.PI; // radians to degrees
            var earthsradius = 3963; // 3963 is the radius of the earth in miles

            var points = 32;

            // find the raidus in lat/lon
            var rlat = (radius / earthsradius) * r2d;
            var rlng = rlat / Math.cos(point.lat() * d2r);

            var extp = new Array();
            if (dir === 1) {
                var start = 0;
                var end = points + 1; // one extra here makes sure we connect the path
            } else {
                var start = points + 1;
                var end = 0;
            }
            for (var i = start;
                (dir === 1 ? i < end : i > end); i = i + dir) {
                var theta = Math.PI * (i / (points / 2));
                var ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
                var ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
                extp.push(new google.maps.LatLng(ex, ey));
            }

            return extp;
        }

        const lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 2
        };

        const radius = 1000;

        for (let i = 1; i <= 3; i++) {
            new google.maps.Polyline({
                map: this.map,
                path: drawCircle(this.company_location, (i * radius) / 1609.344, 1),
                strokeOpacity: 0,
                icons: [{
                    icon: lineSymbol,
                    offset: '0',
                    repeat: '10px'
                }],
                strokeWeight: 1,
                strokeColor: "#aaaaaa",
            });
        }
    }

    highlightCityArea() {
        const url = new URL("https://nominatim.openstreetmap.org/search.php");

        url.search = new URLSearchParams({
            country: "Brazil",
            city: company.city,
            state: company.state,
            polygon_geojson: 1,
            format: "json",
            limit: 1,
        });

        fetch(url).then(response => response.json()).then(data => {
            const delimiters = data[0].geojson.coordinates[0];
            const paths = delimiters.map(path => {
                return {
                    lng: path[0],
                    lat: path[1],
                }
            });

            const highlightArea = new google.maps.Polygon({
                paths,
                strokeColor: '#0cb50c',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: '#0cb50c',
                fillOpacity: 0.1
            });

            highlightArea.setMap(this.map);
        });
    }
}