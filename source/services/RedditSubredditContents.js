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
		if(this.currentSubreddit != url) {
			this.reset();
			this.currentSubreddit = url;
		}
		
		this.$.subredditContentsWebService.setUrl("http://www.reddit.com"+this.currentSubreddit+".json");
	},
	
	reset: function() {
		this.loadedStories = [];
		this.loadedStoryHashes = [];
	},
		
	loadStories: function() {
		
		var args = { limit: 25 };
		
		if(this.loadedStoryHashes.length != 0) {
			args.after = this.loadedStories[this.loadedStories.length - 1].name;
		}
		
		this.$.subredditContentsWebService.call(args);
	},
	
	subredditContentsWebServiceSuccess: function(inSender, inResponse, inRequest) {
		
		if(typeof inResponse.data.children == "undefined") {
			
			this.doFailure();
			
		} else {
			
			for(var i in inResponse.data.children) {
				
				var k = inResponse.data.children[i].data;
				
				if(this.loadedStoryHashes.indexOf(k.name == -1)) {
					this.loadedStories.push(k);
					this.loadedStoryHashes.push(k.name);
				}
				
			}
			
			this.doSuccess(this.loadedStories);
		}
	},
	
	subredditContentsWebServiceFailure: function() {
		
		this.doFailure();
	},
})