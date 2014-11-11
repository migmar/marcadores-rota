/*
 * myjquery.js ViverAveiro.pt
 * author: Miguel Marnoto (@MigMarILV)
 * 2013
 *
 */

jQuery(document).ready(function($) {

	// Saves window hight.
	var docHeight;

	// Too many changes in code... I don't remember what is this.
	// But it keeps columns and map on place.
	$("body").css("overflow", "hidden");


	// Futur click events to get user GeoLocation.

	// $("#GeoLocatIcon, #setAutoLocal").click(function(){
	// doGeolocation();
	// });


	// Prevent that searchLocation() function will be fired twice,
	// When user presses ENTER key on Search Address field.
	$("#addressInput").keydown(function(e){
		if (e.keyCode == 13) {
			e.preventDefault();
		}
	});


	// Set options for #Slider on right column.
	// Set value of #amountDistance when user slides the slider.
	$("#slider").slider({
	      value:10000,
	      min: 500,
	      max: 15000,
	      step: 500,
	      slide: function( event, ui ) {
	        $("#amountDistance").text( ui.value);
	      }
	});
	// Inicial value of #amountDistance.
	$("#amountDistance").text($("#slider").slider("value"));
	// Do a new search on database after slider mouseup event.
	$("#slider").mouseup(function (){
	    searchLocations();
		defineSideBarHeight();
	});


	// *
	// * Start Tour - Visita Guiada
	// *
	$("#vaVisitaGuiada").on("click", function(){hopscotch.startTour(tour);});

	// Set active Search Option for Autocomplete
	var setSearchOpt = function (option) {
		$('#so' + option).click(function(){
			$('#moreSearchOptions>li.active').removeClass('active');
			$(this).parent().addClass('active');
		});	
	}
	setSearchOpt('All');
	setSearchOpt('Geocode');
	setSearchOpt('Establishment');

	//Define a altura do mapa
	function defineMapHeight() {
		docWidth = $(window).width() - 252 - 267;
		docHeight = $(window).height() - 68;
		
		$("#map_canvas").css("height", docHeight).css("width", docWidth);
	}
	defineMapHeight();

	//Define a altura da lista de POI (32 altura titulo sidebar) (60 espaço de margem após a sidebar para visualizar logo do Google)
	defineSideBarHeight = function () {
		docHeight = $(window).height();
		$rightColumn = $('#right_column');

		var leftColHeigth = {
			title: 46,
			bottomMargin: 60
		};
		var topMenu = 68;

		$('#leftcolumn').css('height', docHeight - topMenu - leftColHeigth.bottomMargin + 10);
		$('#side_bar').css('height', docHeight - topMenu - leftColHeigth.title - leftColHeigth.bottomMargin);
		$rightColumn.css('height', docHeight - topMenu - 6);
		$('#formatCategorias').css('height', $('#right_column').height() - 354);
		$rightColumn.css('visibility', 'visible')
	};

	//detecta alteração do tamanho da janela
	$(window).resize( function() {
		defineMapHeight();
		defineSideBarHeight();

	});

	// Actualiza o estado das checksboxes com leitura ao cookie
	function setcheckboxValuesstart() {
		var verify_checked = "";
		for (var i=1; i<17; i++) {
		  var verify_checked = readCookie('box' + i);
		  if (verify_checked 	!= "unchecked") {
			$('#format input[name=box' + i + ']').attr('checked',true);
		  } else {
			$('#format input[name=box' + i + ']').attr('checked',false);
		  }
		}
		//$("#format").buttonset("refresh");
	}
	setcheckboxValuesstart();


	//iwLinks state
	$('ul.nav.nav-pills li a').click(function() {			
	    $(this).parent().addClass('active').siblings().removeClass('active');
	});


	$('#btaiwClose, #iwModalBack, #closeBtn').click(function (e) {
		history.pushState({},'','/mapa');
		e.preventDefault();

		// Prevent the automatic open of iwModel if there is soma value in newSearchPOI.
		// The automatic open is defined in the domready event of the infowindow.
		if(newSearchPOI[2]){
			newSearchPOI = [];
		}
		panorama.setVisible(false);
		$('#iwDetailsInner').scrollTop(0);
		$('#' + $('#iwShown').html()).hide("slow");
		$("#iwModal").hide("slow");
		$("#iwModalBack").hide();
		// $("#btaiwDetails").hide();
		// $("#btaiwFotos").hide();
	});

	var setBtaiwState = function (button) {
		$('#btaiw' + button).click(function () {
			$('#' + $('#iwShown').html()).hide();
			if (button === 'StreetView') {
				$("#iwStreetView").show();
				panorama.setVisible(true);
		} else {
				$('#iw' + button).show();			
			}
			$('#iwShown').html('iw' + button);
		});
	};

	setBtaiwState('Details');
	setBtaiwState('Fotos');
	setBtaiwState('StreetView');

	// define o conteúdo da infoWindow e mostra a localização do ManPos
	$("#topDisplayLocalidade, #showActualLocal").click(function() {
		var myMarker = markers;
		infoWindow.setContent(iwManPosHtml());
		infoWindow.open(map, myMarker[markers.length-1]);
	});

	// $("#side_bar").scroll(function() {
	//     if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
	//         alert("finish");    
	//     }
	// });


	// CookieBar display/Hide
	// Just in case...
	$('.cookie-message').hide();

	// Show cookieBar for the first time
	if (readCookie('cookiebar') != 'hide' || readCookie('cookiebar') == null) {
	   setTimeout(function() {
	      $('.cookie-message').show('slow');
	   }, 800);
	  
	}

	// Close button
	$('.cookiebar-close').click(function() {
		 $('.cookie-message').hide();
		createCookie('cookiebar', 'hide', 30);
		return false;
	});


});