enyo.kind({
	
	name: "reddOS.view.popup.Login", 
	kind: "enyo.Popup",
	
	layoutKind: "VFlexLayout",
	
	modal: true,
	scrim: true, 
	dismissWithClick: false,
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-login-popup");
	},
	
	/***************************************************************************
	 * Published Items
	 */
	
	events: {
		onSuccessfulLogin: "",
	},
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
	
		{name: "authService", 
			kind: "reddOS.service.RedditAuthentication",
			onLoginSuccess: "loginSuccess", 
			onLoginFailure: "loginFailure",
		},
		
		{name: "loginPopupTitle", 
			className: "reddos-login-title",
			content: "Login to Reddit",
		},
		
		{name: "loginMessage", 
			className: "reddos-login-message", 
			allowHtml: true, 
			content: "&nbsp;"
		},
		
		{kind: "enyo.RowGroup", components: [
			
			{name: "loginUsername", 
				kind: "enyo.Input", 
				spellcheck: false, 
				autocorrect: false, 
				autoWordComplete: false, 
				autoCapitalize: "lowercase", 
				hint: "Username"
			},
			
			{name: "loginPassword", 
				kind: "enyo.PasswordInput", 
				hint: "Password"
			},
		]},
		
		{kind: "enyo.HFlexBox", components: [
			
			{kind: "enyo.Button", 
				className: "enyo-button-affirmative", 
				content: "Login", 
				flex: 2, 
				onclick: "submitLogin"
			},
			
			{kind: "enyo.Button", 
				content: "Cancel", 
				flex: 1, 
				onclick: "dismiss"
			},
			
		]},
	],
		
	/***************************************************************************
	 * Methods 
	 */
	
	dismiss: function () {
		this.$.loginUsername.setValue("");
		this.$.loginPassword.setValue("");
		this.$.loginMessage.setContent("&nbsp;");
		this.close();
	},
	
	submitLogin: function() {
		var u = this.$.loginUsername.getValue();
		var p = this.$.loginPassword.getValue();
		this.$.loginMessage.setContent("Checking...");
		this.$.authService.doLogin(u,p);
	},
	
	loginSuccess: function() {
		this.doSuccessfulLogin();
		this.dismiss();
	},
	
	loginFailure: function(inSender, errorMessage) {
		this.$.loginMessage.setContent("Error: "+errorMessage);
	},
})