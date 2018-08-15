(function () {
    'use strict';

    angular
        .module('chatbot.app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$log', 'Conversation', '$window', '$location'];
    function LoginController($log, Conversation, $window, $location) {
        var vm = this;

        vm.loginName = "";
        vm.login = function () {
            $window.loginName = vm.loginName
            $location.path('/chatbot')
        }
    }
})();
