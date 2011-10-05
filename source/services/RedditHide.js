enyo.kind({
    
    name: "reddOS.service.RedditHide",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    create: function() {
        this.inherited(arguments);
        this.$.hideWebService.setTimeout(this.timeout);
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
        
        {name: "hideWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "http://www.reddit.com/api/hide", 
            method: "POST",
            onSuccess: "hideReturnSuccess", 
            onFailure: "hideReturnFailure", 
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    doHidden: function(userhash, fullname, hidden) {
        if(typeof fullname == "undefined" || typeof hidden == "undefined" || typeof userhash == "undefined") {
            this.doFailure();
        } else {
            if(hidden) {
                this.$.hideWebService.setUrl("http://www.reddit.com/api/hide");
            } else {
                this.$.hideWebService.setUrl("http://www.reddit.com/api/unhide");
            }
            this.$.hideWebService.call({id: fullname, uh: userhash});
        }
    },
    
    hideReturnSuccess: function(inSender, inResponse) {
        if(typeof inResponse.jquery != "undefined") {
            this.doFailure();
        } else {
            this.doSuccess();
        }
    },
    
    hideReturnFailure: function() {
        this.doFailure();
    },
});
