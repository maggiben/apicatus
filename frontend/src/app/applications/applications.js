/**

 */
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
        //authenticate: true,
        controller: function($scope, $stateParams, Restangular) {
            $scope.httpSettings = {
                "statuses": [
                    { id: 100, group: "Informational", label: 100, code: 100, title: "Continue", description: "Client should continue with request" },
                    { id: 101, group: "Informational", label: 101, code: 101, title: "Switching Protocols", description: "Server is switching protocols" },
                    { id: 102, group: "Informational", label: 102, code: 102, description: "Server has received and is processing the request" },
                    { id: 103, group: "Informational", label: 103, code: 103, description: "Resume aborted PUT or POST requests" },
                    { id: 122, group: "Informational", label: 122, code: 122, description: "URI is longer than a maximum of 2083 characters" },

                    { id: 200, group: "Success", label: 200, code: 200, title: "OK", description: "standard response for successful HTTP requests" },
                    { id: 201, group: "Success", label: 201, code: 201, title: "Created", description: "request has been fulfilled; new resource created" },
                    { id: 202, group: "Success", label: 202, code: 202, title: "Accepted", description: "request accepted, processing pending" },
                    { id: 203, group: "Success", label: 203, code: 203, title: "Non-Authoritative Information", description: "request processed, information may be from another source" },
                    { id: 204, group: "Success", label: 204, code: 204, title: "No Content", description: "request processed, no content returned" },
                    { id: 205, group: "Success", label: 205, code: 205, title: "Reset Content", description: "request processed, no content returned, reset document view" },
                    { id: 206, group: "Success", label: 206, code: 206, title: "Partial Content", description: "partial resource return due to request header" },
                    { id: 207, group: "Success", label: 207, code: 207, description: "XMLl, can contain multiple separate responses" },
                    { id: 208, group: "Success", label: 208, code: 208, description: "results previously returned" },
                    { id: 226, group: "Success", label: 226, code: 226, description: "request fulfilled, reponse is instance-manipulations" },

                    { id: 200, group: "Redirection", label: 200, code: 200, description: "multiple options for the resource delivered" },
                    { id: 201, group: "Redirection", label: 201, code: 201, description: "this and all future requests directed to the given URI" },
                    { id: 302, group: "Redirection", label: 302, code: 302, description: "temporary response to request found via alternative URI" },
                    { id: 303, group: "Redirection", label: 303, code: 303, description: "permanent response to request found via alternative URI" },
                    { id: 304, group: "Redirection", label: 304, code: 304, description: "resource has not been modified since last requested" },
                    { id: 305, group: "Redirection", label: 305, code: 305, description: "content located elsewhere, retrieve from there" },
                    { id: 306, group: "Redirection", label: 306, code: 306, description: "subsequent requests should use the specified proxy" },
                    { id: 307, group: "Redirection", label: 307, code: 307, description: "connect again to different uri as provided" },
                    { id: 308, group: "Redirection", label: 308, code: 308, description: "resumable HTTP Requests" },

                    { id: 400, group: "Client Error", label: 400, code: 400, description: "request cannot be fulfilled due to bad syntax" },
                    { id: 401, group: "Client Error", label: 401, code: 401, description: "authentication is possible but has failed" },
                    { id: 402, group: "Client Error", label: 402, code: 402, description: "payment required, reserved for future use" },
                    { id: 403, group: "Client Error", label: 403, code: 403, description: "server refuses to respond to request" },
                    { id: 404, group: "Client Error", label: 404, code: 404, description: "requested resource could not be found" },
                    { id: 405, group: "Client Error", label: 405, code: 405, description: "request method not supported by that resource" },
                    { id: 406, group: "Client Error", label: 406, code: 406, description: "content not acceptable according to the Accept headers" },
                    { id: 407, group: "Client Error", label: 407, code: 407, description: "client must first authenticate itself with the proxy" },
                    { id: 408, group: "Client Error", label: 408, code: 408, description: "server timed out waiting for the request" },
                    { id: 409, group: "Client Error", label: 409, code: 409, description: "request could not be processed because of conflict" },
                    { id: 410, group: "Client Error", label: 410, code: 410, description: "resource is no longer available and will not be available again" },
                    { id: 411, group: "Client Error", label: 411, code: 411, description: "request did not specify the length of its content" },
                    { id: 412, group: "Client Error", label: 412, code: 412, description: "server does not meet request preconditions" },
                    { id: 413, group: "Client Error", label: 413, code: 413, description: "request is larger than the server is willing or able to process" },
                    { id: 414, group: "Client Error", label: 414, code: 414, description: "URI provided was too long for the server to process" },
                    { id: 415, group: "Client Error", label: 415, code: 415, description: "server does not support media type" },
                    { id: 416, group: "Client Error", label: 416, code: 416, description: "client has asked for unprovidable portion of the file" },
                    { id: 417, group: "Client Error", label: 417, code: 417, description: "server cannot meet requirements of Expect request-header field" },
                    { id: 418, group: "Client Error", label: 418, code: 418, description: "I'm a teapot" },
                    { id: 420, group: "Client Error", label: 420, code: 420, description: "Twitter rate limiting" },
                    { id: 422, group: "Client Error", label: 422, code: 422, description: "request unable to be followed due to semantic errors" },
                    { id: 423, group: "Client Error", label: 423, code: 423, description: "resource that is being accessed is locked" },
                    { id: 424, group: "Client Error", label: 424, code: 424, description: "request failed due to failure of a previous request" },
                    { id: 426, group: "Client Error", label: 426, code: 426, description: "client should switch to a different protocol" },
                    { id: 428, group: "Client Error", label: 428, code: 428, description: "origin server requires the request to be conditional" },
                    { id: 429, group: "Client Error", label: 429, code: 429, description: "user has sent too many requests in a given amount of time" },
                    { id: 431, group: "Client Error", label: 431, code: 431, description: "server is unwilling to process the request" },
                    { id: 444, group: "Client Error", label: 444, code: 444, description: "server returns no information and closes the connection" },
                    { id: 449, group: "Client Error", label: 449, code: 449, description: "request should be retried after performing action" },
                    { id: 450, group: "Client Error", label: 450, code: 450, description: "Windows Parental Controls blocking access to webpage" },
                    { id: 451, group: "Client Error", label: 451, code: 451, description: "The server cannot reach the client's mailbox." },
                    { id: 499, group: "Client Error", label: 499, code: 499, description: "connection closed by client while HTTP server is processing" },

                    { id: 500, group: "Server Error", label: 500, code: 500, description: "generic error message" },
                    { id: 501, group: "Server Error", label: 501, code: 501, description: "server does not recognise method or lacks ability to fulfill" },
                    { id: 502, group: "Server Error", label: 502, code: 502, description: "server received an invalid response from upstream server" },
                    { id: 503, group: "Server Error", label: 503, code: 503, description: "server is currently unavailable" },
                    { id: 504, group: "Server Error", label: 504, code: 504, description: "gateway did not receive response from upstream server" },
                    { id: 505, group: "Server Error", label: 505, code: 505, description: "server does not support the HTTP protocol version" },
                    { id: 506, group: "Server Error", label: 506, code: 506, description: "content negotiation for the request results in a circular reference" },
                    { id: 507, group: "Server Error", label: 507, code: 507, description: "server is unable to store the representation" },
                    { id: 508, group: "Server Error", label: 508, code: 508, description: "server detected an infinite loop while processing the request" },
                    { id: 509, group: "Server Error", label: 509, code: 509, description: "bandwidth limit exceeded" },
                    { id: 510, group: "Server Error", label: 510, code: 510, description: "further extensions to the request are required" },
                    { id: 511, group: "Server Error", label: 511, code: 511, description: "client needs to authenticate to gain network access" },
                    { id: 598, group: "Server Error", label: 598, code: 598, description: "network read timeout behind the proxy" },
                    { id: 599, group: "Server Error", label: 599, code: 599, description: "network connect timeout behind the proxy" }
                ],
                "methods": [
                    { id: 1, group: "RFC 2616", label: "OPTIONS", code: 100, title: "Continue", description: "Client should continue with request" },
                    { id: 2, group: "RFC 2616", label: "GET", code: 101, title: "Switching Protocols", description: "Server is switching protocols" },
                    { id: 3, group: "RFC 2616", label: "HEAD", code: 102, description: "Server has received and is processing the request" },
                    { id: 4, group: "RFC 2616", label: "POST", code: 103, description: "Resume aborted PUT or POST requests" },
                    { id: 5, group: "RFC 2616", label: "PUT", code: 122, description: "URI is longer than a maximum of 2083 characters" },
                    { id: 6, group: "RFC 2616", label: "DELETE", code: 122, description: "URI is longer than a maximum of 2083 characters" },
                    { id: 7, group: "RFC 2616", label: "TRACE", code: 122, description: "URI is longer than a maximum of 2083 characters" },
                    { id: 8, group: "RFC 2616", label: "CONNECT", code: 122, description: "URI is longer than a maximum of 2083 characters" }
                ],
                "contentTypes": [
                    { id: 0, group: "Application", label: "application/json" },
                    { id: 1, group: "Application", label: "application/x-www-form-urlencoded" },
                    { id: 2, group: "Application", label: "application/xhtml+xml" },
                    { id: 3, group: "Application", label: "application/xml" },
                    { id: 4, group: "Audio", label: "audio/mpeg" },
                    { id: 5, group: "Audio", label: "audio/ogg" },
                    { id: 6, group: "Image", label: "image/gif" },
                    { id: 7, group: "Image", label: "image/jpeg" },
                    { id: 7, group: "Image", label: "image/png" },
                    { id: 9, group: "Image", label: "image/svg+xml" },
                    { id: 10, group: "Message", label: "message/http" },
                    { id: 11, group: "Message", label: "message/partial" },
                    { id: 12, group: "Model", label: "model/vrml" },
                    { id: 13, group: "Multipart", label: "multipart/form-data" },
                    { id: 14, group: "Text", label: "text/css" },
                    { id: 15, group: "Text", label: "text/csv" },
                    { id: 16, group: "Text", label: "text/html" },
                    { id: 16, group: "Text", label: "text/json" },
                    { id: 704, group: "Text", label: "text/json" },
                    { id: 705, group: "Text", label: "text/xml" },
                    { id: 800, group: "Video", label: "video/mpeg" },
                    { id: 801, group: "Video", label: "video/mp4" },
                    { id: 802, group: "Video", label: "video/x-flv" }
                ]
            };
            $scope.applications = Restangular.one('digestors', $stateParams.id).get().then(function(digestor){
                console.log(digestor);
                $scope.api = digestor;
            });

            $scope.save = function(api) {
                console.log("save api");
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
                //console.log($scope.api.endpoints);
                $scope.api.endpoints.splice($index, 1);
                $scope.api.put();
            };
            $scope.saveMethod = function(method, $index) {
                console.log(method);
                /*endpoint.methods[$index] = {
                    "name": "Method XX1",
                    "synopsis": "Grabs information from the A1 data set",
                    "method": "GET",
                    "URI": "/myroute"
                };*/
                $scope.api.put();
            };
            $scope.probe = function(method, $index) {

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

        },
        data: { pageTitle: 'Application' },
        onEnter: function(){
          console.log("enter contacts.detail");
        }
    });
})

