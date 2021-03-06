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
     // games page that will use the GameController
     .when('/admin/games', {
         templateUrl: 'views/game-admin.html',
         controller: 'GameAdminController'
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
     })

     // standings page that will use the StandingsController
     .when('/admin/update', {
         templateUrl: 'views/update.html',
         controller: 'UpdateController'
     });

    

     $locationProvider.html5Mode(true);

 }]);
