angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
            
    .state('mapa', {
      url: '/mapa',
      templateUrl: 'templates/mapa.html',
      controller: 'MapController'
    })

    .state('lista', {
      url: '/lista',
      templateUrl: 'templates/lista.html',
      controller: 'PesquisaController'
    });

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/mapa');

});