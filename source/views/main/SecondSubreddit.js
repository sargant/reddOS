enyo.kind({
	
	name: "reddOS.view.main.SecondSubreddit",
	kind: "enyo.VFlexBox", 
	
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
		onNotReady: "",
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
        
        {kind: "enyo.Scroller", name: "subredditScroller", flex: 1, components: [
		
            {name: "subredditContents", 
                kind: "VirtualRepeater", 
                onSetupRow: "subredditContentsRender",
                components: [
                    
                    {name: "subredditSingleItem", 
                        kind: "enyo.Item",
                        className: "reddos-subreddit-item",
                        cssNamespace: "reddos-subreddit-item",
                        tapHighlight: true,
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
                                    
                                    {name: "postDomain",
                                        className: "reddos-subreddit-item-domain",
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

                            {kind: "VFlexBox", components: [
								
                                {name: "commentCount", 
                                    kind: "enyo.CustomButton", 
                                    className: "reddos-subreddit-item-commentbutton",
                                    cssNamespace: "reddos-subreddit-item-commentbutton",
                                    content: "0", 
                                    allowDrag: true,
                                    onclick: "subredditStoryCommentClick"
                                }
                            ]},
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
        ]},
        
        {kind: "enyo.Toolbar",
			className: "reddos-toolbar",
			components: [
			
				{kind: "enyo.GrabButton",
					slidingHandler: true
				},
				
				{kind: "enyo.Spacer"},
				
				{kind: "enyo.ToolButton", 
					icon: "images/menu-icon-share.png",
				},
			
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
	
	loadSubreddit: function(subredditName) {
		this.$.subredditScroller.setScrollTop(0);
		this.$.subredditContentsService.setSubreddit(subredditName);
		this.$.subredditContentsService.loadStories();
	},
	
	loadSubredditMore: function() {
		this.$.loadMoreStoriesButton.setCaption(this.moreButtonCaptions.loading);
		this.$.subredditContentsService.loadStories();
	},
	
	refresh: function() {
		this.$.subredditScroller.setScrollTop(0);
		this.doNotReady();
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
			if(inIndex % 2 == 1) { this.$.subredditSingleItem.addClass("reddos-subreddit-item-odd"); }
			this.$.postTitle.setContent(r.title);
			this.$.postDomain.setContent(r.domain);
			this.$.postWhen.setContent("<span class=\"reddos-subreddit-item-score\">"+r.score+"</span> posted "+reddOS_Date.timeSince(r.created_utc)+" ago");
			this.$.postWhoWhere.setContent("Posted by "+r.author+" to "+r.subreddit);
			this.$.commentCount.setCaption(r.num_comments);
			return true;
		}
		return false;
	},
})
