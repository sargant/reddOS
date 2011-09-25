reddOS_Settings = {
    
    getSetting: function(name) {
        
        var temp = localStorage.getItem("reddOS_settings");
        
        if(temp == null) return null;
        
        var settingsString = enyo.json.parse(temp);
        
        if(typeof settingsString[name] == "undefined") return null;
        
        return settingsString[name];
    },
};
