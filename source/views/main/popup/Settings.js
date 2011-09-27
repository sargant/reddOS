enyo.kind({
    
    name: "reddOS.view.main.popup.Settings", 
    kind: "enyo.ModalDialog",
    lazy: false,
    
    caption: "Settings",
    layoutKind: "VFlexLayout",
    
    width: "500px",
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-settings-popup");
    },
    
    settings: [
        {
            name: "subredditSortOrder",
            caption: "Default subreddit sort order",
            kind: "enyo.ListSelector",
            items: [
                {caption: "Popularity", value: "default"},
                {caption: "A-Z", value: "alpha"},
            ]
        },
        {
            name: "imgurDeepLink",
            caption: "Imgur deep linking",
            kind: "enyo.CheckBox",
        },
        {
            name: "dontTrackVisited",
            caption: "Don't record my visited links",
            kind: "enyo.CheckBox",
        },
    ],
    
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
            {kind: "enyo.Scroller", 
                name: "settingsScroller", 
                height: "400px", 
                components: []
            },
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
                onclick: "saveSettings"
            },
        ]},
    ],
        
    /***************************************************************************
     * Methods 
     */
    
    openAndPopulate: function () {
        
        // Load the stored values
        
        var settingsValues = enyo.json.parse(localStorage.getItem("reddOS_settings"));
        
        if(settingsValues == null) {
            settingsValues = {};
        }
        
        // Build the settings panel from the settings JSON
        
        this.$.settingsScroller.destroyControls();
        
        for(i in this.settings) {
            
            var control = {
                name: this.settings[i].name,
                kind: this.settings[i].kind,
            };
            
            if(control.kind == "enyo.ListSelector") {
                control.items = this.settings[i].items;
                
                if(typeof settingsValues[control.name] != "undefined") {
                    control.value = settingsValues[control.name];
                }
            }
            
            if(control.kind == "enyo.CheckBox") {
                if(typeof settingsValues[control.name] != "undefined") {
                    control.checked = settingsValues[control.name];
                }
            }
            
            var temp = {
                owner: this,
                kind: "enyo.Item",
                layoutKind: "HFlexLayout",
                align: "center",
                components: [
                    {content: this.settings[i].caption},
                    {kind: "enyo.Spacer"},
                    control,
                ],
            }
            
            this.$.settingsScroller.createComponent(temp);
        }
        
        this.$.settingsScroller.render();
        this.openAtCenter();
    },
    
    saveSettings: function () {
        
        var settingsValues = enyo.json.parse(localStorage.getItem("reddOS_settings"));
        
        if(settingsValues == null) settingsValues = {};
        
        for(i in this.settings) {
            
            var controlName = this.settings[i].name;
            
            if(this.settings[i].kind == "enyo.ListSelector") {
                settingsValues[controlName] = this.$[controlName].getValue();
            }
            
            if(this.settings[i].kind == "enyo.CheckBox") {
                settingsValues[controlName] = this.$[controlName].getChecked();
            }
        }
        
        localStorage.setItem("reddOS_settings", enyo.json.stringify(settingsValues));
        enyo.dispatch({type: "onSettingsUpdate", data: settingsValues});
        this.dismiss();
    },
    
    dismiss: function () {
        this.close();
    },
});
