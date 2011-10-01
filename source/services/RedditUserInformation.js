enyo.kind({
    
    name: "reddOS.service.RedditUserInformation",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    create: function() {
        this.inherited(arguments);
        this.$.userInformationWebService.setTimeout(this.timeout);
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
        
        {name: "userInformationWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "http://www.reddit.com/api/me.json", 
            method: "GET",
            onSuccess: "userInformationWebServiceSuccess",
            onFailure: "userInformationWebServiceFailure",
        },
        
    ],
        
    /***************************************************************************
     * Methods
     */
        
    refreshData: function() {
        this.$.userInformationWebService.call();
    },
    
    userInformationWebServiceSuccess: function(inSender, inResponse, inRequest) {
        if(reddOS_Kind.isAccount(inResponse) == false) {
            this.doSuccess(null);
        } else {
            this.doSuccess(inResponse);
        }
    },
    
    userInformationWebServiceFailure: function() {
        this.doFailure();
    },
});
