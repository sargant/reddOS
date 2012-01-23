/**
 * reddOS.view.main.HeaderBar
 *
 * Comprises the topmost component of the app, above the main content panes.
 * Displays user information, notifications and authentication options
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.HeaderBar",
    
    // Parent class
    kind: "enyo.Control",
    
    // Inherited properties from parent class
    layoutKind: "enyo.HFlexLayout",
    pack: "start",
    align: "center",
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-header-bar");
        
        // Add this kind to the list of listeners for global events
        enyo.dispatcher.rootHandler.addListener(this);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onRequestLogin: "",
        onRequestLogout: "",
    },
    
    published: {
        loggedIn: false,
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        ////////////
        //
        //  Relevant Modal Dialogs
        //
        ///////////
        {   name: "logoutConfirmationPopup",
            kind: "enyo.ModalDialog",
            layoutKind: "HFlexLayout",
            caption: "Are you sure?",
            components: [
                {   kind: "enyo.Button",
                    flex: 1,
                    caption: "Cancel",
                    onclick: "cancelLogout"
                },
                {   kind: "enyo.Button",
                    flex: 1,
                    className: "enyo-button-negative",
                    caption: "Logout",
                    onclick: "confirmLogout"
                },
            ],
        },
        
        // Main Title
        {name: "viewTitle", 
            content: "reddOS", 
            className: "reddos-header-title",
        },
        
        // "Update available" button
        {   kind: "enyo.CustomButton", 
            name: "updateAvailableButton",
            className: "reddos-header-button reddos-header-light-button", 
            cssNamespace: "reddos-header-light-button",
            content: "Update Available",
            url: "",
            onclick: "getUpdate",
            showing: false,
        },
    
        // User status pane
        // Changes view depending on authentication status of current user
        {   name: "userStatusPane", 
            kind: "enyo.Pane", 
            flex: 1, 
            height: "100%", 
            width: "100%", 
            transitionKind: "enyo.transitions.Simple", 
            components: [
            
                // Newly authenticated user, no cached data
                {   name: "refreshingView", 
                    layoutKind: "HFlexLayout",
                    pack: "end", 
                    align: "center",
                    components: [
                        {   content: "Refreshing user info..."
                        },
                        {   kind: "Spinner",
                            showing: true
                        }
                    ]
                },
                
                // User is not authenticated
                {   name: "loggedOutView",
                    layoutKind: "HFlexLayout",
                    pack: "end", 
                    align: "center",
                    components: [
                        {   content: "You are not logged in.", 
                            style: "margin-right: 8px"
                        },
                        {   kind: "CustomButton", 
                            className: "reddos-header-button", 
                            cssNamespace: "reddos-header-button",
                            content: "Login", 
                            onclick: "login"
                        },
                    ]
                },
                
                // Cannot connect to retrieve information
                {   name: "errorView",
                    layoutKind: "HFlexLayout",
                    pack: "end", 
                    align: "center",
                    components: [
                        {   content: "Error connecting to reddit."
                        },
                        {   kind: "Button",
                            className: "enyo-button-dark", 
                            content:"Retry?",
                            onclick: "reloadUserInformation"
                        },
                    ]
                },
            
                // Logged in user with full set of details
                {   name: "loggedInView",
                    layoutKind: "HFlexLayout",
                    pack: "end",
                    align: "center",
                    components: [
                        {   kind: "enyo.Spinner",
                            name: "loggedInSpinner",
                            showing: false
                        },
                        {   kind: "CustomButton", 
                            name: "loggedInUsername",
                            className: "reddos-header-button reddos-header-light-button", 
                            cssNamespace: "reddos-header-light-button",
                            content: "", 
                        },
                        {   kind: "CustomButton", 
                            name: "mailNotification",
                            className: "reddos-header-button reddos-header-light-button", 
                            cssNamespace: "reddos-header-light-button",
                            content: "&nbsp;", 
                            allowHtml: true,
                        },
                        {   kind: "CustomButton", 
                            name: "logoutButton",
                            className: "reddos-header-button", 
                            cssNamespace: "reddos-header-button",
                            content:"Logout", 
                            onclick: "logout"
                        },
                    ]
                },
            ]
        },
    ],
        
    /***************************************************************************
     * Methods
     */
     
    ////////////
    //
    //  Authentication Status
    //
    ////////////
    
    // Dispatch event for authentication request to parent class, which holds
    // the correct dialogs and logic
    login: function() {
        this.doRequestLogin();
    },
    
    // Open a logout confirmation popup
    logout: function () {
        this.$.logoutConfirmationPopup.openAtControl(this.$.logoutButton, {left: 150});
    },
    
    // Dismiss logout popup
    cancelLogout: function () {
        this.$.logoutConfirmationPopup.close();
    },
    
    // Accept logout popup and dispatch event to parent class
    confirmLogout: function() {
        this.$.logoutConfirmationPopup.close();
        this.doRequestLogout();
    },
        
    // Force the view to show we have no cached user data and we are awaiting it
    setNotReady: function() {
        this.setLoading(true);
    },
    
    // Change view to represent current user info and hide
    // loading activity indicator
    setReady: function(isLoggedIn) {
        if(typeof isLoggedIn != "undefined") this.loggedIn = isLoggedIn;
        this.$.userStatusPane.selectView((this.loggedIn) ? this.$.loggedInView : this.$.loggedOutView);
        this.$.loggedInSpinner.hide();
    },
    
    // Show loading activity indicator, either a subtle spinner if we have
    // a logged in user, or a full change of view if we are uncertain about
    // authentication status
    setLoading: function (force) {
        if(this.loggedIn && !force) {
            this.$.loggedInSpinner.show();
        } else {
            this.$.userStatusPane.selectView(this.$.refreshingView);
        }
    },
    
    ////////////
    //
    // Event Listeners
    //
    ////////////
    
    // Capture notification that we are about to receive new user data  
    onUserInfoBeforeUpdateHandler: function () {
        this.setLoading();
    },
    
    // Capture notification that there is new user data
    onUserInfoUpdateHandler: function(inSender, inEvent) {
        
        // Extract the data property
        var inUserData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        
        if(reddOS_Kind.isAccount(inUserData) == false) {
        
            // If we do not have valid user data, set to logged out view
            this.loggedIn = false;
            
        } else {
        
            // We have valid logged in data, populate the "logged in" view
            this.$.loggedInUsername.setContent(inUserData.data.name + " (" + inUserData.data.link_karma + ")");
            
            this.$.mailNotification.addRemoveClass("reddos-header-mail", !inUserData.data.has_mail);
            this.$.mailNotification.addRemoveClass("reddos-header-mail-new", inUserData.data.has_mail);
            
            this.loggedIn = true;
        }
        
        // Select new view based on authentication status
        this.setReady();
    },
    
    ////////////
    //
    //  Update Notification
    //
    ////////////
    
    // Show update available button
    updateAvailable: function (inVersion, inUrl) {
        this.$.updateAvailableButton.show();
        this.$.updateAvailableButton.url = inUrl;
    },
    
    // Update button click method
    getUpdate: function (inSender) {
        enyo.dispatch({type: "onLinkClick", url: inSender.url});
    },
});
