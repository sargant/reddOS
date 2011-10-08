enyo.kind({
    
    name: "reddOS.service.RedditLoadComments",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
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
    
    permalinkCache: null,
    
    /***************************************************************************
     * Components
     */
    
    components: [
        
        {name: "commentsWebService", 
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
     
    loadComments: function(inPermalink) {
        this.permalinkCache = "http://www.reddit.com"+inPermalink+".json";
        this.$.commentsWebService.setUrl(this.permalinkCache);
        this.$.commentsWebService.call();
    },
        
    refreshData: function() {
        this.$.commentsWebService.call();
    },
    
    commentsWebServiceSuccess: function(inSender, inResponse, inRequest) {
        if(enyo.isArray(inResponse) == false) {
            this.doFailure();
        } else {
            this.doSuccess(inResponse);
        }
    },
    
    commentsWebServiceFailure: function() {
        this.doFailure();
    },
});
