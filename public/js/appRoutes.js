 angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

     $routeProvider

     // home page
         .when('/', {
         templateUrl: 'views/home.html',
         controller: 'MainController'
     })
          // standings page that will use the StandingsController
     .when('/teams/compare', {
         templateUrl: 'views/comparison.html',
         controller: 'ComparisonController'
     })

     .when('/team/:teamId', {
         templateUrl: 'views/team.html',
         controller: 'TeamController'
     })

     // games page that will use the GameController
     .when('/games', {
         templateUrl: 'views/game.html',
         controller: 'GameController'
     })

      // standings page that will use the StandingsController
     .when('/standings/:association', {
         templateUrl: 'views/standings-rs.html',
         controller: 'StandingsRsController'
     })

      // standings page that will use the StandingsController
     .when('/admin/team', {
         templateUrl: 'views/team-admin.html',
         controller: 'TeamAdminController'
     })
      // standings page that will use the StandingsController
     .when('/ranking', {
         templateUrl: 'views/power-ranking.html',
         controller: 'PowerRankController'
     })
     

     // standings page that will use the StandingsController
     .when('/standings', {
         templateUrl: 'views/standings.html',
         controller: 'StandingsController'
     });

    

     $locationProvider.html5Mode(true);

 }]);
