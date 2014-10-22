define('demo', ()->
	user_plugin = 	
		name : 'demo'
		anchor : '#/demo'
		title : 'Demo'
		type : 'plugin'
		icon : 'icon-list'
		# initialize plugin,
		init : ()->
			console.log 'init'
			define_controller()
			foundry.initialized(this.name)
)

define_controller = ()->
	angular.module('foundry').controller('DemoController', ['$scope', ($scope)->
		# contrller code
	])
