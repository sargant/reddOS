/**
 * reddOS_Kind namespace
 *
 * Provides methods for identifying the type of raw data returned by
 * the Reddit APIs
 */

reddOS_Kind = {
    
    // Identifying kinds, translated to human readable values
    COMMENT: "t1",
    ACCOUNT: "t2",
    LINK: "t3",
    MESSAGE: "t4",
    SUBREDDIT: "t5",
    LISTING: "Listing",
    
    // Returns whether data "a" is of kind "k".
    // Use the isComment/isAccount/isLink etc. methods externally
    isKind: function(a, k) {
        
        if(a == null) {
            return false;
        }
        else if(typeof a == "string") {
            return (a == k);
        }
        else if(typeof a == "object") {
            
            if(typeof a.kind == "undefined") {
                return false;
            } else {
                return (a.kind == k);
            }
            
        } else {
            return false;
        }
    },
    
    // Returns whether data represents a comment
    isComment: function(a) {
        return this.isKind(a, this.COMMENT);
    },
    
    // Returns whether data represents a user account
    isAccount: function(a) {
        return this.isKind(a, this.ACCOUNT);
    },
        
    // Returns whether data represents a link
    isLink: function(a) {
        return this.isKind(a, this.LINK);
    },
    
    // Returns whether data represents a private message
    isMessage: function(a) {
        return this.isKind(a, this.MESSAGE);
    },
    
    // Returns whether data represents a subreddit's details
    isSubreddit: function(a) {
        return this.isKind(a, this.SUBREDDIT);
    },
    
    // Returns whether data is a listing
    isListing: function(a) {
        return this.isKind(a, this.LISTING);
    },
    
    //////////
    
    // Returns whether the data represents a fake subreddit (e.g. saved, hidden)
    isFakeSubreddit: function(a) {
        return this.isKind(a, this.SUBREDDIT) 
            && typeof a.data.fake_subreddit != "undefined" 
            && a.data.fake_subreddit == true;
    },
};
