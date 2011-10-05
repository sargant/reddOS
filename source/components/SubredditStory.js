enyo.kind({
    
    name: "reddOS.component.SubredditStory", 
    kind: "enyo.Item",
    
    cssNamespace: "reddos-subreddit-item",
    tapHighlight: true,
    layoutKind: "HFlexLayout",
    align: "start",
    
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
    },
    
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
    
    likesChanged: function () {
        this.$.voteCount.addRemoveClass("reddos-subreddit-item-votebutton-like", this.likes === true);
        this.$.voteCount.addRemoveClass("reddos-subreddit-item-votebutton-dislike", this.likes === false);
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        {kind: "enyo.Menu", name: "voteMenu", width: "150px", lazy: false, components: [
            {caption: "Vote...", components: [
                {kind: "enyo.MenuItem", name: "voteUpOption", score: 1, caption: "Upvote", onclick: "castVote"},
                {kind: "enyo.MenuItem", name: "voteCancelOption", score: 0, caption: "Cancel vote", onclick: "castVote"},
                {kind: "enyo.MenuItem", name: "voteDownOption", score: -1, caption: "Downvote", onclick: "castVote"},
            ]},
            {name: "hideOption", caption: "Hide", onclick: "toggleHidden"},
        ]},
    
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
    
    storyClick: function (inSender, inEvent) {
        this.doStoryClick(inEvent);
    },
    
    voteClick: function (inSender, inEvent) {
        this.cancelEvent(inSender, inEvent);
        
        this.$.voteMenu.rowIndex = inEvent.rowIndex;
        this.$.voteUpOption.setDisabled(this.likes === true);
        this.$.voteCancelOption.setDisabled(this.likes === null);
        this.$.voteDownOption.setDisabled(this.likes === false);
        
        this.$.hideOption.setCaption(this.hidden ? "Unhide" : "Hide");
        
        this.$.voteMenu.openAtEvent(inEvent);
    },
    
    castVote: function (inSender, inEvent) {
    
        var likes = null;
        if (inSender.score === 1) { likes = true; }
        if (inSender.score === -1) { likes = false; }
        
        this.setLikes(likes);
        
        this.doVoteClick(inEvent, this.$.voteMenu.rowIndex, inSender.score);
    },
     
    toggleHidden: function (inSender, inEvent) {
        var hidden_status = !this.getHidden();
        this.setHidden(hidden_status);
        this.doHideClick(inEvent, this.$.voteMenu.rowIndex, hidden_status);
    },
    
    commentClick: function (inSender, inEvent) {
        this.doCommentClick(inEvent);
        this.cancelEvent(inSender, inEvent);
    },
    
    cancelEvent: function(inSender, inEvent) {
        inEvent.stopPropagation();
    },
});
