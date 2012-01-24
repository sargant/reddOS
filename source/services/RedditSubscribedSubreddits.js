/**
 * reddOS.service.RedditSubscribedSubreddits
 *
 * A webservice for obtaining a list of subreddits subscribed to by the user.
 */
 
enyo.kind({
    
    // Class identifier
    name: "reddOS.service.RedditSubscribedSubreddits",
    
    // Base class
    kind: "enyo.Component",
    
    // Local properties
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.$.subscribedSubredditsWebService.setTimeout(this.timeout);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onSuccess: "",
        onFailure: "",
    },
    
    published: {
        timeout: 20000,
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        {   name: "subscribedSubredditsWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "http://www.reddit.com/reddits/mine.json?limit=1000", 
            method: "GET",
            onSuccess: "subscribedSubredditsWebServiceSuccess",
            onFailure: "subscribedSubredditsWebServiceFailure",
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    // Begin an asynchronous webservice call
    refreshData: function() {
        this.$.subscribedSubredditsWebService.call();
    },
    
    // Internal service callback upon success
    subscribedSubredditsWebServiceSuccess: function(inSender, inResponse, inRequest) {
        
        // Sanity checking
        if(typeof inResponse.data == "undefined" || typeof inResponse.data.children == "undefined") {
            this.doFailure();
        } else {
            // Extract each child from the data and return as an array
            // of reddOS_Kind.SUBREDDIT items
            var sS = [];
            for(var i in inResponse.data.children) {
                sS.push(inResponse.data.children[i])
            }
            this.doSuccess(sS);
        }
    },
    
    // Internal service callback upon failure
    subscribedSubredditsWebServiceFailure: function() {
        this.doFailure();
    },
});
