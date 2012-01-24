/**
 * reddOS.component.RecursiveComment
 *
 * A reusable component that represents a user comment which may in turn
 * contain more RecursiveComment kinds.
 *
 * Due to memory problems, this component is not currently used, in favour
 * of reddOS.component.NormalComment
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.component.RecursiveComment",
    
    // Base class
    kind: "enyo.VFlexBox",
    
    // Inherited properties
    className: "reddos-comment-item",
    cssNamespace: "reddos-comment-item",
    
    // Local properties
    collapsed: false,
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.updateMeta();
        this.opChanged();
        this.commentChanged();
        this.repliesChanged();
    },
    
    /***************************************************************************
     * Published items
     */
    
    published: {
        author: "",
        created: 0,
        score: 0,
        comment: "",
        op: "",
        replies: [],
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        // Metadata and tree collapse controls
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
        
        // Comment content
        {   kind: "enyo.HtmlContent",
            name: "commentContent",
            className: "reddos-comment-content",
            onLinkClick: "commentLinkClick",
            allowHtml: true,
        },
        
        // Container for nested child RecursiveComment components
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
        
    ////////////
    //
    //  Published item listeners
    //
    ////////////
    
    scoreChanged: function () { 
        this.updateMeta();
    },
    
    authorChanged: function () {
        this.updateMeta();
    },
    
    createdChanged: function () {
        this.updateMeta();
    },
    
    // One single metadata updater, called when any of the metadata-related
    // published properties are updated
    updateMeta: function () {
        if(this.author == false && this.score == false && this.created == false)
        {
            // If we have no metadata whatsoever, hide the metadata header
            this.$.commentHeader.hide();
        } else {
            // Update the metadata bar and ensure it is visible
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
    
    // When the published "replies" array is changed, we need to re-render
    // our commentReplies component and show new child entries
    repliesChanged: function () {
        
        // Begin by hiding the replies container
        this.$.commentReplies.hide();
        
        // Test we have a valid array of replies, and not just a "more" link
        try {
            if(this.replies.data.children.length == 0) return;
            if(!reddOS_Kind.isComment(this.replies.data.children[0])) return;
        } catch(e) {
            return;
        }
        
        // If we have replies, destroy all existing controls and rebuild from
        // scratch
        this.$.commentReplies.destroyControls();
        
        for(var i in this.replies.data.children) {
            
            // If not a reply, ignore
            if(false == reddOS_Kind.isComment(this.replies.data.children[i])) continue;
            
            // Create a new comment component. This will, in turn, render its
            // own children if necessary
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
            
            // Render the reply tree, after all children have rendered
            // themselves
            this.$.commentReplies.render();
        }
        
        // Only re-show replies box if we have at least one reply
        if(this.$.commentReplies.getComponents().length > 0) {
            this.$.commentReplies.show();
        }
    },
    
    ////////////
    //
    //  Comment interaction
    //
    ////////////
    
    // Toggle visiibility status of comment contents and all child components
    toggleCollapse: function () {
    
        this.collapsed = !this.collapsed;
        
        this.$.commentAuthor.addRemoveClass("reddos-comment-item-collapsed", this.collapsed);
        this.$.commentMeta.addRemoveClass("reddos-comment-item-collapsed", this.collapsed);
        this.$.treeCollapse.setContent(this.collapsed ? "+" : "-");
        this.$.commentContent.setShowing(!this.collapsed);
        this.$.commentReplies.setShowing(!this.collapsed);
    },
    
    // Capture link click events and dispatch them as an event instead, to allow
    // the main app to fix them for e.g. relativeness, and opena new browser
    // window
    commentLinkClick: function (inSender, inUrl) {
        enyo.dispatch({type: "onLinkClick", url: inUrl});
    },
    
});
