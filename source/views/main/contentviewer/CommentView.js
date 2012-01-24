/**
 * reddOS.view.main.contentviewer.CommentView
 *
 * Parses and displays user comments. Formats and indents the display to 
 * give the appearance of tree-like nesting.
 */

 enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.contentviewer.CommentView",
    
    // Base class
    kind: "enyo.VFlexBox",
    
    // Inherited components
    className: "reddos-comments",
    flex: 1,
    
    // Local properties
    linkCache: null,
    commentsCache: null,
    flatCommentsCache: null,
    
    /***************************************************************************
     * Published Items
     */
     
    events: {
        onToggleView: "",
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
    
        // Service for loading all comments from a particular story
        {   name: "commentsService",
            kind: "reddOS.service.RedditLoadComments",
            onSuccess: "incomingComments",
            onFailure: "incomingComments",
        },
        
        // Local data caching service
        {   name: "storedObjectManager",
            kind: "reddOS.service.StoredObjectManager"
        },
        
        ////////////
        //
        //  Dialogs and popups
        //
        ////////////
        
        // Interface for adding a comment
        {   name: "commentReplyPopup",
            kind: "reddOS.main.view.popup.CommentReply",
            onNewComment: "insertNewComment",
        },
        
        ////////////
        //
        //  Popup menus
        //
        ////////////
        
        // Sharing menu
        {   kind: "enyo.Menu",
            name: "commentShareMenu",
            components: [
                {   caption: "Open in browser",
                    onclick: "openInBrowser"
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
                {   kind: "HtmlContent",
                    name: "commentToolbarTitle",
                    flex: 1,
                    style: "margin-left: 8px; font-size: 18px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                },
            ]
        },
        
        // Main content pane - holds loading and error views when we have
        // no content
        {   kind: "enyo.Pane", 
            name: "commentViewPane", 
            flex: 1, 
            transitionKind: "enyo.transitions.Simple",
            components: [
                
                // Loading view
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
                
                // Error view
                {   kind: "enyo.VFlexBox",
                    name: "commentError",
                    flex: 1,
                    align: "center",
                    pack: "center",
                    components: [
                        {   content: "There was an error."
                        },
                    ]
                },
                
                // Regular view
                {   kind: "enyo.VFlexBox", 
                    name: "commentContents", 
                    flex: 1, 
                    autoHorizontal: false, 
                    horizontal: false, 
                    components: [
                        // VirtualList
                        {   name: "commentBlock", 
                            kind: "enyo.VirtualList", 
                            onSetupRow: "commentRender",
                            flex: 1, 
                            components: [
                                // Virtual component which is cloned when
                                // rows are rendered or added
                                {   name: "commentContent", 
                                    kind: "reddOS.component.NormalComment",
                                    onOpenReply: "openReplyPopup",
                                },
                            ],
                        },
                    ]
                },
            ]
        },
        
        // Bottom toolbar
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
                    name: "commentNewButton",
                    icon: "images/menu-icon-pencil.png", 
                    onclick: "newComment",
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
     
    ////////////
    //
    //  View switching
    //
    ////////////
    
    // Display a loading view, with custom message
    goNotReady: function (message) {
    
        if(message) {
            this.$.commentLoadingMessage.show();
            this.$.commentLoadingMessage.setContent(message);
        } else {
            this.$.commentLoadingMessage.hide();
        }
        
        this.$.commentViewPane.selectView(this.$.commentLoading);
    },
    
    // Display the ready view
    goReady: function () {
        this.$.commentViewPane.selectView(this.$.commentContents);
    },
    
    // Display the error view
    goError: function () {
        this.$.commentViewPane.selectView(this.$.commentError);
    },
    
    ////////////
    //
    //  Toolbar functionality
    //
    ////////////
    
    // Request the parent class to change views
    loadLink: function () {
        this.doToggleView();
    },
    
    // Open sharing menu
    shareComments: function () {
        this.$.commentShareMenu.openAtControl(this.$.commentShareButton, {left: 90, top: -50});
    },
    
    // Due to relative URLs, dispatch an event to show we want a link opening
    // in a new window, and let a method in the main app handle correcting the
    // data.
    openInBrowser: function () {
        enyo.dispatch({type: "onLinkClick", url: this.linkCache.data.permalink});
    },
    
    ////////////
    //
    //  Comment rendering
    //
    ////////////
    
    // Receive a new command from the parent class
    receiveObject: function (inObject) {
    
        // Check it's not a link object
        if(reddOS_Kind.isLink(inObject) == false) return;
        
        // If we already have loaded this set, don't reload them
        if(!reddOS_Kind.isLink(this.linkCache) || (this.linkCache.data.permalink != inObject.data.permalink)) {
        
            // Cache the passed object
            this.linkCache = inObject;
            
            // Update the chrome
            this.$.commentToolbarTitle.setContent("[" + inObject.data.subreddit + "] " + inObject.data.title);
        
            // Update the comments
            this.refreshComments();
        }
    },
    
    // Begin to load new comments based on cached data
    refreshComments: function () {
    
        // Go to a "not ready" view
        this.goNotReady("Downloading...");
        
        // Update the link toolbar button, as we now know whether it's a self
        // post or not
        this.$.toolbarLinkButton.setShowing(!this.linkCache.data.is_self);
        
        // Dispatch an asynchronous request for the comments thread
        this.$.commentsService.loadComments(this.linkCache.data.permalink);
    },
    
    // Callback for the comments loading service, covering both positive
    // and negative results
    incomingComments: function(inSender, inResults) {
    
        // As data processing maqy be slow, show that we have downloaded the
        // data but not yet rendered it
        this.goNotReady("Reticulating splines...");
        
        // Sanity check - if what we have isn't a valid return, show the error
        // view and stop processing
        if(!inResults || !enyo.isArray(inResults) || inResults.length != 2) {
            this.goError();
            return false;
        }
        
        try {
            
            // Clear the caches
            this.linkCache = null;
            this.commentsCache = null;
            
            // Refill the raw caches from the transferred data
            this.linkCache = inResults[0].data.children[0];
            this.commentsCache = inResults[1].data.children;
            
        } catch (e) {
            this.goError();
            return false;
        }
        
        // Convert the raw data into a format suitable for the rendering method
        this.flatCommentsCache = this.flattenComments(this.commentsCache, 0);
        
        // Remove all existing comments, so that the renderer callback will
        // re-layout every single comment
        this.$.commentBlock.punt();
        
        // Go to the ready view, and allow the renderer to start generating
        // list rows
        this.goReady();
    },
    
    // Convert a raw comments data feed into a format suitable for the renderer
    flattenComments: function (inComments, depth) {
    
        // Generate some empty arrays, ensure empty
        var retval = [];
        var subarray = [];
        retval.length = 0;
        subarray.length = 0;
        
        // Loop through returned comments data
        for (var i in inComments) {
        
            // If not a comment, ignore and continue to next data item
            if(reddOS_Kind.isComment(inComments[i]) == false) continue;
            
            // Add current depth to comment object's properties
            retval.push(enyo.mixin(inComments[i], {reddos_depth: depth}));
            
            try {
            
                // If there are no nested comments beneath this one,
                // continue onto the next loop cycle
                if(inComments[i].data.replies.data.children.length == 0) continue;
                if(!reddOS_Kind.isComment(inComments[i].data.replies.data.children[0])) continue;
                
                // If there are nested comments, call this method recursively,
                // increasing the depth property by 1 to visually indicate
                // nesting level
                subarray.length = 0;
                subarray = this.flattenComments(inComments[i].data.replies.data.children, depth+1);
                
                // Push the now un-nested comments into the list we already have
                for (var j in subarray) retval.push(subarray[j]);
                
            } catch(e) {
                continue;
            }
        }
        
        // Return the flattened comments list
        return retval;
    },
    
    // Callback function which renders comments on demand
    commentRender: function(inSender, inIndex) {
    
        // If this is row zero, then it is the special "header row" which shows
        // metadata. Construct the data and tell the comment container
        // to render it in header mode.
        if(inIndex == 0) {
        
            var linkData = this.linkCache.data;
            if(!linkData) { this.goError(); return false; }
            
            var metadata = "posted "+reddOS_Date.timeSince(linkData.created_utc)+" ago by "+linkData.author+" to "+linkData.subreddit;
            var selftext = reddOS_Markdown.makeHtml(linkData.selftext.unescapeHtml());
            
            this.$.commentContent.headerMode(linkData.title, metadata, selftext);
            return true;
        }
    
        // Obtain the cached comment data, offset by one to account for the
        // metadata header row
        try {
            var r = this.flatCommentsCache[inIndex-1];
        } catch (e) {
            return false;
        }
        
        // If we have a valid comment, insert the data into the template
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
    
    ////////////
    //
    //  User addition of comments
    //
    ////////////
    
    
    // Open the new comment popup
    newComment: function() {
        this.$.commentReplyPopup.openAndPopulate(this.linkCache, -1);
    },
    
    // Open the new comment popup in "replying" mode
    openReplyPopup: function (inSender, inEvent, inRowIndex) {
        this.$.commentReplyPopup.openAndPopulate(this.flatCommentsCache[inRowIndex], inRowIndex);
    },
    
    // Called when the new comment dialog has successfully inserted a new 
    // message. Rather than reload all data, insert the new data into the cache
    // and update relevant rows.
    insertNewComment: function (inSender, parentRowIndex, inNewID, inComment) {
    
        // Create comment object
        var newComment = new Object;
        newComment.kind = reddOS_Kind.COMMENT;
        
        // Add correct depth level
        if(parentRowIndex == -1) {
            newComment.reddos_depth = 0;
        } else {
            newComment.reddos_depth = (this.flatCommentsCache[parentRowIndex].reddos_depth + 1);
        }
        
        // Render the new comment data as a combination of the text that
        // was submitted, and data about the currently authenticated user.
        newComment.data = {};
        
        var currentUser = this.$.storedObjectManager.getItem("user_info");
        
        newComment.data.body = inComment;
        newComment.data.author = currentUser.data.name;
        newComment.data.ups = 1;
        newComment.data.downs = 0;
        newComment.data.created_utc = reddOS_Date.now();
        newComment.data.likes = true;
        newComment.data.name = inNewID;
        
        // Splice this new comment into the cache in the right location
        this.flatCommentsCache.splice(parentRowIndex + 1, 0, newComment);
        
        // Request that the whole list re-renders
        // (does NOT involve an internet service call)
        this.$.commentBlock.refresh();
    },

    
    /*     
    
    ** These methods provide a way of naturally nesting the data, allowing
    ** for collapsing of the tree branch-by-branch.
    **
    ** Due to memory problems with large webpages, this strategy is infeasible
    ** on the TouchPad - a flyweight strategy is required.
    
    renderHeaderFromCache: function () {
        
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
    }, 
    
    renderCommentsFromCache: function() {
        
        var commentsArray = this.commentsCache;
        
        if(enyo.isArray(commentsArray) == false) {
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
    
});
