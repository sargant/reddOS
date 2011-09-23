enyo.kind({
    
    name: "reddOS.view.main.popup.About", 
    kind: "enyo.Popup",
    
    layoutKind: "VFlexLayout",
    
    pack: "start",
    align: "center",
    
    modal: true,
    scrim: true,
    lazy: false,
    
    dismissWithClick: false,
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-about-popup");
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
