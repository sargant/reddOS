enyo.kind({
    
    name: "reddOS.service.RedditSubmitComment",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    create: function() {
        this.inherited(arguments);
        this.$.submitCommentWebService.setTimeout(this.timeout);
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
        
        {name: "submitCommentWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "http://www.reddit.com/api/comment", 
            method: "POST",
            onSuccess: "commentReturnSuccess", 
            onFailure: "commentReturnFailure", 
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    submitComment: function(userhash, fullname, comment) {
        if(typeof fullname == "undefined" || typeof comment == "undefined" || typeof userhash == "undefined") {
            this.doFailure();
        } else {
            this.$.submitCommentWebService.call({parent: fullname, uh: userhash, text: comment});
        }
    },
    
    commentReturnSuccess: function(inSender, inResponse) {
        
        if (typeof inResponse.jquery == "undefined" || !enyo.isArray(inResponse.jquery)) {
            this.doFailure();
            return;
        }
        
        var data_next_cycle = false;
        
        for (var i in inResponse.jquery) {
            
            var r = inResponse.jquery[i];
            
            if (r[2] == "attr" && r[3] == "insert_things") {
                data_next_cycle = true;
                continue;
            }
            
            if(data_next_cycle) {
                if (typeof r[3][0][0].data.id == "undefined") {
                    this.doFailure();
                } else {
                    this.doSuccess(r[3][0][0].data.id, r[3][0][0].data.contentText);
                }
                
                data_next_cycle = false;
                return;
            }
            
        }
        
        this.doFailure();
    },
    
    commentReturnFailure: function() {
        this.doFailure();
    },
});
