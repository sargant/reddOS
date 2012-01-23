/**
 * reddOS.view.main.popup.About
 *
 * Modal dialog showing basic application information
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.popup.About", 
    
    // Base class
    kind: "enyo.ModalDialog",
    
    // Inherited properties
    layoutKind: "VFlexLayout",
    pack: "start",
    align: "center",
    lazy: false,
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.$.aboutPopupVersion.setContent("v "+enyo.fetchAppInfo().version);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        
        {   name: "aboutPopupTitle", 
            className: "reddos-about-title",
            content: "reddOS",
        },
        {   name: "aboutPopupVersion", 
            className: "reddos-about-version",
            content: "v"
        },
        {   kind: "enyo.Button", 
            content: "Close", 
            onclick: "dismiss"
        },
    ],
        
    /***************************************************************************
     * Methods 
     */
    
    // Close dialog
    dismiss: function () {
        this.close();
    },
});
