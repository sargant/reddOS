enyo.kind({
    
    name: "reddOS.component.NormalComment",
    kind: "enyo.Item",
    
    cssNamespace: "reddos-comment-item",
    
    published: {
        author: "",
        created: 0,
        depth: 0,
        score: 0,
        comment: "",
        op: "",
    },
    
    collapsed: false,
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-comment-item"),
        this.updateMeta();
        this.opChanged();
        this.commentChanged();
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        {   kind: "enyo.VFlexBox",
            className: "reddos-comment-wrapper",
            name: "wrapper",
            components: [
                {   kind: "enyo.HFlexBox", 
                    className: "reddos-comment-header",
                    name: "commentHeader",
                    pack: "start",
                    align: "center",
                    
                    components: [
                    
                        {   kind: "enyo.HtmlContent",
                            name: "commentAuthor",
                            className: "reddos-comment-author",
                            content: "",
                        },
                        {   kind: "enyo.HtmlContent",
                            name: "commentMeta",
                            className: "reddos-comment-meta",
                            content: "",
                        },
                    ]
                },
                {   kind: "enyo.HtmlContent",
                    name: "commentContent",
                    className: "reddos-comment-content",
                    onLinkClick: "commentLinkClick",
                    allowHtml: true,
                },
            ]
        },
        
        {   kind: "enyo.VFlexBox",
            name: "header",
            className: "reddos-comment-item-header",
            showing: false,
            components: [
                {   kind: "enyo.HtmlContent",
                    className: "reddos-comment-item-header-title",
                    name: "headerTitle",
                },
                {   kind: "enyo.HtmlContent",
                    className: "reddos-comment-item-header-meta",
                    name: "headerMeta",
                },
                {   kind: "enyo.HtmlContent",
                    className: "reddos-comment-item-header-selftext",
                    name: "headerSelftext",
                    onLinkClick: "commentLinkClick",
                    allowHtml: true,
                    showing: false,
                },
            ]
        },
    ],
    
    /***************************************************************************
     * Methods
     */
     
    headerMode: function (title, meta, selftext) {
        this.$.wrapper.hide();
        this.$.header.show();
        this.$.headerTitle.setContent(title);
        this.$.headerMeta.setContent(meta);
        if(selftext) {
            this.$.headerSelftext.setContent("<hr/>\n"+selftext);
            this.$.headerSelftext.show();
        }
    },
    
    scoreChanged: function () { this.updateMeta(); },
    authorChanged: function () { this.updateMeta(); },
    createdChanged: function () { this.updateMeta(); },
    
    updateMeta: function () {
        if(this.author == false && this.score == false && this.created == false)
        {
            this.$.commentHeader.hide();
        } else {
            this.$.commentAuthor.setContent(this.author);
            this.$.commentMeta.setContent(this.score + " points " + reddOS_Date.timeSince(this.created) + " ago");
            this.$.commentHeader.show();
        }
    },
    
    opChanged: function () { 
        this.$.commentAuthor.addRemoveClass("reddos-comment-author-op", (this.author == this.op));
    },
    
    depthChanged: function () {
        this.$.wrapper.applyStyle("margin-left", (14 + (this.depth*15)) + "px");
    },
    
    commentChanged: function () {
        this.$.commentContent.setContent(reddOS_Markdown.makeHtml(this.comment.unescapeHtml()));
    },
    
    commentLinkClick: function (inSender, inUrl) {
        enyo.dispatch({type: "onLinkClick", url: inUrl});
    },
    
});
