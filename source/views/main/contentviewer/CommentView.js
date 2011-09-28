 enyo.kind({
    
    name: "reddOS.view.main.contentviewer.CommentView",
    kind: "enyo.VFlexBox",
    className: "reddos-comments",
    
    flex: 1,
    
    linkCache: null,
    commentsCache: null,
    
    events: {
        onToggleView: "",
    },
    
    components: [
    
        {name: "commentsService",
            kind: "reddOS.service.RedditComments",
            onSuccess: "incomingComments",
            onFailure: "incomingComments",
        },
        
        {kind: "enyo.Menu", name: "commentShareMenu", components: [
            {caption: "Open in browser", onclick: "openInBrowser"},
        ]},
    
        {kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {kind: "HtmlContent", name: "commentToolbarTitle", flex: 1,
                    style: "margin-left: 8px; font-size: 16px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                },
            ]
        },
        
        {kind: "enyo.Pane", 
            name: "commentViewPane", 
            flex: 1, 
            transitionKind: "enyo.transitions.Simple",
            components: [
        
                {kind: "enyo.VFlexBox", name: "commentLoading", flex: 1,
                    align: "center", pack: "center", components: [
                        {kind: "enyo.SpinnerLarge", showing: true},
                        {name: "commentLoadingMessage", showing: false, style: "font-size: 18px; font-weight: bold; margin-top: 2em; color: #888888"},
                    ]
                },
            
                {kind: "enyo.VFlexBox", name: "commentError", flex: 1,
                    align: "center", pack: "center", components: [
                        {content: "There was an error."},
                    ]
                },
        
                {kind: "enyo.Scroller", 
                    name: "commentScroller", 
                    flex: 1, 
                    autoHorizontal: false, 
                    horizontal: false, 
                    components: [
                        {name: "headerBlock", 
                            className: "reddos-comments-header", 
                            components: [
                                {name: "commentTitle", className: "reddos-comments-title", allowHtml: true},
                                {name: "commentMeta", className: "reddos-comments-meta"},
                            ],
                        },
                        {name: "commentSelftext", allowHtml: true, className: "reddos-comments-selftext"},
                        {name: "commentsBlock", className: "reddos-comments-block",
                            flex: 1,
                        },
                    ]
                },
            ]
        },
        
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
                    name: "commentShareButton",
                    icon: "images/menu-icon-share.png", 
                    onclick: "shareComments",
                },
                {kind: "enyo.ToolButton", 
                    name: "toolbarRefreshButton",
                    icon: "images/menu-icon-refresh.png", 
                    onclick: "refreshComments",
                },
            ]
        },
    ],
    
    /***************************************************************************
     * Methods
     */
     
    receiveObject: function (inObject) {
    
        if(reddOS_Kind.isLink(inObject) == false) return;
        
        if(!reddOS_Kind.isLink(this.linkCache) || (this.linkCache.data.permalink != inObject.data.permalink)) {
        
            this.linkCache = inObject;
            this.$.commentToolbarTitle.setContent("[" + inObject.data.subreddit + "] " + inObject.data.title);
        
            this.refreshComments();
        }
    },
    
    goNotReady: function (message) {
    
        if(message) {
            this.$.commentLoadingMessage.show();
            this.$.commentLoadingMessage.setContent(message);
        } else {
            this.$.commentLoadingMessage.hide();
        }
        
        this.$.commentViewPane.selectView(this.$.commentLoading);
    },
    
    goReady: function () {
        this.$.commentViewPane.selectView(this.$.commentScroller);
    },
    
    goError: function () {
        this.$.commentViewPane.selectView(this.$.commentError);
    },
    
    shareComments: function () {
        this.$.commentShareMenu.openAtControl(this.$.commentShareButton, {left: 90, top: -50});
    },
    
    openInBrowser: function () {
        enyo.dispatch({type: "onLinkClick", url: this.linkCache.data.permalink});
    },
    
    refreshComments: function () {
        this.goNotReady("Downloading...");
        this.$.commentsService.loadComments(this.linkCache.data.permalink);
    },
    
    incomingComments: function(inSender, inResults) {
    
        this.goNotReady("Reticulating splines...");
        
        if(!inResults || !reddOS_Kind.isArray(inResults) || inResults.length != 2) {
            this.goError();
            return false;
        }
        
        try {
            
            this.linkCache = null;
            this.commentsCache = null;
            
            this.linkCache = inResults[0].data.children[0];
            this.commentsCache = inResults[1].data.children;
            
        } catch (e) {
            this.goError();
            return false;
        }
        
        this.$.commentScroller.setScrollTop(0);
        this.$.commentScroller.setScrollLeft(0);
        
        if(this.renderHeaderFromCache() && this.renderCommentsFromCache()) {
            this.goReady();
        } else {
            this.goError();
        }
    },
    
    renderHeaderFromCache: function () {
        
        var linkData = this.linkCache.data;
        
        if(!linkData) return false;
        
        this.$.commentTitle.setContent(linkData.title);
        this.$.commentMeta.setContent("posted "+reddOS_Date.timeSince(linkData.created_utc)+" ago by "+linkData.author+" to "+linkData.subreddit);
        
        if(linkData.is_self) {
            
            var markdown = new Markdown.Converter();
            this.$.commentSelftext.setContent(markdown.makeHtml(linkData.selftext));
            
            this.$.commentSelftext.show();
            this.$.toolbarLinkButton.hide();
            
        } else {
            this.$.commentSelftext.hide();
            this.$.toolbarLinkButton.show();
        }
        
        return true;
    },
    
    renderCommentsFromCache: function() {
        
        var commentsArray = this.commentsCache;
        
        if(reddOS_Kind.isArray(commentsArray) == false) {
            return false;
        }
        
        var forRendering = [];
        
        var markdown = new Markdown.Converter;
        
        for(var i in commentsArray) {
            forRendering.push(this.commentBuilder(commentsArray[i]));
        }
        
        if(forRendering.length == 0) {
            forRendering.push(
                {   kind: "reddOS.component.Comment",
                    comment: "This post doesn't have any comments yet!",
                }
            );
        }
        
        this.$.commentsBlock.destroyControls();
        this.$.commentsBlock.createComponents(forRendering, {owner: this});
        this.$.commentsBlock.render();
        
        return true;
    },
    
    commentBuilder: function (inComment) {
        
        if(!reddOS_Kind.isComment(inComment)) {
            return {};
        }
        
        var cd = inComment.data;
        
        var returnObject = {
            kind: "reddOS.component.RecursiveComment",
            author: cd.author,
            score: (cd.ups-cd.downs),
            created: cd.created_utc,
            op: this.linkCache.data.author,
            replies: cd.replies,
        };
        
        var markdown = new Markdown.Converter;
        returnObject.comment = markdown.makeHtml(cd.body.unescapeHtml());
        
        return returnObject;
    },
    
    loadLink: function () {
        this.doToggleView();
    },
});
