/**
 * reddOS_Date namespace
 *
 * Provides useful methods for manipulating date and time
 * without relying on external libraries
 */

reddOS_Date = {
   
    // Returns a nicely formatted string showing how long between now and the
    // passed UTC timestamp.
    //
    // Return format is "[[[? days,] ? hours,] ? minutes,] ? seconds", where
    // groups with leading zeroes are omitted
    timeSince: function(utc) {
        var seconds = this.now() - utc;
        if(seconds > 86400) { return Math.floor(seconds/86400) +  " days";}
        if(seconds > 3600)  { return Math.floor(seconds/3600) +  " hours";}
        if(seconds > 60)  { return Math.floor(seconds/60) +  " minutes";}
        return seconds + " seconds";
    },
    
    // Returns the current unix timestamp in seconds, instead of milliseconds
    now: function () {
        return Math.round(new Date().getTime()/1000.0);
    }
};
