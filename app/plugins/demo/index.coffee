define('demo', ()->
	user_plugin = 	
		name : 'demo'
		_models : {}
		anchor : '#/demo'
		title : 'Demo'
		type : 'plugin'
		order : -12
		icon : 'icon-list'
		# initialize plugin,
		init : ()->
			console.log 'init'
			define_controller()
)

define_controller = ()->
	angular.module('foundry').controller('DemoController', ['$scope', ($scope)->
		# contrller code
	])
