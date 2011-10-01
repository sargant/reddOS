enyo.kind({
    
    name: "reddOS.view.main.TopMenu",
    kind: "enyo.VFlexBox",
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-topmenu");
        
        enyo.dispatcher.rootHandler.addListener(this);
    },
    
    /***************************************************************************
     * Published Items
     */
     
    subredditCache: [],
    
    events: {
        onObjectSend: "",
        onRequestSubredditRefresh: "",
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        // Sort menu for subreddit pane
        
        {name: "subredditMetaMenu",
            kind: "enyo.Menu", 
            width: "200px",
            components: [
                {caption: "Refresh", onclick: "refreshSubredditList"},
                {caption: "Sort by...", components: [
                    {name: "sortOptionDefault", 
                        content: "Popularity", 
                        onclick: "sortSubredditList",
                        sortkind: "default", 
                        checked: true
                    },
                    {name: "sortOptionAlpha", 
                        content: "A-Z", 
                        onclick: "sortSubredditList", 
                        sortkind: "alpha"
                    },
                ]},
            ]
        },
        
        {kind: "Scroller", flex: 1, components: [
        
            // Default components
            
            {className: "reddos-topmenu-buttongroup", name: "defaultGroup",
                components: [
                
                    {kind: "reddOS.component.TopMenuSubredditButton",
                        className: "reddos-topmenu-subreddit-button-first",
                        onclick: "sendObject",
                        content: "Front Page",
                        subreddit: {
                            kind: reddOS_Kind.SUBREDDIT,
                            data: {
                                display_name: "Front Page",
                                url: "/",
                            }
                        },
                    },
                    
                    {kind: "reddOS.component.TopMenuSubredditButton",
                        className: "reddos-topmenu-subreddit-button-last",
                        onclick: "sendObject",
                        content: "All Subreddits",
                        subreddit: {
                            kind: reddOS_Kind.SUBREDDIT,
                            data: {
                                display_name: "All Subreddits",
                                url: "/r/all",
                            }
                        },
                    },
                ],
            },
            
            // User-orientated lists
            
            {   name: "myRedditList",
                className: "reddos-topmenu-buttongroup", 
                components: [
                
                    {   kind: "reddOS.component.TopMenuSubredditButton",
                        className: "reddos-topmenu-subreddit-button-header",
                        cssNamespace: "reddos-topmenu-subreddit-button-header",
                        name: "myRedditTitle",
                        content: "My Reddit",
                    },
                    {   name: "myRedditLoggedIn", 
                        showing: false,
                        components: [
                        
                            {   kind: "reddOS.component.TopMenuSubredditButton",
                                name: "myRedditSubmitted",
                                onclick: "sendObject",
                                content: "Submitted",
                            },
                            {   kind: "reddOS.component.TopMenuSubredditButton",
                                name: "myRedditLiked",
                                onclick: "sendObject",
                                content: "Liked",
                            },
                            {   kind: "reddOS.component.TopMenuSubredditButton",
                                name: "myRedditDisliked",
                                onclick: "sendObject",
                                content: "Disliked",
                            },
							{   kind: "reddOS.component.TopMenuSubredditButton",
                                name: "myRedditSaved",
                                onclick: "sendObject",
                                content: "Saved",
                            },
                            {   kind: "reddOS.component.TopMenuSubredditButton",
                                className: "reddos-topmenu-subreddit-button-last",
                                name: "myRedditHidden",
                                onclick: "sendObject",
                                content: "Hidden",
                            },
                        ]
                    },
                    {   name: "myRedditLoggedOut",
                        showing: true,
                        components: [
                        
                            {   kind: "reddOS.component.TopMenuSubredditButton",
                                className: "reddos-topmenu-subreddit-button-last reddos-topmenu-subreddit-button-loading",
                                cssNamespace: "reddos-topmenu-subreddit-button-loading",
                                content: "These options will become available when logged in.",
                            },
                        ]
                    },
                ]
            },
            
            // Subreddit Lists
            
            {name: "subredditList",
                className: "reddos-topmenu-buttongroup", 
                components: [
                    {kind: "reddOS.component.TopMenuSubredditButton",
                        className: "reddos-topmenu-subreddit-button-header reddos-topmenu-subreddit-button-header-hasmenu",
                        cssNamespace: "reddos-topmenu-subreddit-button-header",
                        name: "subredditListTitle",
                        content: "Subreddits",
                        onclick: "openSubredditMetaMenu",
                    },
                    {   name: "subredditListLoading", 
                        kind: "reddOS.component.TopMenuSubredditButton",
                        className: "reddos-topmenu-subreddit-button-loading reddos-topmenu-subreddit-button-last",
                        cssNamespace: "reddos-topmenu-subreddit-button-loading",
                        content: "Loading...",
                    },
                    {name: "subredditListContainer", components: []},
                ]
            },
        ]},
    ],
        
    /***************************************************************************
     * Methods
     */
    
    refreshSubredditList: function () {
        this.setLoading();
        this.doRequestSubredditRefresh();
    },
    
    openSubredditMetaMenu: function() {
        this.$.subredditMetaMenu.openAtControl(this.$.subredditListTitle, {left: 150});
    },
    
    onSettingsUpdateHandler: function (inSender, inEvent) {
        var inEventData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        var subredditSortOrder = (typeof inEventData.subredditSortOrder == "undefined") ? "default" : inEventData.subredditSortOrder;
        this.sortSubredditList({sortkind: subredditSortOrder});
    },
    
    setLoading: function () {
        this.$.subredditListContainer.hide();
        this.$.subredditListLoading.show();
    },
    
    setReady: function () {
        this.$.subredditListContainer.show();
        this.$.subredditListLoading.hide();
    },
    
    onUserInfoUpdateHandler: function(inSender, inEvent) {
        
        var inUserData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        
        if(reddOS_Kind.isAccount(inUserData) == false) {
            this.$.myRedditLoggedIn.hide();
            this.$.myRedditLoggedOut.show();
        } else {
            this.$.myRedditSubmitted.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {fake_subreddit: true, display_name: "Submitted", url: "/user/"+inUserData.data.name+"/submitted"}}
            this.$.myRedditLiked.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {fake_subreddit: true, display_name: "Liked", url: "/user/"+inUserData.data.name+"/liked"}}
            this.$.myRedditDisliked.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {fake_subreddit: true, display_name: "Disliked", url: "/user/"+inUserData.data.name+"/disliked"}}
			this.$.myRedditSaved.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {fake_subreddit: true, display_name: "Saved", url: "/saved"}}
            this.$.myRedditHidden.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {fake_subreddit: true, display_name: "Hidden", url: "/user/"+inUserData.data.name+"/hidden"}}
            
            this.$.myRedditLoggedIn.show();
            this.$.myRedditLoggedOut.hide();
        }
    },
    
    onSubscribedSubredditsBeforeUpdateHandler: function () {
        if(this.subredditCache.length == 0) {
            this.setLoading();
        }
    },
    
    onSubscribedSubredditsUpdateHandler: function (inSender, inEvent) {
        
        var inSubredditData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        
        this.subredditCache.length = 0;
        
        for(var i in inSubredditData) {
            
            if (reddOS_Kind.isSubreddit(inSubredditData[i])) {
                this.subredditCache.push(inSubredditData[i]);
            }
        }
        
        this.sortSubredditList({sortkind: reddOS_Settings.getSetting("subredditSortOrder")});
    },
    
    sortSubredditList: function(inSender) {
        
        // Bodge for javascript's inability to copy stuff
        var k = enyo.json.parse(enyo.json.stringify(this.subredditCache));
        
        if(typeof inSender.sortkind == "undefined") {
            // do nothing
        } else if(inSender.sortkind == "alpha") {
            
            k.sort(function(x,y){
                a = x.data.display_name.toLowerCase();
                b = y.data.display_name.toLowerCase();
                if(a==b) { return 0; }
                return (a<b) ? -1 : 1;
            });
        }
        
        this.rebuildSubredditList(k);
    },
    
    rebuildSubredditList: function (subredditList) {
    
        var c = this.$.subredditListContainer;
        c.destroyControls();
        
        if(subredditList.length == 0) {
        
            var temp =  {
                owner: this,
                kind: "reddOS.component.TopMenuSubredditButton",
                className: "reddos-topmenu-subreddit-button-loading reddos-topmenu-subreddit-button-last",
                cssNamespace: "reddos-topmenu-subreddit-button-loading",
                content: "Log in to see a list of your subscribed subreddits.",
            };
            
            c.createComponent(temp);
            
        } else {
            for(var i in subredditList) {
            
                var temp =  {
                    owner: this,
                    onclick: "sendObject", 
                    kind: "reddOS.component.TopMenuSubredditButton",
                    content: subredditList[i].data.display_name,
                    subreddit: subredditList[i],
                };
            
                if(i == (subredditList.length - 1)) {
                    temp.className = "reddos-topmenu-subreddit-button-last";
                }
            
                c.createComponent(temp);
            }
        }
        
        c.render();
        this.setReady();
    },
    
    sendObject: function(inSender) {
        if(typeof inSender.subreddit != "undefined") {
            this.doObjectSend(inSender.subreddit);
        }
    },    
});
