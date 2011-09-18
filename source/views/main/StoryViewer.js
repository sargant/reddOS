enyo.kind({
	
	name: "reddOS.view.MainStoryViewer",
	kind: "VFlexBox",
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-storyviewer");
	},
	
	components: [
	
		{kind: "enyo.Toolbar", 
			className: "reddos-toolbar",
			components: [
				{kind: "enyo.ToolButton", icon: "images/menu-icon-back.png"},
			
				{kind: "HtmlContent", name: "webBrowserTitle", flex: 1,
					style: "margin-left: 8px; font-size: 16px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"},
				{kind: enyo.Spinner, name: "webBrowserLoading"},
			
			]
		},
	
		{kind: "Pane", name: "storyPane", transitionKind: "enyo.transitions.Simple",
			flex: 1, className: "reddos-story-view", components: [
			
				// Empty (default) view
				{name: "plainView", layoutKind: "VFlexLayout", 
					flex: 1, pack: "center", align: "center", components: [
						{kind: "Image", src: "images/reddOS_filler.png"},
					]
				},
				
				// Web View
				{name: "storyView", layoutKind: "VFlexLayout", 
					flex: 1, components: [
							{name: "webBrowser", kind: "WebView", minFontSize: 0, flex: 1,
								onLoadStarted: "webBrowserLoadStarted",
								onLoadStopped: "webBrowserLoadStopped",
								onPageTitleChanged: "webBrowserTitleChanged",
							},
					]
				},
			]
		},
		
		{kind: "enyo.Toolbar", 
			className: "reddos-toolbar",
			components: [
			{kind: enyo.GrabButton},
			{kind: enyo.ToolButtonGroup, components: [
				{caption: "Link", onclick: "loadLink"},
				{caption: "Comments", onclick: "loadComments"}
			]}
		]} 
	],
})