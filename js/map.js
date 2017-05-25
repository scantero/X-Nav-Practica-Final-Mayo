$(document).ready(function() {
    // create a map in the "map" div, set the view to a given place and zoom
    var map = L.map('map').setView([40.4169, -3.7034], 14);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18}
                ).addTo(map);



    //map.locate({setView: true});


    function clickMap(e) {
      L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
        .bindPopup(e.latlng.lat +", "+ e.latlng.lng)
        .openPopup();
    }
    map.on('click', clickMap);


    function onLocationError(e) {
      alert(e.message);
    }
    map.on('locationerror', onLocationError);



});
