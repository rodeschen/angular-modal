/*
 * @license
 * angular-modal v0.2.0
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.modal', []).
factory('btfModal', ['$compile', '$rootScope', '$controller', '$q', '$http', '$templateCache',
  function($compile, $rootScope, $controller, $q, $http, $templateCache) {
    return function modalFactory(config) {

      if ((+ !! config.template) + (+ !! config.templateUrl) !== 1) {
        throw new Error('Expected modal to have exacly one of either `template` or `templateUrl`');
      }

      var template = config.template,
        controller = config.controller || angular.noop,
        controllerAs = config.controllerAs,
        container = angular.element(config.container || document.body),
        _overlay = angular.element('<div class="btf-modal-overlay"></div>'),
        duplicate = config.duplicate || false,
        element = null,
        overlay = null,
        html;

      if (config.template) {
        var deferred = $q.defer();
        deferred.resolve(config.template);
        html = deferred.promise;
      } else {
        html = $http.get(config.templateUrl, {
          cache: $templateCache
        }).
        then(function(response) {
          return response.data;
        });
      }

      function activate(locals) {
        html.then(function(html) {
          if (!element) {
            attach(html, locals);
          }
        });
      }

      function attach(html, locals) {
        element = angular.element(html);
        overlay = _overlay.clone().on('click', deactivate)
        container.prepend(element);
        container.prepend(overlay);

        var scope = $rootScope.$new();
        var _locals = duplicate ? angular.copy(locals) : locals;
        if (locals) {
          for (var prop in _locals) {
            scope[prop] = _locals[prop];
          }
        }
        var ctrl = $controller(controller, {
          $scope: scope
        });
        if (controllerAs) {
          scope[controllerAs] = ctrl;
        }
        $compile(element)(scope);
      }

      function deactivate() {
        if (element) {
          overlay.remove();
          element.remove();
          element = null;
        }
      }

      function active() {
        return !!element;
      }

      return {
        activate: activate,
        deactivate: deactivate,
        active: active
      };
    };
  }
]);
