/*jslint evil: true */

angular.module( 'apicatus.applications', [
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
    $stateProvider.state( 'main.applications', {
        url: '/applications',
        abstract: true,
        template: '<ui-view/>',
        views: {
            "main": {
                templateUrl: 'applications/applications.tpl.html'
            }
        },
        data: { pageTitle: 'Applications' },
        authenticate: true
    })
    .state('main.applications.list', {
        url: '/list',
        templateUrl: 'applications/list/applications.list.tpl.html',
        //authenticate: true,
        onEnter: function(){
            console.log("enter contacts.list");
        }
    })
    .state('main.applications.application', {
        url: '/:id',
        templateUrl: 'applications/application/application.tpl.html',
        controller: 'ApplicationCtrl',
        data: { pageTitle: 'Resource editor' },
        onEnter: function(){
          console.log("enter contacts.detail");
        }
    });
})

// Applications controller
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, $modal, Restangular ) {

    var baseDigestors = Restangular.all('digestors');

    $scope.applications = Restangular.one('digestors').getList().then(function(digestors) {
        //$scope.apis = _.sortBy(digestors, {enabled: true});
        /*$scope.apis = digestors.sort(function(a, b) {
            return b.enabled - a.enabled;
        });*/
        $scope.apis = digestors;
        Restangular.one('logs').getList().then(function(logs){
            $scope.logs = logs;
            $scope.apis.map(function(api) {
                var digestorLogs = $scope.logs.filter(function(log) {
                    return log.digestor == api._id;
                });
                //_.filter($scope.logs, {'digestor': api._id });
                if(digestorLogs.length <= 0) {
                    return;
                }
                digestorLogs = _.sortBy(digestorLogs, 'date');
                var mean = 1;
                //d3.mean(digestorLogs, function(d) { return d.time; });
                api.meanTime = parseInt(mean, 10);
                api.logs = angular.copy(digestorLogs);
            });
        });
    });
    //Restangular.one('projects').getList().then(function(project){
        //console.log("project", project);
    //});
    $scope.data = [1, 4, 2, 4, 7, 2, 9, 5, 6, 4, 1, 6, 8, 2];


    $scope.newApi = function () {
        var modalInstance = $modal.open({
            templateUrl: 'new_api_modal.html',
            controller: newApiModalCtrl,
            windowClass: '',
            resolve: {
                apis: function () {
                    return $scope.apis;
                }
            }
        });

        modalInstance.result.then(
            function (api) {
                console.log("modal ok: ", api);
                baseDigestors.post(api).then(function(result){
                    $scope.apis.push(api);
                }, function(error) {

                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };

    // Please note that $modalInstance represents a modal window (instance) dependency.
    // It is not the same as the $modal service used above.
    var newApiModalCtrl = function ($scope, $modalInstance, apis) {
        $scope.api = {
            name: "test123",
            domain: "myDomain"
        };
        $scope.ok = function() {
            console.log("ok:", apis);
        };
        $scope.submit = function () {
            console.log("ok:", apis);
            $modalInstance.close($scope.api);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    $scope.addApplication = function() {
        $scope.apis.push({
            _id: "5262f08d284b9963b1000001",
            allowCrossDomain: false,
            created: "2013-10-19T20:50:21.553Z",
            enabled: true,
            entries: [],
            hits: 0,
            lastAccess: "2013-10-19T20:50:21.553Z",
            lastUpdate: "2013-10-19T20:50:21.553Z",
            logging: false,
            name: "myApi3",
            type: "REST"
        });
    };
})
.controller( 'ApplicationCtrl', function ApplicationController( $scope, $location, $stateParams, $modal, Restangular, parseURL ) {
    console.log("configuration", Restangular.configuration.baseUrl);
    $scope.applications = Restangular.one('digestors', $stateParams.id).get().then(function(digestor) {
        $scope.api = digestor;
        Restangular.one('logs').get({digestor: digestor._id, limit: 10}).then(function(logs) {
            $scope.api.logs = logs;
            for(var i = 0; i < $scope.api.endpoints.length; i++) {
                var endpoint = $scope.api.endpoints[i];
                for(var j = 0; j < endpoint.methods.length; j++) {
                    var method = endpoint.methods[j];
                    // Pair methods and logs
                    method.logs = _.filter(logs, {'method': method._id });
                    // Create simple demo to test the endpoint
                    var serviceUrl = parseURL.parse(Restangular.configuration.baseUrl);
                    console.log(serviceUrl);
                    var options = {
                        type: method.method.toUpperCase(),
                        url: serviceUrl.protocol + "://" + $scope.api.name + "." + serviceUrl.host + ":" + serviceUrl.port + method.URI,
                        data: {}
                    };
                    method.demo = "$.ajax(" + JSON.stringify(options) + ")\n.then(function(r){\n\tconsole.log(r);\n});";
                }
            }
            /*$scope.api.map(function(api) {
                var digestorLogs = _.filter($scope.logs, {'digestor': api._id });
                if(digestorLogs.length <= 0) {
                    return;
                }
                digestorLogs = _.sortBy(digestorLogs, 'date');
                var mean = 1;
                //d3.mean(digestorLogs, function(d) { return d.time; });
                api.meanTime = parseInt(mean, 10);
                api.lastAccess = moment(digestorLogs[digestorLogs.length-1].date).fromNow();
                api.logs = angular.copy(digestorLogs);
            });*/
        });
    });
    $scope.currentPage = 1;
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.save = function(api) {
        $scope.api.put();
    };
    $scope.addResource = function (api) {
        console.log($scope.api.endpoints);
        $scope.api.endpoints.push({
            name: "Resource Group A",
            methods: [
                {
                    "name": "Method A1",
                    "synopsis": "Grabs information from the A1 data set",
                    "method": "GET",
                    "URI": "/a1/grab"
                }
            ]
        });
        $scope.api.put();
    };
    $scope.addEndpoint = function(endpoint) {
        console.log(endpoint.methods);
        endpoint.methods.push({
            "name": "Method XX1",
            "synopsis": "Grabs information from the A1 data set",
            "method": "GET",
            "URI": "/myroute"
        });
        $scope.api.put();
    };
    $scope.removeEndpoint = function(endpoint, $index) {
        $scope.api.endpoints.splice($index, 1);
        $scope.api.put();
    };
    $scope.saveMethod = function(method, $index) {
        $scope.api.put();
    };
    $scope.demo = function(demo) {
        var result = eval(demo);
    };
    // The modes
    $scope.modes = ['Scheme', 'XML', 'Javascript'];
    $scope.mode = $scope.modes[0];

    $scope.aceLoaded = function(_editor) {
        console.log("ace loaded: ", _editor);
        window.ace = _editor;
         // Editor part
        //var _session = _editor.getSession();
        //_session.setMode('ace/mode/javascript');
    };

    // The ui-ace option
    $scope.aceOption = {
        mode: $scope.mode.toLowerCase(),
        onLoad: function (_ace) {
            console.log("ace loaded: ", _ace);
            window.ace = _ace;
            _ace.getSession().setMode('ace/mode/javascript');
            // HACK to have the ace instance in the scope...
            $scope.modeChanged = function () {
                _ace.getSession().setMode('ace/mode/' + $scope.mode.toLowerCase());
            };
        }
    };
    // Initial code content...
    $scope.aceModel = '$.ajax(' + "route" + ')';
})
// We already have a limitTo filter built-in to angular,
// let's make a startFrom filter
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});