// Applications controller
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, $modal, Restangular ) {

    var baseDigestors = Restangular.all('digestors');

    $scope.applications = Restangular.one('digestors').getList().then(function(digestors) {
        $scope.apis = angular.copy(digestors);
        Restangular.one('logs').getList().then(function(logs){
            $scope.logs = angular.copy(logs);
            $scope.apis.map(function(api) {
                var digestorLogs = _.filter($scope.logs, {'digestor': api._id });
                //console.log("api ", api.name,"logs:", digestorLogs);
                api.logs = digestorLogs;
            });
            console.log($scope.apis);
        });
        for(var i = 0; i < digestors.length; i ++) {
            $scope.apis[i].data = [
                {
                    date: new Date(2010, 1, 1),
                    value: 22
                }, {
                    date: new Date(2010, 1, 2),
                    value: 12
                }, {
                    date: new Date(2010, 1, 3),
                    value: 12
                }, {
                    date: new Date(2010, 1, 4),
                    value: 42
                }, {
                    date: new Date(2010, 1, 5),
                    value: 32
                }, {
                    date: new Date(2010, 1, 6),
                    value: 12
                }, {
                    date: new Date(2010, 1, 7),
                    value: 22
                }, {
                    date: new Date(2010, 1, 8),
                    value: 10
                }, {
                    date: new Date(2010, 1, 9),
                    value: 30
                }
            ];
        }
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
// We already have a limitTo filter built-in to angular,
// let's make a startFrom filter
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});

