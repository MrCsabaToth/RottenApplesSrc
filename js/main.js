(function (window) {
    function MarkerData(id, latStr, lngStr, name, data) {
        var self2 = this;
        self2.id = id;
        self2.name = name;
        self2.latlng = new google.maps.LatLng(new Number(latStr), new Number(lngStr));
        self2.data = data;
        self2.marker = null;
    }

    var ViewModel = function () {
        var self = this;
        self.isSpanish = false;
        self.markers = [];
        self.map = null;
        self.welcomeText = "";
        self.radialMissingInfoWindow = null;
        self.bitwisePos = null;

        self.handleNoGeolocation = function(errorFlag) {
            var content = "";
            if (errorFlag) {
                content += self.isSpanish ? "No era capaz de determinar su ubicaci&oacute;n con el servicio de geolocalizaci&oacute;n." : "Wasn't able to determine your location with the geolocation service.";
            } else {
                content += self.isSpanish ? "Su navegador no soporta geolocalizaci&oacute;n." : "Your browser doesn't support geolocation.";
            }

            self.postInitialize(null);
            Pace.stop();

            var infowindow = new google.maps.InfoWindow({
                map: self.map,
                position: self.bitwisePos,
                content: content + "<br>" + self.welcomeText
            });
            infowindow.open(self.map);
        };

        self.preInitialize = function() {
            $("#languageDialog").modal("show");
        };

        self.postInitialize = function(pos) {
            self.map.setZoom(18);
            if (pos) {
                var infowindow = new google.maps.InfoWindow({
                    map: self.map,
                    position: pos,
                    content: (self.isSpanish ? "Ubicaci&oacute;n encontrado usando HTML5"
                        : "Location found using HTML5.") + "<br>" + self.welcomeText
                });
                infowindow.open(self.map);
            }

            Pace.stop();
            $($(".gm-style")[0]).attr("id", "gmInner");

            var search_input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
            self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(search_input);
            var searchBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */(search_input));
            google.maps.event.addListener(searchBox, 'places_changed', function() {
                var keyword = $("#pac-input").val().replace(/\W /g, '');
                console.log("search keywrod: " + keyword);
                //$.ajax({
                //    type: "POST",
                //    url: "http://d6cfa80b.ngrok.io/hospitals_list?filter=" + keyword,
                //    data: JSON.stringify(""),
                //    processData: false,
                //    contentType: "application/json",
                //    dataType: "json"
                //}).success(function (returnData) {
                    var retJson = //JSON.parse(returnData);
                        [ { "LATITUDE":  36.740769, "LONGITUDE": -119.798396, "name": "Tokyo Garden", "marker": null },
                          { "LATITUDE":  36.743409, "LONGITUDE": -119.798075, "name": "Fajita Fiesta", "marker": null },
                          { "LATITUDE":  36.741715, "LONGITUDE": -119.796637, "name": "Toledo's Mexican", "marker": null } ];

                    console.log("Success, got " + retJson.length + " entries");

                    // Clear existing markers
                    for(var i = 0; i < self.markers.length; i++) {
                        self.markers[i].marker.setMap(null);
                    }
                    self.markers = [];

                    var bounds = new google.maps.LatLngBounds();
                    for(var i = 0; i < retJson.length; i++) {
                        var markerData = new MarkerData(i, retJson[i].LATITUDE, retJson[i].LONGITUDE, retJson[i].name, retJson[i]);
                        self.placeMarker(markerData);
                        bounds.extend(markerData.latlng);
                    }
                    self.map.fitBounds(bounds);
                //}).error(function (data) {
                //    console.log("Error: " + data.responseText);
                //});
            });
        };

        self.placeMarker = function(markerData) {
            var marker = new google.maps.Marker({
                position: markerData.latlng,
                icon: 'img/apple-map-pin.png',
                map: self.map,
                animation: google.maps.Animation.DROP
            });
            markerData.marker = marker;
            self.markers.push(markerData);
            if (ej.browserInfo().name == "msie" && ej.browserInfo().version < 9) {
                self.radialMissingInfoWindow = new google.maps.InfoWindow({
                    map: self.map,
                    content: self.isSpanish ?
                        "El componente de men&uacute; radial no est&aacute; disponible en su navegador. Utilice Firefox, Chrome, Safari, Edge o la versi&oacute;n m&aacute;s reciente de Internet Explorer" :
                        "The radial menu component is not available on your browser. Please use Firefox, Chrome, Safari, Edge or newer version of Internet Explorer"
                });
            }
            google.maps.event.addListener(marker, 'click', function() {
                if (ej.browserInfo().name == "msie" && ej.browserInfo().version < 9) {
                    viewModel.radialMissingInfoWindow.open(self.map, marker);
                } else {
                    self.radialItems = [
                        { "imageUrl": "themes/images/RadialMenu/copy.png", "text": "Copy" },
                        { "imageUrl": "themes/images/RadialMenu/font.png", "text": "Font" },
                        { "imageUrl": "themes/images/RadialMenu/f1.png", "text": "Italic", "items": [
                                        { "imageUrl": "themes/images/RadialMenu/f2.png", "text": "Bold" },
                                        { "imageUrl": "themes/images/RadialMenu/font.png", "text": "Font" },
                                        { "imageUrl": "themes/images/RadialMenu/f1.png", "text": "Italic"}]
                        }];
                    $('#nestedradialmenu').ejRadialMenu({
                        imageClass: "imageclass",
                        backImageClass: "backimageclass",
                        targetElementId: "gmInner", // "map-canvas",  // "gmInner"
                        mouseUp: "menuclick",
                        items: self.radialItems
                    });
                    $('#nestedradialmenu').ejRadialMenu("show");
                }
            });
        };
    };

    $(document).ready(function() {
        Pace.start();
        var viewModel = new ViewModel();
        viewModel.preInitialize();

        $("#spanishbtn").click(function() {
            viewModel.isSpanish = true;
            $("#languageDialog").modal("hide");
        });

        window.menuclick = function(evt) {
            $('#nestedradialmenu').ejRadialMenu("menuHide");
        };

        window.initializeMaps = function() {
            viewModel.bitwisePos = new google.maps.LatLng(36.742130, -119.795411);
            var mapOptions = {
                zoom: 12,
                center: viewModel.bitwisePos
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            viewModel.map = map;

            if (ej.browserInfo().name == "msie" && ej.browserInfo().version < 9) {
                var infowindow = new google.maps.InfoWindow({
                    map: viewModel.map,
                    content: viewModel.isSpanish ?
                        "Radial Men&uacute; requerido para esta aplicaci&oacute;n s&oacute;lo es compatible con versi&oacute;n de Internet Explorer 9 y superiores." :
                        "Radial Menu required for this application is only supported from Internet Explorer Versioned 9 and above."
                });
                infowindow.open(viewModel.map);
            } else {
                $("#map-canvas").append("<div id='nestedradialmenu'></div>");
            }

            // Try HTML5 geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude,
                                                     position.coords.longitude);

                    viewModel.map.setCenter(pos);
                    viewModel.postInitialize(pos);
                }, function() {
                    viewModel.handleNoGeolocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                viewModel.handleNoGeolocation(false);
            }
        };

        $('#languageDialog').on('hidden.bs.modal', function () {
            viewModel.welcomeText = viewModel.isSpanish ?
                "Por favor introduzca una palabra clave en el cuadro de b&uacute;squeda y pulse ENTER" :
                "Please enter a keyword into the search box and press enter.";
            var script  = document.createElement('script');
            script.type = "text/javascript";
            scriptsrc = 'https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&sensor=true' + '&libraries=places';
            // Intentionally trying not initializing places library so it wont interfere with us
            // But if I don't initialize it, SearchBox cannot be registered for events
            if (viewModel.isSpanish)
                scriptsrc += "&language=es";
            scriptsrc += '&callback=initializeMaps';
            script.src  = scriptsrc;
            document.body.appendChild(script);
            //document.getElementsByTagName('head')[0].appendChild(script);
        });
    });
} (window));

