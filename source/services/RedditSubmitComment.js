/**
 * reddOS.service.RedditSubmitComment
 *
 * A simple webservice for submitting a comment.
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.service.RedditSubmitComment",
    
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
        {   name: "submitCommentWebService", 
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
    
    // Add a comment. Requires the userhash, for authentication purposes.
    submitComment: function(userhash, fullname, comment) {
        if(typeof fullname == "undefined" || typeof comment == "undefined" || typeof userhash == "undefined") {
            this.doFailure();
        } else {
            this.$.submitCommentWebService.call({parent: fullname, uh: userhash, text: comment});
        }
    },
    
    // Internal service callback success
    commentReturnSuccess: function(inSender, inResponse) {
        
        // Check we have the correct response data
        if (typeof inResponse.jquery == "undefined" || !enyo.isArray(inResponse.jquery)) {
            this.doFailure();
            return;
        }
        
        var data_next_cycle = false;
        
        // Loop through response fields
        for (var i in inResponse.jquery) {
            
            var r = inResponse.jquery[i];
            
            // If true, the next loop will give us our response details
            if (r[2] == "attr" && r[3] == "insert_things") {
                data_next_cycle = true;
                continue;
            }
            
            // If the last loop told us to expect data next cycle, we gather
            // it here
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
    
    // Internal service callback failure
    commentReturnFailure: function() {
        this.doFailure();
    },
});
