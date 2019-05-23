'use strict';

/**
 * @ngdoc function
 * @name custom.controller:SignInCtrl
 * @description
 * # SignInCtrl
 * Controller of the custom
 */
angular.module('custom')
    .controller('SignInCtrl', function($scope, $rootScope, pcSessionService) {

        $rootScope.totallyBusy = true;
        $rootScope.loading = false;

        var environment = globalEnvironment;
        var clientId = globalClientId;


        var sessionParams = {
            strategy: 'implicit',
            clientId: clientId,
            environment: environment,
            redirectUrl: globalRedirectUrl
        };

        var accessToken = pcSessionService.getToken();
        console.log(accessToken);
        if (accessToken) {
            sessionParams.token = accessToken;
            pcSessionService.setToken('');
        }

        var pureCloudSession = purecloud.platform.PureCloudSession(sessionParams);
        pureCloudSession.login();


    });