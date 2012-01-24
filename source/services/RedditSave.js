/**
 * reddOS.service.RedditSave
 *
 * A simple webservice for remotely saving articles
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.service.RedditSave",
    
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
        
        {   name: "saveWebService", 
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
    
    // Initiate a call to the saving service. Requires userhash for authentication.
    doSaved: function(userhash, fullname, saved) {
        if(typeof fullname == "undefined" || typeof saved == "undefined" || typeof userhash == "undefined") {
            this.doFailure();
        } else {
            // Change the service URL based on whether we are saving or removing
            if(saved) {
                this.$.saveWebService.setUrl("http://www.reddit.com/api/save");
            } else {
                this.$.saveWebService.setUrl("http://www.reddit.com/api/unsave");
            }
            // Call
            this.$.saveWebService.call({id: fullname, uh: userhash});
        }
    },
    
    // Internal service callback success
    saveReturnSuccess: function(inSender, inResponse) {
        if(typeof inResponse.jquery != "undefined") {
            this.doFailure();
        } else {
            this.doSuccess();
        }
    },
    
    // Internal service callback failure
    saveReturnFailure: function() {
        this.doFailure();
    },
});
