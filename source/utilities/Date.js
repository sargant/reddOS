reddOS_Date = {
    
    timeSince: function(utc) {
        var seconds = Math.round(Date.now()/1000) - utc;
        if(seconds > 86400) { return Math.floor(seconds/86400) +  " days";}
        if(seconds > 3600)  { return Math.floor(seconds/3600) +  " hours";}
        if(seconds > 60)  { return Math.floor(seconds/60) +  " minutes";}
        return seconds + " seconds";
    },
};
