/**
 * reddOS.view.main.popup.Login
 *
 * Modal dialog containing UI elements for entry of authentication information.
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.popup.Login", 
    
    // Base class
    kind: "enyo.ModalDialog",
    
    // Inherited properties
    layoutKind: "VFlexLayout",
    caption: "Login to Reddit",
    
    // Constructor
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
        
        // Grouping of related text-entry form components
        {   kind: "enyo.RowGroup",
            components: [
               {   name: "loginUsername", 
                    kind: "enyo.Input", 
                    spellcheck: false, 
                    autocorrect: false, 
                    autoWordComplete: false, 
                    autoCapitalize: "lowercase", 
                    hint: "Username"
                },
                {   name: "loginPassword", 
                    kind: "enyo.PasswordInput", 
                    hint: "Password"
                },
            ]
        },
        
        // Placeholder for error messages
        {   name: "loginMessage", 
            className: "reddos-login-message", 
            allowHtml: true, 
            content: "",
        },
        
        // Confirmation and dismissal buttons
        {   kind: "enyo.HFlexBox",
            components: [
                {   kind: "enyo.Button", 
                    content: "Cancel", 
                    flex: 1, 
                    onclick: "dismiss"
                },
                {   kind: "enyo.Button", 
                    className: "enyo-button-affirmative", 
                    content: "Login", 
                    flex: 2, 
                    onclick: "submitLogin"
                },
            ]
        },
    ],
        
    /***************************************************************************
     * Methods 
     */
    
    // Reset UI elements and hide dialog
    dismiss: function () {
        this.$.loginUsername.setValue("");
        this.$.loginPassword.setValue("");
        this.$.loginMessage.setContent("");
        this.close();
    },
    
    // Pass authentication details up to parent class
    submitLogin: function() {
        var u = this.$.loginUsername.getValue();
        var p = this.$.loginPassword.getValue();
        this.$.loginMessage.setContent("Checking...");
        this.doLoginRequest(u,p);
    },
    
    // Show error messages on failed authentication
    loginFailure: function(errorMessage) {
        this.$.loginMessage.setContent("Error: "+errorMessage);
    },
});
