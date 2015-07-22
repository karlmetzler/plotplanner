var markers = [];
var plotCoords = [];

angular.module('plotPlanner.controllers', ['ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal,$ionicLoading, $timeout,$http,LoginService,$cordovaOauth) {
  // Form data for the login modal
  $scope.loginData = {};
	console.log('running');
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
   
    if(window.localStorage['plotplanner_user']){
	  	$scope.user = JSON.parse(window.localStorage['plotplanner_user']);
	  } else {
	  	console.log('missing data');
	  	$scope.modal.show();
	  }
	
    
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
 
  $scope.doLogin = function() {
  	$scope.loading = $ionicLoading.show({
		template: 'Signing In...',
		showBackdrop: true
	});
	
    LoginService.loginUser($scope.loginData.username,$scope.loginData.password)
    	.then(function(result){
    		// handle successful login
    		console.log(result);
    		
    		window.localStorage['plotplanner_user'] = JSON.stringify({
    			uid : result.id,
    			first_name: result.first_name,
    			last_name: result.last_name,
    			email: result.email,
    			address: result.address,
    			address2: result.address2,
    			city: result.city,
    			state: result.state,
    			zip: result.zip,
    			country: result.country,
    			phone: result.phone
    		});
    		
	  		//$scope.user = JSON.parse(window.localStorage['plotplanner_user']);
	  		$ionicLoading.hide();
    		$scope.modal.hide();
    	},function(status){
    		console.log(status);
    		// handle error
    		$ionicLoading.hide();
    	});
  };
  
  $scope.registerPage=function(){
  	$scope.modal.hide();
  };
  
  $scope.facebookLogin = function(){
  	console.log('Facebook Login Called');
  	
  	$scope.loading = $ionicLoading.show({
		template: 'Signing In...',
		showBackdrop: true
	});
	
  	$cordovaOauth.facebook('900681043310580', ["public_profile","email"]).then(function(token){
  		$http.get('https://graph.facebook.com/v2.3/me',{params:{access_token:token.access_token,format:'json'}})
  			.then(function(result){
  				/*
  				 * Got the user profile...
  				 * log the user through plotplanner api and save to local storage
  				 */
  				 $http.post('http://plotplanner.karlmetzler.com/api/fblogin',{params:{email:result.email,oauth_uid:result.id,format:'json'}})
  				 	.then(function(res){
  				 		console.log(res);
    		
			    		window.localStorage['plotplanner_user'] = JSON.stringify({
			    			uid : res.id,
			    			first_name: res.first_name,
			    			last_name: res.last_name,
			    			email: res.email,
			    			address: res.address,
			    			address2: res.address2,
			    			city: res.city,
			    			state: res.state,
			    			zip: res.zip,
			    			country: res.country,
			    			phone: res.phone
			    		});
			    		
			    		//$scope.user = JSON.parse(window.localStorage['plotplanner_user']);
				  		$ionicLoading.hide();
			    		$scope.modal.hide();
			    		
  				 	},function(error,status){
  				 		// handle api login error here...
  				 		console.log(error);
  				 		console.log(status);
  				 	});				
  				
  			},function(error){
  				alert("There was a problem getting your profile.  Check the logs for details.");
                console.log(error);
  			});
  		
  	},function(error){
  		console.log(error);
  	});
  	
  };
  
  //$scope.user = JSON.parse(window.localStorage['plotplanner_user']);
})

.controller('RegisterCtrl',function($scope){
	
})

.controller('MainCtrl', function($scope,$cordovaGeolocation,Geo,$ionicLoading){
	$scope.title = 'Plot Planner';
	//$scope.user = JSON.parse(window.localStorage['plotplanner_user']);
	
})

