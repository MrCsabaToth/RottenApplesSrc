(function (window) {
    var ViewModel = function () {
        var self = this;
        self.initialized = false;
        self.is_spanish = false;
        self.pins = [ { "lat":  36.740769, "lon": -119.798396, "name": "Tokyo Garden", "marker": null },
                      { "lat":  36.743409, "lon": -119.798075, "name": "Fajita Fiesta", "marker": null },
                      { "lat":  36.741715, "lon": -119.796637, "name": "Toledo's Mexican", "marker": null } ];
        self.map = null;
        self.marker = [];

        self.handleNoGeolocation = function(errorFlag) {
            if (errorFlag) {
                var content = viewModel.is_spanish ? "Error: Ubicaci&oacute;n encontrado" : "Error: El servicio de Geolocalizaci&oacute;n fracas&oacute;.";
            } else {
                var content = viewModel.is_spanish ? "Ubicaci&oacute;n encontrado" : "Error: Su navegador no soporta geolocalizaci&oacute;n.";
            }

            var options = {
                map: self.map,
                position: new google.maps.LatLng(60, 105),
                content: content
            };

            var infowindow = new google.maps.InfoWindow(options);
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
                content: pindata.name +
                    '<br>Latitude: ' + latlon.lat() +
                    '<br>Longitude: ' + latlon.lng()
            });
            google.maps.event.addListener(marker, 'click', function() {
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
        //if (!(ej.browserInfo().name == "msie" && ej.browserInfo().version < 9)) {
            $('#nestedradialmenu').ejRadialMenu({
                imageClass: "imageclass",
                backImageClass: "backimageclass",
                targetElementId: "map-canvas",
                mouseUp: "menuclick"
            });
        //}
        //} else {
        //    $("#contentDiv").html("Radial Menu is only supported from Internet Explorer Versioned 9 and above.").css({ "font-size": "20px", "color": "red" });
        //}

        window.initializeMaps = function() {
            var mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(36.742130, -119.795411)
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            viewModel.map = map;

            // Try HTML5 geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude,
                                                     position.coords.longitude);

                    var infowindow = new google.maps.InfoWindow({
                        map: viewModel.map,
                        position: pos,
                        content: viewModel.is_spanish ? "Ubicaci&oacute;n encontrado" : "Location found using HTML5."
                    });

                    map.setCenter(pos);
                    map.setZoom(18);
                    Pace.stop();

                    // Place pins
                    //for(var i = 0; i < viewModel.pins.length; i++) {
                    //    viewModel.placeMarker(viewModel.pins[i]);
                    //}

                    var search_input = /** @type {HTMLInputElement} */(
                        document.getElementById('pac-input'));
                    map.controls[google.maps.ControlPosition.TOP_LEFT].push(search_input);
                    var searchBox = new google.maps.places.SearchBox(
                        /** @type {HTMLInputElement} */(search_input));
                    google.maps.event.addListener(searchBox, 'places_changed', function() {
                        var keyword = $("#pac-input").val();
                        console.log("search keywrod: " + keyword);
                        $.ajax({
                            type: "POST",
                            url: "http://d6cfa80b.ngrok.io/hospitals_list?filter=" + keyword,
                            data: JSON.stringify(""),
                            processData: false,
                            contentType: "application/json",
                            dataType: "json"
                        }).success(function (returnData) {
                            console.log("Success! " + returnData);
                            // Clear existing markers
                            //marker.setMap(null);

                            var retJson = JSON.parse(returnData);
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
            scriptsrc = 'https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&sensor=true"; // Intentionally not initialize places library so it wont interfere with us &libraries=places';
            if (viewModel.is_spanish)
                scriptsrc += "&language=es";
            scriptsrc += '&callback=initializeMaps';
            script.src  = scriptsrc;
            document.body.appendChild(script);
            //document.getElementsByTagName('head')[0].appendChild(script);
        });
    });
} (window));

