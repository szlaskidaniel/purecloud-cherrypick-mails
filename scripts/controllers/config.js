'use strict';

/**
 * @ngdoc function
 * @name kiwi.controller:ConfigCtrl
 * @description
 * # ConfigCtrl
 * Controller of the kiwi
 */
angular.module('kiwi')
    .controller('ConfigCtrl', function($scope, $rootScope, $location) {

        // <exit if legged in>
        if ($rootScope.loggedInFlag) {
            $location.path('/');
        }
        // </exit if legged in>

        $scope.environment = localStorage.getItem('custom_environment');
        $scope.clientId = localStorage.getItem('custom_clientId');

        $scope.onConfigChange = function() {
            localStorage.setItem('custom_environment', $scope.environment);
            localStorage.setItem('custom_clientId', $scope.clientId);
        };

    });