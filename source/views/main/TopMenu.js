/**
 * reddOS.view.main.TopMenu
 *
 * The top level hierarchical menu. This serves as the main entry point to
 * reading content on reddit itself.
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.TopMenu",
    
    // Base class
    kind: "enyo.VFlexBox",
    
    // Constructor
    create: function() {
    
        this.inherited(arguments);
        this.addClass("reddos-topmenu");
        
        // Add this kind to the list of listeners for global events
        enyo.dispatcher.rootHandler.addListener(this);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    // Cache received subreddit data objects
    subredditCache: [],
    
    events: {
        onObjectSend: "",
        onRequestSubredditRefresh: "",
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        ////////////
        //
        //  Popup Menus
        //
        ////////////
        
        // Subreddit sorting options
        {   name: "subredditMetaMenu",
            kind: "enyo.Menu", 
            width: "200px",
            components: [
                {   caption: "Refresh",
                    onclick: "refreshSubredditList"
                },
                {   caption: "Sort by...",
                    components: [
                        {   name: "sortOptionDefault", 
                            content: "Popularity", 
                            onclick: "sortSubredditList",
                            sortkind: "default", 
                            checked: true
                        },
                        {   name: "sortOptionAlpha", 
                            content: "A-Z", 
                            onclick: "sortSubredditList", 
                            sortkind: "alpha"
                        },
                    ]
                },
            ]
        },
        
        ////////////
        //
        //  Visual Components
        //
        ////////////
        
        // Main scroller, containing all menu options
        {   kind: "Scroller",
            flex: 1, 
            components: [
        
                // Default components
                {   className: "reddos-topmenu-buttongroup",
                    name: "defaultGroup",
                    components: [
                    
                        // Front page listings
                        {   kind: "reddOS.component.TopMenuSubredditButton",
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
                        // All subreddit listings
                        {   kind: "reddOS.component.TopMenuSubredditButton",
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
                
                    // Header
                    {   kind: "reddOS.component.TopMenuSubredditButton",
                        className: "reddos-topmenu-subreddit-button-header",
                        cssNamespace: "reddos-topmenu-subreddit-button-header",
                        name: "myRedditTitle",
                        content: "My Reddit",
                    },
                    
                    // Components only available when logged in
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
                    
                    // Components only available when logged out
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
                {   name: "subredditList",
                    className: "reddos-topmenu-buttongroup", 
                    components: [
                        {   kind: "reddOS.component.TopMenuSubredditButton",
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
                        // Dynamically populated container
                        {   name: "subredditListContainer",
                            components: []
                        },
                    ]
                },
            ]
        },
    ],
        
    /***************************************************************************
     * Methods
     */
     
    ////////////
    //
    //  Message dispatch
    //
    ////////////
    
    // Pass selected objects for handling by the parent class, to delegate
    // to other views
    sendObject: function(inSender) {
        if(typeof inSender.subreddit != "undefined") {
            this.doObjectSend(inSender.subreddit);
        }
    },
     
    ////////////
    //
    //  Subreddit menu methods
    //
    ////////////
    
    // Switch to a loading view
    setLoading: function () {
        this.$.subredditListContainer.hide();
        this.$.subredditListLoading.show();
    },
    
    // Switch to a ready view
    setReady: function () {
        this.$.subredditListContainer.show();
        this.$.subredditListLoading.hide();
    },
    
    // Request a refresh of the subscription data
    refreshSubredditList: function () {
        
        this.setLoading();
        
        // Send the actual request to the parent class
        this.doRequestSubredditRefresh();
    },
    
    // Show sort order menu  
    openSubredditMetaMenu: function() {
        this.$.subredditMetaMenu.openAtControl(this.$.subredditListTitle, {left: 150});
    },
    
    ////////////
    //
    //  External event listeners
    //
    ////////////
    
    // Before the subscription list is updated, update the UI
    onSubscribedSubredditsBeforeUpdateHandler: function () {
        if(this.subredditCache.length == 0) {
            this.setLoading();
        }
    },
    
    // Rebuild the subscription listings from new data
    onSubscribedSubredditsUpdateHandler: function (inSender, inEvent) {
        
        // Check we have valid data
        var inSubredditData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        
        // Clear out existing cache
        this.subredditCache.length = 0;
        
        for(var i in inSubredditData) {
            
            // If it passes a sanity check, add to the cache list
            if (reddOS_Kind.isSubreddit(inSubredditData[i])) {
                this.subredditCache.push(inSubredditData[i]);
            }
        }
        
        // Sort the subscription list according to user preference
        this.sortSubredditList({sortkind: reddOS_Settings.getSetting("subredditSortOrder")});
    },
    
    // Listen for changed settings, and re-render the list based on user's 
    // sort preferences
    onSettingsUpdateHandler: function (inSender, inEvent) {
        var inEventData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        var subredditSortOrder = (typeof inEventData.subredditSortOrder == "undefined") ? "default" : inEventData.subredditSortOrder;
        this.sortSubredditList({sortkind: subredditSortOrder});
    },
    
    // Listen to changes in logged in user data
    onUserInfoUpdateHandler: function(inSender, inEvent) {
        
        // If we do not have a data property, set it to null so as not to
        // break what follows
        var inUserData = (typeof inEvent.data == "undefined") ? null : inEvent.data;
        
        if(reddOS_Kind.isAccount(inUserData) == false) {
            // If we do not have a valid logged in account, show as logged out
            this.$.myRedditLoggedIn.hide();
            this.$.myRedditLoggedOut.show();
        } else {
            
            // Build the meta-subscriptions menu based on username
            this.$.myRedditSubmitted.subreddit = {
                kind: reddOS_Kind.SUBREDDIT,
                data: {
                    fake_subreddit: true,
                    display_name: "Submitted",
                    url: "/user/"+inUserData.data.name+"/submitted"
                }
            }
            this.$.myRedditLiked.subreddit = {
                kind: reddOS_Kind.SUBREDDIT,
                data: {
                    fake_subreddit: true,
                    display_name: "Liked",
                    url: "/user/"+inUserData.data.name+"/liked"
                }
            }
            this.$.myRedditDisliked.subreddit = {
                kind: reddOS_Kind.SUBREDDIT,
                data: {
                    fake_subreddit: true,
                    display_name: "Disliked",
                    url: "/user/"+inUserData.data.name+"/disliked"
                }
            }
			this.$.myRedditSaved.subreddit = {
                kind: reddOS_Kind.SUBREDDIT,
                data: {
                    fake_subreddit: true,
                    display_name: "Saved", url: "/saved"
                }
            }
            this.$.myRedditHidden.subreddit = {
                kind: reddOS_Kind.SUBREDDIT,
                data: {
                    fake_subreddit: true,
                    display_name: "Hidden",
                    url: "/user/"+inUserData.data.name+"/hidden"
                }
            }
            
            // Show the options
            this.$.myRedditLoggedIn.show();
            this.$.myRedditLoggedOut.hide();
        }
    },
    

    ////////////
    //
    //  Subscription display renderes
    //
    ////////////

    
    // Sort the subscription list. We do not directly modify the cached data,
    // as the original sort order is somewhat arbitrary
    sortSubredditList: function(inSender) {
        
        // Bodge for javascript's inability to copy stuff
        var k = enyo.json.parse(enyo.json.stringify(this.subredditCache));
        
        if(typeof inSender.sortkind == "undefined") {
            // do nothing
        } else if(inSender.sortkind == "alpha") {
            
            // Perform a case-insensitive alphabetical sort
            k.sort(function(x,y){
                a = x.data.display_name.toLowerCase();
                b = y.data.display_name.toLowerCase();
                if(a==b) { return 0; }
                return (a<b) ? -1 : 1;
            });
        }
        
        // Ask the subscription list to re-render
        this.rebuildSubredditList(k);
    },
    
    // Renders the list of subscriptions
    rebuildSubredditList: function (subredditList) {
    
        // Clear out all existing controls
        var c = this.$.subredditListContainer;
        c.destroyControls();
        
        if(subredditList.length == 0) {
        
            // If we have no subscriptions to show, display a logged out message
            var temp =  {
                owner: this,
                kind: "reddOS.component.TopMenuSubredditButton",
                className: "reddos-topmenu-subreddit-button-loading reddos-topmenu-subreddit-button-last",
                cssNamespace: "reddos-topmenu-subreddit-button-loading",
                content: "Log in to see a list of your subscribed subreddits.",
            };
            
            c.createComponent(temp);
            
        } else {
        
            // Build a list of subscriptions
            for(var i in subredditList) {
            
                var temp =  {
                    owner: this,
                    onclick: "sendObject", 
                    kind: "reddOS.component.TopMenuSubredditButton",
                    content: subredditList[i].data.display_name,
                    subreddit: subredditList[i],
                };
            
                // Put fancy design on last item in list
                if(i == (subredditList.length - 1)) {
                    temp.className = "reddos-topmenu-subreddit-button-last";
                }
            
                // Add component
                c.createComponent(temp);
            }
        }
        
        // Render the list and show that we are ready
        c.render();
        this.setReady();
    },
});
