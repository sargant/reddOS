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
		onMessageSend: "",
	},
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
		
		{kind: "Scroller", flex: 1, components: [
		
			{className: "reddos-topmenu-buttongroup", 
				components: [
				
					{kind: "reddOS.component.SubredditButton",
						className: "reddos-topmenu-subreddit-button-first",
						onclick: "sendMessage",
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
						onclick: "sendMessage",
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
				onclick: "sendMessage", 
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
	
	sendMessage: function(inSender) {
		if(typeof inSender.subreddit != "undefined") {
			this.doMessageSend(inSender.subreddit);
		}
	},
	
})