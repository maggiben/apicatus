angular.module( 'apicatus', [
    'templates-app',
    'templates-common',
    'apicatus.main',
    'apicatus.home',
    'apicatus.login',
    'apicatus.applications',
    'apicatus.error',
    //'apicatus.application',
    'AuthService',
    'restangular',
    'ui.bootstrap',
    'ui.router',
    'ui.utils',
    'LocalStorageModule',
    'pascalprecht.translate',
    'ui.ace'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $translateProvider, RestangularProvider, localStorageServiceProvider ) {
    $urlRouterProvider.otherwise( '/main/home' );
    RestangularProvider.setBaseUrl('http://localhost:8080');
    RestangularProvider.setRestangularFields({
        id: "_id"
    });
    RestangularProvider.setDefaultHeaders({
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Access-Control-Allow-Headers": "x-requested-with"
    });
    $translateProvider.useStaticFilesLoader({
        prefix: '/languages/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    //RestangularProvider.setDefaultHttpFields({cache: true});
    localStorageServiceProvider.setPrefix('apicatus');
})

.run(function run($rootScope, $state, AuthService, Restangular) {
    Restangular.setErrorInterceptor(function (response) {
        console.log("error: ", response);
        switch(response.status) {
            case 401:
                $state.transitionTo("main.login");
                break;
            case 403:
                $state.transitionTo("main.login");
                break;
            case 404:
                $state.transitionTo("main.error.404", {data: "response.data"});
                break;
        }
        return response;
    });
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate && !AuthService.isAuthenticated()) {
            console.log("user isn't authenticated");
            AuthService.saveState(toState);
            // User isn’t authenticated
            $state.transitionTo("main.login");
            event.preventDefault();
        }
    });
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, localStorageService, Restangular ) {
    var token = localStorageService.get('token');
    if(token){
        console.log("found token: ", token);
        Restangular.configuration.defaultHeaders.token = token.token;
    }
    /*$scope.account = {
        username: "James Woods",
        email: "jwoods@ananke.com",
        avatar: "https://pbs.twimg.com/profile_images/378800000534882248/fc2341fbc7d96cd7a9dc21f0f396e099.jpeg",
        firstName: "James",
        lastName: "Woods",
        phone: "555-555-555",
        address: "bonpland",
        zip: 4336,
        city: "Buenos Aires",
        timezone: "AGT",
    };*/
    // authenticate
    //$scope.user = Restangular.one('user').customPOST({username: "admin", password: "admin"}, 'signin');
    // Restangular returns promises
    //$scope.baseApi = Restangular.one('user');
    //$scope.baseApi.get().then(function(account) {
        // returns a list of users
    //    $scope.account = account;   // first Restangular obj in list: { id: 123 }
    //});

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | apicatus' ;
        }
    });
});
