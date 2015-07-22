// Plotplanner Hybrid App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('plotPlanner', ['ionic', 'plotPlanner.controllers','plotPlanner.directives','plotPlanner.services','plotPlanner.filters','ngCordova','ngResource'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  
  .state('app.main',{
  	url: "/main",
  	views: {
  		'menuContent': {
  			templateUrl: "templates/home.html",
  			controller: 'MainCtrl'
  		}
  	}
  })

  .state('app.register',{
  	url: "/register",
  	views: {
  		'menuContent':{
  			templateUrl: "templates/register.html",
  			controller: 'MainCtrl'
  		}
  	}
  })

  .state('app.map',{
  	url: "/map",
  	views: {
  		'menuContent': {
  			templateUrl: "templates/map.html",
  			controller: 'MapCtrl'
  		}
  	}
  })

  .state('app.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "templates/search.html",
        controller: 'PlaylistsCtrl'
      }
    }
  })

  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html"
      }
    }
  })
    .state('app.plots', {
      url: "/plots",
      views: {
        'menuContent': {
          templateUrl: "templates/plots.html",
          controller: 'PlotsCtrl'
        }
      }
    })
    
    .state('app.plot', {
      url: "/plot/:plotId",
      views: {
        'menuContent': {
          templateUrl: "templates/plot.html",
          controller: 'PlotCtrl'
        }
      }
    })

  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/playlist.html",
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/main');
});
