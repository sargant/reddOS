enyo.kind({
	
	name: "reddOS.view.MainSecondSubreddit",
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
	],
})