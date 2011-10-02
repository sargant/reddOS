 enyo.kind({
    
    name: "reddOS.view.main.contentviewer.CommentView",
    kind: "enyo.VFlexBox",
    className: "reddos-comments",
    
    flex: 1,
    
    linkCache: null,
    commentsCache: null,
    flatCommentsCache: null,
    
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
                    style: "margin-left: 8px; font-size: 18px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                },
            ]
        },
        
        {kind: "enyo.Pane", 
            name: "commentViewPane", 
            flex: 1, 
            transitionKind: "enyo.transitions.Simple",
            components: [
                {   kind: "enyo.VFlexBox", 
                    name: "commentLoading",
                    flex: 1,
                    align: "center",
                    pack: "center",
                    components: [
                        {   kind: "enyo.SpinnerLarge",
                            showing: true
                        },
                        {   name: "commentLoadingMessage", 
                            showing: false,
                            style: "font-size: 18px; font-weight: bold; margin-top: 2em; color: #888888"
                        },
                    ]
                },
                {   kind: "enyo.VFlexBox",
                    name: "commentError",
                    flex: 1,
                    align: "center",
                    pack: "center",
                    components: [
                        {content: "There was an error."},
                    ]
                },
                {   kind: "enyo.VFlexBox", 
                    name: "commentContents", 
                    flex: 1, 
                    autoHorizontal: false, 
                    horizontal: false, 
                    components: [
                        {name: "commentBlock", 
                            kind: "enyo.VirtualList", 
                            onSetupRow: "commentRender",
                            flex: 1, 
                            components: [
                                {   name: "commentContent", 
                                    kind: "reddOS.component.NormalComment",
                                },
                            ],
                        },
                    ]
                },
            ]
        },
        
        {   kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {   kind: "enyo.GrabButton"
                },
                {   kind: "enyo.ToolButton", 
                    name: "toolbarLinkButton", 
                    icon: "images/menu-icon-link.png", 
                    onclick: "loadLink",
                },
                {   kind: "enyo.Spacer"
                },
                {   kind: "enyo.ToolButton", 
                    name: "commentShareButton",
                    icon: "images/menu-icon-share.png", 
                    onclick: "shareComments",
                },
                {   kind: "enyo.ToolButton", 
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
        this.$.commentViewPane.selectView(this.$.commentContents);
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
        this.$.toolbarLinkButton.setShowing(!this.linkCache.data.is_self);
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
        
        this.flatCommentsCache = this.flattenComments(this.commentsCache, 0);
        
        this.$.commentBlock.punt();
        
        this.goReady();
    },
    
    flattenComments: function (inComments, depth) {
    
        var retval = [];
        var subarray = [];
        retval.length = 0;
        subarray.length = 0;
        
        for (var i in inComments) {
        
            if(reddOS_Kind.isComment(inComments[i]) == false) continue;
            
            retval.push(enyo.mixin(inComments[i], {reddos_depth: depth}));
            
            try {
            
                if(inComments[i].data.replies.data.children.length == 0) continue;
                if(!reddOS_Kind.isComment(inComments[i].data.replies.data.children[0])) continue;
                
                subarray.length = 0;
                subarray = this.flattenComments(inComments[i].data.replies.data.children, depth+1);
                
                for (var j in subarray) retval.push(subarray[j]);
                
            } catch(e) {
                continue;
            }
        }
        return retval;
    },
    
/*     renderHeaderFromCache: function () {
        
        var linkData = this.linkCache.data;
        
        if(!linkData) return false;
        
        this.$.commentTitle.setContent(linkData.title);
        this.$.commentMeta.setContent("posted "+reddOS_Date.timeSince(linkData.created_utc)+" ago by "+linkData.author+" to "+linkData.subreddit);
        
        if(linkData.is_self) {
            
            var markdown = new Markdown.Converter();
            this.$.commentSelftext.setContent(markdown.makeHtml(linkData.selftext.unescapeHtml()));
            
            this.$.commentSelftext.show();
            this.$.toolbarLinkButton.hide();
            
        } else {
            this.$.commentSelftext.hide();
            this.$.toolbarLinkButton.show();
        }
        
        return true;
    }, */
    
    commentRender: function(inSender, inIndex) {
    
        if(inIndex == 0) {
        
            var linkData = this.linkCache.data;
            if(!linkData) { this.goError(); return false; }
            
            var metadata = "posted "+reddOS_Date.timeSince(linkData.created_utc)+" ago by "+linkData.author+" to "+linkData.subreddit;
            var selftext = reddOS_Markdown.makeHtml(linkData.selftext.unescapeHtml());
            
            this.$.commentContent.headerMode(linkData.title, metadata, selftext);
            return true;
        }
    
        try {
            var r = this.flatCommentsCache[inIndex-1];
        } catch (e) {
            return false;
        }
        
        if (reddOS_Kind.isComment(r)) {
            this.$.commentContent.setAuthor(r.data.author);
            this.$.commentContent.setScore(r.data.ups-r.data.downs);
            this.$.commentContent.setCreated(r.data.created_utc);
            this.$.commentContent.setComment(r.data.body);
            this.$.commentContent.setDepth(r.reddos_depth);
            this.$.commentContent.setOp(this.linkCache.data.author);
            return true;
        }
        return false;
    },
    
    /*
    
    renderCommentsFromCache: function() {
        
        var commentsArray = this.commentsCache;
        
        if(reddOS_Kind.isArray(commentsArray) == false) {
            return false;
        }
        
        var forRendering = [];
        
        for(var i in commentsArray) {
            forRendering.push(this.commentBuilder(commentsArray[i]));
        }
        
        if(forRendering.length == 0) {
            forRendering.push(
                {   kind: "reddOS.component.RecursiveComment",
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
        
        returnObject.comment = reddOS_Markdown.makeHtml(cd.body.unescapeHtml());
        
        return returnObject;
    },
    
    */
    
    loadLink: function () {
        this.doToggleView();
    },
});
