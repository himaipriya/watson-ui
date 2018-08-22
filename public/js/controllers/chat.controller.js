/*!
 * ./public/js/controllers/chat.controller.js
 *
 * Declares ChatController
 * Authors: Abner Castro
 * Date: August 16th, 2017
 */

(function () {
    'use strict';

    angular
        .module('chatbot.app')
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$log', 'Conversation', '$window', '$location'];
    function ChatController($log, Conversation, $window, $location) {
        var vm = this;

        if (!$window.loginName) {
            $location.path('/')
        }

        vm.input = "";
        vm.messages = [];

        vm.sendMessage = function (initialChat) {
            if (vm.input !== "" || initialChat) {
                var message = {};
                message["recipient"] = $window.loginName ? $window.loginName : 'user';
                message["content"] = vm.input || initialChat;
                message["date"] = (new Date()).toTimeString().substr(0, 8);
                vm.messages.push(message);
                vm.input = ""
                $log.log(vm.messages);

                Conversation.sendMessage(message)
                    .then(data => {
                        if (data) {
                            var reply = {};
                            reply["recipient"] = "watson";
                            reply["content"] = data.output.text[0];
                            reply["atm"] = data.output.atm ? data.output.atm : [];
                            reply["date"] = (new Date()).toTimeString().substr(0, 8);
                            console.log(reply)
                            vm.messages.push(reply);
                        }
                    });
            }
        }

        vm.sendMessage('Hi')
    }
})();
