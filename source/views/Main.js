/**
 * reddOS.view.Main
 *
 * The top-level app component, which organizes all other components,
 * services and globally accessible properties
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.Main",
    
    // Parent class
    kind: "VFlexBox",
    
    // This will hold a global timer for updating user information. It needs
    // highest scope as the main constructor & destructor will generate it
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
    
    ////////////
    //
    //  Popup Handling
    //
    ////////////
    
    // Allow the "reddit is down" popup to dismiss itself, as it does not
    // have its own kind
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
    
    ////////////
    //
    //  Authentication Service Callbacks
    //
    ////////////
    
    // Request an asynchronous login attempt with a given name and password
    authLoginRequest: function(inSender, username, password) {
        this.$.authService.doLogin(username, password);
    },
    
    // Callback on successful authentication
    authLoginSuccess: function() {
    
        // Dismiss login dialog
        this.$.loginPopup.dismiss();
        
        // Refresh all user data
        this.refreshUserInfo();
        this.refreshSubredditInfo();
    },
    
    // Callback on failed authentication
    authLoginFailure: function(inSender, message) {
    
        // Display error, do not dismiss dialog
        this.$.loginPopup.loginFailure(message);
    },
    
    // Request an asynchronous logout attempt
    authLogoutRequest: function() {
    
        // Only perform request if there is a valid logged in user
        if(reddOS_Kind.isAccount(this.getUserInfo())) {
            this.$.headerBar.setNotReady();
            this.$.authService.doLogout(this.getUserInfo().data.modhash);
        }
    },
    
    // Callback on successful user logout
    authLogoutSuccess: function() {
        
        // Set all user data to null
        this.setUserInfo(null);
        this.setSubreddits(null);
        
        this.$.headerBar.setReady(false);
        
        // Dispatch events that user information has been changed 
        enyo.dispatch({type: "onUserInfoUpdate", data: this.getUserInfo()});
        enyo.dispatch({type: "onSubscribedSubredditsUpdate", data: this.getSubreddits()});
    },
    
    // Callback on failed logout attempt - only cause can be that reddit is down
    authLogoutFailure: function() {
        this.$.redditIsDownPopup.openAtCenter();
        this.$.headerBar.setReady();
    },
        
    ////////////
    //
    // User Information Service Callbacks
    //
    ////////////
    
    // Request updated user information
    //
    // Wrapper function, which will dispatch an event warning that user info
    // may be about to be updated
    refreshUserInfo: function() {
        enyo.dispatch({type: "onUserInfoBeforeUpdate"});
        this.$.userInfoService.refreshData();
    },
    
    // Request updated user information due to a background process
    //
    // As this is invoked by a timer regardless of login status, do not keep
    // trying to send requests if we are certain the user is logged out.
    refreshUserInfoBackground: function () {
        if(reddOS_Kind.isAccount(this.userInfo)) this.refreshUserInfo();
    },
    
    // Callback for successful response from user information service
    incomingUserInfo: function(inSender, inUserData) {
        
        // Check the returned data is valid. If not, remove invalid stored data.
        if(reddOS_Kind.isAccount(inUserData) == false) {
            this.setUserInfo(null);
        } else {
            this.setUserInfo(inUserData);
        }
        
        // Dispatch an event notifying of updated user information
        enyo.dispatch({type: "onUserInfoUpdate", data: this.getUserInfo()});
    },
    
    ////////////
    //
    // Subscriptions Service Callbacks
    //
    ////////////
    
    // Request updated subscription data
    //
    // Wrapper function, which will dispatch an event warning that the
    // subscription list may be about to be updated
    refreshSubredditInfo: function() {
        enyo.dispatch({type: "onSubscribedSubredditsBeforeUpdate"});
        this.$.subscribedSubredditsService.refreshData();
    },
    
    // Callback for successful response from subscriptionn information service
    incomingSubscribedSubreddits: function(inSender, inSubredditData) {
        
        // If data is not valid, remove invalid subscription list
        if(typeof inSubredditData == 'undefined') {
            this.setSubreddits(null);
        } else {
            this.setSubreddits(inSubredditData);
        }
        
        // Dispatch an event notifying of updated subscription data
        enyo.dispatch({type: "onSubscribedSubredditsUpdate", data: this.getSubreddits()});
    },
    
    ////////////
    //
    //  Propagated Events
    //
    ////////////
    
    // Receive an object from child components, and pass it to the appropriate
    // sibling based on its kind
    dispatchObject: function(inSender, inObject) {
        
        if(reddOS_Kind.isSubreddit(inObject)) {
            this.$.paneSecondMenu.receiveObject(inObject);
        } else if (reddOS_Kind.isLink(inObject)) {
            this.$.paneStoryViewer.receiveObject(inObject);
        }
    },
    
    ////////////
    //
    //  Event Handling
    //
    ////////////
    
    // reddOS update available callback
    handleUpdateAvailable: function (inSender, inVersion, inUrl) {
        this.$.headerBar.updateAvailable(inVersion, inUrl);
    },
    
    // Override the default onLinkClick event
    //
    // Because the app is not running on the reddit.com domain, we need to
    // handle relative links and attach the domain correctly
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
        
        // Open the link in a new browser instance
        window.open(inUrl);
    },
});
