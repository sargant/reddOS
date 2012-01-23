/**
 * reddOS.view.main.secondColumn.Subreddit
 *
 * Lists subreddit stories, allows interaction on a per-story basis, and 
 * automatically loads more stories based on UI interaction and position
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.secondcolumn.Subreddit",
    
    // Base class
    kind: "enyo.VFlexBox", 
    
    // Inherited properties
    flex: 1, 
    
    // Local properties
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
    
        ////////////
        //
        //  Register required services
        //
        ////////////
        
        // Service for getting list of subreddit contents
        {   name: "subredditContentsService",
            kind: "reddOS.service.RedditSubredditContents",
            onSuccess: "incomingSubredditContents",
            onFailure: "incomingSubredditContents",
        },
        
        // Vote casting service
        {   name: "voteService",
            kind: "reddOS.service.RedditVote",
        },
        
        // Visibility service
        {   name: "hideService",
            kind: "reddOS.service.RedditHide",
        },
        
        // Story saving service
        {   name: "saveService",
            kind: "reddOS.service.RedditSave",
        },
        
        // "Visited links" emulation history manager
        {   name: "historyManager",
            kind: "reddOS.service.HistoryManager"
        },
        
        // Local data caching service
        {   name: "storedObjectManager",
            kind: "reddOS.service.StoredObjectManager"
        },
        
        ////////////
        //
        //  Relevant modal dialogs
        //
        ////////////

        {   name: "descriptionPopup",
            kind: "reddOS.main.view.popup.SubredditDescription"
        },
        
        ////////////
        //
        //  Popup menus
        //
        ////////////
        
        // Subreddit story sort order popup menu
        {   kind: "enyo.Menu",
            name: "subredditViewMenu",
            components: [
                {   caption: "Hot",
                    value: "",
                    onclick: "changeSubredditView"
                },
                {   caption: "New",
                    value: "new",
                    onclick: "changeSubredditView"
                },
                {   caption: "Controversial",
                    value: "controversial",
                    onclick: "changeSubredditView"
                },
                {   caption: "Top",
                    value: "top",
                    onclick: "changeSubredditView"
                },
            ]
        },
        
        // Subreddit metadata popup menu
        {   kind: "enyo.Menu",
            name: "subredditShareMenu",
            components: [
                {   caption: "Show subreddit description",
                    onclick: "showSubredditDescription"
                }, 
            ]
        },
        
        ////////////
        //
        //  Visible components
        //
        ////////////
        
        // Top toolbar
        {   kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {   name: "secondMenuTitle", 
                    kind: "enyo.HtmlContent", 
                    style: "color: white; font-weight: bold"
                },
            ],
        },
        
        // Main content pane
        {   kind: "enyo.Pane", name: "subredditPane", transitionKind: "enyo.transitions.Simple", flex: 1, components: [
            
            // Loading View
            {   name: "subredditLoading", 
                layoutKind: "VFlexLayout",
                pack: "end",
                components: [
                    {   kind: "enyo.VFlexBox",
                        flex: 1,
                        pack: "center",
                        align: "center",
                        components: [
                            {   kind: "enyo.SpinnerLarge",
                                showing: true
                            },
                        ]
                    },
                ]
            },
        
            // Rendered View
            {   name: "subredditContents", 
                kind: "enyo.VirtualList", 
                onSetupRow: "subredditContentsRender",
                components: [
                    // Virtual components used for populating the list
                    {   name: "subredditSingleItem", 
                        kind: "reddOS.component.SubredditStory",
                        onStoryClick: "subredditStoryItemClick",
                        onVoteClick: "subredditStoryVoteClick",
                        onHideClick: "subredditStoryHideClick",
                        onSaveClick: "subredditStorySaveClick",
                        onCommentClick: "subredditStoryCommentClick",
                    },
                ],
            },
        ]},
        
        // Bottom toolbar
        {   kind: "enyo.Toolbar",
            className: "reddos-toolbar",
            components: [
                {   kind: "enyo.GrabButton",
                    slidingHandler: true
                },
                {   kind: "enyo.ToolButton",
                    icon: "images/menu-icon-view.png",
                    name: "subredditViewButton",
                    onclick: "openSubredditViewMenu"
                },
                {   kind: "enyo.Spacer"
                },
                {   kind: "enyo.ToolButton",
                    icon: "images/menu-icon-share.png",
                    name: "subredditShareButton",
                    onclick: "openSubredditShareMenu"
                },
                {   kind: "enyo.ToolButton",
                    icon: "images/menu-icon-refresh.png",
                    onclick: "refresh"
                },
            ]
        },
    ],
        
    /***************************************************************************
     * Methods
     */
     
    ////////////
    //
    //  Toolbar commands
    //
    ////////////
    
    // Show the subreddit sort order menu
    openSubredditViewMenu: function () {
        this.$.subredditViewMenu.openAtControl(this.$.subredditViewButton, {left: 30, top: -30});
    },
    
    // Show the subreddit metadata menu
    openSubredditShareMenu: function () {
        this.$.subredditShareMenu.openAtControl(this.$.subredditShareButton, {left: 30, top: -50});
    },
    
    // Handle selections from the metadata menu
    showSubredditDescription: function () {
        this.$.descriptionPopup.openDescription(this.subredditCache);
    },
    
    // Handle selections from the sort order menu
    changeSubredditView: function(inSender, inEvent) {
        this.loadSubreddit(inSender.value);
    },
    
    ////////////
    //
    //  Subreddit listing - item interactions
    //
    ////////////
    
    // Acknowledge a vote, update the UI and dispatch asynchronous
    // service request
    subredditStoryVoteClick: function(inSender, inEvent, rowIndex, score) {
       
        // Get selected item
        var r = this.subredditContentsCache[rowIndex];
        
        // Calculate current score, minus the user's outstanding votes
        var currentStatusScore = 0;
        if(r.data.likes === true) currentStatusScore = 1;
        if(r.data.likes === false) currentStatusScore = -1;
        
        // Add the difference between user's old vote and new vote
        r.data.score += (score - currentStatusScore);
        
        // Set the "likes" property to true, null or false for +1, 0, -1
        // votes respectively
        switch (score) {
            case 1:
                r.data.likes = true;
                break;
            case 0:
                r.data.likes = null;
                break;
            case -1:
                r.data.likes = false;
                break;
        }
        
        // Tell the row to re-render
        this.$.subredditContents.updateRow(rowIndex);
        
        // Get the current user, and if valid, dispatch an update request
        // to the voting service
        var currentUser = this.$.storedObjectManager.getItem("user_info");
        
        if (reddOS_Kind.isAccount(currentUser)) {
            this.$.voteService.doVote(currentUser.data.modhash, this.subredditContentsCache[rowIndex].data.name, score);
        }
    },
    
    // Acknowledge a hide command, update the UI and dispatch asynchronous
    // service request
    subredditStoryHideClick: function(inSender, inEvent, rowIndex, hidden) {
    
        // Set the status to hidden
        this.subredditContentsCache[rowIndex].data.hidden = hidden;
        
        // The hiddenStrict property tells the render to keep the hidden item
        // visible until the next full refresh
        this.subredditContentsCache[rowIndex].hiddenStrict = true;
        
        // Tell the row to re-render
        this.$.subredditContents.updateRow(rowIndex);
    
        // Get the current user, and if valid, dispatch an update request
        // to the visibility service
        var currentUser = this.$.storedObjectManager.getItem("user_info");
        
        if (reddOS_Kind.isAccount(currentUser)) {
            this.$.hideService.doHidden(currentUser.data.modhash, this.subredditContentsCache[rowIndex].data.name, hidden);
        }
    },
    
    // Acknowledge a save command, update the UI and dispatch asynchronous
    // service request
    subredditStorySaveClick: function(inSender, inEvent, rowIndex, saved) {
    
        // Update the status and re-render the row
        this.subredditContentsCache[rowIndex].data.saved = saved;
        this.$.subredditContents.updateRow(rowIndex);
    
        // Get the current user, and if valid, dispatch an update request
        // to the story saving service
        var currentUser = this.$.storedObjectManager.getItem("user_info");
        
        if (reddOS_Kind.isAccount(currentUser)) {
            this.$.saveService.doSaved(currentUser.data.modhash, this.subredditContentsCache[rowIndex].data.name, saved);
        }
    },
       
    // Pass a comment selection to the object dispatcher
    subredditStoryCommentClick: function(inSender, inEvent) {
        this.itemSelected(inEvent.rowIndex, "comment");
    },
    
    // Pass an item selection to the object dispatcher
    subredditStoryItemClick: function(inSender, inEvent) {
        this.itemSelected(inEvent.rowIndex, "link");
    },
    
    // Dispatch selected objects to the parent class for rendering in a
    // different component
    itemSelected: function (rowIndex, type) {
    
        var obj = this.subredditContentsCache[rowIndex];
        
        // Tell the history manager that this link is now visited
        this.$.historyManager.setVisited(obj.data.name);
        
        // Re-render the row to show visited status
        this.$.subredditContents.updateRow(rowIndex);
        
        // Dispatch the object to the parent
        obj.target = type;
        this.doObjectSend(obj);
    },
    
    ////////////
    //
    //  Interface loading and rendering
    //
    ////////////
    
    // Receive dispatched objects from the parent class. If they are valid,
    // treat them as a request to throw out all existing cached data and reload
    receiveObject: function(inObject) {
        
        if(reddOS_Kind.isSubreddit(inObject)) {
            this.subredditCache = new Object;
            this.subredditCache = inObject;
            this.loadSubreddit();
        }
    },
    
    // Load stories from the cached subreddit from scratch
    loadSubreddit: function(inView) {
        
        // Select the loading view
        this.$.subredditPane.selectView(this.$.subredditLoading);
        
        // Clear the current story cache
        this.$.subredditContents.punt();
        this.subredditContentsCache.length = 0;
        this.finalize = false;
        
        // Update the top toolbar
        var display_name = this.subredditCache.data.display_name;
        var url = this.subredditCache.data.url;
        
        
        if(typeof inView != "undefined" && inView != "") {
            // If we have a non-default view, mix in those details
            display_name += " ("+inView+")";
            url += "/"+inView;
        }
        
        this.$.secondMenuTitle.setContent(display_name);
        
        // If this is a "real" subreddit (i.e. not a meta-list like "saved"),
        // show the sort order toolbar button
        if(reddOS_Kind.isFakeSubreddit(this.subredditCache)) {
            this.$.subredditViewButton.hide();
        } else {
            this.$.subredditViewButton.show();
        }
        
        // Dispatch an asynchronous request to the subreddit listing service
        this.$.subredditContentsService.setSubreddit(url);
        this.$.subredditContentsService.loadStories();
    },
    
    // Load additional stories from the cached subreddit, but append them
    // to the existing cache
    loadSubredditMore: function() {
        this.$.subredditContentsService.loadStories();
    },   

    // Refresh the current view by clearing out all cached data, but do not
    // change any properties so that the same call is made to the subreddit
    // listing service
    refresh: function() {
    
        // Clear local cache
        this.$.subredditContents.punt(0);
        this.subredditContentsCache.length = 0;
        
        // Show loading view as we now have no data
        this.$.subredditPane.selectView(this.$.subredditLoading);
        
        // Clear service cache and dispatch asynchronous request
        this.$.subredditContentsService.reset();
        this.$.subredditContentsService.loadStories();
    },
    
    // Receive asynchronous data from the subreddit listing service
    incomingSubredditContents: function(inSender, inData) {
        
        if(inData == null) {
            // If there is no data, "finalize" the listings
            this.subredditContentsFinalize();
        } else {
            // Update the cache and re-render the list
            this.subredditContentsCache = inData;
            this.$.subredditContents.refresh();
            this.$.subredditContents.update();
        }
         
        // Ensure the loading view is hidden and the content view is on display
        this.$.subredditPane.selectView(this.$.subredditContents);
    },
    
    // Finalizing occurs when we are certain there are no more stories to load,
    // to prevent infinite loading at the bottom of the list
    subredditContentsFinalize: function() {
        this.finalize = true;
        this.$.subredditContents.updateRow(this.subredditContentsCache.length);
    },
    
    // Row renderer - takes data from the cache and renders the requested row.
    //
    // Rows are rendered "as required" - either manually or as they scroll into
    // view. This saves memory and rendering time, and also allows us to only
    // fetch additional stories once we have scrolled to the bottom of the list
    subredditContentsRender: function(inSender, inIndex) {
    
        // If we are at the end of the list
        if(inIndex == this.subredditContentsCache.length) {
        
            if(this.finalize) {
                // No more stories
                this.$.subredditSingleItem.setMode("finalize");
            } else {
                // Automatically load more stories when visible
                this.$.subredditSingleItem.setMode("loading");
                this.loadSubredditMore();
            }
            return true;
        }
        
        // Not at the end of the list - normal mode
        this.$.subredditSingleItem.setMode("normal");
        
        // If we have an error, then prevent row from being rendered
        try {
            var r = this.subredditContentsCache[inIndex];
        } catch (e) {
            return false;
        }
        
        // Check history tracking setting
        var dontTrackVisited = reddOS_Settings.getSetting("dontTrackVisited");
        
        // Check we have a valid story to render
        if (reddOS_Kind.isLink(r)) {
        
            // Zebra striping
            if(inIndex % 2 == 1) { this.$.subredditSingleItem.setOdd(true); }
            
            var titleLine = r.data.title;
            
            // Check "suitable for adults only" status
            this.$.subredditSingleItem.setNsfw(r.data.over_18 ? true : false);
            
            // If the history tracker is enabled and we have visited before,
            // render this row differently
            if(this.$.historyManager.isVisited(r.data.name) && !dontTrackVisited) {
                this.$.subredditSingleItem.setVisited(true);
            } else {
                this.$.subredditSingleItem.setVisited(false);
            }
            
            // Populate the row with story data
            this.$.subredditSingleItem.setTitle(titleLine);
            this.$.subredditSingleItem.setDomain(r.data.domain);
            this.$.subredditSingleItem.setMeta("posted "+reddOS_Date.timeSince(r.data.created_utc)+" ago by "+r.data.author+" to "+r.data.subreddit);
            this.$.subredditSingleItem.setComments(r.data.num_comments);
            this.$.subredditSingleItem.setVotes(r.data.score);
            this.$.subredditSingleItem.setLikes(r.data.likes);
            this.$.subredditSingleItem.setSaved(r.data.saved);
            
            // Render the row despite being "hidden"?
            if(this.subredditCache.data.fake_subreddit && this.subredditCache.data.display_name == "Hidden" && !r.hiddenStrict) {
                this.$.subredditSingleItem.setHidden(true);
            } else {
                this.$.subredditSingleItem.setHidden(r.data.hidden);
            }
            
            return true;
        }
        
        // If we get this far, we have no data to render - disallow
        // row rendering
        return false;
    },
});
