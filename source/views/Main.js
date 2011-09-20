enyo.kind({
	
	//
	// Required properties
	//
	name: "reddOS.view.Main",
	kind: "VFlexBox",
	
	//
	// Constructor
	//	
	create: function() {
		this.inherited(arguments);
		enyo.setAllowedOrientation("landscape");
	},
	
	/***************************************************************************
	 * Published Items
	 */
	
	published: {
		userInfo: null,
		subreddits: null,
	},
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
	
		{kind: "enyo.ApplicationEvents", 
			onLoad: "appEventLoad"
		},
	
		//
		// Services
		//
	
		{name: "userInfoService",
			kind: "reddOS.service.RedditUserInformation",
			onSuccess: "incomingUserInfo",
			onFailure: "incomingUserInfo",
		},
		
		{name: "subscribedSubredditsService",
			kind: "reddOS.service.RedditSubscribedSubreddits",
			onSuccess: "incomingSubscribedSubreddits",
			onFailure: "incomingSubscribedSubreddits",
		},
		
        //
        // Popups
        //
        
		{name: "loginPopup",
			kind: "reddOS.view.main.popup.Login", 
			onSuccessfulLogin: "loginPopupSuccess",
		},
		
		//
		// Main UI
		//
		
		{name: "headerBar",
			kind: "reddOS.view.main.HeaderBar",
            onRequestLoginPopup: "openLoginPopup",
			onRequestRefresh: "refreshUserInfo",
		},
		
		
		{kind: "SlidingPane", flex: 1, components: [
			
			{dragAnywhere: false, width: "250px", components: [
				
				{name: "paneTopMenu", 
					kind: "reddOS.view.main.TopMenu",
					flex: 1, 
					onSubredditSelect: "subredditSelect"
				},
				
			]},
			
			{dragAnywhere: false, width: "350px", components: [
				
				{name: "paneSecondMenu",
					kind: "reddOS.view.main.SecondMenu", 
					flex: 1, 
					onSubredditStoryLoad: "subredditStoryLoad"
				}
				
			]},
			
			{dragAnywhere: false, components: [
			
				{name: "paneStoryViewer",
					flex: 1,
					kind: "reddOS.view.main.StoryViewer"
				}
			
			]},
			
		]}
		
	],
		
	/***************************************************************************
     * Methods
	 */
	
	//
	// Global Events
	//
		
	appEventLoad: function() {
		this.refreshUserInfo();
		this.refreshSubredditInfo();
	},
    
    //
    // Popup Handling
    //
    
    openLoginPopup: function () {
        this.$.loginPopup.openAtCenter();
    },
    
    loginPopupSuccess: function() {
		this.$.headerBar.setNotReady();
		this.refreshUserInfo();
        this.refreshSubredditInfo();
    },
		
	// 
	// User Info
	//
	
	refreshUserInfo: function() {
		this.$.userInfoService.refreshData();
	},
	
	incomingUserInfo: function(inSender, inUserData) {
		
		if(typeof inUserData == 'undefined') {
			this.setUserInfo(null);
		} else {
			this.setUserInfo(inUserData);
		}
		
		// UI Elements to update
		this.$.headerBar.refreshUserData(this.getUserInfo());
	},
	
	//
	// Subreddit Info
	//
	
	refreshSubredditInfo: function() {
		this.$.subscribedSubredditsService.refreshData();
	},
	
	incomingSubscribedSubreddits: function(inSender, inSubredditData) {
		
		if(typeof inSubredditData == 'undefined') {
			this.setSubreddits(null);
		} else {
			this.setSubreddits(inSubredditData);
		}
		
		// UI Elements to update
		this.$.paneTopMenu.refreshSubredditData(this.getSubreddits());
		
	},
	
	//
	// Message Passing
	//
	
	subredditSelect: function(inSender, subredditButton) {
		this.$.paneSecondMenu.loadSubreddit(subredditButton);
	},
})
