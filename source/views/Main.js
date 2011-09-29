enyo.kind({
    
    //
    // Required properties
    //
    name: "reddOS.view.Main",
    kind: "VFlexBox",
    
    userInfoInterval: null,
    
    //
    // Constructor
    //  
    create: function() {
        this.inherited(arguments);
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
    
        {   kind: "enyo.ApplicationEvents", 
            onLoad: "appEventLoad",
            onUnload: "appEventUnload",
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
            onFailure: "authLogoutFailure",
        },
        
        {name: "subscribedSubredditsService",
            kind: "reddOS.service.RedditSubscribedSubreddits",
            onSuccess: "incomingSubscribedSubreddits",
            onFailure: "incomingSubscribedSubreddits",
        },
        
        {   name: "reddOSUpdatesService",
            kind: "reddOS.service.reddOSUpdates",
            onUpdateAvailable: "handleUpdateAvailable",
        },
        
        //
        // Popups
        //
        
        {   name: "loginPopup",
            kind: "reddOS.view.main.popup.Login", 
            onLoginRequest: "authLoginRequest",
        },
        
        {   name: "settingsPopup",
            kind: "reddOS.view.main.popup.Settings",
        },
        
        {   name: "aboutPopup",
            kind: "reddOS.view.main.popup.About",
        },
        
        {   name: "redditIsDownPopup",
            kind: "enyo.ModalDialog",
            caption: "Error",
            components: [
                {   content: "Reddit appears to be down.<br />Please try again later.",
                    className: "reddos-login-message",
                    allowHtml: true,
                },
                {   kind: "enyo.Button",
                    caption: "OK",
                    onclick: "closeRedditIsDownPopup",
                    style: "margin-top: 10px"
                }
            ]
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
            
            {dragAnywhere: false, width: "242px", components: [
                
                {name: "paneTopMenu", 
                    kind: "reddOS.view.main.TopMenu",
                    flex: 1, 
                    onObjectSend: "dispatchObject",
                    onRequestSubredditRefresh: "refreshSubredditInfo",
                },
                
            ]},
            
            {dragAnywhere: false, width: "390px", components: [
                
                {name: "paneSecondMenu",
                    kind: "reddOS.view.main.SecondColumn", 
                    flex: 1, 
                    onObjectSend: "dispatchObject"
                }
                
            ]},
            
            {dragAnywhere: false, minWidth: "378px", components: [
            
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
    
        // Start an update check, once per launch
        this.$.reddOSUpdatesService.check();
        
        // Load cached user info & subreddit details
        var userInfo = localStorage.getItem("reddOS_userInfo");
        var subreddits = localStorage.getItem("reddOS_subreddits");
        
        if(userInfo != null && userInfo != "null") {
            this.incomingUserInfo(null, enyo.json.parse(userInfo));
        }
        
        if(subreddits != null && subreddits != "null") {
            this.incomingSubscribedSubreddits(null, enyo.json.parse(subreddits));
        }
        
        // Attempt to refresh data too
        this.refreshUserInfo();
        this.refreshSubredditInfo();

        // Refresh user info every two minutes
        this.userInfoInterval = setInterval(enyo.hitch(this, "refreshUserInfoBackground"), 1000 * 120);
    },
    
    appEventUnload: function () {
        clearInterval(this.userInfoInterval);
    },
    
    handleUpdateAvailable: function (inSender, inVersion, inUrl) {
        this.$.headerBar.updateAvailable(inVersion, inUrl);
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
    
    closeRedditIsDownPopup: function () {
        this.$.redditIsDownPopup.close();
    },
    
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
        this.setSubreddits(null);
        this.$.headerBar.setReady(false);
        enyo.dispatch({type: "onUserInfoUpdate", data: this.getUserInfo()});
        enyo.dispatch({type: "onSubscribedSubredditsUpdate", data: this.getSubreddits()});
    },
    
    authLogoutFailure: function() {
        this.$.redditIsDownPopup.openAtCenter();
        this.$.headerBar.setReady();
    },
        
    // 
    // User Info Callbacks
    //
    
    refreshUserInfo: function() {
        enyo.dispatch({type: "onUserInfoBeforeUpdate"});
        this.$.userInfoService.refreshData();
    },
    
      
    refreshUserInfoBackground: function () {
        if(reddOS_Kind.isAccount(this.userInfo)) this.refreshUserInfo();
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
        enyo.dispatch({type: "onSubscribedSubredditsBeforeUpdate"});
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
