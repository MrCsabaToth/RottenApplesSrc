(function (window) {
    var ViewModel = function () {
        var self = this;
        self.is_spanish = false;
        self.marker = [];
        //[ { "lat":  36.740769, "lon": -119.798396, "name": "Tokyo Garden", "marker": null },
        //  { "lat":  36.743409, "lon": -119.798075, "name": "Fajita Fiesta", "marker": null },
        //  { "lat":  36.741715, "lon": -119.796637, "name": "Toledo's Mexican", "marker": null } ];
        self.map = null;

        self.handleNoGeolocation = function(errorFlag) {
            if (errorFlag) {
                var content = viewModel.is_spanish ? "Error: El servicio de Geolocalizaci&oacute;n fracas&oacute;." : "Error: The Geolocation service failed.";
            } else {
                var content = viewModel.is_spanish ? "Error: Su navegador no soporta geolocalizaci&oacute;n." : "Error: Your browser doesn't support geolocation.";
            }

            var infowindow = new google.maps.InfoWindow({
                map: self.map,
                content: content
            });
            map.setCenter(options.position);
            Pace.stop();
        };

        self.initialize = function() {
            $("#languageDialog").modal("show");
        };

        self.placeMarker = function(pindata) {
            var latlon = new google.maps.LatLng(pindata.lat, pindata.lon);
            var marker = new google.maps.Marker({
                position: latlon,
                icon: 'img/apple-map-pin.png',
                map: self.map,
                animation: google.maps.Animation.DROP
            });
            self.marker.push(marker);
            var infowindow = new google.maps.InfoWindow({
                map: self.map,
                content: pindata.name +
                    '<br>Latitude: ' + latlon.lat() +
                    '<br>Longitude: ' + latlon.lng()
            });
            google.maps.event.addListener(marker, 'click', function() {
                //$('#nestedradialmenu').ejRadialMenu("show");
                infowindow.open(self.map, marker);
            });
        };
    };

    $(document).ready(function() {
        Pace.start();
        var viewModel = new ViewModel();
        viewModel.initialize();

        $("#spanishbtn").click(function() {
            viewModel.is_spanish = true;
            $("#languageDialog").modal("hide");
        });

        window.menuclick = function(evt) {
            $('#nestedradialmenu').ejRadialMenu("menuHide");
        };
        if (!(ej.browserInfo().name == "msie" && ej.browserInfo().version < 9)) {
            $('#nestedradialmenu').ejRadialMenu({
                imageClass: "imageclass",
                backImageClass: "backimageclass",
                targetElementId: "map-canvas",
                mouseUp: "menuclick"
            });
        }

        window.initializeMaps = function() {
            var mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(36.742130, -119.795411)
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            viewModel.map = map;

            if (ej.browserInfo().name == "msie" && ej.browserInfo().version < 9) {
                var infowindow = new google.maps.InfoWindow({
                    map: self.map,
                    content: viewModel.is_spanish ?
                        "Radial Men&uacute; requerido para esta aplicaci&oacute;n s&oacute;lo es compatible con versi&oacute;n de Internet Explorer 9 y superiores." :
                        "Radial Menu required for this application is only supported from Internet Explorer Versioned 9 and above."
                });
            }

            // Try HTML5 geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude,
                                                     position.coords.longitude);

                    var infowindow = new google.maps.InfoWindow({
                        map: viewModel.map,
                        position: pos,
                        content: viewModel.is_spanish ? "Ubicaci&oacute;n encontrado usando HTML5" : "Location found using HTML5."
                    });

                    map.setCenter(pos);
                    map.setZoom(18);
                    Pace.stop();

                    var search_input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
                    map.controls[google.maps.ControlPosition.TOP_LEFT].push(search_input);
                    var searchBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */(search_input));
                    google.maps.event.addListener(searchBox, 'places_changed', function() {
                        var keyword = $("#pac-input").val().replace(/\W /g, '');
                        console.log("search keywrod: " + keyword);
                        $.ajax({
                            type: "POST",
                            url: "http://d6cfa80b.ngrok.io/hospitals_list?filter=" + keyword,
                            data: JSON.stringify(""),
                            processData: false,
                            contentType: "application/json",
                            dataType: "json"
                        }).success(function (returnData) {
                            var retJson = JSON.parse(returnData);
                            console.log("Success, got " + retJson.length + " entries");

                            // Clear existing markers
                            //marker.setMap(null);

                            for(var i = 0; i < retJson.length; i++) {
                                markers = [];
                                var bounds = new google.maps.LatLngBounds();
                                self.placeMarker({"lat":  new Number(retJson[i].LATITUDE), "lon": new Number(retJson[i].LONGITUDE), "name": retJson[i].name, "content": retJson[i], "marker": null});
                                bounds.extend(new google.maps.LatLng(new Number(retJson[i].LATITUDE), new Number(retJson[i].LONGITUDE)));
                                map.fitBounds(bounds);
                            }
                        }).error(function (data) {
                            console.log("Error: " + data.responseText);
                        });
                    });
                }, function() {
                    viewModel.handleNoGeolocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                viewModel.handleNoGeolocation(false);
            }
        };

        $('#languageDialog').on('hidden.bs.modal', function () {
            var script  = document.createElement('script');
            script.type = "text/javascript";
            scriptsrc = 'https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&sensor=true';
            // Intentionally not initializing places library so it wont interfere with us - &libraries=places';
            if (viewModel.is_spanish)
                scriptsrc += "&language=es";
            scriptsrc += '&callback=initializeMaps';
            script.src  = scriptsrc;
            document.body.appendChild(script);
            //document.getElementsByTagName('head')[0].appendChild(script);
        });
    });
} (window));

