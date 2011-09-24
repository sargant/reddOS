enyo.kind({
    
    name: "reddOS.view.main.secondcolumn.Subreddit",
    kind: "enyo.VFlexBox", 
    
    flex: 1, 
    
    subredditCache: null,
    subredditContentsCache: [],
    
    moreButtonCaptions: {
        ok: "Tap to load more...",
        loading: "Loading...",
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onObjectSend: "",
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
        
        {kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {name: "secondMenuTitle", 
                    kind: "enyo.HtmlContent", 
                    style: "color: white; font-weight: bold"
                },
            ],
        },
        
        {kind: "enyo.Pane", name: "subredditPane", transitionKind: "enyo.transitions.Simple", flex: 1, components: [
            
            // Loading View
            
            {name: "subredditLoading", 
                layoutKind: "VFlexLayout",
                pack: "end",
                components: [
                        
                    {kind: "enyo.VFlexBox",
                        flex: 1,
                        pack: "center",
                        align: "center",
                        components: [
                            {kind: "enyo.SpinnerLarge", showing: true},
                        ]
                    },
                ]
            },
        
            // Rendered View
            
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
                            onclick: "subredditStoryItemClick",
                            components: [
                                
                                {kind: "VFlexBox", 
                                    flex: 1, 
                                    components: [
                                    
                                        {name: "postTitle", className: "reddos-subreddit-item-title", allowHtml: true},
                                        {name: "postDomain", className: "reddos-subreddit-item-domain", allowHtml: true},
                                        {name: "postMeta", className: "reddos-subreddit-item-meta",allowHtml: true},
                                    ],
                                },
    
                                {kind: "VFlexBox", pack: "start", align: "end", components: [
                                    
                                    {name: "voteCount", 
                                        kind: "enyo.CustomButton", 
                                        className: "reddos-subreddit-item-votebutton",
                                        cssNamespace: "reddos-subreddit-item-votebutton",
                                        content: "0", 
                                        allowDrag: true,
                                        onclick: "subredditStoryVoteClick",
                                        onmousehold: "cancelEvent",
                                    },
                                    
                                    {name: "commentCount", 
                                        kind: "enyo.CustomButton", 
                                        className: "reddos-subreddit-item-commentbutton",
                                        cssNamespace: "reddos-subreddit-item-commentbutton",
                                        content: "0", 
                                        allowDrag: true,
                                        onclick: "subredditStoryCommentClick",
                                        onmousehold: "cancelEvent",
                                    },
                                    
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
        
        ]},
        
        {kind: "enyo.Toolbar",
            className: "reddos-toolbar",
            components: [
            
                {kind: "enyo.GrabButton", slidingHandler: true},
                {kind: "enyo.Spacer"},
                {kind: "enyo.ToolButton", icon: "images/menu-icon-share.png"},
                {kind: "enyo.ToolButton", icon: "images/menu-icon-refresh.png", onclick: "refresh"},
            ]
        },
    ],
        
    /***************************************************************************
     * Methods
     */
        
    subredditStoryCommentClick: function(inSender, inEvent) {
        this.cancelEvent(null, inEvent);
        
        var obj = this.subredditContentsCache[inEvent.rowIndex];
        obj.target = "comments";
        this.doObjectSend(obj);
    },
    
    subredditStoryItemClick: function(inSender, inEvent) {
        this.cancelEvent(null, inEvent);
        
        var obj = this.subredditContentsCache[inEvent.rowIndex];
        obj.target = "link";
        this.doObjectSend(obj);
    },
    
    subredditStoryVoteClick: function(inSender, inEvent) {
        this.cancelEvent(null, inEvent);
    },
    
    cancelEvent: function(inSender, inEvent) {
        inEvent.stopPropagation();
    },
    
    receiveObject: function(inObject) {
        this.$.subredditPane.selectView(this.$.subredditLoading);
        this.loadSubreddit(inObject);
    },
    
    loadSubreddit: function(inObject) {
        this.$.subredditScroller.setScrollTop(0);
        this.$.subredditCache = inObject;
        this.$.secondMenuTitle.setContent(inObject.data.display_name);
        this.$.subredditContentsService.setSubreddit(inObject.data.url);
        this.$.subredditContentsService.loadStories();
    },
    
    loadSubredditMore: function() {
        this.$.loadMoreStoriesButton.setCaption(this.moreButtonCaptions.loading);
        this.$.subredditContentsService.loadStories();
    },
    
    refresh: function() {
        this.$.subredditScroller.setScrollTop(0);
        this.$.subredditPane.selectView(this.$.subredditLoading);
        this.$.subredditContentsService.reset();
        this.$.subredditContentsService.loadStories();
    },
    
    incomingSubredditContents: function(inSender, inData) {
        this.subredditContentsCache = inData;
        this.$.subredditContents.render();
        this.$.loadMoreStoriesButton.setCaption(this.moreButtonCaptions.ok);
        this.$.subredditPane.selectView(this.$.subredditScroller);
    },
    
    subredditContentsRender: function(inSender, inIndex) {
        
        var r = this.subredditContentsCache[inIndex];
        
        if (reddOS_Kind.isLink(r)) {
            this.$.subredditContents.setStyle("border: 0");
            if(inIndex % 2 == 1) { this.$.subredditSingleItem.addClass("reddos-subreddit-item-odd"); }
            
            var titleLine = r.data.title;
            
            if(r.data.over_18) {
                titleLine = "<span class=\"reddos-subreddit-item-nsfw\">NSFW</span> " + titleLine;
            }
            
            this.$.postTitle.setContent(titleLine);
            this.$.postDomain.setContent(r.data.domain);
            this.$.postMeta.setContent("posted "+reddOS_Date.timeSince(r.data.created_utc)+" ago<br>by "+r.data.author+" to "+r.data.subreddit);
            this.$.commentCount.setCaption(r.data.num_comments);
            this.$.voteCount.setCaption(r.data.score);
            
            if(r.data.likes === true) {
                this.$.voteCount.addClass("reddos-subreddit-item-votebutton-like");
            }
            
            if(r.data.likes === false) {
                this.$.voteCount.addClass("reddos-subreddit-item-votebutton-dislike");
            }
            
            return true;
        }
        return false;
    },
});
