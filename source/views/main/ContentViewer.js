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
    
        {kind: "Pane", name: "contentPane", transitionKind: "enyo.transitions.Simple",
            flex: 1, className: "reddos-story-view", components: [
            
                // Empty (default) view
                {name: "plainView", layoutKind: "VFlexLayout", 
                    components: [
                        {kind: "enyo.Toolbar", className: "reddos-toolbar"},
                        {kind: "enyo.VFlexBox", flex: 1, 
                            pack: "center", align: "center", 
                            components: [
                                {kind: "enyo.Image", src: "images/reddOS_filler.png"},
                            ]
                        },
                        {kind: "enyo.Toolbar", className: "reddos-toolbar",
                            components: [
                                {kind: "enyo.GrabButton"},
                                {kind: "enyo.Spacer"},
                            ]
                        },
                    ]
                },
                
                // Web View
                {name: "webView", 
                    kind: "reddOS.view.main.contentviewer.WebView",
                    onToggleView: "toggleLinkCommentView",
                    flex: 1
                },
                
                // Comment View
                {name: "commentView", 
                    kind: "reddOS.view.main.contentviewer.CommentView",
                    onToggleView: "toggleLinkCommentView",
                    flex: 1
                },
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
            this.$.commentView.receiveObject(this.linkCache);
            this.$.contentPane.selectView(this.$.commentView);
        } else if(typeof this.linkCache.target == "undefined" || this.linkCache.target == "link") {
            this.$.webView.receiveUrl(this.linkCache.data.url);
            this.$.contentPane.selectView(this.$.webView);
        } else {
            this.$.commentView.receiveObject(this.linkCache);
            this.$.contentPane.selectView(this.$.commentView);
        }
    },
    
    toggleLinkCommentView: function () {
    
        if(this.$.contentPane.getViewName() == "commentView") {
            this.$.webView.receiveUrl(this.linkCache.data.url);
            this.$.contentPane.selectView(this.$.webView);
        } else {
            this.$.commentView.receiveObject(this.linkCache);
            this.$.contentPane.selectView(this.$.commentView);
        }
    },
    
    /*
    
    loadLink: function() {
        this.$.storyPane.selectView(this.$.storyView);
        
        var url = this.linkCache.data.url;
        
        if(reddOS_Settings.getSetting("imgurDeepLink") && url.match(/^http:\/\/(www\.)?imgur.com\/[A-Za-z0-9]+/gi)) {
            url = url.replace(/http:\/\/(www\.)?imgur/gi, "http://i.imgur");
            url += ".jpg";
        }
        
        this.$.webBrowser.setUrl(url);
    },
    
    loadComments: function() {
        this.$.storyPane.selectView(this.$.storyView);
        this.$.webBrowser.setUrl("http://i.reddit.com"+this.linkCache.data.permalink);
    },
    
    */
});
