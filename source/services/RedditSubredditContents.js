enyo.kind({
    
    name: "reddOS.service.RedditSubredditContents",
    kind: "enyo.Component",
    
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    create: function() {
        this.inherited(arguments);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onSuccess: "",
        onFailure: "",
    },
    
    published: {
        timeout: "10000",
    },
    
    currentSubreddit: "/",
    loadedStories: [],
    loadedStoryHashes: [],
    
    /***************************************************************************
     * Components
     */
    
    components: [
        
        {name: "subredditContentsWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            method: "GET",
            onSuccess: "subredditContentsWebServiceSuccess",
            onFailure: "subredditContentsWebServiceFailure",
        },
        
    ],
        
    /***************************************************************************
     * Methods
     */
        
    setSubreddit: function(url) {
        this.reset();
        this.currentSubreddit = url;
        this.$.subredditContentsWebService.setUrl("http://www.reddit.com"+this.currentSubreddit+".json");
    },
    
    reset: function() {
        this.loadedStories = [];
        this.loadedStoryHashes = [];
    },
        
    loadStories: function() {
        
        var args = { limit: 25 };
        
        if(this.loadedStoryHashes.length != 0) {
            args.after = this.loadedStories[this.loadedStories.length - 1].data.name;
        }
        
        this.$.subredditContentsWebService.call(args);
    },
    
    subredditContentsWebServiceSuccess: function(inSender, inResponse, inRequest) {
        
        if(reddOS_Kind.isListing(inResponse) == false) {
            this.doFailure();
        } else {
            
            for(var i in inResponse.data.children) {
                
                var k = inResponse.data.children[i];
                
                if(reddOS_Kind.isLink(k) == false) {
                    continue;
                }
                
                if(this.loadedStoryHashes.indexOf(k.data.name == -1)) {
                    this.loadedStories.push(k);
                    this.loadedStoryHashes.push(k.data.name);
                }
                
            }
            
            this.doSuccess(this.loadedStories);
        }
    },
    
    subredditContentsWebServiceFailure: function() {
        
        this.doFailure();
    },
});
