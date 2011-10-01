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
        onCommentClick: "",
    },
    
    published: {
        title: "",
        domain: "",
        meta: "",
        votes: 0,
        comments: 0,
        odd: false,
        visited: false,
        likes: null,
    },
    
    updateAllFields: function () {
        this.titleChanged();
        this.domainChanged();
        this.metaChanged();
        this.votesChanged();
        this.commentsChanged();
        this.oddChanged();
        this.visitedChanged();
        this.likesChanged();
    },
    
    titleChanged: function () {
        this.$.postTitle.setContent(this.title);
    },
    
    domainChanged: function () {
        this.$.postDomain.setContent(this.domain);
    },
    
    metaChanged: function () {
        this.$.postMeta.setContent(this.meta);
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
    
    likesChanged: function () {
        this.$.voteCount.addRemoveClass("reddos-subreddit-item-votebutton-like", this.likes === true);
        this.$.voteCount.addRemoveClass("reddos-subreddit-item-votebutton-dislike", this.likes === false);
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        {   kind: "enyo.VFlexBox", 
            onclick: "storyClick",
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
    ],
    
    /***************************************************************************
     * Methods
     */
     
    storyClick: function (inSender, inEvent) {
        this.doStoryClick(inEvent);
    },
    
    voteClick: function (inSender, inEvent) {
        this.cancelEvent(inSender, inEvent);
    },
    
    commentClick: function (inSender, inEvent) {
        this.doCommentClick(inEvent);
        this.cancelEvent(inSender, inEvent);
    },
    
    cancelEvent: function(inSender, inEvent) {
        inEvent.stopPropagation();
    },
});
