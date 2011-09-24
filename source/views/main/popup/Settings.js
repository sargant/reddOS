enyo.kind({
    
    name: "reddOS.view.main.popup.Settings", 
    kind: "enyo.ModalDialog",
    
    caption: "Settings",
    layoutKind: "VFlexLayout",
    
    width: "500px",
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-settings-popup");
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
    
        {kind: "enyo.Group", components: [
            {kind: "enyo.Scroller", height: "400px", components: [
                {kind: "enyo.Item", layoutKind: "HFlexLayout", align: "center", components: [
                    {content: "Subreddit sort order"},
                    {kind: "enyo.Spacer"},
                    {kind: "enyo.ListSelector", items: [
                        {caption: "Default", value: "default"},
                        {caption: "A-Z", value: "alpha"},
                    ]},
                ]},
                {kind: "enyo.Item", layoutKind: "HFlexLayout", components: [
                    {content: "Deep linking to imgur"},
                    {kind: "enyo.Spacer"},
                    {kind: "enyo.CheckBox"},
                ]},
            ]},
        ]},
        
        {kind: "HFlexBox", components: [
        
            {kind: "enyo.Button", 
                content: "Cancel", 
                flex: 1, 
                onclick: "dismiss"
            },
            {kind: "enyo.Button", 
                content: "Save",
                className: "enyo-button-affirmative", 
                flex: 1, 
                onclick: "dismiss"
            },
        ]},
    ],
        
    /***************************************************************************
     * Methods 
     */
    
    dismiss: function () {
        this.close();
    },
});
