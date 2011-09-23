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
        onRequestLogin: "",
        onRequestLogout: "",
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        
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
                            className: "reddos-header-user-button", 
                            cssNamespace: "reddos-header-user-button",
                            content: "", 
                        },
                        
                        {kind: "CustomButton", 
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
    
    logout: function() {
        this.doRequestLogout();
    },
        
    setNotReady: function() {
        this.$.userStatusPane.selectView(this.$.refreshingView);
    },
    
    refreshUserData: function(inUserData) {
        if(reddOS_Kind.isAccount(inUserData) == false) {
            this.$.userStatusPane.selectView(this.$.loggedOutView);
        } else {
            this.$.loggedInUsername.setContent(inUserData.data.name + " (" + inUserData.data.link_karma + ")");
            this.$.userStatusPane.selectView(this.$.loggedInView);
        }
    },    
});
