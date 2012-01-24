/**
 * reddOS.service.RedditSubredditContents
 *
 * A webservice for retrieving a list of subreddit contents. Contains internal
 * caching for loading additional pages on demand, and returns the full
 * dataset from 1..N each time.
 */

enyo.kind({
   
    // Class identifier
    name: "reddOS.service.RedditSubredditContents",
    
    // Base class
    kind: "enyo.Component",
    
    // Local properties
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    currentSubreddit: "/",
    loadedStories: [],
    loadedStoryHashes: [],
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.$.subredditContentsWebService.setTimeout(this.timeout);
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
        {   name: "subredditContentsWebService", 
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
    
    // Change the subreddit we want the contents for, and load the first page
    // of results
    setSubreddit: function(url) {
        this.reset();
        this.currentSubreddit = url;
        this.$.subredditContentsWebService.setUrl("http://www.reddit.com"+this.currentSubreddit+".json");
    },
    
    // Clean out the caches, such that we load the subreddit from the first
    // page on the next API call
    reset: function() {
        this.loadedStories = [];
        this.loadedStoryHashes = [];
    },
        
    // Perform an asynchronous request for the next page of contents
    loadStories: function() {
        
        var args = { limit: 25 };
        
        // If the cache already contains items, load the next set of items
        // beyond the last item in the cache
        if(this.loadedStoryHashes.length != 0) {
            args.after = this.loadedStories[this.loadedStories.length - 1].data.name;
        }
        
        this.$.subredditContentsWebService.call(args);
    },
    
    // Internal service callback success
    subredditContentsWebServiceSuccess: function(inSender, inResponse, inRequest) {
        
        // Sanity check
        if(reddOS_Kind.isListing(inResponse) == false) {
            this.doFailure();
        } else if (inResponse.data.children.length === 0) {
        
            // If there are no entries we are still successful, there just
            // are no more results!
            this.doSuccess(null);
        
        } else {
            
            // Loop over all the results returned
            for(var i in inResponse.data.children) {
                
                var k = inResponse.data.children[i];
                
                // Sanity check - is it the right kind of data?
                if(reddOS_Kind.isLink(k) == false) {
                    continue;
                }
                
                // Check we don't already have this story in our hash cache.
                if(this.loadedStoryHashes.indexOf(k.data.name == -1)) {
                    // Add the story and its hash to the cache
                    this.loadedStories.push(k);
                    this.loadedStoryHashes.push(k.data.name);
                }
                
            }
            this.doSuccess(this.loadedStories);
        }
    },
    
    // Internal service callback failure
    subredditContentsWebServiceFailure: function() {
        this.doFailure();
    },
});
