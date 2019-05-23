'use strict';


angular.module('pcSessionService', [])
    .service('pcSessionService', function($q, $rootScope, $window) {

        // <handler for message from sign in popup>
        window.onmessage = function(e) {
            var access_token = e.data.access_token;
            if (access_token) {
                $rootScope.access_token = access_token;
                $rootScope.$apply();
                $rootScope.setSignState();
            }
        };
        // </handler for message from sign in popup>

        var queueList = [];

        return {

            //* UNIT TEST **

            getEnv: function() {
                return globalEnvironment;
            },

            getClientId: function() {
                return globalClientId;
            },

            getURL: function() {
                return globalRedirectUrl;
            },


            UnitTest_getUsers: function(_sessionParams) {

                var pureCloudSession = purecloud.platform.PureCloudSession(_sessionParams);
                var api = new purecloud.platform.UsersApi(pureCloudSession);
                return api.getUsers(10, 1);


            },

            UnitTest_getQueues: function(_sessionParams) {

                var pureCloudSession = purecloud.platform.PureCloudSession(_sessionParams);
                var api = new purecloud.platform.RoutingApi(pureCloudSession);
                return api.getQueues(10, 1);


            },


            // * END UNIT TESTS

            setToken: function(newToken) {
                localStorage.setItem("kiwi_accessToken", newToken);
            },

            getToken: function() {
                return localStorage.kiwi_accessToken;
            },


            signIn: function() {

                var environment = globalEnvironment;
                var clientId = globalClientId;

                if (!environment || !clientId) {
                    alert('ERROR: application not configured properly');
                    return;
                }

                var popupUrl = '#/signIn';
                $rootScope.loading = true;
                var popup = window.open(popupUrl, 'Sign In', "width=600,height=500,top=100,left=100,toolbar=no,scrollbars=no,resizable=no");

                var popupMonitor = setInterval(function() {
                    if (popup.closed) {
                        window.clearInterval(popupMonitor);
                        $rootScope.loading = false;
                        $rootScope.$apply();
                    }
                }, 500);
            },

            signOff: function() {
                //var environment = localStorage.getItem('kiwi_environment');
                //var clientId = localStorage.getItem('kiwi_clientId');
                var environment = globalEnvironment;
                var clientId = globalClientId;

                var signOffUrl = 'https://login.' + environment + '/logout?client_id=' + clientId + '&redirect_uri=' + globalRedirectUrl;
                $rootScope.access_token = '';
                $window.location.href = signOffUrl;
            },

            getSessionObject: function() {
                if ($rootScope.access_token !== '') {
                    var environment = globalEnvironment;
                    var clientId = globalClientId;

                    var sessionParams = {
                        strategy: 'token',
                        clientId: clientId,
                        environment: environment,
                        redirectUrl: globalRedirectUrl,
                        token: $rootScope.access_token
                    };
                    var pureCloudSession = purecloud.platform.PureCloudSession(sessionParams);
                    pureCloudSession.login();
                    return pureCloudSession;
                }
                return undefined;
            },

        };

    });