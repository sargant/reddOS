enyo.kind({
	
	name: "reddOS.view.main.HeaderBar",
	kind: "enyo.Control",
	
	layoutKind: "enyo.HFlexLayout",
	pack: "start",
	align: "center",
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-header-bar");
	},
	
	/***************************************************************************
	 * Published Items
	 */
	
	events: {
		onRequestRefresh: "",
	},
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
	
		{name: "loginPopup",
			kind: "reddOS.view.main.popup.Login", 
			onSuccessfulLogin: "loadUserInfo"
		},
		
		{name: "viewTitle", 
			content: "reddOS", 
			style: "font-weight: bold"
		},
	
		{name: "userStatusPane", 
			kind: "enyo.Pane", 
			flex: 1, 
			height: "100%", 
			width: "100%", 
			transitionKind: "enyo.transitions.Simple", 
			components: [
			
				{name: "refreshingView", layoutKind: "HFlexLayout", pack: "end", 
					align: "center", components: [
					
						{content: "Refreshing user info..."},
						{kind: "Spinner", showing: true}
						
					]
				},
			
				{name: "loggedOutView", layoutKind: "HFlexLayout", pack: "end", 
					align: "center", components: [
						
						{content: "You are not logged in.", 
							style: "margin-right: 8px"
						},
						
						{kind: "Button", className: "enyo-button-dark", 
							content:"Login", onclick: "openLoginPopup"
						},
					]
				},
				
				{name: "errorView", layoutKind: "HFlexLayout", pack: "end", 
					align: "center", components: [
					
						{content: "Error connecting to reddit."},
						
						{kind: "Button", className: "enyo-button-dark", 
							content:"Retry?", onclick: "reloadUserInformation"
						},
					]
				},
			
				{name: "loggedInView", layoutKind: "HFlexLayout", pack: "end",
					align: "center", components: [
					
						{name: "loggedInUsername", content: "", 
							style: "margin-right: 8px"
						},
						
						{kind: "Button", className: "enyo-button-dark", 
							content:"Logout", onclick: "logout"
						},
					]
				},
			]
		},
	],
		
	/***************************************************************************
	 * Methods
	 */
		
	openLoginPopup: function() {
		this.$.loginPopup.openAtCenter();
	},
	
	loadUserInfo: function() {
		this.$.userStatusPane.selectView(this.$.refreshingView);
		this.doRequestRefresh();
	},
	
	refreshUserData: function(inUserData) {
		if(inUserData == null) {
			this.$.userStatusPane.selectView(this.$.loggedOutView);
		} else {
			this.$.loggedInUsername.setContent("Logged in as " + inUserData.name + " (" + inUserData.link_karma + ")");
			this.$.userStatusPane.selectView(this.$.loggedInView);
		}
	},
	
})