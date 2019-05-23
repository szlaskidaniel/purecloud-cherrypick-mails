'use strict';

/**
 * @ngdoc function
 * @name kiwi.controller:TokenCtrl
 * @description
 * # TokenCtrl
 * Controller of the kiwi
 */
angular.module('kiwi')
    .controller('TokenCtrl', function($scope, $rootScope, $location) {

        $rootScope.totallyBusy = true;

        $scope.parseKeyValue = function(inVal) {
            return parseKeyValue(inVal);
        };


        function parseKeyValue( /**string*/ keyValue) {
            var obj = {},
                keyValueArray, key;
            angular.forEach((keyValue || '').split('&'), function(keyValue) {
                if (keyValue) {
                    keyValueArray = keyValue.split('=');
                    key = decodeURIComponent(keyValueArray[0]);
                    obj[key] = angular.isDefined(keyValueArray[1]) ? decodeURIComponent(keyValueArray[1]) : true;
                }
            });
            return obj;
        }

        var queryString = $location.path().substring(1); // preceding slash omitted
        var params = parseKeyValue(queryString);

        if (queryString) {
            window.opener.postMessage(params, '*');
            window.close();
        }

    });