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
                            ]
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
        
        this.linkCache = inObject;
        this.$.commentToolbarTitle.setContent("[" + inObject.data.subreddit + "] " + inObject.data.title);
        
        this.refreshComments();
    },
    
    refreshComments: function () {
        this.$.commentViewPane.selectView(this.$.commentLoading);
        this.$.commentsService.loadComments(this.linkCache.data.permalink);
    },
    
    incomingComments: function(inSender, inResults) {
        
        if(!inResults || !reddOS_Kind.isArray(inResults) || inResults.length != 2) {
            this.$.commentViewPane.selectView(this.$.commentError);
            return false;
        }
        
        try {
            
            this.linkCache = null;
            this.commentsCache = null;
            
            this.linkCache = inResults[0].data.children[0];
            this.commentsCache = inResults[1].data.children;
            
        } catch (e) {
            this.$.commentViewPane.selectView(this.$.commentError);
            return false;
        }
        
        this.$.commentScroller.setScrollTop(0);
        this.$.commentScroller.setScrollLeft(0);
        
        if(this.renderHeaderFromCache() && this.renderCommentsFromCache()) {
            this.$.commentViewPane.selectView(this.$.commentScroller);
        } else {
            this.$.commentViewPane.selectView(this.$.commentError);
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
            alert("falling out");
            return false;
        }
        
        var forRendering = [];
        
        var markdown = new Markdown.Converter;
        
        for(var i in commentsArray) {
            forRendering.push(this.recursiveCommentBuilder(commentsArray[i]));
        }
        
        if(forRendering.length == 0) {
            forRendering.push(
                {
                    components: [
                        {className: "reddos-comment-content", content: "This post doesn't have any comments yet!"},
                    ]
                }
            );
        }
        
        this.$.commentsBlock.destroyControls();
        this.$.commentsBlock.createComponents(forRendering, {owner: this, className: "reddos-comment-item", allowHtml: true});
        this.$.commentsBlock.render();
        
        return true;
    },
    
    recursiveCommentBuilder: function (inComment) {
        
        var returnObject = new Object;
        returnObject = {};
        
        if(!reddOS_Kind.isComment(inComment)) {
            return returnObject;
        }
        
        var cd = inComment.data;
        
        returnObject.components = [];
        
        returnObject.owner = this;
        returnObject.className = "reddos-comment-item";
        
        // Assemble the meta string
        
        var op = (cd.author == this.linkCache.data.author) ? "reddos-comment-author-op " : "";
        
        var metastring = "<span class=\""+op+"reddos-comment-author\">"+cd.author+"</span>";
        metastring += " " + (cd.ups-cd.downs) + " points";
        metastring += " " + reddOS_Date.timeSince(cd.created_utc);
        
        returnObject.components.push({content: metastring, className: "reddos-comment-meta"});
        
        // Format and push back the comment
        var markdown = new Markdown.Converter;
        returnObject.components.push({content: markdown.makeHtml(cd.body), className: "reddos-comment-content", allowHtml: true});
        
        // If we have replies, make a reply item and loop over the replies
        try {
            
            if(cd.replies.data.children.length > 1 || reddOS_Kind.isComment(cd.replies.data.children[0])) {
            
                var repliesObject = {className: "reddos-comment-item-indent", components: [] };
            
                for(var i in cd.replies.data.children) {
                    repliesObject.components.push(this.recursiveCommentBuilder(cd.replies.data.children[i]));
                }
            
                returnObject.components.push(repliesObject);
            }
            
        } catch (e) {}
        
        return returnObject;
    },
    
    loadLink: function () {
        this.doToggleView();
    },
});
