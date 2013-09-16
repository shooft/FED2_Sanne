var GEO = GEO || {};
   
(function () {
	
	// Constants
	var GPS_AVAILABLE = 'GPS_AVAILABLE';
	var	GPS_UNAVAILABLE = 'GPS_UNAVAILABLE';
	var	POSITION_UPDATED = 'POSITION_UPDATED';
	
	// The real stuff
	var locaties = [
		['Jan Bommerhuis', 'http://www.google.com', 30, 52.35981828737461, 4.909543130688462],
		['Theo Thijssenhuis', 'http://icanhasgeo.nl/map.html#TTH', 50, 52.35955620231157, 4.908019635968003],
		['Koninklijk Instituut voor de Tropen', 'http://icanhasgeo.nl/map.html#KIT', 10, 52.36228181098596, 4.920969341091904],
		['Crea', 'http://icanhasgeo.nl/map.html#CREA', 30, 52.36322525173981, 4.912826154522691]
	];
	
	
	// controller
	GEO.app = {
		init:function(){
			GEO.location.init();
	
		}
	};
	
	
	// Location Object
	GEO.location = {
		refreshRate: 1000,
		currentPosition: false,
		interval: false,
		intervalCounter: false,
		
		
		// Test of GPS beschikbaar is (via geo.js) en vuur een event af
		init: function (){
			//GEO.debug.message("Controleer of GPS beschikbaar is...");
			ET.addListener(GPS_AVAILABLE, this.startInterval); //waarom zet Joost hier .bind(this) achter?
			ET.addListener(GPS_UNAVAILABLE, function(){GEO.debug.message('GPS is niet beschikbaar.')});
		
			(geo_position_js.init())?ET.fire(GPS_AVAILABLE):ET.fire(GPS_UNAVAILABLE);
		},
		
		
		// Start een interval welke op basis van REFRESH_RATE de positie updated
		startInterval: function (event){
			//GEO.debug_message("GPS is beschikbaar, vraag positie.");
			this.updatePosition();
			this.interval = setInterval(this.updatePosition, this.refreshRate);
			ET.addListener(POSITION_UPDATED, this.checkLocations); //waarom zet Joost hier .bind(this) achter?
		},
		
		
		// Vraag de huidige positie aan geo.js, stel een callback in voor het resultaat
		updatePosition: function (){
			this.intervalCounter++;
			geo_position_js.getCurrentPosition(this.setPosition, GEO.debug.geoErrorHandler, {enableHighAccuracy:true});
		},
		
		
		// Callback functie voor het instellen van de huidige positie, vuurt een event af
		setPosition: function (position){
			this.currentPosition = position;
			ET.fire("POSITION_UPDATED");
			GEO.debug.message(intervalCounter+" positie lat:"+position.coords.latitude+" long:"+position.coords.longitude);
		},
		
		
		// Controleer de locaties en verwijs naar een andere pagina als we op een locatie zijn
		checkLocations: function (event){
			// Liefst buiten google maps om... maar helaas, ze hebben alle coole functies
			for (var i = 0; i < locaties.length; i++) {
				var locatie = {coords:{latitude: locaties[i][3],longitude: locaties[i][4]}};
		
				if(GEO.map.calculateDistance(locatie, this.currentPosition)<locaties[i][2]){
		
					// Controle of we NU op die locatie zijn, zo niet gaan we naar de betreffende page
					if(window.location!=locaties[i][1] && localStorage[locaties[i][0]]=="false"){
						// Probeer local storage, als die bestaat incrementeer de locatie
						try {
							(localStorage[locaties[i][0]]=="false")?localStorage[locaties[i][0]]=1:localStorage[locaties[i][0]]++;
						} catch(error) {
							GEO.debug.message("Localstorage kan niet aangesproken worden: "+error);
						}
		
						// TODO: Animeer de betreffende marker
		
						window.location = locaties[i][1];
						GEO.debug.message("Speler is binnen een straal van "+ locaties[i][2] +" meter van "+locaties[i][0]);
					}
				}
			}
		}
	};
	
	
	
	//Google Maps object
	GEO.map = {
		locatieRij: [],
		markerRij: [],
		currentPositionMarker: false,
		theMap: false,
		updateMap: false,
		
		
		//generate_map(myOptions, canvasId)
		generateMap: function (myOptions, canvasId){
		// TODO: Kan ik hier asynchroon nog de google maps api aanroepen? dit scheelt calls
			GEO.debug.message("Genereer een Google Maps kaart en toon deze in #"+canvasId)
			this.theMap = new google.maps.Map(document.getElementById(canvasId), myOptions);
		
			var routeList = [];
			// Voeg de markers toe aan de map afhankelijk van het tourtype
			GEO.debug.message("Locaties intekenen, tourtype is: "+tourType);
			for (var i = 0; i < locaties.length; i++) {
		
				// Met kudos aan Tomas Harkema, probeer local storage, als het bestaat, voeg de locaties toe
				try {
					(localStorage.visited==undefined||GEO.calculator.isNumber(localStorage.visited))?localStorage[locaties[i][0]]=false:null;
				} catch (error) {
					GEO.debug.message("Localstorage kan niet aangesproken worden: "+error);
				}
		
				var markerLatLng = new google.maps.LatLng(locaties[i][3], locaties[i][4]);
				routeList.push(markerLatLng);
		
				markerRij[i] = {};
				for (var attr in locatieMarker) {
					markerRij[i][attr] = locatieMarker[attr];
				}
				markerRij[i].scale = locaties[i][2]/3;
		
				var marker = new google.maps.Marker({
					position: markerLatLng,
					map: this.theMap,
					icon: markerRij[i],
					title: locaties[i][0]
				});
			}
		
			// TODO: Kleur aanpassen op het huidige punt van de tour
			
			if(tourType == LINEAIR){
				// Trek lijnen tussen de punten
				GEO.debug.message("Route intekenen");
				var route = new google.maps.Polyline({
					clickable: false,
					map: this.theMap,
					path: routeList,
					strokeColor: 'Black',
					strokeOpacity: .6,
					strokeWeight: 3
				});
		
			}
		
			// Voeg de locatie van de persoon door
			currentPositionMarker = new google.maps.Marker({
				position: kaartOpties.center,
				map: this.theMap,
				icon: positieMarker,
				title: 'U bevindt zich hier'
			});
		
			// Zorg dat de kaart geupdated wordt als het POSITION_UPDATED event afgevuurd wordt
			ET.addListener(POSITION_UPDATED, update_positie);
		},


		// Bereken het verchil in meters tussen twee punten
		calculateDistance: function (p1, p2){
			var pos1 = new google.maps.LatLng(p1.coords.latitude, p1.coords.longitude);
			var pos2 = new google.maps.LatLng(p2.coords.latitude, p2.coords.longitude);
			return Math.round(google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2), 0);
		},
		
		
		// Update de positie van de gebruiker op de kaart
		updatePositie: function (event){
			// use currentPosition to center the map
			var newPos = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
			this.theMap.setCenter(newPos);
			this.currentPositionMarker.setPosition(newPos); // is dit ok?
		}
	};
	
	

	// Calculator object
	GEO.calculator = {
		
		isNumber: function (n) {
		  return !isNaN(parseFloat(n)) && isFinite(n);
		}
			
	};
	
		
	
	//Debugger object
	GEO.debug = {
		customDebugging: false,
		debugId: false,
		
		geoErrorHandler: function (code, message) {
			this.message('geo.js error '+code+': '+message);
		},
		
		message: function (message){
			(this.customDebugging && this.debugId)?document.getElementById(this.debugId).innerHTML:console.log(message);
		},
		
		setCustomDebugging: function (debugId){
			this.debugId = this.debugId;  // dit lijkt niet ok?
			this.customDebugging = true;
		}	
	};
	
	
	
	//Run app
	GEO.app.init(); 

})();

