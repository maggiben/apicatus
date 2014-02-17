////////////////////////////////////////////////////////////////////////////////
// D3 loader service                                                          //
// NOTES:                                                                     //
// * Maybe it would be a good idea to use a CDN to fetch d3's source          //
////////////////////////////////////////////////////////////////////////////////
angular.module('AuthService', ['restangular'])
.config(function AuthServiceConfig (RestangularProvider) {
    //console.log(RestangularProvider);
})
.factory('AuthService', ['$document', '$q', '$rootScope', 'Restangular', 'localStorageService', function($document, $q, $rootScope, Restangular, localStorageService) {
    var isAuthenticated = false;
    var appState = {};  // holds the state of the app

    function enterAuthentication(user, pass) {
        // Create a script tag with d3 as the source
        // and call our onScriptLoad callback when it
        // has been loaded
        var defer = $q.defer();
        var code = [];

        Restangular.one('user').customPOST({username: user, password: pass}, 'signin').then(function (user) {

            var codeBlob = null;
            var url = null;
            var scriptTag = $document[0].createElement('script');

            if(user.token.token) {
                Restangular.configuration.defaultHeaders.token = user.token.token;
                localStorageService.add('token', user.token);
                code = ['window.isAuthenticated = true;'];
                isAuthenticated = true;
            } else {
                code = ['window.isAuthenticated = false;'];
                isAuthenticated = false;
                defer.reject(isAuthenticated);
            }

            codeBlob = new Blob(code, {type : 'text/javascript'});
            url = URL.createObjectURL(codeBlob);

            function onAuthenticated(event){
                $rootScope.$apply(function() {
                    defer.resolve(isAuthenticated);
                });
            }
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = url;
            scriptTag.onreadystatechange = function () {
                if (!this.readyState || this.readyState == 'complete') {
                    onAuthenticated();
                }
            };
            scriptTag.onload = onAuthenticated;

            var node = $document[0].getElementsByTagName('body')[0];
            node.appendChild(scriptTag);

        }, function(error) {
            code = ['window.isAuthenticated = false;'];
            isAuthenticated = false;
            defer.reject(error);
        });

        return defer.promise;
    }
    return {
        authenticate: function(user, pass) {
            return enterAuthentication(user, pass);
        },
        logout: function() {
            return leaveAuthentication();
        },
        isAuthenticated: function() {
            return isAuthenticated; /*return d.promise;*/
        },
        saveState: function(state) {
            appState = state; // Save the app state before going into the login secuence
        },
        getState: function() {
            return appState;
        },
        getRole: function() {
            return "admin";
        }
    };
}]);