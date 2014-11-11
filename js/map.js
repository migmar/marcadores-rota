//<![CDATA[
/*
 * -------------------------------------------------------- 
 * DIRECTIONS
 * ---------------------------------------------------------
 *
*/
var rendererOptions = {
	draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
var directionsService = new google.maps.DirectionsService();
var directionsData = {
	actualPos: 0,
	endLat: 0,
	endLng: 0
};

/*
 * ----------------------------------------
 * GLOBAL VARS
 * ----------------------------------------
 *
 */
var map;								// map render
var markers = [];						// normal POI
var infoWindow;							// normal POI infoWindow

/*
 * -------------------------------------------------------- 
 * MAP API INITIALIZE
 *
 * set defaults for map rendering
 * ---------------------------------------------------------
 *
*/

function initialize() {

	/*
	 * -----------------------------------------------------
	 * MAP OPTIONS
	 *
	 * -----------------------------------------------------
	*/
	var myOptions = {
		center: new google.maps.LatLng(-17.727479, -49.124000),
		zoom: 8,
		scaleControl: true,
		mapTypeId: 'hybrid'//modifiquei
	};

	// coloca o mapa no DIV map_canvas com as opções definidas em myoptions
	map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
	/*
	 * -------------------------------------------
	 * START POSITION
	 * 
	 * Define a posição inicial para a rota.
	 * Quando inicia o mapa o valor para START é igual ao centro do mapa.
	 * Quando você actualiza os valores nos inputs Lat e Lng no topo do mapa
	 * o valor para START também é actualizado na função newSearch().
	 * --------------------------------------------
	 */
	directionsData.actualPos = myOptions.center;

	/*
	 * -------------------------------------------
	 * INFOWINDOW
	 * 
	 * Sets a new google.maps.InfoWindow to infoWindow
	 * --------------------------------------------
	 */
	infoWindow = new google.maps.InfoWindow();
	/*
	 * -------------------------------------------
	 * INFOWINDOW - CLOSE EVENT
	 * 
	 * --------------------------------------------
	 */
	google.maps.event.addListener(map, 'click', function() {
		infoWindow.close();
	});
	/*
	 * -------------------------------------------
	 * DIRECTIONS
	 * Identifica o DIV para inserir as direcções
	 * --------------------------------------------
	 */
	directionsDisplay.setPanel(document.getElementById('left-column'));
	/*
	 * -------------------------------------------
	 * FIRST CALL TO DATABASE
	 * 
	 * --------------------------------------------
	 */
	searchLocationsNear(myOptions.center);
}
// call initialize() after dom load
google.maps.event.addDomListener(window, 'load', initialize);
/*
* -------------------------------------------------------------------------
* DIRECTIONS
*
* directionsData.actualPos, directionsData.endLat, directionsData.endLng são variáveis globais definidas no topo do arquivo.
* -------------------------------------------------------------------------
*/
function calcRoute(endLat, endLng) {
	directionsDisplay.setMap(map);
	var selectedMode = document.getElementById("mode").value;
	var start = directionsData.actualPos;
	var end;
	if (endLat) {
		end = endLat +', '+ endLng;
		directionsData.endLat = endLat;
		directionsData.endLng = endLng;
	} else {
		end = directionsData.endLat +', '+ directionsData.endLng;
	}
	var request = {
		origin:start, 
		destination:end,
		travelMode: google.maps.TravelMode[selectedMode],
		provideRouteAlternatives: true,
		region: "br"
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			var leftcolumn = document.getElementById('left-column');
			leftcolumn.style.display = "block";
		}
	});
}
/*
* -------------------------------------------------------------------------
* CLEAR ALL FOR A NEW ROUND
*
* Clear all data, free memory and close infowindows for a good restart.
* -------------------------------------------------------------------------
*/
function clearLocations() {

	// close infowindows
	infoWindow.close();


	// remove markers from map
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers.length = 0;
}

function newSearch() {
	var lat = parseFloat(document.getElementById('lat').value);
	var lng = parseFloat(document.getElementById('lng').value);

	var latlng = new google.maps.LatLng(lat, lng);

	// Atualiza os valores de inicio da rota
	directionsData.actualPos = latlng;

	searchLocationsNear(latlng);
}

/*
* -------------------------------------------------------------------------
* GET POIs FROM DATABASE
*
* -------------------------------------------------------------------------
*/

