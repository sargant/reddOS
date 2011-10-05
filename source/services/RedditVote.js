enyo.kind({
    
    name: "reddOS.service.RedditVote",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    create: function() {
        this.inherited(arguments);
        this.$.voteWebService.setTimeout(this.timeout);
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
        
        {name: "voteWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "http://www.reddit.com/api/vote", 
            method: "POST",
            onSuccess: "voteReturnSuccess", 
            onFailure: "voteReturnFailure", 
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    doVote: function(userhash, fullname, vote) {
        if(typeof fullname == "undefined" || typeof vote == "undefined" || typeof userhash == "undefined") {
            this.doFailure();
        } else {
            this.$.voteWebService.call({id: fullname, dir: vote, uh: userhash});
        }
    },
    
    voteReturnSuccess: function(inSender, inResponse) {
        if(typeof inResponse.jquery != "undefined") {
            this.doFailure();
        } else {
            this.doSuccess();
        }
    },
    
    voteReturnFailure: function() {
        this.doFailure();
    },
});
