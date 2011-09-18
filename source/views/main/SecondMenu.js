enyo.kind({
	
	name: "reddOS.view.MainSecondMenu",
	kind: "VFlexBox",
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-secondmenu");
	},
	
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
					kind: "reddOS.view.MainSecondSubreddit",
					onReady: "subredditViewReady",
				},
			],
		},
		
		{kind: "enyo.Toolbar",
			className: "reddos-toolbar",
			components: [
			
				{kind: "enyo.GrabButton",
					slidingHandler: true
				},
				
				{kind: "enyo.Spacer"},
			
				{kind: "enyo.ToolButton", 
					icon: "images/menu-icon-refresh.png",
					onclick: "refresh",
				},
			]
		},
	],
		
	/***************************************************************************
	 * Methods
	 */
		
	loadSubreddit: function(inSender) {
		this.$.secondMenuContent.selectView(this.$.secondMenuLoading);
		this.$.secondMenuTitle.setContent(inSender.caption);
		this.$.secondMenuSubreddit.loadSubreddit(inSender.subreddit);
	},
	
	refresh: function() {
		
		var currentView = this.$.secondMenuContent.getView();
		
		if(typeof currentView.refresh == "function") {
			this.$.secondMenuContent.selectView(this.$.secondMenuLoading);
			currentView.refresh();
		}
	},
	
	subredditViewReady: function() {
		this.$.secondMenuContent.selectView(this.$.secondMenuSubreddit);
	},

})