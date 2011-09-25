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
                {caption: "Sort by...", components: [
                    {kind:"enyo.MenuCheckItem", 
                        name: "sortOptionDefault", 
                        content: "Subscribers", 
                        onclick: "sortSubredditList",
                        sortkind: "default", 
                        checked: true
                    },
                    {kind:"enyo.MenuCheckItem", 
                        name: "sortOptionAlpha", 
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
                
                    {kind: "reddOS.component.SubredditButton",
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
                    
                    {kind: "reddOS.component.SubredditButton",
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
            
            {name: "myRedditList", showing: false,
                className: "reddos-topmenu-buttongroup", 
                components: [
                
                    {kind: "reddOS.component.SubredditButton",
                        className: "reddos-topmenu-subreddit-button-header",
                        cssNamespace: "reddos-topmenu-subreddit-button-header",
                        name: "myRedditTitle",
                        content: "My Reddit",
                    },
                
                    {kind: "reddOS.component.SubredditButton",
                        name: "myRedditSubmitted",
                        onclick: "sendObject",
                        content: "Submitted",
                    },
                    
                    {kind: "reddOS.component.SubredditButton",
                        name: "myRedditLiked",
                        onclick: "sendObject",
                        content: "Liked",
                    },
                    
                    {kind: "reddOS.component.SubredditButton",
                        name: "myRedditDisliked",
                        onclick: "sendObject",
                        content: "Disliked",
                    },
                    
                    {kind: "reddOS.component.SubredditButton",
                        className: "reddos-topmenu-subreddit-button-last",
                        name: "myRedditHidden",
                        onclick: "sendObject",
                        content: "Hidden",
                    },
                ]
            },
            
            // Subreddit Lists
            
            {name: "subredditList",
                className: "reddos-topmenu-buttongroup", 
                components: [
                    {kind: "reddOS.component.SubredditButton",
                        className: "reddos-topmenu-subreddit-button-header reddos-topmenu-subreddit-button-header-hasmenu",
                        cssNamespace: "reddos-topmenu-subreddit-button-header",
                        name: "subredditListTitle",
                        content: "Subreddits",
                        onclick: "openSubredditMetaMenu",
                    },
                    {name: "subredditListContainer", components: [
                        {kind: "reddOS.component.SubredditButton",
                            className: "reddos-topmenu-subreddit-button-loading reddos-topmenu-subreddit-button-last",
                            components: [
                                {kind: "enyo.Spinner", showing: true, style: "margin: auto"},
                            ]
                        },
                    ]},
                ]
            },
        ]},
    ],
        
    /***************************************************************************
     * Methods
     */
    
    openSubredditMetaMenu: function() {
        this.$.subredditMetaMenu.openAtControl(this.$.subredditListTitle, {left: 150});
    },
    
    onUserInfoUpdateHandler: function(inSender, inEvent) {
        
        var inUserData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        
        if(reddOS_Kind.isAccount(inUserData) == false) {
            this.$.myRedditList.hide();
        } else {
            this.$.myRedditSubmitted.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Submitted", url: "/user/"+inUserData.data.name+"/submitted"}}
            this.$.myRedditLiked.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Liked", url: "/user/"+inUserData.data.name+"/liked"}}
            this.$.myRedditDisliked.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Disliked", url: "/user/"+inUserData.data.name+"/disliked"}}
            this.$.myRedditHidden.subreddit = {kind: reddOS_Kind.SUBREDDIT, data: {display_name: "Hidden", url: "/user/"+inUserData.data.name+"/hidden"}}
            
            this.$.myRedditList.show();
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
        
        this.rebuildSubredditList(this.subredditCache);
    },
    
    sortSubredditList: function(inSender) {
        
        // Bodge for javascript's inability to copy stuff
        var k = enyo.json.parse(enyo.json.stringify(this.subredditCache));
        
        this.$.sortOptionDefault.setChecked(false);
        this.$.sortOptionAlpha.setChecked(false);
        
        if(typeof inSender.sortkind == "undefined") {
            
            this.$.sortOptionDefault.setChecked(true);
            
        } else if(inSender.sortkind == "alpha") {
            
            k.sort(function(x,y){
                a = x.data.display_name.toLowerCase();
                b = y.data.display_name.toLowerCase();
                if(a==b) { return 0; }
                return (a<b) ? -1 : 1;
            });
            
            this.$.sortOptionAlpha.setChecked(true);
            
        } else {
            this.$.sortOptionDefault.setChecked(true);
        }
        
        this.rebuildSubredditList(k);
    },
    
    rebuildSubredditList: function (subredditList) {
        
        if(subredditList.length == 0) {
            this.$.subredditList.hide();
        } else {
            
            var c = this.$.subredditListContainer;
            c.destroyControls();
        
            for(var i in subredditList) {
            
                var temp =  {
                    owner: this,
                    onclick: "sendObject", 
                    kind: "reddOS.component.SubredditButton",
                    content: subredditList[i].data.display_name,
                    subreddit: subredditList[i],
                };
            
                if(i == (subredditList.length - 1)) {
                    temp.className = "reddos-topmenu-subreddit-button-last";
                }
            
                c.createComponent(temp);
            }
            
            c.render();
            this.$.subredditList.show();
        }
    },
    
    sendObject: function(inSender) {
        if(typeof inSender.subreddit != "undefined") {
            this.doObjectSend(inSender.subreddit);
        }
    },    
});
