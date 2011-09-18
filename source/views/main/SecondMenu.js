enyo.kind({
	
	name: "reddOS.view.MainSecondMenu",
	kind: "VFlexBox",
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-secondmenu");
	},
	
	subredditContentsCache: [],
	
	/***************************************************************************
	 * Published Items
	 */
	
	events: {
		onSubredditStoryLoad: "",
	},
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
	
		{name: "subredditContentsService",
			kind: "reddOS.service.RedditSubredditContents",
			onSuccess: "incomingSubredditContents",
			onFailure: "incomingSubredditContents",
		},
		
		//
		// UI
		//
		
		{kind: "enyo.Toolbar", 
			className: "reddos-toolbar",
			components: [
				{name: "secondMenuTitle", 
					kind: "enyo.HtmlContent", 
					style: "color: white; font-weight: bold"
				},
			],
		},
		
		{name: "subredditContentsScroller", 
			kind: "enyo.Scroller", 
			flex: 1, 
			components: [
			
				{name: "subredditContents", 
					kind: "VirtualRepeater", 
					onSetupRow: "subredditContentsRender",
					components: [
					
						{name: "subredditSingleItem", 
							kind: "enyo.Item",
							className: "reddos-subreddit-item",
							layoutKind: "HFlexLayout", 
							align: "start", 
							components: [
								
								{kind: "VFlexBox", 
									flex: 1, 
									onclick: "subredditStoryItemClick",
									components: [
										
										{name: "postTitle", 
											className: "reddos-subreddit-item-title",
											allowHtml: true,
										},
										
										{name: "postWhen",
											className: "reddos-subreddit-item-date",
											allowHtml: true,
										},
										
										{name: "postWhoWhere", 
											className: "reddos-subreddit-item-user",
											allowHtml: true, 
										},
									],
								},
								
								{name: "commentCount", 
									kind: "enyo.Button", 
									content: "0", 
									onclick: "subredditStoryCommentClick"
								},
							],
						},
					],
				},
			
				{name: "loadMoreStoriesButton", 
					kind: "enyo.CustomButton", 
					caption: "Tap to load more...", 
					onclick: "loadSubredditMore",
					style: "padding: 20px 5px 20px 5px; font-weight: bold; text-align: center"
				},
			]
		},
		
		{kind: "enyo.Toolbar",
			className: "reddos-toolbar",
			components: [
			
				{kind: "enyo.GrabButton",
					slidingHandler: true
				},
				
				{kind: "enyo.Spacer"},
			
				{kind: "enyo.ToolButton", icon: "images/menu-icon-refresh.png"},
			]
		},
	],
		
	loadSubreddit: function(inSender) {
		this.$.secondMenuTitle.setContent(inSender.caption);
		this.$.subredditContentsService.setSubreddit(inSender.subreddit);
		this.$.subredditContentsService.loadStories();
	},
	
	loadSubredditMore: function() {
		this.$.subredditContentsService.loadStories();
	},
	
	incomingSubredditContents: function(inSender, inData) {
		this.subredditContentsCache = inData;
		this.$.subredditContents.render();
	},
	
	subredditContentsRender: function(inSender, inIndex) {
		
		var r = this.subredditContentsCache[inIndex];
		
		if (r) {
			this.$.subredditContents.setStyle("border: 0");
			if(inIndex % 2 == 1) { this.$.subredditSingleItem.setStyle("border:0; background-color: #eee"); }
			this.$.postTitle.setContent(r.title);
			this.$.postWhen.setContent("<b>"+r.score+"</b> posted "+reddOS_Date.timeSince(r.created_utc)+" ago");
			this.$.postWhoWhere.setContent("Posted by "+r.author+" to "+r.subreddit);
			this.$.commentCount.setCaption(r.num_comments);
			return true;
		}
		return false;
	},
})