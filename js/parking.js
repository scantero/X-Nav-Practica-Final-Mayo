$(document).ready(function() {
  //Variables que contienen los datos del json
  var nElem = 0;
	var parkData;
  //Variables para el mapa
  var map;
  var mapC1;
  var mapC2;
  var marker;
  var markerC;
  var markerP;
  //Variables para navegar entre pestañas
	var fromPrincipal = true;
	var fromColecciones = false;
	var fromInstalaciones = false;
  //Variables para guardar las colecciones durante la sesión
  var colecciones_titles = [];
	var dic_colecciones = {};
  //Variable para asignar id a cada colección
  var id_colecciones = 0;
  //Variables para guardar durante el drag and drop
  var coleccion_actual = "";
  var aparcamiento_a_añadir = "";
  var aparcamiento_a_eliminar = "";
  var aparcamientos_antiguos = [];
  var aparcamientos_actuales = [];
  //Lista original de aparcamientos en pestaña Colecciones
  var htmlC = "";
  var htmlC_elementos = []; //para no añadir elementos repetidos (sortable)
  //Usuarios de Google+
  var idUsersGPlus = [];
  var allUsersDiv = [];
  var nUsers = 0;
  var dic_users = {};
  var ghub;
  var apiKey;
  $("#principal").show();
  $("#colecciones").hide();
  $("#instalaciones").hide();
  $("#myCarousel").hide();
  $("#list-zone").hide();
  $("#description-zone").hide();
  $("#gusers").hide();
  $("#description-col-C").hide();
  $("#description-col-P").hide();
  $("#park-selected").hide();
  $("#users-btn").hide();
  $("#users-loaded").hide();


  /* ---------------------- MAP  ---------------------- */

    map = L.map('map').setView([40.4169, -3.7034], 14);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18}
                ).addTo(map);
    //map.locate({setView: true});

  /* ---------------------- INIT ---------------------- */

  $("#start-all").click(function(e){
		//Habilitamos todas las funciones
		$("#principal").css({"opacity":'1', "pointer-events":'all'});
		$("#principal").css({"opacity":'1', "pointer-events":'all'});
		$("#colecciones").css({"opacity":'1', "pointer-events":'all'});
		$("#instalaciones").css({"opacity":'1', "pointer-events":'all'});
    $("#cont-github").css({"opacity":'1', "pointer-events":'all'});
		$("#btn-principal").css({"opacity":'1', "pointer-events":'all'});
		$("#btn-colecciones").css({"opacity":'1', "pointer-events":'all'});
		$("#btn-instalaciones").css({"opacity":'1', "pointer-events":'all'});
		fillParkingList();
		$("#startedOK").remove(); //Botón inicio
    $("#principal").show(); //Comenzamos en la pestaña Principal
    $("#colecciones").hide();
    $("#instalaciones").hide();
    $("#list-zone").show(); //zona donde se muestran los aparcamientos en Principal
    $("#description-zone").show();
    //Para api key
    $("#clave-google").dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 1500
      },
      hide: {
        effect: "blind",
        duration: 1500
      },
      buttons: {
        "Load": insertApiKey,
        Cancel: function(){
          $(this).dialog("close");
        }
      }
    })

	})

  /* ---------------------- TABS ---------------------- */

  $("#btn-principal").click(function(e){
    $("#principal").show();
    $("#colecciones").hide();
    $("#instalaciones").hide();
  })

  $("#btn-colecciones").click(function(e){
    $("#principal").hide();
    $("#colecciones").show();
    $("#instalaciones").hide();
  })

  $("#btn-instalaciones").click(function(e){
    $("#principal").hide();
    $("#colecciones").hide();
    $("#instalaciones").show();
    $("#users-btn").show();
    if (allUsersDiv.length>0){
      $("#allUsers").html("");
      for(var i=0; i<allUsersDiv.length; i++){
        $("#allUsers").append(allUsersDiv[i]);
      }
    }
  })

  /* ---------------------- GITHUB ---------------------- */

  $("#guardarGH").click(function(e){
    // fa22dfc3aa38dfe6855c42980b3163dfcec66e8b
    e.preventDefault();
    var token = $("#token").val();
    var user = $("#identgithub").val();
    var repo = $("#repositorio").val();
    var file = $("#fichero").val();
    ghub = new Github({
      token: token,
      auth: "oauth"
    });
    var data = {
      "names": colecciones_titles,
      "collection": dic_colecciones,
      "users": dic_users
    };
    var repositorio = ghub.getRepo(user, repo);
    var contenido = JSON.stringify(data);
    var commit = "Fichero creado";
    repositorio.write('master', file, contenido, commit, function(e){console.log(e)});
    alert("Datos guardados correctamente!");
  })


  $("#cargarGH").click(function(e){
    // fa22dfc3aa38dfe6855c42980b3163dfcec66e8b
    e.preventDefault();
    var token = $("#token").val();
    var user = $("#identgithub").val();
    var repo = $("#repositorio").val();
    var file = $("#fichero").val();
    ghub = new Github({
      token: token,
      auth: "oauth"
    })
    var repositorio = ghub.getRepo(user, repo);
    repositorio.read('master', file, function(err, data) {
      data = JSON.parse(data);
      colecciones_titles = data.names;
      dic_colecciones = data.collection;
      dic_users = data.users;
      var pos;
      $("#sortable1").html("");
      for(var i=0; i<colecciones_titles.length; i++){
        pos = $.inArray(colecciones_titles[i], colecciones_titles);
        $("#sortable1").append("<li id='Col-" + i.toString() + "'>" + colecciones_titles[i] + "</li>");
        var ident = "#Col-" + i.toString();
        $(ident).click(function(e){
          showCollection($(this).html());
        })
      }
      alert("Datos cargados correctamente!");
    })
  })


  /* ---------------------- PRINCIPAL ---------------------- */

  function fillParkingList(){
		//Cargar lista aparcamientos inicial
			$('.list-of-parks-P').css("overflow-y","scroll");
			$('.list-of-parks-P').css("height", "590px");
      $('.list-of-parks-C').css("overflow-y","scroll");
      $('.list-of-parks-C').css("height", "630px");
      getListOfParks();
	};

  $("#minusvalidosP").click(function(e){
    for(var i=0; i<parkData.length; i++){
      if (parkData[i].organization.accesibility == '1'){
        var ident = "#parkP-" + i.toString();
        if ($(ident).css("background-color") == "#A9F5F2"){
          $(ident).css("background-color","white");
        }
        else{
          $(ident).css("background-color","#A9F5F2");
        }
      }
    }
  })

  $("#minusvalidosC").click(function(e){
    for(var i=0; i<parkData.length; i++){
      if (parkData[i].organization.accesibility == '1'){
        var ident = "#" + i.toString();
        if ($(ident).css("background-color") == "#A9F5F2"){
          $(ident).css("background-color","white");
        }
        else{
          $(ident).css("background-color","#A9F5F2");
        }
      }
    }
  })

  function getListOfParks(){
		//Descargamos los aparcamientos de instalaciones.json y los introducimos en el dom
			$.getJSON("json/instalaciones.json")
			.done(function(data){
				parkData =  data['@graph'];
				nElem = parkData.length;
				var htmlP = buildParkElementP(parkData, nElem);
        $('.list-of-parks-P').empty();
        $('.list-of-parks-P').html(htmlP);
        htmlC = buildParkElementC(parkData, nElem);
				$('.list-of-parks-C').empty();
				$('.list-of-parks-C').html(htmlC);
				createClickHandlers(parkData, nElem);
        for(var i=0; i<nElem; i++){
          dic_users[i.toString()] = []; //Inicializamos la lista de usuarios para cada aparcamiento
          //dic_parks[i] = data[elem].title.split('.')[1]
        }

			})
			.fail(function(jqxhr, status, error){
				var htmlErr = "<p>Request Failed: " + status + ": " + error + "</p>"
				$('.list-of-parks').append(htmlErr);
			})
	}

  function buildParkElementP(data, nElem){
		//Creamos el html para cada uno de los aparcamientos en la pestaña Principal
		var html = "";
		html += "<ul class='item col-xs-12 col-sm-12 col-md-3 col-lg-3'>";
		for (var i = 0; i < nElem; i++){
			html += "<li class='parking' id='parkP-" + i + "'>";
			html += "<h5>" + data[i].title + "</h5>";
	    html += "<p>" + data[i].address['street-address'] + "</br>";
			html += data[i].address['postal-code'] + "&nbsp" + data[i].address['locality'] + "</p>";
			html += "</li>";
		}
		html += "</ul>";
		return html;
	}

  function buildParkElementC(data, nElem){
    //Creamos el html para cada uno de los aparcamientos en la pestaña Colecciones
    var html = "";
    html += "<div id='parkC'>";
    for (var i = 0; i < nElem; i++){

      html += "<a class='connectedSortable2' id='parkC-" + i + "'>";
      html += "<div class='connectedSortable2 sortable-list' id='" + i + "'><h5>" + data[i].title + "</h5>";
      html += "<p>" + data[i].address['street-address'] + "</br>";
      html += data[i].address['postal-code'] + "&nbsp" + data[i].address['locality'] + "</p></div>";
      html += "</a>";
      //creamos los elementos para manejarlos en el sortable
      var html_aux = "";
      html_aux += "<div class='connectedSortable2 sortable-list ui-sortable-handle' id='" + i + "'><h5>" + data[i].title + "</h5>";
      html_aux += "<p>" + data[i].address['street-address'] + "</br>";
      html_aux += data[i].address['postal-code'] + "&nbsp" + data[i].address['locality'] + "</p></div>";
      htmlC_elementos.push(html_aux);
    }
    html += "</div>";
    return html;
  }

  function showParking(data, elem){
    $('#park-description').empty();
    var html = "";
    var html_ini1 = "<div class='item col-xs-12 col-sm-12 col-md-2 col-lg-2'>";
    html += "<h5>" + data[elem].title + "</h5>";
    html += "<p>" + data[elem].address['street-address'] + "</br>";
    html += data[elem].address['postal-code'] + "&nbsp" + data[elem].address['locality'] + "</p>";
    html += "<p>" + data[elem].organization['organization-desc'] + "</p>";
    html += "</div>";
    $('#park-description').html(html_ini1 + html);
    if(dic_users[elem].length > 0){
      $("#gusers").show();
      $("#gusers").html("");
      for (var i=0; i<dic_users[elem].length; i++){
        $("#gusers").append(dic_users[elem][i]);
      }
    }
    else{
      $("#gusers").hide();
      $('.list-of-parks-P').css("height", "590px");
    }
    //Guardamos la latitud y la longitud
    var latitude = data[elem].location.latitude;
    var longitude = data[elem].location.longitude;
    //Buscamos las fotos para cada aparcamiento
    var url = "https:\/\/commons.wikimedia.org\/w\/api.php?format=json&action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggscoord=";
    url += latitude + "|" + longitude;
    url += "&ggslimit=10&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=200&iiurlheight=200&callback=?";
    var imgs = [];
    $.getJSON(url,function(json){
      $("#myCarousel").show();
        var dic_imgs = json.query.pages;
        var i=1;
        $.each(dic_imgs, function(key, value) {
          if(i<5){
            var item = "#img-" + i.toString();
            $(item).attr("src", value.imageinfo[0].url);
            imgs.push(value.imageinfo[0].url);
          }
          i = i+1;
        });
        $("#myCarousel").show();
        var html_ini2 = "<div class='item col-xs-12 col-sm-12 col-md-2 col-lg-2' id='" + elem + "'>";
        fillInstalationsPark(elem, html_ini2 + html, imgs);
    });

  }

  function createClickHandlers(data, nElem){
    //En Principal: Creamos un manejador para cada aparcamiento de la lista para mostrar su descripción completa
    //En Colecciones: Hacemos sortable cada elemento de la lista de aparcamientos.
    var ident = "";
    var uno = true;
    for (var i = 0; i < nElem; i++){

      //Hacemos los aparcamientos de colecciones Sortable
      ident = "#parkC-" + i.toString();
      $(ident).sortable({
        connectWith: ".connectedSortable2",
        items: "div"
      }).disableSelection();

      //Creamos un click para cada aparcamiento en principal para mostarlo completo
      ident = "#parkP-" + i.toString();
      $(ident).click(function(e) {
        //Incluimos la descripción detallada del aparcamiento clickeado
        var elem = e.currentTarget.id.split('-')[1];
        showParking(data, elem);
        //Guardamos la latitud y la longitud
        var latitude = data[elem].location.latitude;
        var longitude = data[elem].location.longitude;
        //Ponemos el marcador en el mapa
        marker = L.marker([latitude, longitude]).addTo(map)
          .bindPopup(data[elem].title.split('.')[1])
          .openPopup();
        $(marker).click(function(e){
          //Al pinchar en el marcador, mostramos el contenido del aparcamiento
          showParking(data, elem);
        })
        $(marker).dblclick(function(e){
          console.log($(this));
          console.log(e.currentTarget);
          //$(this).remove();
        })
      })
    }
  }

  $('#myCarousel').carousel({
      interval: 1800
  });

  /* ---------------------- COLECCIONES ---------------------- */

  $("#submit-collection").click(function(e){
    //Botón crear colección.
    //Mostramos en la lista de colecciones la nueva que se ha creado
    e.preventDefault();
    var name = $("#collection-title").val();
    $("#collection-title").val("");
    if ($.inArray(name, colecciones_titles) == -1){
      $("#my-collections ul").append("<li id='Col-" + id_colecciones.toString() + "'>" + name + "</li>");
      colecciones_titles.push(name);
      dic_colecciones[name] = []; //lista en la que meteremos los aparcamientos
      var ident = "#Col-" + id_colecciones.toString();
      //Cuando pincho en una colección de la lista, muestro su contenido en la zona inferior
      $(ident).click(function(e){
        showCollection($(this).html());
      })
      id_colecciones = id_colecciones + 1;
    }
    else{
      alert("Este nombre ya está en la lista. Elige otro nombre!");
    }
  })

  function showCollection(title){
    //Muestra la colección completa tanto en la pestaña Principal como en la pestaña Colecciones
      $("#description-col-C").show();
      $("#description-col-P").show();
      var clist = dic_colecciones[title];
      if(mapC1 == undefined){
        mapC1 = L.map('mapC1').setView([40.4169, -3.7034], 14);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                    { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18}
                  ).addTo(mapC1);
      }
      if(mapC2 == undefined){
        mapC2 = L.map('mapC2').setView([40.4169, -3.7034], 14);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                    { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18}
                  ).addTo(mapC2);
      }
      for (var i=0; i< clist.length; i++){
        var elem = clist[i].split('id=\'')[1].split('\'')[0];
        //elem = parseInt(elem.toString());
        var latitude = parkData[elem].location.latitude;
        var longitude = parkData[elem].location.longitude;
        markerC = L.marker([latitude, longitude]).addTo(mapC2)
          .bindPopup(parkData[elem].title.split('.')[1])
          .openPopup();
        markerP = L.marker([latitude, longitude]).addTo(mapC1)
          .bindPopup(parkData[elem].title.split('.')[1])
          .openPopup();
      }
      $(".campo-col-title").html(title);
      $(".campo-col-head-parks").html("Aparcamientos en esta colección:");
      if(clist.length > 0){
        var html1 = "";
        var html2 = "";
        var items = [];
        for(var i=0; i< clist.length; i++){
          var nuevo1 = clist[i].split('id=\'')[0] + 'id=\'P' + clist[i].split('id=\'')[1];
          var nuevo2 = clist[i].split('id=\'')[0] + 'id=\'C' + clist[i].split('id=\'')[1];
          //Html para la descripción de la colección en la pestaña Principal
          html1 += "<li id='ColParkP-" + i.toString() + "'>" + nuevo1 + "</li>";
          //Html para la descripción de la colección en la pestaña Colecciones
          html2 += "<li id='ColParkC-" + i.toString() + "'>" + nuevo2 + "</li>";
          var elem = clist[i].split('id=\'')[1].split('\'')[0];
          var item = "#P" + elem;
          items.push(item);
        }
        $(".block-content > #campo-col-listP").html("");
        $(".block-content > #campo-col-listP").html("</br><ul>" + html1 + "</ul>");
        $(".block-content > #campo-col-list").html("");
        $(".block-content > #campo-col-list").html("</br><ul>" + html2 + "</ul>");
        for (var i=0; i<items.length; i++){
          $(items[i]).click(function(e){
            var actual = e.currentTarget.id[1];
            showParking(parkData, actual);
          })
        }
      }
      else{
        $(".block-content > #campo-col-list").html("");
        $(".block-content > #campo-col-list").html("</br>Aún no has añadido elementos a esta colección...");
        $(".block-content > #campo-col-listP").html("");
        $(".block-content > #campo-col-listP").html("</br>Aún no has añadido elementos a esta colección...");
      }
      if(clist.length > 4){
        $(".block-content > #campo-col-list").css("overflow-y","scroll");
        $(".block-content > #campo-col-list").css("height", "350px");
        $(".block-content > #campo-col-listP").css("overflow-y","scroll");
        $(".block-content > #campo-col-listP").css("height", "350px");
      }
      //$("#description-col-P").html($("#description-col-C").html());
  }

  $(function(){
  //Conectamos las colecciones con la caja de colecciones
    $( "#sortable1").sortable({
      connectWith: ".connectedSortable1",
      items: "li"
    }).disableSelection();
  })

  $( function() {
    //Conectamos la caja de colecciones con las colecciones
    $( "#caja-col").sortable({
      connectWith: ".connectedSortable1",
      items: "li",
      receive: function(event, ui) {
            if ($(this).children('li').length > 1) {
                alert('Only one Collection per time!');
                $(ui.sender).sortable('cancel');
            }
            createClickHandlersC(nElem);
            coleccion_actual = ui.item.context.innerHTML;
            aparcamientos_antiguos = $.extend(true, [], dic_colecciones[coleccion_actual]);
            aparcamientos_actuales = dic_colecciones[coleccion_actual];
             $("#caja-par").html(aparcamientos_actuales);
            //console.log(ui.item.context.innerHTML);
        },
        remove: function(event, ui){
          $("#caja-par").html("");
          dic_colecciones[coleccion_actual] = [];
          dic_colecciones[coleccion_actual] = aparcamientos_antiguos;
        }
    }).disableSelection();
  });

   $( function() {
     //Conectamos la caja de aparcamientos con la lista
     $( "#caja-par" ).sortable({
       connectWith: ".connectedSortable2",
       items: "div",
       receive: function(event, ui) {
             if ($("#caja-col").children('li').length == 0) {
                 alert('You need to add a Collection before!');
                 $(ui.sender).sortable('cancel');
             }
             else{
               aparcamiento_a_añadir = "<div class='connectedSortable2 sortable-list ui-sortable-handle' id='";
               aparcamiento_a_añadir += ui.item.context.id + "' style=''>";
               aparcamiento_a_añadir += ui.item.context.innerHTML + "</div>";
               if ($.inArray(aparcamiento_a_añadir, aparcamientos_actuales) == -1){
                 aparcamientos_actuales.push(aparcamiento_a_añadir);
               }
               else{
                 alert("El aparcamiento ya está añadido a tu colección ;)");
                 $(ui.sender).sortable('cancel');
               }
             }
             if(aparcamientos_actuales.length > 5){
               $("#caja-par").css("overflow-y","scroll");
               $("#caja-par").css("height", "495px");
             }
         },
         remove: function(event, ui) {
           aparcamiento_a_eliminar = "<div class='connectedSortable2 sortable-list ui-sortable-handle' id='";
           aparcamiento_a_eliminar += ui.item.context.id + "' style=''>";
           aparcamiento_a_eliminar += ui.item.context.innerHTML + "</div>";
           if ($.inArray(aparcamiento_a_eliminar, aparcamientos_actuales) != -1){
             var pos = $.inArray(aparcamiento_a_eliminar, aparcamientos_actuales);
             aparcamientos_actuales.splice(pos, 1); //eliminamos el elemento de la lista
           }
           else{
             console.log("Se ha intentado eliminar el aparcamiento pero no se ha podido");
           }

         }
     }).disableSelection();
   });


   function createClickHandlersC(nElem){
     //En Colecciones: Hacemos sortable cada elemento de la lista de aparcamientos.
     var ident = "";
     for (var i = 0; i < nElem; i++){
       //Hacemos los aparcamientos de colecciones Sortable
       ident = "#parkC-" + i.toString();
       $(ident).sortable({
         connectWith: ".connectedSortable2",
         items: "div",
         receive: function(event, ui){
           aparcamiento_a_añadir = "<div class='connectedSortable2 sortable-list ui-sortable-handle' id='";
           aparcamiento_a_añadir += ui.item.context.id + "' style=''>";
           aparcamiento_a_añadir += ui.item.context.innerHTML + "</div>";
           if ($.inArray(aparcamiento_a_añadir, htmlC_elementos) != -1){
             $(ui.item).remove();
           }
         }
       }).disableSelection();
     }
   }


   $('#basurero').droppable({
     //Papelera para eliminar las colecciones
       accept: '#sortable1 li',
       drop: function(ev, ui) {
          $(ui.draggable).remove();
          var name = ui.draggable[0].firstChild.data;
          delete dic_colecciones[name];
          var pos = $.inArray(name, colecciones_titles);
          delete colecciones_titles[pos];
       }
    });


  $("#save-collection").click(function(e){
    //Añadimos los cambios en los aparcamientos de la colección
    e.preventDefault();
    if ($("#caja-col").html() == ""){
      alert("Primero tienes que añadir una colección!");
    }
    else{
      //Actualizamos la colección
      dic_colecciones[coleccion_actual] = [];
      dic_colecciones[coleccion_actual] = aparcamientos_actuales;
      //Dejamos todo como estaba
      alert("Colección guardada con éxito");
      var colec = $("#caja-col").html();
      $("#my-collections ul").append(colec);
      var ident =  "#" + colec.split('\"')[1].split('\"')[0];//<li id="Col-0">coleccion1</li>
      $(ident).click(function(e){
        showCollection($(this).html());
      })
      $("#caja-col").empty();
      $("#caja-par").empty();
      $('.list-of-parks-C').html(htmlC);
      createClickHandlersC(nElem);
    }
  })

  $("#back-original-collection").click(function(e){
    //Cancelamos los cambios en los aparcamientos de la colección y volvemos a su estado original
    e.preventDefault();
    var colec = $("#caja-col").html();
    dic_colecciones[coleccion_actual] = [];
    dic_colecciones[coleccion_actual] = aparcamientos_antiguos;
    aparcamientos_actuales = [];
    $("#my-collections ul").append(colec);
    var ident = "#" + colec.split('\"')[1].split('\"')[0];//<li id="Col-0">coleccion1</li>
    $(ident).click(function(e){
      showCollection($(this).html());
    })
    //coleccionesSortable();
    $("#caja-col").empty();
    $("#caja-par").empty();
    $('.list-of-parks-C').html(htmlC);
    createClickHandlersC(nElem);
  })


    /* ---------------------- INSTALACIONES ---------------------- */

    function fillInstalationsPark(elem, desc, imgs){
      $("#park-selected").show();
      $("#users-btn").show();
      $("#park-descriptionI").html(desc);
      for(var i=0; i<imgs.length; i++){
        var item = "#img-" + (i+1).toString() + "-mini";
        $(item).attr("src", imgs[i]);
      }
      $("#cajaI2").html("");
      for (var i=0; i<dic_users[elem].length; i++){
        $("#cajaI2").append(dic_users[elem][i]);
      }
    }

    $("#google-btn").click(function(e){
      e.preventDefault();
      $("#clave-google").dialog("open");
    })


    function insertApiKey(){
      apiKey = $("#api-key").val();
      if(apiKey == ""){
        alert("No ha introducido un valor!");
        return false;
      }
      else{
        $("#api-key").val("");
        $("#clave-google").dialog("close");
        get_users();
      }
    }

    function get_users(){
      try {

  			var host = "ws://localhost:8002/";
  			var s = new WebSocket(host);

  			s.onopen = function (e) {
  				console.log("Socket opened.");
  			};
  			s.onclose = function (e) {
  				console.log("Socket closed.");
  			};
  			s.onmessage = function (e) {
  				//console.log("Socket message:", e.data);
          if($.inArray(e.data, idUsersGPlus) == -1){
            //Si no tengo ese id lo guardo y hago la petición
            idUsersGPlus.push(e.data);
            showUsers(e.data);
          }
  			};
  			s.onerror = function (e) {
  				//console.log("Socket error:", e);
  			};
  		} catch (ex) {
  			console.log("Socket exception:", ex);
  		}
    }

    function showUsers(id){
      //var apiKey = 'AIzaSyBAGoM7AQnX7-VkLhGMelCwX_GXam5hArY';
      handleClientLoad(apiKey, id);
    }

    // Use a button to handle authentication the first time.
    function handleClientLoad(apiKey, id) {
      gapi.client.setApiKey(apiKey);
      makeApiCall(id);
    }

    // Load the API and make an API call.  Display the results on the screen.
    function makeApiCall(id) {
      gapi.client.load('plus', 'v1', function() {
        var request = gapi.client.plus.people.get({
          'userId': id
        });
        request.execute(function(resp) {
          $("#users-loaded").show();
          var image = resp.image.url;
          var name = resp.displayName;
          var html = "<div class='user' id='user-" + nUsers + "'>";
          if(image == ""){
            html += "<img src='img/user_blue_logo.png'></img>";
          }
          else{
            html += "<img src='" + image + "'></img>";
          }
          html += "<h5>" + name + "</h5>";
          html += "</div>";
          allUsersDiv[nUsers] = html;
          nUsers = nUsers + 1;
          $("#allUsers").append(html);
          html = "";

        });
      });
    }



    //function createSortableUser(ident){
    $(function(){
        //Hacemos sortable un usuario de google de la lista descargada
        $("#allUsers").sortable({
          connectWith: ".connectedSortable3",
          items: "div",
          receive: function(event, ui){
            var div_user = "<div class='user' id='";
            div_user += ui.item.context.id + "' style=''>";
            div_user += ui.item.context.innerHTML + "</div>";
            if ($.inArray(div_user, allUsersDiv) != -1){
              $(ui.item).remove();
            }
          }
        }).disableSelection();
    })

    $(function(){
    //Conectamos la caja de usuarios del aparcamiento con la caja de todos los usuarios
      $( "#cajaI2").sortable({
        connectWith: ".connectedSortable3",
        items: "div",
        receive: function(event, ui){
          var id_park =  $("#park-descriptionI").html().split("id=\"")[1].split("\"")[0];
          var num_user = ui.item[0].id.split('-')[1];
          var div_user = "<div class='user' id='";
          div_user += ui.item.context.id + "' style=''>";
          div_user += ui.item.context.innerHTML + "</div>";
          if ($.inArray(div_user, dic_users[id_park]) == -1){
            dic_users[id_park].push(div_user);
            //Actualizo la lista en la pestaña Principal
            $("#gusers").show();
            $("#gusers").html("");
            for (var i=0; i<dic_users[id_park].length; i++){
              $("#gusers").append(dic_users[id_park][i]);
            }
            $('.list-of-parks-P').css("height", "790px");
          }
          else{
            alert("El usuario ya está añadido ;)");
            $(ui.sender).sortable('cancel');
          }


        },
        remove: function(event, ui) {
          var id_park =  $("#park-descriptionI").html().split("id=\"")[1].split("\"")[0];
          var num_user = ui.item[0].id.split('-')[1];
          var pos = $.inArray(div_user, dic_users[id_park]);
          dic_users[id_park].splice(pos, 1); //eliminamos el elemento de la lista
          //Actualizo la lista en la pestaña Principal
          if(dic_users[id_park].length > 0){
            $("#gusers").show();
            $("#gusers").html("");
            for (var i=0; i<dic_users[id_park].length; i++){
              $("#gusers").append(dic_users[id_park][i]);
            }
            $('.list-of-parks-P').css("height", "790px");
          }
          else{
            $("#gusers").hide();
            $('.list-of-parks-P').css("height", "590px");
          }
        }
      }).disableSelection();
    })


  });
