$(document).ready(function(){
	var nElem = 0;
	var parkData = "";
	var fromPrincipal = true;
	var fromColecciones = false;
	var fromInstalaciones = false;
	var principalContent = $('#principal').html();
	var coleccionesContent = $('#colecciones').html();
	var instalacionesContent = $('#instalaciones').html();
	var colecciones = {};
	//init();


	function init(){
		$('#colecciones').empty();
		$('#instalaciones').empty();
	}

	$("#start-all").click(function(e){
		console.log("despierta!!");
		//Habilitamos todas las funciones
		$("#principal").css({"opacity":'1', "pointer-events":'all'});
		$("#principal").css({"opacity":'1', "pointer-events":'all'});
		$("#colecciones").css({"opacity":'1', "pointer-events":'all'});
		$("#instalaciones").css({"opacity":'1', "pointer-events":'all'});
		$("#btn-principal").css({"opacity":'1', "pointer-events":'all'});
		$("#btn-colecciones").css({"opacity":'1', "pointer-events":'all'});
		$("#btn-instalaciones").css({"opacity":'1', "pointer-events":'all'});
		fillParkingList();
		$("#startedOK").remove();
	})

/* ---------------------- TABS FUNCTIONS ---------------------- */


	$("#btn-principal").click(function (e) {
		//Guardamos el contenido de las otras pestañas para vaciarlo
		//y cargamos el de la pestaña principal
	  	e.preventDefault();
			fromPrincipal = true;
			if (fromColecciones){
				coleccionesContent = $('#colecciones').html();
				$('#colecciones').empty();
				fromColecciones = false;
			}
			else if (fromInstalaciones) {
				instalacionesContent = $('#instalaciones').html();
				$('#instalaciones').empty();
				fromInstalaciones = false;
			}
			$('#principal').html(principalContent);
	});


	$("#btn-colecciones").click(function (e) {
			//Guardamos el contenido de las otras pestañas para vaciarlo
			//y cargamos el de la pestaña colecciones
			e.preventDefault();
			fromColecciones = true;
			if (fromPrincipal){
				principalContent = $('#principal').html();
				$('#principal').empty();
				fromPrincipal = false;
			}
			else if (fromInstalaciones){
				instalacionesContent = $('#instalaciones').html();
				$('#instalaciones').empty();
				fromInstalaciones = false;
			}
			$('#colecciones').html(coleccionesContent);
	});


	$("#btn-instalaciones").click(function (e) {
		//Guardamos el contenido de las otras pestañas para vaciarlo
		//y cargamos el de la pestaña instalaciones
			e.preventDefault();
			fromInstalaciones = true;
			if (fromPrincipal){
				principalContent = $('#principal').html();
				$('#principal').empty();
				fromPrincipal = false;
			}
			else if (fromColecciones){
				coleccionesContent = $('#colecciones').html();
				$('#colecciones').empty();
				fromColecciones = false;
			}
			$('#instalaciones').html(instalacionesContent);
	});


/* ---------------------- END TABS FUNCTIONS ---------------------- */
/* ---------------------- PRINCIPAL FUNCTIONS ---------------------- */


	function fillParkingList(){
		//Cargar lista aparcamientos inicial
			$('.list-of-parks').css("overflow-y","scroll");
			$('.list-of-parks').css("height", "500px");
      getListOfParks();
	};


	function startedOk(){
		$('#colecciones').html(coleccionesContent);
		$('#instalaciones').html(instalacionesContent);
	}


	function getListOfParks(){
		//Descargamos los aparcamientos de instalaciones.json y los introducimos en el dom
			$.getJSON("json/instalaciones.json")
			.done(function(data){
				parkData =  data['@graph'];
				nElem = parkData.length;
				var html = buildParkElement(parkData, nElem);
				$('.list-of-parks').empty();
				$('.list-of-parks').html(html);
				//startedOk(); //rellenamos las pestañas de colecciones e instalaciones
				//$('.list-of-parks-c').css("overflow-y","scroll");
				//$('.list-of-parks-c').css("height", "500px");
				//$('#list-of-parks-c').empty();
				//$('#list-of-parks-c').html(html); //incluimos la lista también en las colecciones
				//console.log($('#list-of-parks-c').html());
				createClickHandlers(parkData, nElem);
			})
			.fail(function(jqxhr, status, error){
				var htmlErr = "<p>Request Failed: " + status + ": " + error + "</p>"
				$('.list-of-parks').append(htmlErr);
			})
	}



	function buildParkElement(data, nElem){
		//Creamos el html para cada uno de los aparcamientos
		var html = "";
		html += "<ul class='item col-xs-12 col-sm-12 col-md-3 col-lg-3'>";
		for (var i = 0; i < nElem; i++){
			html += "<li class='parking' id='park-" + i + "'>";
			html += "<h5>" + data[i].title + "</h5>";
	    html += "<p>" + data[i].address['street-address'] + "</br>";
			html += data[i].address['postal-code'] + "&nbsp" + data[i].address['locality'] + "</p>";
			html += "</li>";
		}
		html += "</ul>";
		return html;
	}


	$('#myCarousel').carousel({
	    interval: 1800
	});

/*
	$(".parking").click(function(e){
		e.preventDefault();
		console.log("hola");
	})
*/


	function createClickHandlers(data, nElem){
		//Creamos un manejador para cada botón "Show more" asociado a cada mensaje cargado,
		//que nos introduzca el contenido del mensaje de cada usuario al pulsar el botón "show more"
		var ident = "";
		var uno = true;
		for (var i = 0; i < nElem; i++){
			ident = "#park-" + i.toString();
			$(ident).click(function(e) {
				var elem = e.currentTarget.id.split('-');
				elem = elem[1];
				$('#park-description').empty();
				//document.getElementById('park-description').innerHTML='';//vacio el contenido
				var html = "";
				html += "<div class='item col-xs-12 col-sm-12 col-md-2 col-lg-2'>";
				html += "<h5>" + data[elem].title + "</h5>";
				html += "<p>" + data[elem].address['street-address'] + "</br>";
				html += data[elem].address['postal-code'] + "&nbsp" + data[elem].address['locality'] + "</p>";
				html += "<p>" + data[elem].organization['organization-desc'] + "</p>";
				html += "</div>";
				$('#park-description').html(html);
				var latitude = data[elem].location.latitude;
				var longitude = data[elem].location.longitude;
				var url = "https:\/\/commons.wikimedia.org\/w\/api.php?format=json&action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggscoord=";
				url += latitude + "|" + longitude;
				url += "&ggslimit=10&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=200&iiurlheight=200&callback=?";
				$.getJSON(url,function(json){
					if(uno){
  					console.log(json);
						uno = false;
						var imgs = json.query.pages;
						$.each( imgs, function( key, value ) {
  						//console.log( key + ": " + value );
							console.log(value.imageinfo[0].url);
						});
					}
				});
			})
		}
	}



/* ---------------------- END PRINCIPAL FUNCTIONS ---------------------- */
/* ----------------------- COLLECTIONS FUNCTIONS ----------------------- */



$("#btn-new-collection").click(function(e){
	console.log("nueva coleccion!!");
	var name = $('#collection-title').html();
	colecciones['name'] = [];
	console.log(colecciones);
})






});
