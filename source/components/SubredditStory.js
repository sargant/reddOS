/**
 * reddOS.component.SubredditStory
 *
 * A reusable component that represents a story entry in a subreddit listing.
 * Contains methods for updating UI upon user interaction.
 *
 * This kind is used heavily in reddOS.view.main.secondcolumn.Subreddit
 */
 
enyo.kind({
    
    // Class identifier
    name: "reddOS.component.SubredditStory", 
    
    // Base class
    kind: "enyo.Item",
    
    // Inherited properties
    cssNamespace: "reddos-subreddit-item",
    tapHighlight: true,
    layoutKind: "HFlexLayout",
    align: "start",
    
    // Constructor
    create: function () {
        this.inherited(arguments);
        this.addClass("reddos-subreddit-item");
        this.updateAllFields();
    },
    
    /***************************************************************************
     * Published items
     */
     
    events: {
        onStoryClick: "",
        onVoteClick: "",
        onHideClick: "",
        onSaveClick: "",
        onCommentClick: "",
    },
    
    published: {
        title: "",
        domain: "",
        meta: "",
        nsfw: false,
        votes: 0,
        comments: 0,
        odd: false,
        visited: false,
        likes: null,
        hidden: false,
        saved: false,
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        ////////////
        //
        //  Popup menus
        //
        ////////////
    
        // Menu triggered by clicking the vote icon
        {   kind: "enyo.Menu",
            name: "voteMenu",
            width: "150px",
            lazy: false,
            components: [
                {   caption: "Vote...",
                    components: [
                        {   kind: "enyo.MenuItem",
                            name: "voteUpOption",
                            score: 1,
                            caption: "Upvote",
                            onclick: "castVote"
                        },
                        {   kind: "enyo.MenuItem",
                            name: "voteCancelOption",
                            score: 0,
                            caption: "Cancel vote",
                            onclick: "castVote"
                        },
                        {   kind: "enyo.MenuItem",
                            name: "voteDownOption",
                            score: -1,
                            caption: "Downvote",
                            onclick: "castVote"
                        },
                    ]
                },
                {   name: "hideOption",
                    caption: "Hide",
                    onclick: "toggleHidden"
                },
                {   name: "saveOption",
                    caption: "Save",
                    onclick: "toggleSaved"
                },
            ]
        },
        
        ////////////
        //
        //  Visible components
        //
        ////////////
    
        {   kind: "enyo.VFlexBox", 
            name: "linkBlock",
            showing: false,
            onclick: "storyClick",
            onmousehold: "voteClick",
            flex: 1, 
            components: [
                {   name: "postTitle", 
                    className: "reddos-subreddit-item-title",
                    allowHtml: true
                },
                {   name: "postDomain",
                    className: "reddos-subreddit-item-domain",
                    allowHtml: true
                },
                {   name: "postMeta",
                    className: "reddos-subreddit-item-meta",
                    allowHtml: true
                },
            ],
        },
        {   kind: "enyo.VFlexBox",
            name: "buttonBlock",
            showing: false,
            pack: "start",
            align: "end",
            components: [
                {   name: "voteCount", 
                    kind: "enyo.CustomButton", 
                    className: "reddos-subreddit-item-votebutton",
                    cssNamespace: "reddos-subreddit-item-votebutton",
                    content: "0", 
                    allowDrag: true,
                    onclick: "voteClick",
                    onmousehold: "cancelEvent",
                },
                {   name: "commentCount", 
                    kind: "enyo.CustomButton", 
                    className: "reddos-subreddit-item-commentbutton",
                    cssNamespace: "reddos-subreddit-item-commentbutton",
                    content: "0", 
                    allowDrag: true,
                    onclick: "commentClick",
                    onmousehold: "cancelEvent",
                },
            ]
        },
        {   name: "loadingBlock",
            className: "reddos-subreddit-item-loading",
            layoutKind: "HFlexLayout",
            flex: 1,
            showing: false,
            align: "center",
            pack: "center",
            components: [
                {   content: "Loading...",
                }
            ]
        },
        {   name: "finalizeBlock",
            className: "reddos-subreddit-item-finalize",
            layoutKind: "HFlexLayout",
            flex: 1,
            showing: false,
            align: "center",
            pack: "center",
            components: [
                {   content: "No more stories!",
                }
            ]
        },
    ],
    
    /***************************************************************************
     * Methods
     */
    
    ////////////
    //
    //  Published item listeners
    //
    ////////////
    
    // Manually call all listeners simultaneously
    updateAllFields: function () {
        this.titleChanged();
        this.domainChanged();
        this.metaChanged();
        this.nsfwChanged();
        this.votesChanged();
        this.commentsChanged();
        this.oddChanged();
        this.visitedChanged();
        this.likesChanged();
        this.hiddenChanged();
        this.savedChanged();
        this.setMode("normal");
    },
    
    titleChanged: function () {
        var nsfw_string = (this.nsfw) ? "<span class=\"reddos-subreddit-item-nsfw\">NSFW</span>"  : "";
        this.$.postTitle.setContent(nsfw_string + this.title);
    },
    
    domainChanged: function () {
        this.$.postDomain.setContent(this.domain);
    },
    
    metaChanged: function () {
        this.$.postMeta.setContent(this.meta);
    },
    
    nsfwChanged: function () {
        this.titleChanged();
    },
    
    votesChanged: function () {
        this.$.voteCount.setContent(this.votes);
    },
    
    commentsChanged: function () {
        this.$.commentCount.setContent(this.comments);
    },
    
    oddChanged: function () {
        this.addRemoveClass("reddos-subreddit-item-odd", this.odd);
    },
    
    visitedChanged: function () {
        this.$.postTitle.addRemoveClass("reddos-subreddit-item-title-visited", this.visited);
    },
    
    hiddenChanged: function () {
        this.addRemoveClass("reddos-subreddit-item-hidden", this.hidden);
    },
    
    savedChanged: function () {
        this.addRemoveClass("reddos-subreddit-item-saved", this.saved);
    },
    
    likesChanged: function () {
        this.$.voteCount.addRemoveClass("reddos-subreddit-item-votebutton-like", this.likes === true);
        this.$.voteCount.addRemoveClass("reddos-subreddit-item-votebutton-dislike", this.likes === false);
    },
    
    ////////////
    //
    //  Component interaction
    //
    ////////////
    
    // Send an event to parent class notifying of story click
    storyClick: function (inSender, inEvent) {
        this.doStoryClick(inEvent);
    },
    
    // Open the voting menu when the voting icon is clicked
    voteClick: function (inSender, inEvent) {
        
        // Stop event propagation
        this.cancelEvent(inSender, inEvent);
        
        // Configure display based on current vote status
        this.$.voteMenu.rowIndex = inEvent.rowIndex;
        this.$.voteUpOption.setDisabled(this.likes === true);
        this.$.voteCancelOption.setDisabled(this.likes === null);
        this.$.voteDownOption.setDisabled(this.likes === false);
        
        // Configure display based on saving and hidden status
        this.$.hideOption.setCaption(this.hidden ? "Unhide" : "Hide");
        this.$.saveOption.setCaption(this.saved ? "Unsave": "Save");
        
        // Open the menu
        this.$.voteMenu.openAtEvent(inEvent);
    },
    
    // Send an event to the parent class when the comment icon is clicked
    commentClick: function (inSender, inEvent) {
        this.doCommentClick(inEvent);
        // Stop event propagation
        this.cancelEvent(inSender, inEvent);
    },
    
    // When a component is clicked, all layers receive the click event, from
    // top down. This stops the event from propagationg any further down the
    // z-axis.
    cancelEvent: function(inSender, inEvent) {
        inEvent.stopPropagation();
    },
    
    // React to vote click within vote menu
    castVote: function (inSender, inEvent) {
        this.doVoteClick(inEvent, this.$.voteMenu.rowIndex, inSender.score);
    },
    
    // React to hidden status click in vote menu
    toggleHidden: function (inSender, inEvent) {
        var hidden_status = !this.getHidden();
        this.setHidden(hidden_status);
        this.doHideClick(inEvent, this.$.voteMenu.rowIndex, hidden_status);
    },
    
    // React to saved status click in vote menu
    toggleSaved: function (inSender, inEvent) {
        var saved_status = !this.getSaved();
        this.setSaved(saved_status);
        this.doSaveClick(inEvent, this.$.voteMenu.rowIndex, saved_status);
    },
    
    ////////////
    //
    //  Story rendering
    //
    ////////////
    
    // Select view mode. Possible options are:
    // - regular, 
    // - "loading", when we reach the bottom of the list and request the next page,
    // - "finalize", when we have reached the end of the list and there are no more pages.
    setMode: function (mode) {
    
        this.$.linkBlock.hide();
        this.$.buttonBlock.hide();
        this.$.loadingBlock.hide();
        this.$.finalizeBlock.hide();
    
        switch (mode) {
            case "loading":
                this.$.loadingBlock.show();
                break;
            case "finalize":
                this.$.finalizeBlock.show();
                break;
            default:
                this.$.linkBlock.show();
                this.$.buttonBlock.show();
                break;
        }
    },
});
