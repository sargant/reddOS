 enyo.kind({
    
    name: "reddOS.view.main.contentviewer.CommentView",
    kind: "enyo.VFlexBox",
    className: "reddos-comments",
    
    flex: 1,
    
    linkCache: null,
    
    events: {
        onToggleView: "",
    },
    
    components: [
    
        {kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {kind: "HtmlContent", name: "commentToolbarTitle", flex: 1,
                    style: "margin-left: 8px; font-size: 16px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                },
            ]
        },
    
        {kind: "enyo.Scroller", name: "commentScroller", flex: 1, components: [
            {name: "headerBlock", 
                className: "reddos-comments-header", 
                components: [
                    {name: "commentTitle", className: "reddos-comments-title"},
                    {name: "commentMeta", className: "reddos-comments-meta"},
                ]
            },
            {name: "commentSelftext", allowHtml: true, className: "reddos-comments-selftext"},
            {name: "commentsBlock",
                flex: 1,
            },
        ]},
        
        {kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {kind: enyo.GrabButton},
                
                {kind: "enyo.ToolButton", 
                    name: "toolbarLinkButton", 
                    icon: "images/menu-icon-link.png", 
                    onclick: "loadLink",
                },
                
                {kind: "enyo.Spacer"},
                {kind: "enyo.ToolButton", 
                    name: "toolbarRefreshButton",
                    icon: "images/menu-icon-refresh.png", 
                    onclick: "webBrowserRefresh",
                },
            ]
        },
    ],
    
    /***************************************************************************
     * Methods
     */
     
    receiveObject: function (inObject) {
    
        if(reddOS_Kind.isLink(inObject) == false) return;
        
        this.linkCache = inObject;
        
        var data = this.linkCache.data;
        
        this.$.commentScroller.setScrollTop(0);
        this.$.commentScroller.setScrollLeft(0);
        this.$.commentToolbarTitle.setContent("[" + data.subreddit + "] " + data.title);
        
        this.$.commentTitle.setContent(data.title);
        this.$.commentMeta.setContent("posted "+reddOS_Date.timeSince(data.created_utc)+" ago by "+data.author+" to "+data.subreddit);
        
        if(data.is_self) {
            
            var text = data.selftext;
            var markdown = new Markdown.Converter();
            
            text = markdown.makeHtml(text);
            //text = enyo.string.runTextIndexer(text, {phoneNumber: false, emailAddress: false, emoticon: false });
            
            this.$.commentSelftext.setContent(text);
            this.$.commentSelftext.show();
            this.$.toolbarLinkButton.hide();
        } else {
            this.$.commentSelftext.hide();
            this.$.toolbarLinkButton.show();
        }
    },
    
    loadLink: function () {
        this.doToggleView();
    },
});
