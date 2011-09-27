reddOS_History = {
    
    isVisited: function(name) {
        
        var temp = localStorage.getItem("reddOS_link_history");
        
        if(temp == null) return false;
        
        var historyArray = enyo.json.parse(temp);
        
        if(reddOS_Kind.isArray(historyArray) == false) return false;
        
        return (historyArray.indexOf(name) != -1);
    },
    
    addVisited: function (name) {
        
        if(reddOS_Settings.getSetting("dontTrackVisited")) return;
        
        var historyArray;
        var temp = localStorage.getItem("reddOS_link_history");
        
        if(temp == null) {
            historyArray = [];
        } else {
            historyArray = enyo.json.parse(temp);
        
            if(reddOS_Kind.isArray(historyArray) == false) {
                historyArray = [];
                historyArray.length = 0;
            }
        }
        
        if(historyArray.indexOf(name) == -1) {
            
            historyArray.push(name);
            
            while(historyArray.length > 500) {
                historyArray.shift();
            }
            
            localStorage.setItem("reddOS_link_history", enyo.json.stringify(historyArray));
        }
    }
};
