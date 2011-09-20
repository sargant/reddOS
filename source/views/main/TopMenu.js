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
		onSubredditSelect: "",
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
						onclick: "clickSubredditSelect",
						content: "Front Page",
						subreddit: "/",
					},
					
					{kind: "reddOS.component.SubredditButton",
						className: "reddos-topmenu-subreddit-button-last",
						onclick: "clickSubredditSelect",
						content: "All Subreddits",
						subreddit: "/r/all",
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
			
			var temp =	{
				owner: this,
				onclick: "clickSubredditSelect", 
				kind: "reddOS.component.SubredditButton",
				content: inSubredditData[i].display_name,
				subreddit: inSubredditData[i].url,
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
	
	clickSubredditSelect: function(inSender) {
		this.doSubredditSelect(inSender);
	},
	
})