.controller('MapCtrl', function($scope,$rootScope,$ionicLoading,$cordovaGeolocation,Geo){
	var _this = this;
	$scope.loading = $ionicLoading.show({
		template: 'Getting Current Location...',
		showBackdrop: true
	});
	
	
	$scope.title = 'Map';
	
	$scope.mapCreated = function(map){
		$rootScope.map = map;
		console.log('mapCreated called');
		//console.log(map);
		$ionicLoading.hide();
		
		var watchOptions = {
			frequency: 1000,
			enableHighAccuracy: true,
			timeout: 5000
		};
		
		$rootScope.watch = $cordovaGeolocation.watchPosition(watchOptions);
		$rootScope.watch.then(
			null,
			function(err){
				alert('unable to retrieve position');
			},
			function(position){
				console.log('Watching Position. Lat: '+position.coords.latitude+', Lng: '+ position.coords.longitude);
				google.maps.event.trigger($rootScope.map,'locationchange',position);
			}
		);
		
		//console.log($cordovaGeolocation.clearWatch);
		
	};
	
	$scope.addMarker = function(){
		
		$scope.loading = $ionicLoading.show({
			template: 'Getting Current Location...',
			showBackdrop: true
		});
		
		Geo.getPos().then(function(position){
			
			google.maps.event.trigger($rootScope.map,'add_marker',position);
			
			$ionicLoading.hide();
		});
		
	};
	
	$scope.addCenterMarker = function(){
		google.maps.event.trigger($rootScope.map,'center_marker');
	};
	
	$scope.clearMarkers = function(){
		google.maps.event.trigger($rootScope.map,'clear');
	};
	
	$scope.closePlot = function(){
		console.log('watch ', $rootScope.watch);
		console.log('WatchID ',$rootScope.watch.watchID);
		google.maps.event.trigger($rootScope.map,'close_path');
		console.log('cordovaGeolocation: ',$cordovaGeolocation);
		$rootScope.watch.clearWatch();
		
		/*
		$cordovaGeolocation.clearWatch($rootScope.watch.watchID)
		.then(function(result){
			
		},function(error){
			
		});
		*/
	};
	
	$scope.centerOnMe = function($scope){
		var posOptions = { timeout: 10000, enableHighAccuracy: false };
		$cordovaGeolocation.getCurrentPosition(posOptions)
		.then(function(position){
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			console.log('FROM CORDOVA:');
			console.log(lat);
			console.log(lng);
		},function(err){
			console.log(err);
		});
	};
	
	
	
})

.controller('PlotsCtrl', function($scope,$q,$http) {
	$scope.user = JSON.parse(window.localStorage['plotplanner_user']);
	$scope.title = 'My Saved Plots';
	$scope.init = function(){
		$scope.getPlots()
			.then(function(res){
				console.log(res);
				$scope.plots = res;
			},function(status){
				$scope.pageError = status;
				console.log(status);
			});
	};
	
	$scope.getPlots = function(){
		var defer = $q.defer();
		$http.jsonp('http://plotplanner.karlmetzler.com/api/plots/user/'+$scope.user.uid+'/format/json?callback=JSON_CALLBACK')
			.success(function(res){
				defer.resolve(res);
			}).error(function(status,err){
				defer.reject(err);
			});
		return defer.promise;
	};
		
	$scope.init();
})

.controller('PlotCtrl',function($scope,$rootScope,$q,$http,$stateParams){
	$scope.user = JSON.parse(window.localStorage['plotplanner_user']);
	$scope.mapCreated = function(map){
		$rootScope.map = map;
	};
	
	var id = $stateParams.plotId;
	
	$scope.init = function(){
		$scope.getPlot()
			.then(function(res){
				//console.log(res);
				$scope.plot = res;
				
				$scope.centerPlot();
							
			},function(status){
				console.log(status);
				$scope.pageError = status;
			});
	};
	
	$scope.centerPlot = function(){
		console.log($rootScope.map);
		google.maps.event.trigger($rootScope.map,'centerPlot',$scope.plot);
	};
	
	$scope.getPlot = function(){
		var defer = $q.defer();
		$http.jsonp('http://plotplanner.karlmetzler.com/api/plot/id/'+id+'/user/'+$scope.user.uid+'/format/json?callback=JSON_CALLBACK')
			.success(function(res){
				defer.resolve(res);
			}).error(function(status,err){
				defer.reject(err);
			});
		return defer.promise;
	};

	$scope.init();
	
	
});
