
angular.module( 'apicatus.application', [
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])


.config(function config( $stateProvider ) {
    $stateProvider.state('main.applications.application', {
        url: '/:id',
        templateUrl: 'applications/application/application.tpl.html',
        data: { pageTitle: 'Resource editor' },
        authenticate: false
    });
})

.controller( 'ApplicationCtrl', function ApplicationController( $scope, $location, $stateParams, Restangular ) {
    console.log("application controler SINGLE");
});
