enyo.kind({
    
    name: "reddOS.view.main.popup.About", 
    kind: "enyo.ModalDialog",
    
    layoutKind: "VFlexLayout",
    
    pack: "start",
    align: "center",
    
    lazy: false,
    
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
        
        {name: "aboutPopupTitle", 
            className: "reddos-about-title",
            content: "reddOS",
        },
        
        {name: "aboutPopupVersion", 
            className: "reddos-about-version",
            content: "v"
        },
        
        {kind: "enyo.Button", 
            content: "Close", 
            onclick: "dismiss"
        },
    ],
        
    /***************************************************************************
     * Methods 
     */
    
    dismiss: function () {
        this.close();
    },
});
