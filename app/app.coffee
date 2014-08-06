# setup plugins to load
if not localStorage["version"]?
	localStorage["version"] ="google"
	window.location.reload()

foundry.angular.dependency = []

define('config', ()->
	config = {}
	config.appName = 'Forum'
	config.plugins = 
		user : 'core/plugins/user'
		workspace : 'core/plugins/workspace'

	config
)

foundry.load_plugins()

Nimbus.Auth.setup 
	'GDrive':
		'app_id' : '696230129324'
		'key': '696230129324-k4g89ugcu02k5obu9hs1u5tp3e54n02u.apps.googleusercontent.com'
		"scope": "openid https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify https://apps-apis.google.com/a/feeds/domain/"
		# "app_name": "foundry"
	"app_name": "forum"
	'synchronous' : false

# callback for loading
Nimbus.Auth.authorized_callback = ()->
	if Nimbus.Auth.authorized()
		$("#login_buttons").addClass("redirect")

foundry.ready(()->
	if Nimbus.Auth.authorized()
		foundry.init(()->
			# 
		)
	return
)

$(document).ready(()->
	
	$('#google_login').on('click',(evt)->
		 
		if not (localStorage["version"] is "google")
			localStorage["version"] = "google"
			window.location.reload()
		
		Nimbus.Auth.authorize('GDrive')
	)

	$('.logout_btn').on('click', (evt)->
		foundry.logout()
		location.reload()
	)
	return
)

