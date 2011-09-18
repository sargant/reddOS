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
		
		{name: "secondMenuContent", 
			kind: "enyo.Pane",
			transitionKind: "enyo.transitions.Simple",
			flex: 1,
			components: [
			
				// Simple plain view
				
				{name: "secondMenuPlain"}, 
				
				// Loading view
				
				{name: "secondMenuLoading", 
					layoutKind: "VFlexLayout", 
					flex: 1, 
					pack: "center", 
					align: "center", 
					components: [
						{kind: "enyo.SpinnerLarge", showing: true},
					]
				},
				
				// Subreddit view
				
				{name: "secondMenuSubreddit",
					kind: "reddOS.view.MainSecondSubreddit"},
			],
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