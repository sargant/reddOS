enyo.kind({
    
    name: "reddOS.view.main.popup.Login", 
    kind: "enyo.ModalDialog",
    
    layoutKind: "VFlexLayout",
    
    caption: "Login to Reddit",
    
    create: function() {
        this.inherited(arguments);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onLoginRequest: "",
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        
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
        
        {name: "loginMessage", 
            className: "reddos-login-message", 
            allowHtml: true, 
            content: "",
        },
        
        {kind: "enyo.HFlexBox", components: [
            
            {kind: "enyo.Button", 
                content: "Cancel", 
                flex: 1, 
                onclick: "dismiss"
            },
            
            {kind: "enyo.Button", 
                className: "enyo-button-affirmative", 
                content: "Login", 
                flex: 2, 
                onclick: "submitLogin"
            },
            
        ]},
    ],
        
    /***************************************************************************
     * Methods 
     */
    
    dismiss: function () {
        this.$.loginUsername.setValue("");
        this.$.loginPassword.setValue("");
        this.$.loginMessage.setContent("");
        this.close();
    },
    
    submitLogin: function() {
        var u = this.$.loginUsername.getValue();
        var p = this.$.loginPassword.getValue();
        this.$.loginMessage.setContent("Checking...");
        this.doLoginRequest(u,p);
    },
    
    loginFailure: function(errorMessage) {
        this.$.loginMessage.setContent("Error: "+errorMessage);
    },
});
