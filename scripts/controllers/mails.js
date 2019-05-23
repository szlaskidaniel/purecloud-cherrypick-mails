'use strict';

/**
 * @ngdoc function
 * @name kiwi.controller:EditcontactlistCtrl
 * @description
 * # EditcontactlistCtrl
 * Controller of the kiwi
 */

angular.module('kiwi')
    .controller('MailsCtrl', function($q, $scope, $rootScope, $location, $timeout, $http, pcSessionService, $sce) {

        // <exit if not logged in>
        if (!$rootScope.loggedInFlag) {
            $location.path('/');
            return;
        } // </exit if not legged in>

        // creating session and API

        var session;

        var routingAPI;
        var analyticsAPI;
        var conversationsAPI;
        var usersAPI;


        var pageSize = 25;
        var pageNumber = 1;
        var mailCount = 0;

        var queueList = [];
        var userList = [];
        var mailList = [];


        $scope.TEST_getQueues = function() {
            session = purecloud.platform.PureCloudSession($scope.UnitTestSession);
            return getQueues(25, 1);
        };

        $scope.TEST_getUsers = function() {
            session = purecloud.platform.PureCloudSession($scope.UnitTestSession);
            return getUsers(25, 1);
        };


        if (!$scope.UnitTest) {
            new Init();
        } else {
            session = purecloud.platform.PureCloudSession($scope.UnitTestSession);

            routingAPI = new purecloud.platform.RoutingApi(session);
            analyticsAPI = new purecloud.platform.AnalyticsApi(session);
            conversationsAPI = new purecloud.platform.ConversationsApi(session);
            usersAPI = new purecloud.platform.UsersApi(session);
        }

        function Init() {

            console.log('Reload PC definitions');

            session = pcSessionService.getSessionObject();
            routingAPI = new purecloud.platform.RoutingApi(session);
            analyticsAPI = new purecloud.platform.AnalyticsApi(session);
            conversationsAPI = new purecloud.platform.ConversationsApi(session);
            usersAPI = new purecloud.platform.UsersApi(session);


            var queueList = [];
            var userList = [];
            var mailList = [];
            pageNumber = 1;

            getQueues(pageSize, pageNumber).then(function success() {
                pageNumber = 1;
                getUsers(pageSize, pageNumber).then(function success() {
                    console.log('Init finished');
                    $timeout(function() { $rootScope.loading = false; });

                }, function error() {
                    console.log('Error during INIT getUsers()');
                    $timeout(function() { $rootScope.loading = false; });
                });
            }, function error() {
                console.log('Error during INIT getQueues()');
                $timeout(function() { $rootScope.loading = false; });
            });
        }

        // Display emails waiting in a selected Queue 
        $scope.selectedQueueUpdate = function(q) {

            $scope.ActiveQueue = q.name;
            $scope.ActiveQueueId = q.id;
            refreshMailList();
        };

        // Update selected user To field 
        $scope.UpdateTransferToUser = function(u) {
            $scope.TransferToSelectedUser = u;
        };

        // Hold selected mail object in $scope variable
        $scope.UpdateMailGlobal = function(objMail) {
            $scope.EmailObj = objMail;
            $scope.selectedUser = undefined;
            //console.log(objMail);
        };

        // Retreive mail body for the selected mail interaction
        $scope.getMailBody = function(objMail) {

            $timeout(function() { $rootScope.loading = true; });
            conversationsAPI.getEmailsEmailIdMessagesMessageId(objMail.conversationId, objMail.messageId).then(function(resp) {
                //console.log(resp);
                // Assign mail body to global $scope variable
                $scope.EmailObj = resp;
                console.log(resp);
                // Check if we've HTML Body
                if (resp.htmlBody !== undefined) {
                    $scope.bHTMLBody = true;
                    // Check if we've got Images
                    if (resp.attachments !== undefined && resp.attachments.length > 0) {
                        //$scope.bShowImages = true;
                        // Download images
                        resp.attachments.forEach(function(item) {
                            var lookupImage = item.attachmentId;
                            lookupImage = lookupImage.replace('@', '&#64;'); // translate @ -> &#64;
                            resp.htmlBody = resp.htmlBody.replace('cid:' + lookupImage, item.contentUri);
                        });

                        $scope.EmailBody = $sce.trustAsHtml(resp.htmlBody);

                    }
                } else {
                    $scope.bHTMLBody = false;
                    //$scope.bShowImages = false;
                    $scope.EmailBody = resp.textBody;
                }

                $scope.EmailFrom = objMail.from;
                if (objMail.subject !== undefined) {
                    $scope.EmailSubject = objMail.subject;
                } else {
                    $scope.EmailSubject = '';
                }

                $timeout(function() { $rootScope.loading = false; });
            }).catch(function(err) {
                console.error(err);
                console.log("> objMail:");
                console.log(objMail);
                $timeout(function() { $rootScope.loading = false; });
                BootstrapDialog.show({ message: 'Cannot get mail body.', type: BootstrapDialog.TYPE_DANGER, title: 'Error', buttons: [{ label: 'Close', action: function(dialogItself) { dialogItself.close(); } }] });
            });
        }; // for getMailBody


        // Pickup mail interaction. It is the same as transfer if to my userId
        $scope.pickupMail = function(objMail) {
            // Transfer mail interaction to myself
            transferMail(objMail, $rootScope.currentUserId).then(function success() {
                $timeout(function() {
                    refreshMailList();
                }, 1000);

            }, function error() {
                $timeout(function() {
                    refreshMailList();
                }, 1000);
            });
        };

        // Transfer mail interaction to the selected userId
        $scope.transferMail = function() {
            // Transfer mail interaction to the selected user
            transferMail($scope.EmailObj, $scope.TransferToSelectedUser.id).then(function success() {
                $timeout(function() {
                    refreshMailList();
                }, 1000);
            }, function error() {
                $timeout(function() {
                    refreshMailList();
                }, 1000);
            });
        };

        // private transfer mail function.
        function transferMail(objMail, userId) {
            console.log('Start try to transfer');

            // Clear User Transfer data
            if ($scope.user_searchFilter !== undefined) {
                $scope.user_searchFilter.name = '';
            }

            var deferred = $q.defer();

            $timeout(function() { $rootScope.loading = true; });
            // Check first if Mail can be still transfered
            canThisMailBeTransfer(objMail).then(function success() {
                console.log('This mail can be transfered, proceed...');
                var body = {
                    'userId': userId
                };


                conversationsAPI.postEmailsEmailIdParticipantsParticipantIdReplace(objMail.conversationId, objMail.participantIdToTransfer, body)
                    .then(function() {
                        // Refresh mail list
                        $scope.TransferToSelectedUser = undefined;
                        deferred.resolve();

                    })
                    .catch(function(error) {
                        console.log("Error during Transfer mail");
                        console.log(error);
                        console.log("> mail conversationId: " + objMail.conversationId);
                        console.log("> mail participantIdFrom: " + objMail.participantIdToTransfer);
                        console.log("> mail participantIdTo: " + body.userId);
                        $scope.TransferToSelectedUser = undefined;

                        deferred.reject();
                        BootstrapDialog.show({ message: 'General error during transfer mail interaction.', type: BootstrapDialog.TYPE_DANGER, title: 'Error', buttons: [{ label: 'Close', action: function(dialogItself) { dialogItself.close(); } }] });
                    });
            }, function error() {
                deferred.reject();
                BootstrapDialog.show({ message: 'Mail is no longer available for transfer', type: BootstrapDialog.TYPE_WARNING, title: 'Warning', buttons: [{ label: 'Close', action: function(dialogItself) { dialogItself.close(); } }] });

            });
            return deferred.promise;
        }

        // Clear Search fields (From and Subject)
        $scope.clearSearch = function() {
            if ($scope.searchFilter !== undefined) {
                $scope.searchFilter.from = '';
                $scope.searchFilter.subject = '';
            }
        };

        // Clear Workgroup Search field
        $scope.clearWGSearch = function() {
            if ($scope.queue_searchFilter !== undefined) {
                $scope.queue_searchFilter.name = '';
            }
        };

        // Clear User Search field
        $scope.clearUserSearch = function() {
            if ($scope.user_searchFilter !== undefined) {
                $scope.user_searchFilter.name = '';
            }
        };

        // Clear TransferUser Data & filters
        $scope.dismissTransferPopup = function() {
            if ($scope.user_searchFilter !== undefined) {
                $scope.user_searchFilter.name = '';
            }
            $scope.TransferToSelectedUser = undefined;
        };

        $scope.firstPage = function() {
            if ($scope.ActiveQueueId == undefined) { return };
            if ($scope.pageNumber == 1) { return };
            refreshMailList(1);
        }

        $scope.nextPage = function() {
            if ($scope.ActiveQueueId == undefined) { return };
            if (!mailList || mailList.length == 0) { return };
            refreshMailList($scope.pageNumber + 1);
        }

        $scope.previousPage = function() {
            if ($scope.ActiveQueueId == undefined) { return };
            if ($scope.pageNumber == 1) { return };
            refreshMailList($scope.pageNumber - 1);
        }


        // Retreive QueueList
        function getQueues(pageSize, pageNumber, def) {
            var deferred = def || $q.defer();

            console.log('Get Queues, page: ' + pageNumber);
            $timeout(function() { $rootScope.loading = true; });
            routingAPI.getQueues(pageSize, pageNumber).then(function(resp) {
                queueList = queueList.concat(resp.entities);

                if (pageNumber === resp.pageCount) {
                    $scope.queues = queueList;
                    $scope.$apply();
                    deferred.resolve();
                } else {
                    getQueues(pageSize, pageNumber + 1, deferred);
                }

            }).catch(function(err) {
                console.error(err);
                $scope.UnitTest_Error = true;
                deferred.reject();
                BootstrapDialog.show({ message: 'Communication error. Cannot get Queue list.', type: BootstrapDialog.TYPE_DANGER, title: 'Error', buttons: [{ label: 'Close', action: function(dialogItself) { dialogItself.close(); } }] });
            });

            return deferred.promise;
        } // for getQueues

        // getUsers
        function getUsers(pageSize, pageNumber, def) {
            var deferred = def || $q.defer();

            console.log('Get Users, page: ' + pageNumber);
            usersAPI.getUsers(pageSize, pageNumber).then(function(resp) {
                userList = userList.concat(resp.entities);
                if (pageNumber === resp.pageCount) {
                    $scope.users = userList;
                    deferred.resolve();
                } else {
                    getUsers(pageSize, pageNumber + 1, deferred);
                }

            }).catch(function(err) {
                console.error(err);
                $scope.UnitTest_Error = true;
                deferred.reject();
                BootstrapDialog.show({ message: 'Communication error. Cannot get user list.', type: BootstrapDialog.TYPE_DANGER, title: 'Error', buttons: [{ label: 'Close', action: function(dialogItself) { dialogItself.close(); } }] });
            });
            return deferred.promise;
        } // for getUsers


        function refreshMailList(inPageNumber) {

            var currentdate = new Date();
            var date_from = new Date();
            date_from.setDate(date_from.getDate() - 30);

            var tInterval = date_from.getFullYear() + '-' + (date_from.getMonth() + 1) + '-' + date_from.getDate() + 'T' +
                date_from.getHours() + ':' + date_from.getMinutes() + ':' + date_from.getSeconds() + 'Z/' +
                currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate() + 'T' +
                currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + 'Z';
            /*
            if (inPageNumber !== undefined) {
                pageNumber = inPageNumber;
            } else {
                pageNumber = 1;
                mailList = [];
            }
            */

            //mailList = [];
            pageNumber = inPageNumber || 1;
            $scope.pageNumber = pageNumber;
            //pageNumber = 1;

            var body = {
                'interval': tInterval,
                'order': 'asc',
                'orderBy': 'conversationStart',
                'paging': {
                    'pageSize': pageSize,
                    'pageNumber': pageNumber
                },
                'segmentFilters': [{
                    'type': 'and',
                    'predicates': [{
                            'type': 'dimension',
                            'dimension': 'mediaType',
                            'operator': 'matches',
                            'value': 'email'
                        },
                        {
                            'type': 'dimension',
                            'dimension': 'queueId',
                            'operator': 'matches',
                            'value': $scope.ActiveQueueId
                        },
                        {
                            'type': 'dimension',
                            'dimension': 'userId',
                            'operator': 'notExists',
                            'value': null
                        }
                    ]
                }],
                'conversationFilters': [{
                    'type': 'and',
                    'predicates': [{
                        'type': 'dimension',
                        'dimension': 'conversationEnd',
                        'operator': 'notExists'
                    }]
                }]
            };

            getMailsList(body);
        }

        // Load all emails in a specific queue
        function getMailsList(body) {
            $timeout(function() { $rootScope.loading = true; });
            $scope.mails = [];
            analyticsAPI.postConversationsDetailsQuery(body).then(function(resp) {
                console.log('Get Mails at Page: ' + pageNumber);
                mailList = resp.conversations;
                //mailList = mailList.concat(resp.conversations);

                console.log(resp);
                if (resp.conversations !== undefined) {
                    resp.conversations.forEach(function(item) {
                        item.Hidden = true;
                        item.participants.forEach(function(tElem) {
                            if (tElem.purpose === 'acd') {
                                if (tElem.sessions[0].segments[0].disconnectType === undefined) {
                                    item.Hidden = false;
                                    item.participantIdToTransfer = tElem.participantId;
                                }
                            }
                        });
                    });

                    if (mailList !== undefined) {
                        mailCount = mailList.length;
                        console.log('We have total ' + mailCount);
                        mailList.forEach(function(entry) {
                            getMailDetails(entry);
                        });
                    }

                    // Try to get NextPage
                    //refreshMailList(pageNumber + 1);

                } else {

                    $timeout(function() { $rootScope.loading = false; });
                }

            }).catch(function(err) {
                $scope.UnitTest_Error = true;
                console.error(err);
                $timeout(function() { $rootScope.loading = false; });
                BootstrapDialog.show({ message: 'Communication error. Cannot get list of mails.', type: BootstrapDialog.TYPE_DANGER, title: 'Error', buttons: [{ label: 'Close', action: function(dialogItself) { dialogItself.close(); } }] });
            });
        } // for getMailsList

        // Load mail details (From, Subject, MessageId)
        function getMailDetails(emailObj) {

            if (emailObj == undefined) {
                $scope.mails = mailList;
                $scope.$apply();
                $timeout(function() { $rootScope.loading = false; });
                return;
            }

            conversationsAPI.getEmailsEmailIdMessages(emailObj.conversationId).then(function(resp) {
                emailObj.from = resp.entities[0].from.email;
                emailObj.subject = resp.entities[0].subject;
                emailObj.messageId = resp.entities[0].id;
                mailCount = mailCount - 1;
                if (mailCount === 0) {
                    $scope.mails = mailList;
                    $scope.$apply();
                    $timeout(function() { $rootScope.loading = false; });
                }

            }).catch(function(err) {
                console.error(err);
                mailCount = mailCount - 1;
            });
        } // for getMailDetails

        // Verify if mail can be still transfered (was not answerred by someone else)
        function canThisMailBeTransfer(emailObj) {
            var deferred = $q.defer();
            var currentdate = new Date();
            var date_from = new Date();

            console.log("Check if mail with id [" + emailObj.conversationId + "] is in valid state");
            date_from.setDate(date_from.getDate() - 30);

            var tInterval = date_from.getFullYear() + '-' + (date_from.getMonth() + 1) + '-' + date_from.getDate() + 'T' +
                date_from.getHours() + ':' + date_from.getMinutes() + ':' + date_from.getSeconds() + 'Z/' +
                currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate() + 'T' +
                currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + 'Z';

            var body = {
                'interval': tInterval,
                'order': 'asc',
                'orderBy': 'conversationStart',
                'paging': {
                    'pageSize': 25,
                    'pageNumber': 1
                },
                'conversationFilters': [{
                    'type': 'or',
                    'clauses': [{
                        'type': 'or',
                        'predicates': [{
                            'type': 'dimension',
                            'dimension': 'conversationId',
                            'operator': 'matches',
                            'value': emailObj.conversationId
                        }]
                    }]
                }]
            };

            analyticsAPI.postConversationsDetailsQuery(body).then(function(resp) {
                console.log(resp);
                resp.conversations.forEach(function(item) {
                    item.participants.forEach(function(tElem) {
                        if (tElem.purpose === 'acd') {
                            if (tElem.sessions[0].segments[0].disconnectType === undefined) {
                                deferred.resolve();
                            }
                        }
                    });
                });
                deferred.reject();

            }).catch(function(err) {
                console.error(err);
                deferred.reject();
            });

            return deferred.promise;
        } // for canThisMailBeTransfer


    });