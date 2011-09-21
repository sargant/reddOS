enyo.kind({
	
	name: "reddOS.view.main.StoryViewer",
	kind: "VFlexBox",
	
	create: function() {
		this.inherited(arguments);
		this.addClass("reddos-storyviewer");
	},
	
	linkCache: null,
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
	
		{kind: "enyo.Toolbar", 
			className: "reddos-toolbar",
			components: [
				{kind: "enyo.ToolButton", icon: "images/menu-icon-back.png", onclick: "webBrowserBack"},
			
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
							{name: "webBrowser", kind: "WebView", minFontSize: 0, flex: 1, width: "100%", height: "100%",
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
				{kind: "enyo.Spacer"},
                {kind: "enyo.ToolButton", icon: "images/menu-icon-refresh.png",	onclick: "webBrowserRefresh"},
			]
		},
	],
		
	/***************************************************************************
	 * Methods
	 */
		
	receiveObject: function(inObject) {
		
		if(reddOS_Kind.isLink(inObject) == false) return;
		
		this.linkCache = inObject;
		
		if(this.linkCache.data.is_self == true) {
			this.loadComments();
		} else if(typeof this.linkCache.target == "undefined" || this.linkCache.target == "link") {
			this.loadLink();
		} else {
			this.loadComments();
		}
	},
	
	loadLink: function() {
		this.$.storyPane.selectView(this.$.storyView);
		this.$.webBrowser.setUrl(this.linkCache.data.url);
	},
	
	loadComments: function() {
		this.$.storyPane.selectView(this.$.storyView);
		this.$.webBrowser.setUrl("http://i.reddit.com"+this.linkCache.data.permalink);
	},
	
	webBrowserRefresh: function() {
		if(typeof this.$.webBrowser.reloadPage == "function") {
			this.$.webBrowser.reloadPage();
		} else {
			this.$.webBrowser.refresh();
		}
	},
	
	webBrowserBack: function() {
		this.$.webBrowser.goBack();
	},
	
	webBrowserTitleChanged: function(inSender, inTitle) {
		if(inTitle != "image_title") {
			this.$.webBrowserTitle.setContent(inTitle);
		}
	},
	
	webBrowserLoadStarted: function() {
		this.$.webBrowserTitle.setContent(this.$.webBrowser.getUrl());
		this.$.webBrowserLoading.show();
	},
	
	webBrowserLoadStopped: function() {
		this.$.webBrowserLoading.hide();
	},
})