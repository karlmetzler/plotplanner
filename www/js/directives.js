angular.module('plotPlanner.directives',['ngCordova'])

.directive('map',function($cordovaGeolocation){
	return {
		restrict: 'E',
		scope: {
			onCreate: '&'
		},
		link: function($scope,$element,$attr){
			
			var posOptions = { timeout: 10000, enableHighAccuracy: true, maximumAge: 0};
			$cordovaGeolocation.getCurrentPosition(posOptions)
			.then(function(position){
				
				function initialize(){
					if(!google.maps.Polygon.prototype.getBounds){
						google.maps.Polygon.prototype.getBounds = function(){
							var bounds = new google.maps.LatLngBounds();
							var paths = this.getPaths();
							var path;
							for(var i=0; i<paths.getLength(); i++){
								path = paths.getAt(i);
								for(var ii=0; ii<path.getLength(); ii++){
									bounds.extend(path.getAt(ii));
								}
							}
							
							return bounds;
						};
					}
					
					var mapOptions = {
						center: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
						zoom: 18,
						mapTypeId: google.maps.MapTypeId.HYBRID,
						tilt: 0
					};
					
					var map = new google.maps.Map($element[0],mapOptions);
					var posMarker = new google.maps.Marker({
						map: map,
						position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
						clickable: false,
						draggable: false,
						icon: 'img/position-marker.png',
						size: new google.maps.Size(16,16),
						origin: new google.maps.Point(8,0)
					});
					var isClosed = false;
					var poly = new google.maps.Polyline({
						map: map,
						path: [],
						strokeColor: '#FF0000',
						strokeWeight: 2,
						strokeOpacity: 1.0
					});
					
					google.maps.event.addListener(map,'close_path',function(){
						console.log('close_path event triggered');
						if(isClosed){
							return;
						}
						
						var path = poly.getPath();
						if(path.length < 3){
							alert('There must be a minimum of 3 markers to define a plot.');
							return false;
						}
						
						poly.setMap(null);
						poly = new google.maps.Polygon({
							map: map,
							path: path,
							strokeColor: '#00FF00',
							strokeWeight: 2,
							strokeOpacity: 0.8,
							fillColor: 'rgb(0,255,255)',
							fillOpacity: 0.35
						});
						
						
						var plotCenter = poly.getBounds().getCenter();
						isClosed = true;
						centerMarker = new google.maps.Marker({
							map: map,
							position: plotCenter,
							draggable: false
						});
						
						poly.getPath().forEach(function(elem,index){
							console.log(elem.lat()+', ' + elem.lng());
						});
						
						console.log(calculateArea(path) + ' acres');
						alert(calculateArea(path) + ' acres');
						
					});
					
					google.maps.event.addListener(map,'click',function(clickEvent){
						console.log('click event fired');
						if(isClosed){
							return;
						}
						
						var markerIndex = poly.getPath().length;
						var isFirstMarker = markerIndex === 0;
						var marker = new google.maps.Marker({
							map: map,
							position: clickEvent.latLng,
							draggable: true
						});
						
						markers.push(marker);
						
						if(isFirstMarker){
							google.maps.event.addListener(marker,'click',function(){
								if(isClosed){
									return;
								}
								var path = poly.getPath();
								poly.setMap(null);
								poly = new google.maps.Polygon({
									map: map,
									path: path,
									strokeColor: '#00FF00',
									strokeWeight: 2,
									strokeOpacity: 0.8,
									fillColor: 'rgb(0,255,255)',
									fillOpacity: 0.35
								});
								
								console.log(calculateArea(path));
								var plotCenter = poly.getBounds().getCenter();
								isClosed = true;
								
								centerMarker =new google.maps.Marker({
									map: map, 
									position: plotCenter,
									draggable: false
								});
								
								poly.getPath().forEach(function(elem,index){
									console.log(index);
									console.log(elem.lat() + ', ' + elem.lng());
								});
								
								
							});
						}
						
						google.maps.event.addListener(marker,'drag',function(dragEvent){
							var path = poly.getPath();
							path.setAt(markerIndex, dragEvent.latLng);
							poly.getPath().setAt(markerIndex, dragEvent.latLng);
							if(isClosed){
								centerMarker.setPosition(poly.getBounds().getCenter());
							}
						});
						
						google.maps.event.addListener(marker,'dragend',function(){
							if(isClosed){
								var plotCenter = poly.getBounds().getCenter();
								poly.getPath().forEach(function(elem,index){
									console.log(index);
									console.log(elem.lat() +', '+elem.lng());
								});
							}
						});
						
					});
					
					google.maps.event.addListener(map,'add_marker',function(pos){
						console.log('add_marker event triggered');
						if(isClosed){
							return false;
						}
						
						var markerPos = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
						var markerIndex = poly.getPath().length;
						//var isFirstMarker = markerIndex === 0;
						var marker = new google.maps.Marker({
							map: map,
							position: markerPos,
							draggable: true
						});
						
						markers.push(marker);
						
						poly.getPath().push(markerPos);
						
						google.maps.event.addListener(marker,'drag',function(dragEvent){
							var path = poly.getPath();
							path.setAt(markerIndex,dragEvent.latLng);
							poly.getPath().setAt(markerIndex,dragEvent.latLng);
							
							if(isClosed){
								centerMarker.setPosition(poly.getBounds().getCenter());
							}
						});
					
						google.maps.event.addListener(marker,'dragend',function(){
							if(isClosed){
								var plotCenter = poly.getBounds().getCenter();
								poly.getPath().forEach(function(elem,index){
									console.log(index);
									console.log(elem.lat() + ', ' + elem.lng());
								});
							}
						});
						
					});
					
					google.maps.event.addListener(map,'center_marker',function(){
						console.log('center_marker event called');
						var markerPos = map.getCenter();
						var markerIndex = poly.getPath().length;
						var marker = new google.maps.Marker({
							map: map,
							position: markerPos,
							draggable: true
						});
						markers.push(marker);
						poly.getPath().push(markerPos);
						
						
						google.maps.event.addListener(marker,'drag',function(dragEvent){
							var path = poly.getPath();
							path.setAt(markerIndex,dragEvent.latLng);
							poly.getPath().setAt(markerIndex,dragEvent.latLng);
							
							if(isClosed){
								centerMarker.setPosition(poly.getBounds().getCenter());
							}
						});
					
						google.maps.event.addListener(marker,'dragend',function(){
							if(isClosed){
								var plotCenter = poly.getBounds().getCenter();
								poly.getPath().forEach(function(elem,index){
									console.log(index);
									console.log(elem.lat() + ', ' + elem.lng());
								});
							}
						});
						
						
					});
					
					google.maps.event.addListener(map,'clear',function(){
						poly.setPath([]);
						clearMarkers();
						isClosed = false;
						poly = new google.maps.Polyline({
							map: map,
							path: [],
							strokeColor: '#FF0000',
							strokeWeight: 2,
							strokeOpacity: 1.0
						});
						
					});
					
					google.maps.event.addListener(map,'locationchange',function(position){
						posMarker.setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
					});
					
										
					function calculateArea(path){
						var area = google.maps.geometry.spherical.computeArea(path);
						var acres = area * 0.000247105381467;
						return parseFloat(acres).toFixed(2);
					}
					
					function setAllMap(map){
						for(var i=0; i<markers.length; i++){
							markers[i].setMap(map);
						}
						if(isClosed){
							centerMarker.setMap(map);
						}
					}
					
					function clearMarkers(){
						setAllMap(null);
					}
					
					$scope.onCreate({map:map});
				}
				
				if(document.readyState === 'complete'){
					initialize();
				} else {
					google.maps.event.addDomListener(window,'load',initialize);
				}
				
			}, function(err){});
		}	
	};
})

