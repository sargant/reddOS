/**
 * reddOS.service.RedditLoadComments
 *
 * A simple webservice for loading all the comments associated with
 * a particular article
 */

enyo.kind({
   
    // Class identifier
    name: "reddOS.service.RedditLoadComments",
    
    // Base class
    kind: "enyo.Component",
    
    // Local properties
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    permalinkCache: null,
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.$.commentsWebService.setTimeout(this.timeout);
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
        {   name: "commentsWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            method: "GET",
            onSuccess: "commentsWebServiceSuccess",
            onFailure: "commentsWebServiceFailure",
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    // Load comments for a specified article
    loadComments: function(inPermalink) {
        this.permalinkCache = "http://www.reddit.com"+inPermalink+".json";
        this.$.commentsWebService.setUrl(this.permalinkCache);
        this.$.commentsWebService.call();
    },
        
    // Reload comments for same article
    refreshData: function() {
        this.$.commentsWebService.call();
    },
    
    // Internal webservice callback success
    commentsWebServiceSuccess: function(inSender, inResponse, inRequest) {
        if(enyo.isArray(inResponse) == false) {
            this.doFailure();
        } else {
            this.doSuccess(inResponse);
        }
    },
    
    // Internal webservice callback failure
    commentsWebServiceFailure: function() {
        this.doFailure();
    },
});
