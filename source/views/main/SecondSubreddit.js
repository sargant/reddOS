enyo.kind({
	
	name: "reddOS.view.MainSecondSubreddit",
	kind: "enyo.Scroller", 
	
	flex: 1, 
	
	subredditContentsCache: [],
	
	moreButtonCaptions: {
		ok: "Tap to load more...",
		loading: "Loading...",
	},
	
	/***************************************************************************
	 * Published Items
	 */
	
	events: {
		onReady: "",
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
							kind: "enyo.CustomButton", 
							className: "reddos-subreddit-item-commentbutton",
							cssNamespace: "reddos-subreddit-item-commentbutton",
							content: "0", 
							onclick: "subredditStoryCommentClick"
						},
					],
				},
			],
		},
			
		{name: "loadMoreStoriesButton", 
			kind: "enyo.CustomButton", 
			caption: "",
			onclick: "loadSubredditMore",
			style: "padding: 20px 5px 20px 5px; font-weight: bold; text-align: center"
		},
	],
		
	/***************************************************************************
     * Methods
	 */
	
	loadSubreddit: function(subredditName) {
		this.setScrollTop(0);
		this.$.subredditContentsService.setSubreddit(subredditName);
		this.$.subredditContentsService.loadStories();
	},
	
	loadSubredditMore: function() {
		this.$.loadMoreStoriesButton.setCaption(this.moreButtonCaptions.loading);
		this.$.subredditContentsService.loadStories();
	},
	
	refresh: function() {
		this.setScrollTop(0);
		this.$.subredditContentsService.reset();
		this.$.subredditContentsService.loadStories();
	},
	
	incomingSubredditContents: function(inSender, inData) {
		this.subredditContentsCache = inData;
		this.$.subredditContents.render();
		this.$.loadMoreStoriesButton.setCaption(this.moreButtonCaptions.ok);
		this.doReady();
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