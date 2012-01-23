enyo.kind({
    
    // Class identifier
    name: "reddOS.view.Main",
    
    // Parent class
    kind: "VFlexBox",
    
    // This will hold a timer for updating user information
    userInfoInterval: null,
    
    // Constructor
    //
    // App startup takes place in this.appEventLoad(), as this gives
    // all child kinds and views time to initialize
    
    create: function() {
        
        // Pass constructor up to parent class
        this.inherited(arguments);
        
        // Add this kind to the list of listeners for global events
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
        
        // Update the cached user info
        this.$.storedObjectManager.setItem("user_info", this.getUserInfo());
    },
    
    subredditsChanged: function() {
        
        // Update the cached subreddits list
        this.$.storedObjectManager.setItem("subscribed_subreddits", this.getSubreddits());
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        ////////////
        //
        //  Register methods for global application events
        //
        ////////////
    
        {   kind: "enyo.ApplicationEvents", 
            onLoad: "appEventLoad",
            onUnload: "appEventUnload",
        },
    
        ////////////
        //
        //  Register global services and callback methods
        //
        ////////////
        
        // Authentication service for login credentials
        {   name: "authService",
            kind: "reddOS.service.RedditAuthentication",
            onLoginSuccess: "authLoginSuccess",
            onLoginFailure: "authLoginFailure",
            onLogoutSuccess: "authLogoutSuccess",
            onLogoutFailure: "authLogoutFailure",
        },
    
        // User information service for logged in user
        {   name: "userInfoService",
            kind: "reddOS.service.RedditUserInformation",
            onSuccess: "incomingUserInfo",
            onFailure: "authLogoutFailure",
        },
        
        // Subscribed subreddits service for gathering subscription data
        {   name: "subscribedSubredditsService",
            kind: "reddOS.service.RedditSubscribedSubreddits",
            onSuccess: "incomingSubscribedSubreddits",
            onFailure: "incomingSubscribedSubreddits",
        },
        
        // reddOS update availability service
        {   name: "reddOSUpdatesService",
            kind: "reddOS.service.reddOSUpdates",
            onUpdateAvailable: "handleUpdateAvailable",
        },
        
        // Local data caching service
        {   name: "storedObjectManager",
            kind: "reddOS.service.StoredObjectManager",
        },
        
        ////////////
        //
        //  Register modal dialogs and popups
        //
        ////////////
        
        // Authentication request UI
        {   name: "loginPopup",
            kind: "reddOS.view.main.popup.Login", 
            onLoginRequest: "authLoginRequest",
        },
        
        // Settings UI
        {   name: "settingsPopup",
            kind: "reddOS.view.main.popup.Settings",
        },
        
        // Application information dialog
        {   name: "aboutPopup",
            kind: "reddOS.view.main.popup.About",
        },
        
        // "API is down" alert dialog
        //
        // This is global as the errors will be thrown by the global services
        // registered above.
        
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
        
        ////////////
        //
        // Register components for the webOS app menu (open with CTRL+` in debugging)
        //
        ////////////
        
        {   kind: "enyo.AppMenu", 
            components: [
                {   caption: "Settings", 
                    onclick: "openSettingsPopup"
                },
                {   caption: "About", 
                    onclick: "openAboutPopup"
                },
            ]
        },
        
        ////////////
        //
        //  Arrange the main GUI components
        //
        ////////////
        
        // Header bar - title, user details, authentication options
        {   name: "headerBar",
            kind: "reddOS.view.main.HeaderBar",
            onRequestLogin: "openLoginPopup",
            onRequestLogout: "authLogoutRequest",
        },
        
        // Main three-pane view
        {   kind: "SlidingPane", 
            flex: 1, 
            components: [
            
                // First view
                {   dragAnywhere: false, 
                    width: "242px", 
                    components: [
                        {   name: "paneTopMenu", 
                            kind: "reddOS.view.main.TopMenu",
                            flex: 1, 
                            onObjectSend: "dispatchObject",
                            onRequestSubredditRefresh: "refreshSubredditInfo",
                        },
                    ]
                },
                
                // Second view
                {   dragAnywhere: false, 
                    width: "390px", 
                    components: [
                        {   name: "paneSecondMenu",
                            kind: "reddOS.view.main.SecondColumn", 
                            flex: 1, 
                            onObjectSend: "dispatchObject"
                        }
                    ]
                },
            
                // Third view
                {   dragAnywhere: false,
                    minWidth: "378px",
                    components: [
                        {   name: "paneStoryViewer",
                            flex: 1,
                            kind: "reddOS.view.main.StoryViewer"
                        }
                    ]
                },
            ]
        }
    ],
        
    /***************************************************************************
     * Methods
     */
    
    ////////////
    //
    //  Global application event methods
    //
    ////////////
        
    // Called once application is fully initialized
    appEventLoad: function() {
    
        // Start an update check, once per launch
        this.$.reddOSUpdatesService.check();
        
        // Load cached user info & subreddit details
        var userInfo = this.$.storedObjectManager.getItem("user_info");
        var subreddits = this.$.storedObjectManager.getItem("subscribed_subreddits");
        
        // If we have cached data, pass this to the service callbacks
        // immediately so that the UI can update before we send out an internet
        // API request
        
        if(userInfo != null && userInfo != "null") {
            this.incomingUserInfo(null, userInfo);
        }
        
        if(subreddits != null && subreddits != "null") {
            this.incomingSubscribedSubreddits(null, subreddits);
        }
        
        // Ask the services to fetch user and subreddit data over the internet
        this.refreshUserInfo();
        this.refreshSubredditInfo();

        // Set the app to perform refreshes of the user's information in the
        // background once every two minutes
        this.userInfoInterval = setInterval(enyo.hitch(this, "refreshUserInfoBackground"), 1000 * 120);
    },
    
    // Called when application is closed
    appEventUnload: function () {
        
        // Stop the timer
        clearInterval(this.userInfoInterval);
        // All other garbage collection is automatic
    },
    
    // TODO: from here
    
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
    
        
    // reddOS update available callback
    handleUpdateAvailable: function (inSender, inVersion, inUrl) {
        
        // Notify the header bar view
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
});
