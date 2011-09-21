enyo.kind({
	
	name: "reddOS.view.main.SecondColumn",
	kind: "VFlexBox",
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-secondcolumn");
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
		
		{name: "secondColumnContent", 
			kind: "enyo.Pane",
			transitionKind: "enyo.transitions.Simple",
			flex: 1,
			components: [
			
				// Simple plain view
				
				{name: "secondColumnPlain",
                    layoutKind: "VFlexLayout",
                    pack: "end",
                    components: [
					
						{kind: "enyo.Toolbar", 
							className: "reddos-toolbar",
							components: [
								{name: "secondColumnTitle", 
									kind: "enyo.HtmlContent", 
									style: "color: white; font-weight: bold"
								},
							],
						},
						
						{flex: 1},
		
                        {kind: "enyo.Toolbar",
                            className: "reddos-toolbar",
                            components: [
                                {kind: "enyo.GrabButton",
                                    slidingHandler: true
                                },
                            ]
                        },
                    ],
                },
				
				// Subreddit view
				{name: "secondColumnSubreddit", kind: "reddOS.view.main.secondcolumn.Subreddit"},
                
			],
		},
	],
		
	/***************************************************************************
	 * Methods
	 */
		
	receiveObject: function(inObject) {
		
		if(reddOS_Kind.isSubreddit(inObject)) {
			this.$.secondColumnSubreddit.receiveObject(inObject);
			this.$.secondColumnContent.selectView(this.$.secondColumnSubreddit);
		}
	},
	
	refresh: function() {
		
		var currentView = this.$.secondColumnContent.getView();
		
		if(typeof currentView.refresh == "function") {
			this.$.secondColumnContent.selectView(this.$.secondColumnLoading);
			currentView.refresh();
		}
	},
    
	notReady: function() {
		this.$.secondColumnContent.selectView(this.$.secondColumnLoading);
	},
	
	subredditViewReady: function() {
		this.$.secondColumnContent.selectView(this.$.secondColumnSubreddit);
	},

})