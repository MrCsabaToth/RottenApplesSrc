(function (window) {
    var ViewModel = function () {
        var self = this;
        self.initialized = false;
        self.is_spanish = false;

        self.handleNoGeolocation = function(errorFlag) {
            if (errorFlag) {
                var content = 'Error: The Geolocation service failed.';
            } else {
                var content = 'Error: Your browser doesn\'t support geolocation.';
            }

            var options = {
                map: map,
                position: new google.maps.LatLng(60, 105),
                content: content
            };

            var infowindow = new google.maps.InfoWindow(options);
            map.setCenter(options.position);
            Pace.stop();
        };

        self.initialize = function() {
            $("#languageDialog").modal("show");
        }
    };

    $(document).ready(function() {
        Pace.start();
        var viewModel = new ViewModel();
        viewModel.initialize();

        $("#spanishbtn").click(function() {
            viewModel.is_spanish = true;
            $("#languageDialog").modal("hide");
        });

        self.initializeMaps = function() {
            var mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(36.742130, -119.795411)
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

            // Try HTML5 geolocation
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude,
                                                     position.coords.longitude);

                    var infowindow = new google.maps.InfoWindow({
                        map: map,
                        position: pos,
                        content: 'Location found using HTML5.'
                    });

                    map.setCenter(pos);
                    map.setZoom(18);
                    Pace.stop();
                }, function() {
                    self.handleNoGeolocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                self.handleNoGeolocation(false);
            }
        };

        $('#languageDialog').on('hidden.bs.modal', function () {
            var script  = document.createElement('script');
            script.type = "text/javascript";
            scriptsrc = 'https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&sensor=true';
            if (viewModel.is_spanish)
                scriptsrc += "&language=es";
            scriptsrc += '&callback=initializeMaps';
            console.log(scriptsrc);
            script.src  = scriptsrc;
            document.body.appendChild(script);
            //document.getElementsByTagName('head')[0].appendChild(script);
            //google.maps.event.addDomListener(window, 'load', viewModel.initializeMaps);
        });
    });
} (window));

