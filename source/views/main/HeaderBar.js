enyo.kind({
    
    name: "reddOS.view.main.HeaderBar",
    kind: "enyo.Control",
    
    layoutKind: "enyo.HFlexLayout",
    pack: "start",
    align: "center",
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-header-bar");
        
        enyo.dispatcher.rootHandler.addListener(this);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onRequestLogin: "",
        onRequestLogout: "",
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        {name: "logoutConfirmationPopup",
            kind: "enyo.ModalDialog",
            layoutKind: "HFlexLayout",
            caption: "Are you sure?",
            components: [
                {kind: "enyo.Button", flex: 1, caption: "Cancel", onclick: "cancelLogout"},
                {kind: "enyo.Button", flex: 1, className: "enyo-button-negative", caption: "Logout", onclick: "confirmLogout"},
            ],
        },
        
        {name: "viewTitle", 
            content: "reddOS", 
            className: "reddos-header-title",
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
                        
                        {kind: "CustomButton", 
                            className: "reddos-header-button", 
                            cssNamespace: "reddos-header-button",
                            content: "Login", 
                            onclick: "login"
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
                    
                        {kind: "CustomButton", 
                            name: "loggedInUsername",
                            className: "reddos-header-button reddos-header-light-button", 
                            cssNamespace: "reddos-header-light-button",
                            content: "", 
                        },
                        
                        {kind: "CustomButton", 
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
    
    login: function() {
        this.doRequestLogin();
    },
    
    logout: function () {
        this.$.logoutConfirmationPopup.openAtControl(this.$.logoutButton, {left: 150});
    },
    
    cancelLogout: function () {
        this.$.logoutConfirmationPopup.close();
    },
    
    confirmLogout: function() {
        this.$.logoutConfirmationPopup.close();
        this.doRequestLogout();
    },
        
    setNotReady: function() {
        this.$.userStatusPane.selectView(this.$.refreshingView);
    },
    
    onUserInfoUpdateHandler: function(inSender, inEvent) {
        
        var inUserData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        
        if(reddOS_Kind.isAccount(inUserData) == false) {
            this.$.userStatusPane.selectView(this.$.loggedOutView);
        } else {
            this.$.loggedInUsername.setContent(inUserData.data.name + " (" + inUserData.data.link_karma + ")");
            this.$.userStatusPane.selectView(this.$.loggedInView);
        }
    },    
});
