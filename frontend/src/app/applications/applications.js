/**

 */
angular.module( 'apicatus.applications', [])

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
                controller: 'ApplicationsCtrl',
                templateUrl: 'applications/applications.tpl.html'
            }
        },
        data: { pageTitle: 'Applications' },
        authenticate: true
    })
    .state('main.applications.list', {
        url: '/list',
        templateUrl: 'applications/list/applications.list.tpl.html',
        authenticate: true,
        onEnter: function(){
            console.log("enter contacts.list");
        }
    })
    .state('main.applications.application', {
        url: '/:id',
        templateUrl: 'applications/application/application.tpl.html',
        authenticate: true,
        controller: function($scope, $stateParams, Restangular){
            $scope.applications = Restangular.one('digestors', $stateParams.id).get().then(function(digestor){
                console.log(digestor);
                $scope.api = digestor;
                $scope.$watch('api', function(newValue, oldValue) {
                    $scope.api.put();
                });
            });

            $scope.save = function(api) {
                console.log("save api");
                $scope.api.put();
            };
            $scope.addResource = function () {
                $scope.api.entries.push({
                    "id": "dsfadsf-asdfasdf-asdfadsf",
                    "route": "",
                    "method": {"id": 2, "label": "GET"},
                    "parameters": {
                        headers: [],
                        values: []
                    },
                    "sends": "",
                    "status": { "id": 204 },
                    "contentType": { "id": 100 },
                    "description": "",
                    "proxy": {
                        "enabled": false,
                        "url": ""
                    },
                    "hits": 0,
                    "isEditing": false
                });
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
            $scope.aceModel = ';; Scheme code in here.\n' +
                '(define (double x)\n\t(* x x))\n\n\n' +
                '<!-- XML code in here. -->\n' +
                '<root>\n\t<foo>\n\t</foo>\n\t<bar/>\n</root>\n\n\n' +
                '// Javascript code in here.\n' +
                'function foo(msg) {\n\tvar r = Math.random();\n\treturn "" + r + " : " + msg;\n}';

        },
        data: { pageTitle: 'Application' },
        onEnter: function(){
          console.log("enter contacts.detail");
        }
    });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, Restangular ) {

    $scope.applications = Restangular.one('digestors').getList().then(function(digestors){
        console.log(digestors);
        $scope.apis = digestors;
    });
    //Restangular.one('projects').getList().then(function(project){
        //console.log("project", project);
    //});
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
});

