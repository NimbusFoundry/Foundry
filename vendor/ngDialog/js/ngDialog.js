/*
 * ngDialog - easy modals and popup windows
 * http://github.com/likeastore/ngDialog
 * (c) 2013 MIT License, https://likeastore.com
 */

(function (window, angular, undefined) {
	'use strict';

	var module = angular.module('ngDialog', []);

	var $el = angular.element;
	var isDef = angular.isDefined;
	var style = (document.body || document.documentElement).style;
	var animationEndSupport = isDef(style.animation) || isDef(style.WebkitAnimation) || isDef(style.MozAnimation) || isDef(style.MsAnimation) || isDef(style.OAnimation);
	var animationEndEvent = 'animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend';

	module.provider('ngDialog', function () {
		var defaults = this.defaults = {
			className: 'ngdialog-theme-default',
			plain: false,
			showClose: true,
			closeByDocument: true,
			closeByEscape: true
		};

		var globalID = 0, dialogsCount = 0;

		this.$get = ['$document', '$templateCache', '$compile', '$q', '$http', '$rootScope', '$timeout',
			function ($document, $templateCache, $compile, $q, $http, $rootScope, $timeout) {
				var $body = $document.find('body');

				var privateMethods = {
					onDocumentKeyup: function (event) {
						if (event.keyCode === 27) {
							publicMethods.close();
						}
					},

					closeDialog: function ($dialog) {
						$dialog.unbind('click');

						if (dialogsCount === 1) {
							$body.unbind('keyup').removeClass('ngdialog-open');
						}

						dialogsCount -= 1;

						if (animationEndSupport) {
							$dialog.unbind(animationEndEvent).bind(animationEndEvent, function () {
								$dialog.remove();
							}).addClass('ngdialog-closing');
						} else {
							$dialog.remove();
						}
					}
				};

				var publicMethods = {

					/*
					 * @param {Object} options:
					 * - template {String} - id of ng-template, url for partial, plain string (if enabled)
					 * - plain {Boolean} - enable plain string templates, default false
					 * - scope {Object}
					 * - controller {String}
					 * - className {String} - dialog theme class
					 * - showClose {Boolean} - show close button, default true
					 * - closeByEscape {Boolean} - default true
					 * - closeByDocument {Boolean} - default true
					 *
					 * @return {Object} dialog
					 */
					open: function (opts) {
						var options = angular.copy(defaults);

						opts = opts || {};
						angular.extend(options, opts);

						globalID += 1;

						var scope = angular.isObject(options.scope) ? options.scope : $rootScope.$new();
						var $dialog;

						$q.when(loadTemplate(options.template)).then(function (template) {
							template = angular.isString(template) ?
								template :
								template.data && angular.isString( template.data ) ?
									template.data :
									'';

							if (options.showClose) {
								template += '<div class="ngdialog-close"></div>';
							}

							$dialog = $el('<div id="ngdialog' + globalID + '" class="ngdialog"></div>');
							$dialog.html('<div class="ngdialog-overlay"></div><div class="ngdialog-content">' + template + '</div>');

							if (options.controller && angular.isString(options.controller)) {
								$dialog.attr('ng-controller', options.controller);
							}

							if (options.className) {
								$dialog.addClass(options.className);
							}

							if (options.data && angular.isString(options.data)) {
								scope.ngDialogData = options.data.replace(/^\s*/, '')[0] === '{' ? angular.fromJson(options.data) : options.data;
							}

							$timeout(function () {
								$compile($dialog)(scope);
							});

							scope.$on('$destroy', function () {
								$dialog.remove();
							});

							$body.addClass('ngdialog-open').append($dialog);

							if (options.closeByEscape) {
								$body.bind('keyup', privateMethods.onDocumentKeyup);
							}

							if (options.closeByDocument) {
								$dialog.bind('click', function (event) {
									var isOverlay = $el(event.target).hasClass('ngdialog-overlay');
									var isCloseBtn = $el(event.target).hasClass('ngdialog-close');

									if (isOverlay || isCloseBtn) {
										publicMethods.close($dialog.attr('id'));
									}
								});
							}

							dialogsCount += 1;

							return publicMethods;
						});

						function loadTemplate (tmpl) {
							if (!tmpl) {
								return 'Empty template';
							}

							if (angular.isString(tmpl) && options.plain) {
								return tmpl;
							}

							return $templateCache.get(tmpl) || $http.get(tmpl, { cache: true });
						}
					},

					/*
					 * @param {String} id
					 * @return {Object} dialog
					 */
					close: function (id) {
						var $dialog = $el(document.getElementById(id));

						if ($dialog.length) {
							privateMethods.closeDialog($dialog);
						} else {
							publicMethods.closeAll();
						}

						return publicMethods;
					},

					closeAll: function () {
						var $all = document.querySelectorAll('.ngdialog');

						angular.forEach($all, function (dialog) {
							privateMethods.closeDialog($el(dialog));
						});
					}
				};

				return publicMethods;
			}];
	});

	module.directive('ngDialog', ['ngDialog', function (ngDialog) {
		return {
			restrict: 'A',
			link: function (scope, elem, attrs) {
				elem.on('click', function (e) {
					e.preventDefault();

					ngDialog.open({
						template: attrs.ngDialog,
						className: attrs.ngDialogClass,
						controller: attrs.ngDialogController,
						scope: attrs.ngDialogScope,
						data: attrs.ngDialogData,
						showClose: attrs.ngDialogShowClose === 'false' ? false : true,
						closeByDocument: attrs.ngDialogCloseByDocument === 'false' ? false : true,
						closeByEscape: attrs.ngDialogCloseByKeyup === 'false' ? false : true
					});
				});
			}
		};
	}]);

})(window, window.angular);
