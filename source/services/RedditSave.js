enyo.kind({
    
    name: "reddOS.service.RedditSave",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    create: function() {
        this.inherited(arguments);
        this.$.saveWebService.setTimeout(this.timeout);
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
        
        {name: "saveWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "http://www.reddit.com/api/save", 
            method: "POST",
            onSuccess: "saveReturnSuccess", 
            onFailure: "saveReturnFailure", 
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    doSaved: function(userhash, fullname, saved) {
        if(typeof fullname == "undefined" || typeof saved == "undefined" || typeof userhash == "undefined") {
            this.doFailure();
        } else {
            if(saved) {
                this.$.saveWebService.setUrl("http://www.reddit.com/api/save");
            } else {
                this.$.saveWebService.setUrl("http://www.reddit.com/api/unsave");
            }
            this.$.saveWebService.call({id: fullname, uh: userhash});
        }
    },
    
    saveReturnSuccess: function(inSender, inResponse) {
        if(typeof inResponse.jquery != "undefined") {
            this.doFailure();
        } else {
            this.doSuccess();
        }
    },
    
    saveReturnFailure: function() {
        this.doFailure();
    },
});
