enyo.kind({
    
    name: "reddOS.component.RecursiveComment",
    kind: "enyo.VFlexBox",
    
    className: "reddos-comment-item",
    cssNamespace: "reddos-comment-item",
    
    published: {
        author: "",
        created: 0,
        score: 0,
        comment: "",
        op: "",
        replies: [],
    },
    
    collapsed: false,
    
    create: function() {
        this.inherited(arguments);
        this.updateMeta();
        this.opChanged();
        this.commentChanged();
        this.repliesChanged();
    },
    
    /***************************************************************************
     * Components
     */
    
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
                {   kind: "enyo.CustomButton",
                    name: "treeCollapse",
                    className: "reddos-comment-collapsebutton",
                    cssNamespace: "reddos-comment-collapsebutton",
                    onclick: "toggleCollapse",
                    content: "-",
                },
            ]
        },
        
        {   kind: "enyo.HtmlContent",
            name: "commentContent",
            className: "reddos-comment-content",
            onLinkClick: "commentLinkClick",
            allowHtml: true,
        },
        
        {   kind: "enyo.VFlexBox",
            name: "commentReplies",
            className: "reddos-comment-replies",
            showing: false,
            components: [],
        }
    ],
    
    /***************************************************************************
     * Methods
     */
    
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
    
    commentChanged: function () {
        this.$.commentContent.setContent(this.comment);
    },
    
    repliesChanged: function () {
        
        this.$.commentReplies.hide();
        
        // Test we have a valid array of replies, and not just a "more" link
        try {
            if(this.replies.data.children.length == 0) return;
            if(!reddOS_Kind.isComment(this.replies.data.children[0])) return;
        } catch(e) {
            return;
        }
        
        // If we have replies, loop over and do stuff.
        this.$.commentReplies.destroyControls();
        
        for(var i in this.replies.data.children) {
            
            if(false == reddOS_Kind.isComment(this.replies.data.children[i])) continue;
            
            var cd = this.replies.data.children[i].data;
            
            this.$.commentReplies.createComponent({
                kind: "reddOS.component.RecursiveComment",
                author: cd.author,
                score: (cd.ups-cd.downs),
                created: cd.created_utc,
                comment: reddOS_Markdown.makeHtml(cd.body.unescapeHtml()),
                op: this.op,
                replies: cd.replies,
            });
            
            this.$.commentReplies.render();
        }
        
        if(this.$.commentReplies.getComponents().length > 0) {
            this.$.commentReplies.show();
        }
    },
    
    toggleCollapse: function () {
    
        this.collapsed = !this.collapsed;
        
        this.$.commentAuthor.addRemoveClass("reddos-comment-item-collapsed", this.collapsed);
        this.$.commentMeta.addRemoveClass("reddos-comment-item-collapsed", this.collapsed);
        this.$.treeCollapse.setContent(this.collapsed ? "+" : "-");
        this.$.commentContent.setShowing(!this.collapsed);
        this.$.commentReplies.setShowing(!this.collapsed);
    },
    
    commentLinkClick: function (inSender, inUrl) {
        enyo.dispatch({type: "onLinkClick", url: inUrl});
    },
    
});
