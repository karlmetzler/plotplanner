angular.module('plotPlanner.directives',['ngCordova'])

.directive('map',function($cordovaGeolocation){
	return {
		restrict: 'E',
		scope: {
			onCreate: '&'
		},
		link: function($scope,$element,$attr){
			var posOptions = {timeout: 10000, enableHighAccuracy: true, maximumAge:0 };
			$cordovaGeolocation.getCurrentPosition(posOptions) 
			.then(function(position){
				console.log('Got Current Position');
				function initialize(){
					if(!google.maps.Polygon.prototype.getBounds){
						google.maps.Polygon.prototype.getBounds = function(){
							var bounds = new google.maps.LatLngBounds();
							var paths = this.getPaths();
							var path;
							for(var i=0; i < paths.getLength(); i++){
								path=paths.getAt(i);
								for(var ii=0; ii < path.getLength(); ii++){
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
					
					var map = new google.maps.Map($element[0], mapOptions);
					
					var posMarker = new google.maps.Marker({
						map: map,
						position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
						clickable: false,
						draggable: false,
						icon: 'img/position-marker.png'
					});
					
					var isClosed = false;
					var poly = new google.maps.Polyline({
						map: map,
						path: [],
						strokeColor:'#FF0000',
						strokeWeight: 2,
						strokeOpacity: 1.0
					});
					
					google.maps.event.addListener(map,'locationChanged',function(){
						console.log('locationChanged called...');
					});
					
					google.maps.event.addListener(map,'close_path',function(){
						console.log('close_path event triggered');
						
						if(isClosed){
							return;
						}
						
						var path = poly.getPath();
						if(path.length < 3){
							alert('Some kind of message here.');
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
						
						//calculate the area
						console.log(calculateArea(path));
						
						var plotCenter = poly.getBounds().getCenter();
						
						isClosed = true;
						centerMarker = new google.maps.Marker({
							map: map,
							position: plotCenter,
							draggable: false
						});
						
						poly.getPath().forEach(function(elem,index){
							console.log(elem.lat());
							console.log(elem.lng());
						});
					});
					
					google.maps.event.addListener(map,'click',function(clickEvent){
						if(isClosed){
							return;
						}
						
						var markerPos = new google.maps.LatLng(clickEvent.coords.latitude,clickEvent.coords.longitude);
						var markerIndex = poly.getPath().length;
						var isFirstMarker = markerIndex === 0;
						var marker = new google.maps.Marker({
							map: map,
							position: markerPos,
							draggable: true
						});
						
						markers.push(marker);
						if(isFirstMarker){
							google.maps.event.addListener(marker,'click',function(){
								if(isClosed){
									return;
								}
								
								var path=poly.getPath();
								poly.setMap(null);
								poly = new google.maps.Polygon({
									map: map,
									path: path,
									strokeColor: '#00FF00',
									strokeOpacity: 0.8,
									strokeWeight: 2,
									fillColor: 'rgb(0,255,255)',
									fillOpacity: 0.35
								});
								
								// calculate the area
								console.log(calculateArea(path));
								var plotCenter = poly.getBounds().getCenter();
								isClosed = true;
								
								centerMarker = new google.maps.Marker({
									map: map,
									position: plotCenter,
									draggable: false
								});
								
								poly.getPath().forEach(function(elem,index){
									console.log(elem.lat());
									console.log(elem.lng());
								});
							});
						}
						
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
									console.log(elem.lat());
									console.log(elem,lng());
								});
							}
						});
						
						google.maps.event.addListener(map,'clear',function(){
							poly.setPath([]);
							clearMarkers();
							isClosed = false;
							poly = new google.maps.Polyline({
								map:map,
								path:[],
								strokeColor: '#FF0000',
								strokeWeight:2,
								strokeOpacity: 1.0
							});
							
							clearMarkers();
						});
						
						poly.getPath().push(markerPos);
						
						
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
				
			},function(err){});
		}
	};
});
