/**
 * reddOS_Settings namespace
 *
 * Provides a convenient interface for automatically serializing, storing,
 * retrieving and unserializing data from local browser storage
 */

reddOS_Settings = {
   
    // Retrieve a setting with a given name
    getSetting: function(name) {
        
        // Get the settings
        var temp = localStorage.getItem("reddOS_settings");
        if(temp == null) return null;
        
        // Parse the settings and see if named setting exists
        var settingsString = enyo.json.parse(temp);
        if(typeof settingsString[name] == "undefined") return null;
        
        return settingsString[name];
    },
};
