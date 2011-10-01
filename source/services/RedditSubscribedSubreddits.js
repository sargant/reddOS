enyo.kind({
    
    name: "reddOS.service.RedditSubscribedSubreddits",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
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
        
        {name: "subscribedSubredditsWebService", 
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
        
    refreshData: function() {
        this.$.subscribedSubredditsWebService.call();
    },
    
    subscribedSubredditsWebServiceSuccess: function(inSender, inResponse, inRequest) {
        
        if(typeof inResponse.data == "undefined" 
            || typeof inResponse.data.children == "undefined") {
            
            this.doFailure();
            
        } else {
            
            var sS = [];
            
            for(var i in inResponse.data.children) {
                sS.push(inResponse.data.children[i])
            }
            
            this.doSuccess(sS);
        }
    },
    
    subscribedSubredditsWebServiceFailure: function() {
        this.doFailure();
    },
});
