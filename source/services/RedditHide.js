/**
 * reddOS.service.RedditHide
 *
 * A simple webservice for marking articles as hidden
 */
 enyo.kind({
    
    // Class identifier
    name: "reddOS.service.RedditHide",
     
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
        {   name: "hideWebService", 
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
    
    // Initiate a call to the hiding service. Requires userhash for authentication.
    doHidden: function(userhash, fullname, hidden) {
        if(typeof fullname == "undefined" || typeof hidden == "undefined" || typeof userhash == "undefined") {
            this.doFailure();
        } else {
            // Change the service URL based on whether we are hiding or revealing
            if(hidden) {
                this.$.hideWebService.setUrl("http://www.reddit.com/api/hide");
            } else {
                this.$.hideWebService.setUrl("http://www.reddit.com/api/unhide");
            }
            // Call
            this.$.hideWebService.call({id: fullname, uh: userhash});
        }
    },
    
    // Internal service callback success
    hideReturnSuccess: function(inSender, inResponse) {
        if(typeof inResponse.jquery != "undefined") {
            this.doFailure();
        } else {
            this.doSuccess();
        }
    },
    
    // Internal service callback failure
    hideReturnFailure: function() {
        this.doFailure();
    },
});
