/**
 * reddOS.view.main.TopMenu
 *
 * Modal dialog allowing the adjustment of application-wide settings and
 * properties. Settings definitions are also contained here.
 */
 
enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.popup.Settings", 
    
    // Base class
    kind: "enyo.ModalDialog",
    
    // Inherited properties
    lazy: false,
    caption: "Settings",
    layoutKind: "VFlexLayout",
    width: "500px",
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-settings-popup");
    },
    
    // List of available settings.
    //
    // These are written in complete, enyo component form. They are located
    // at the top of the file for easy configuration, as well as for other
    // methods to be able to loop through the list of setting names
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
        
        // Placeholder for settings widgets
        {   kind: "enyo.Group",
            components: [
                {   kind: "enyo.Scroller", 
                    name: "settingsScroller", 
                    height: "400px", 
                    components: []
                },
            ]
        },
        
        // Buttons
        {   kind: "HFlexBox",
            components: [
                {   kind: "enyo.Button", 
                    content: "Cancel", 
                    flex: 1, 
                    onclick: "dismiss"
                },
                {   kind: "enyo.Button", 
                    content: "Save",
                    className: "enyo-button-affirmative", 
                    flex: 1, 
                    onclick: "saveSettings"
                },
            ]
        },
    ],
        
    /***************************************************************************
     * Methods 
     */
    
    // Initialize the form, by populating it with widgets from the settings
    // property
    openAndPopulate: function () {
        
        // Load the stored values
        var settingsValues = enyo.json.parse(localStorage.getItem("reddOS_settings"));
        
        if(settingsValues == null) {
            settingsValues = {};
        }
        
        // Destroy all pre-existing controls
        this.$.settingsScroller.destroyControls();
        
        // List through available settings options
        for(i in this.settings) {
           
            // Common properties for all controls
            var control = {
                name: this.settings[i].name,
                kind: this.settings[i].kind,
            };
            
            // If a drop-down list selector
            if(control.kind == "enyo.ListSelector") {
                control.items = this.settings[i].items;
                
                if(typeof settingsValues[control.name] != "undefined") {
                    control.value = settingsValues[control.name];
                }
            }
            
            // If a tick box
            if(control.kind == "enyo.CheckBox") {
                if(typeof settingsValues[control.name] != "undefined") {
                    control.checked = settingsValues[control.name];
                }
            }
            
            // Create the label to go along with the control, and assemble
            // the whole row
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
            
            // Insert the control into the settings dialog
            this.$.settingsScroller.createComponent(temp);
        }
        
        // Render the controls, and open the dialog
        this.$.settingsScroller.render();
        this.openAtCenter();
    },
    
    // Merge the current settings from the dialog with the locally
    // cached settings
    saveSettings: function () {
        
        // Load stored values
        var settingsValues = enyo.json.parse(localStorage.getItem("reddOS_settings"));
        if(settingsValues == null) settingsValues = {};
        
        // Looping through all availabe settings widgets
        for(i in this.settings) {
            
            var controlName = this.settings[i].name;
            
            // Drop-down list selector
            if(this.settings[i].kind == "enyo.ListSelector") {
                settingsValues[controlName] = this.$[controlName].getValue();
            }
            
            // Tick box
            if(this.settings[i].kind == "enyo.CheckBox") {
                settingsValues[controlName] = this.$[controlName].getChecked();
            }
        }
        
        // Store local values
        localStorage.setItem("reddOS_settings", enyo.json.stringify(settingsValues));
        
        // Dispatch a global event notifying that the settings have been updated
        enyo.dispatch({type: "onSettingsUpdate", data: settingsValues});
        
        // close dialog
        this.dismiss();
    },
    
    // Closes the UI - does NOT destroy components
    dismiss: function () {
        this.close();
    },
});
