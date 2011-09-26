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
        enyo.dispatcher.rootHandler.addListener(this);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    published: {
        userInfo: null,
        subreddits: null,
    },
    
    userInfoChanged: function() {
        localStorage.setItem("reddOS_userInfo", enyo.json.stringify(this.getUserInfo()));
    },
    
    subredditsChanged: function() {
        localStorage.setItem("reddOS_subreddits", enyo.json.stringify(this.getSubreddits()));
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
        
        {name: "authService",
            kind: "reddOS.service.RedditAuthentication",
            onLoginSuccess: "authLoginSuccess",
            onLoginFailure: "authLoginFailure",
            onLogoutSuccess: "authLogoutSuccess",
            onLogoutFailure: "authLogoutFailure",
        },
    
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
            onLoginRequest: "authLoginRequest",
        },
        
        {name: "settingsPopup",
            kind: "reddOS.view.main.popup.Settings",
        },
        
        {name: "aboutPopup",
            kind: "reddOS.view.main.popup.About",
        },
        
        //
        // App Menu
        //
        
        {kind: "enyo.AppMenu", components: [
            {caption: "Settings", onclick: "openSettingsPopup"},
            {caption: "About", onclick: "openAboutPopup"},
        ]},
        
        //
        // Main UI
        //
        
        {name: "headerBar",
            kind: "reddOS.view.main.HeaderBar",
            onRequestLogin: "openLoginPopup",
            onRequestLogout: "authLogoutRequest",
        },
        
        
        {kind: "SlidingPane", flex: 1, components: [
            
            {dragAnywhere: false, width: "220px", components: [
                
                {name: "paneTopMenu", 
                    kind: "reddOS.view.main.TopMenu",
                    flex: 1, 
                    onObjectSend: "dispatchObject"
                },
                
            ]},
            
            {dragAnywhere: false, width: "350px", components: [
                
                {name: "paneSecondMenu",
                    kind: "reddOS.view.main.SecondColumn", 
                    flex: 1, 
                    onObjectSend: "dispatchObject"
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
        
        // Load cached user info, if none exists attempt a login
        //if(localStorage.getItem("reddOS_userInfo") != null) {
        //    this.incomingUserInfo(null, enyo.json.parse(localStorage.getItem("reddOS_userInfo")));
        //} else {
            this.refreshUserInfo();
        //}
        
        // Load cached subreddit info, if none exists attempt to download a new list
        //if(localStorage.getItem("reddOS_subreddits") != null) {
        //    this.incomingSubscribedSubreddits(null, enyo.json.parse(localStorage.getItem("reddOS_subreddits")));
        //} else {
            this.refreshSubredditInfo();
        //}
    },
    
    onLinkClickHandler: function(inSender, inEvent) {
        var inUrl = inEvent.url;
        
        // Handle basic relative links
        if(inUrl.charAt(0) == "/") {
            inUrl = "http://www.reddit.com" + inUrl;
        }
        
        // Handle links now pointing at filesystem for unknown reasons
        if(inUrl.substr(0,7) == "file://") {
            inUrl = "http://www.reddit.com" + inUrl.substr(7);
        }
        
        window.open(inUrl);
    },
    
    //
    // Popup Handling
    //
    
    openLoginPopup: function () {
        this.$.loginPopup.openAtCenter();
    },
    
    openSettingsPopup: function () {
        this.$.settingsPopup.openAndPopulate();
    },
    
    openAboutPopup: function () {
        this.$.aboutPopup.openAtCenter();
    },
    
    //
    // Authentication Callbacks
    //
    
    authLoginRequest: function(inSender, username, password) {
        this.$.authService.doLogin(username, password);
    },
    
    authLoginSuccess: function() {
        this.$.loginPopup.dismiss();
        this.$.headerBar.setNotReady();
        this.refreshUserInfo();
        this.refreshSubredditInfo();
    },
    
    authLoginFailure: function(inSender, message) {
        this.$.loginPopup.loginFailure(message);
    },
    
    authLogoutRequest: function() {
        if(reddOS_Kind.isAccount(this.getUserInfo())) {
            this.$.headerBar.setNotReady();
            this.$.authService.doLogout(this.getUserInfo().data.modhash);
        }
    },
    
    authLogoutSuccess: function() {
        this.setUserInfo(null);
        enyo.dispatch({type: "onUserInfoUpdate", data: this.getUserInfo()});
    },
    
    authLogoutFailure: function() {
        enyo.dispatch({type: "onUserInfoUpdate", data: this.getUserInfo()});
    },
        
    // 
    // User Info Callbacks
    //
    
    refreshUserInfo: function() {
        this.$.userInfoService.refreshData();
    },
    
    incomingUserInfo: function(inSender, inUserData) {
        
        if(reddOS_Kind.isAccount(inUserData) == false) {
            this.setUserInfo(null);
        } else {
            this.setUserInfo(inUserData);
        }
        
        // Fire a custom event
        enyo.dispatch({type: "onUserInfoUpdate", data: this.getUserInfo()});
    },
    
    //
    // Subscribed Subreddits Callbacks
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
        
        // Fire a custom event
        enyo.dispatch({type: "onSubscribedSubredditsUpdate", data: this.getSubreddits()});
    },
    
    //
    // Message Passing
    //
    
    dispatchObject: function(inSender, inObject) {
        
        if(reddOS_Kind.isSubreddit(inObject)) {
            
            this.$.paneSecondMenu.receiveObject(inObject);
            
        } else if (reddOS_Kind.isLink(inObject)) {
        
            this.$.paneStoryViewer.receiveObject(inObject);
            
        }
    },
});
