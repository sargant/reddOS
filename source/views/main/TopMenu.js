enyo.kind({
	
	name: "reddOS.view.main.TopMenu",
	kind: "enyo.VFlexBox",
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-topmenu");
	},
	
	/***************************************************************************
	 * Published Items
	 */
	
	events: {
		onObjectSend: "",
	},
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
		
		{kind: "Scroller", flex: 1, components: [
		
            // Default components
            
			{className: "reddos-topmenu-buttongroup", name: "defaultGroup",
				components: [
				
					{kind: "reddOS.component.SubredditButton",
						className: "reddos-topmenu-subreddit-button-first",
						onclick: "sendObject",
						content: "Front Page",
						subreddit: {
							kind: reddOS_Kind.SUBREDDIT,
							data: {
								display_name: "Front Page",
								url: "/",
							}
						},
					},
					
					{kind: "reddOS.component.SubredditButton",
						className: "reddos-topmenu-subreddit-button-last",
						onclick: "sendObject",
						content: "All Subreddits",
						subreddit: {
							kind: reddOS_Kind.SUBREDDIT,
							data: {
								display_name: "All Subreddits",
								url: "/r/all",
							}
						},
					},
				],
			},
            
            // User-orientated lists
            
            {className: "reddos-topmenu-divider", content: "My Reddit", name: "myRedditDivider", showing: false},
            
            {name: "myRedditList", showing: false,
				className: "reddos-topmenu-buttongroup", 
				components: [
					{kind: "reddOS.component.SubredditButton",
						className: "reddos-topmenu-subreddit-button-first",
                        name: "myRedditSubmitted",
						onclick: "sendObject",
                        content: "Submitted",
					},
                    
                    {kind: "reddOS.component.SubredditButton",
                        name: "myRedditLiked",
						onclick: "sendObject",
                        content: "Liked",
					},
                    
                    {kind: "reddOS.component.SubredditButton",
                        name: "myRedditDisliked",
						onclick: "sendObject",
                        content: "Disliked",
					},
                    
                    {kind: "reddOS.component.SubredditButton",
						className: "reddos-topmenu-subreddit-button-last",
                        name: "myRedditHidden",
						onclick: "sendObject",
                        content: "Hidden",
					},
				]
			},
            
            // Subreddit Lists
			
			{className: "reddos-topmenu-divider", content: "Subreddits"},
			
			{name: "subredditList", 
				className: "reddos-topmenu-buttongroup", 
				components: [
					{kind: "reddOS.component.SubredditButton",
						className: "reddos-topmenu-subreddit-button-loading reddos-topmenu-subreddit-button-first reddos-topmenu-subreddit-button-last",
						content: "Loading...",
					},
				]
			},
		]},
	],
		
	/***************************************************************************
	 * Methods
     */
        
    refreshUserData: function(inUserData) {
        
        if(inUserData == null) {
            this.$.myRedditDivider.hide();
            this.$.myRedditList.hide();
        } else {
            this.$.myRedditSubmitted.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Submitted", url: "/user/"+inUserData.data.name+"/submitted"}}
            this.$.myRedditLiked.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Liked", url: "/user/"+inUserData.data.name+"/liked"}}
            this.$.myRedditDisliked.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Disliked", url: "/user/"+inUserData.data.name+"/disliked"}}
            this.$.myRedditHidden.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Hidden", url: "/user/"+inUserData.data.name+"/hidden"}}
            
            this.$.myRedditDivider.show();
            this.$.myRedditList.show();
        }
    },
	
	refreshSubredditData: function(inSubredditData) {
		
		var c = this.$.subredditList;
		c.destroyControls();
		
		for(var i in inSubredditData) {
			
			if (typeof inSubredditData[i].kind == "undefined"
				|| typeof inSubredditData[i].data == "undefined"
				|| reddOS_Kind.isSubreddit(inSubredditData[i].kind) == false
			)
			{
				continue;
			}
			
			var temp =	{
				owner: this,
				onclick: "sendObject", 
				kind: "reddOS.component.SubredditButton",
				content: inSubredditData[i].data.display_name,
				subreddit: inSubredditData[i],
			};
			
			if(i == 0) {
				temp.className = "reddos-topmenu-subreddit-button-first";
			}
			
			if(i == (inSubredditData.length - 1)) {
				temp.className = "reddos-topmenu-subreddit-button-last";
			}
			
			c.createComponent(temp);
			
		}
		
		c.render();
		
	},
	
	sendObject: function(inSender) {
		if(typeof inSender.subreddit != "undefined") {
			this.doObjectSend(inSender.subreddit);
		}
	},
	
})