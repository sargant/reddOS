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
        
        {name: "descriptionPopup",
            kind: "reddOS.main.view.popup.SubredditDescription"
        },
        
        //
        // UI
        //
        
        {kind: "enyo.Menu", name: "subredditViewMenu", components: [
            {caption: "Hot", value: "", onclick: "changeSubredditView"},
            {caption: "New", value: "new", onclick: "changeSubredditView"},
            {caption: "Controversial", value: "controversial", onclick: "changeSubredditView"},
            {caption: "Top", value: "top", onclick: "changeSubredditView"},
        ]},
        
        {kind: "enyo.Menu", name: "subredditShareMenu", components: [
            {caption: "Show subreddit description", onclick: "showSubredditDescription"}, 
        ]},
        
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
            
            {name: "subredditContents", 
                kind: "enyo.VirtualList", 
                onSetupRow: "subredditContentsRender",
                components: [
                    
                    {name: "subredditSingleItem", 
                        kind: "reddOS.component.SubredditStory",
                        onStoryClick: "subredditStoryItemClick",
                        onCommentClick: "subredditStoryCommentClick",
                    },
                ],
            },
        ]},
        
        {kind: "enyo.Toolbar",
            className: "reddos-toolbar",
            components: [
            
                {kind: "enyo.GrabButton", slidingHandler: true},
                {kind: "enyo.ToolButton", icon: "images/menu-icon-view.png", name: "subredditViewButton", onclick: "openSubredditViewMenu"},
                {kind: "enyo.Spacer"},
                {kind: "enyo.ToolButton", icon: "images/menu-icon-share.png", name: "subredditShareButton", onclick: "openSubredditShareMenu"},
                {kind: "enyo.ToolButton", icon: "images/menu-icon-refresh.png", onclick: "refresh"},
            ]
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    showSubredditDescription: function () {
        this.$.descriptionPopup.openDescription(this.subredditCache);
    },
    
    openSubredditViewMenu: function () {
        this.$.subredditViewMenu.openAtControl(this.$.subredditViewButton, {left: 30, top: -30});
    },
    
    openSubredditShareMenu: function () {
        this.$.subredditShareMenu.openAtControl(this.$.subredditShareButton, {left: 30, top: -50});
    },
    
    changeSubredditView: function(inSender, inEvent) {
        this.loadSubreddit(inSender.value);
    },
       
    subredditStoryCommentClick: function(inSender, inEvent) {
        this.itemSelected(inEvent.rowIndex, "comment");
    },
    
    subredditStoryItemClick: function(inSender, inEvent) {
        this.itemSelected(inEvent.rowIndex, "link");
    },
    
    itemSelected: function (rowIndex, type) {
        var obj = this.subredditContentsCache[rowIndex];
        reddOS_History.addVisited(obj.data.name);
        this.$.subredditContents.updateRow(rowIndex);
        obj.target = type;
        this.doObjectSend(obj);
    },
    
    receiveObject: function(inObject) {
        
        if(reddOS_Kind.isSubreddit(inObject)) {
            this.subredditCache = new Object;
            this.subredditCache = inObject;
            this.loadSubreddit();
        }
    },
    
    loadSubreddit: function(inView) {
        
        this.$.subredditPane.selectView(this.$.subredditLoading);
        
        this.$.subredditContents.punt();
        this.subredditContentsCache.length = 0;
        this.finalize = false;
        
        var display_name = this.subredditCache.data.display_name;
        var url = this.subredditCache.data.url;
        
        if(typeof inView != "undefined" && inView != "") {
            display_name += " ("+inView+")";
            url += "/"+inView;
        }
        
        this.$.secondMenuTitle.setContent(display_name);
        
        if(reddOS_Kind.isFakeSubreddit(this.subredditCache)) {
            this.$.subredditViewButton.hide();
        } else {
            this.$.subredditViewButton.show();
        }
        
        this.$.subredditContentsService.setSubreddit(url);
        this.$.subredditContentsService.loadStories();
    },
    
    loadSubredditMore: function() {
        this.$.subredditContentsService.loadStories();
    },
    
    refresh: function() {
        this.$.subredditContents.punt(0);
        this.$.subredditPane.selectView(this.$.subredditLoading);
        this.$.subredditContentsService.reset();
        this.subredditContentsCache.length = 0;
        this.$.subredditContentsService.loadStories();
    },
    
    incomingSubredditContents: function(inSender, inData) {
    
        if(inData == null) {
            this.subredditContentsFinalize();
        } else {
            this.subredditContentsCache = inData;
            this.$.subredditContents.refresh();
            this.$.subredditContents.update();
        }
         
        this.$.subredditPane.selectView(this.$.subredditContents);
    },
    
    subredditContentsFinalize: function() {
        this.finalize = true;
        this.$.subredditContents.updateRow(this.subredditContentsCache.length);
    },
    
    subredditContentsRender: function(inSender, inIndex) {
    
        if(inIndex == this.subredditContentsCache.length) {
        
            if(this.finalize) {
                this.$.subredditSingleItem.setMode("finalize");
            } else {
                this.$.subredditSingleItem.setMode("loading");
                this.loadSubredditMore();
            }
            return true;
        }
        
        this.$.subredditSingleItem.setMode("normal");
        
        try {
            var r = this.subredditContentsCache[inIndex];
        } catch (e) {
            return false;
        }
        
        var dontTrackVisited = reddOS_Settings.getSetting("dontTrackVisited");
        
        if (reddOS_Kind.isLink(r)) {
        
            if(inIndex % 2 == 1) { this.$.subredditSingleItem.setOdd(true); }
            
            var titleLine = r.data.title;
            
            if(r.data.over_18) this.$.subredditSingleItem.setNsfw(true);
            
            if(reddOS_History.isVisited(r.data.name) && !dontTrackVisited) {
                this.$.subredditSingleItem.setVisited(true);
            }
            
            this.$.subredditSingleItem.setTitle(titleLine);
            this.$.subredditSingleItem.setDomain(r.data.domain);
            this.$.subredditSingleItem.setMeta("posted "+reddOS_Date.timeSince(r.data.created_utc)+" ago by "+r.data.author+" to "+r.data.subreddit);
            this.$.subredditSingleItem.setComments(r.data.num_comments);
            this.$.subredditSingleItem.setVotes(r.data.score);
            this.$.subredditSingleItem.setLikes(r.data.likes);
            
            return true;
        }
        return false;
    },
});
