reddOS_Date = {
    
    timeSince: function(utc) {
        var seconds = this.now() - utc;
        if(seconds > 86400) { return Math.floor(seconds/86400) +  " days";}
        if(seconds > 3600)  { return Math.floor(seconds/3600) +  " hours";}
        if(seconds > 60)  { return Math.floor(seconds/60) +  " minutes";}
        return seconds + " seconds";
    },
    
    now: function () {
        return Math.round(new Date().getTime()/1000.0);
    }
};
