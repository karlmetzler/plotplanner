angular.module('plotPlanner.services',[])

.factory('Geo',function($q, $cordovaGeolocation){
	return {
		getPos: function(){
			console.log('getPos called...');
			var q = $q.defer();
			
			var posOptions = { timeout: 10000, enableHighAccuracy: true, maximumAge:0 };
			$cordovaGeolocation
			.getCurrentPosition(posOptions)
			.then(function(position){
				console.log('Got Position');
				//alert('Accuracy: '+ position.coords.accuracy);
				q.resolve(position);
				
			},function(err){
				q.reject(err);
			});
			
			return q.promise;
		},
		
		followLocation: function(map){
			console.log('followLocation called...');
			var q = $q.defer();
			var watchOptions = { frequency: 1000, timeout: 3000, enableHighAccuracy: false, maximumAge: 0 };
			var watch = $cordovaGeolocation.watchPosition(watchOptions);
			watch.then(
				null,
				function(err){
					q.reject(err);
				},
				function(position){
					google.maps.event.trigger(map,'locationChanged',position);
					var lat = position.coords.latitude;
					var lng = position.coords.longitude;
					q.resolve(position);
				}
			);
			
			return q.promise;
		}
	};
})
.factory('LoginService',function($q,$http){
	return {
		loginUser: function(email,pw){
			
			var q=$q.defer();
			$http.post('http://localhost/plotplanner/api/login',{
				user_name: email,
				password: pw,
				format:'json'
			})
				.success(function(response,status,headers,config){
					//console.log(response);
					q.resolve(response);
				})
				.error(function(response,status,headers,config){
					//console.log(response);
					//console.log(status);
					q.reject(status);
				});
			return q.promise;
		},
		facebookLogin:function(){}
		
		
		
	};
});
