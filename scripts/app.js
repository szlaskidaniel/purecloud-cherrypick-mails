'use strict';

/**
 * @ngdoc overview
 * @name custom
 * @description
 * # custom
 *
 * Main module of the application.
 */
angular
    .module('custom', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'pcSessionService',
        'smart-table',
        'angular-toArrayFilter'
    ])
    .config(function($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/signIn', {
                templateUrl: 'views/signIn.html',
                controller: 'SignInCtrl',
                controllerAs: 'signIn'
            })
            .when('/config', {
                templateUrl: 'views/config.html',
                controller: 'ConfigCtrl',
                controllerAs: 'config'
            })
            .when('/access_token=:accessToken', {
                templateUrl: 'views/token.html',
                controller: 'TokenCtrl',
                controllerAs: 'token'
            })
            .when('/mails', {
                templateUrl: 'views/mails.html',
                controller: 'MailsCtrl',
                controllerAs: 'mails'
            })

        .otherwise({
            redirectTo: '/'
        });
    });