function searchLocationsNear(center) {

	// Clear all data, free memory, remove markers from map
	clearLocations();

	// Define max distance to get POIs.
	var radius = document.getElementById('amountDistance').value;

	// URL to get data from database
	var searchUrl = 'includes/get_data_genxml.php?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius/1000;

	// This will retrieve each POI returned by XML.
	// Fill respective vars to call createMarker() on each POI
	downloadUrl(searchUrl, function(data) {
		var xml = parseXml(data);
		var markerNodes = xml.documentElement.getElementsByTagName("marker");

		// LatLngBounds define the map area to display.
		// This is defined by LatLng of the furthest POIs
		var bounds = new google.maps.LatLngBounds();

		// Start working...
		for (var i = 0; i < markerNodes.length; i++) {
			var geoloc_id = markerNodes[i].getAttribute("geoloc_id");
			var geoloc_nomeprop = markerNodes[i].getAttribute("geoloc_nomeprop");
			var geoloc_nomefazenda = markerNodes[i].getAttribute("geoloc_nomefazenda");
			var geozona_nome = markerNodes[i].getAttribute("geozona_nome");
			var distance = parseFloat(markerNodes[i].getAttribute("distance"));
			var lat = parseFloat(markerNodes[i].getAttribute("lat"));
			var lng = parseFloat(markerNodes[i].getAttribute("lng"));
			var latlng = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));

			// CREATE MARKERS
			createMarker(i, geoloc_id, geoloc_nomeprop, geoloc_nomefazenda, geozona_nome, distance, lat, lng, latlng);

			// Define the furdest LatLng
			bounds.extend(latlng);
		}
			// Define map area to show based on var bounds values.
			map.fitBounds(bounds);
	});
}


/*
* -------------------------------------------------------------------------
* CREATE MARKERS
*
* -------------------------------------------------------------------------
*/

function createMarker(i, geoloc_id, geoloc_nomeprop, geoloc_nomefazenda, geozona_nome, distance, lat, lng, latlng) {


	// Create present marker to push to markers array
	var marker = new google.maps.Marker({
		map: map,
		position: latlng,
		title: geoloc_nomefazenda,
		zIndex: 100
	});

	var distanceToFix = distanceToKm(distance, distance.toFixed(2));

	// Marker icon click event
	google.maps.event.addListener(marker, 'click', function() {
		
		// var distanceToFix = distanceToKm(distance, distance.toFixed(2));
		// Create infoWindow content
		
		var htmlInfoWindow = '<div class="infoWindow">' + geoloc_nomeprop + '<br>' + geoloc_nomefazenda + '<br>' + distanceToFix + '<br><a href="javascript:void(0)" id="btDirections" onclick="calcRoute(' + lat + ', ' + lng + ');">Rota</a></div>';

		
		// Set content to infoWindow.
		infoWindow.setContent(htmlInfoWindow);

		// We still are in marker.click event, so
		// we must display the infoWindow to the user.
		infoWindow.open(map, marker);
	});

	// Push the present marker to markers array and let's create another one.
	markers.push(marker);
}


function distanceToKm (distance, distanceToFix) {
	var distanceToFix = distanceToFix;
	var distance = distance;

	// Distances less than 1Km are retrieved from database as a decimal value.
	// e.g., 0.625 = 625m or 1.500 = 1.5km
	if (distanceToFix < 1) {
		distanceToFix = (distanceToFix * 1000) +'m';
	} else {
		distanceToFix = (distance.toFixed(1)) +'km';
	}
	return distanceToFix;
}


/*
* -------------------------------------------------------------------------
* DOWNLOAD URL
*
* -------------------------------------------------------------------------
*/

function downloadUrl(url, callback) {
	var request = window.ActiveXObject ?
		new ActiveXObject('Microsoft.XMLHTTP') :
		new XMLHttpRequest;

	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			request.onreadystatechange = doNothing;
			callback(request.responseText, request.status);
		}
  };

	request.open('GET', url);
	request.send(null);
}


/*
* -------------------------------------------------------------------------
* PARSE XML
*
* -------------------------------------------------------------------------
*/

function parseXml(str) {

	if (window.ActiveXObject) {
		var doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.loadXML(str);

		return doc;

	} else if (window.DOMParser) {

		return (new DOMParser).parseFromString(str, 'text/xml');

	}
}


/*
* -------------------------------------------------------------------------
* DO NOTHING
*
* This function is called from downloadUrl().
* -------------------------------------------------------------------------
*/

function doNothing() {}

//]]>