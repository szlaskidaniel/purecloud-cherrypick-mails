'use strict';

/**
 * @ngdoc function
 * @name kiwi.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the kiwi
 */
angular.module('kiwi')
    .controller('MainCtrl', function($scope, $rootScope, $location, pcSessionService, $cookies) {

        //*** Test AREA */
        $scope.TestMe = function() {
            return true;
        };
        pcSessionService.signIn();


        // *** END TEST
        // <initialize $rootScope>
        if (!$rootScope.loggedInFlag) {

            $rootScope.totallyBusy = false;
            $rootScope.loading = false;
            $rootScope.loggedInFlag = false;

            $rootScope.signIn = function() {
                pcSessionService.signIn();
            };

            $rootScope.signOff = function() {
                pcSessionService.signOff();
            };

            $rootScope.setSignState = function() {
                if ($rootScope.access_token !== '') {
                    // <if token present>
                    $rootScope.loading = true;

                    $cookies.put('ININ-Auth-Api', $rootScope.access_token);
                    // get PC session object
                    var pureCloudSession = pcSessionService.getSessionObject();
                    // execute GetMe()        
                    var usersApi = new purecloud.platform.UsersApi(pureCloudSession);
                    usersApi.getMe().then(function(me) {
                        $rootScope.currentUserName = me.name;
                        $rootScope.currentUserId = me.id;
                        $rootScope.loggedInFlag = true;
                        $rootScope.loading = false;
                        $location.path('/mails');
                        $rootScope.$apply();
                    });
                    // </if token present>
                } else {
                    // <if token absend>
                    $rootScope.loggedInFlag = false;
                    $rootScope.$apply();
                    // </if token absend>
                }
                $location.path('/mails');
            };
        }


        // </initialize $rootScope>

    });