.directive('displaymap',function(){
	return {
		restrict: 'E',
		scope: {
			onCreate: '&'
		},
		link: function($scope,$element,$attr){
			function initialize(){
				
				if(!google.maps.Polygon.prototype.getBounds){
					google.maps.Polygon.prototype.getBounds = function(){
						var bounds = new google.maps.LatLngBounds();
						var paths = this.getPaths();
						var path;
						for(var i=0; i<paths.getLength(); i++){
							path = paths.getAt(i);
							for(var ii=0; ii<path.getLength(); ii++){
								bounds.extend(path.getAt(ii));
							}
						}
						
						return bounds;
					};
				}
				
				var mapOptions = {
					center: new google.maps.LatLng(39.0631820141926,-87.65865381944657),
					zoom: 5,
					mapTypeId: google.maps.MapTypeId.HYBRID,
					tilt: 0,
					scaleControl:false
				};
				
				var map = new google.maps.Map($element[0],mapOptions);
				
				google.maps.event.addListener(map,'centerPlot',function(plot){
					console.log(plot);
					console.log('centerPlot called');
					
					var position = new google.maps.LatLng(plot.center_lat,plot.center_lng);
					var marker = new google.maps.Marker({
						map: map,
						position: position,
						draggable: false
					});
					map.panTo(position);
					
					var path = [];
					var latlngbounds = new google.maps.LatLngBounds();
					
					for(var i=0; i<plot.coords.length; i++){
						var corner = new google.maps.Marker({
							map: map,
							position: new google.maps.LatLng(plot.coords[i].latitude,plot.coords[i].longitude),
							draggable: false
						});
						
						path.push(new google.maps.LatLng(plot.coords[i].latitude,plot.coords[i].longitude));
						latlngbounds.extend(corner.position);
					}
					console.log('Bounds:',latlngbounds);
					var poly = new google.maps.Polygon({
						map:map,
						path: path,
						strokeColor: '#00FF00',
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: '#00FF00',
						fillOpacity: 0.35
					});
					
					map.fitBounds(latlngbounds);
				});
				
				$scope.onCreate({map:map});
				
			}
			
			
				
				if(document.readyState === 'complete'){
					initialize();
				} else {
					google.maps.event.addDomListener(window,'load',initialize);
				}
		}	
	};
});
