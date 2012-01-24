/**
 * reddOS.component.NormalComment
 *
 * A reusable component that represents a user comment, in the flat
 * (un-nested) presentation style.
 *
 * This kind is used heavily in reddOS.view.main.contentviewer.CommentView
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.component.NormalComment",
    
    // Base class
    kind: "enyo.Item",
    
    // Inherited properties
    cssNamespace: "reddos-comment-item",
    
    // Local properties
    collapsed: false,
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-comment-item"),
        this.updateMeta();
        this.opChanged();
        this.commentChanged();
    },
    
    /***************************************************************************
     * Published items
     */
    
    published: {
        author: "",
        created: 0,
        depth: 0,
        score: 0,
        comment: "",
        op: "",
    },
    
    events: {
        onOpenReply: "",
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
    
        // Comment context menu
        {   kind: "enyo.Menu",
            name: "commentMenu",
            lazy: false,
            components: [
                {   name: "commentMenuReplyOption",
                    caption: "Reply",
                    onclick: "openReply"
                },
            ]
        },
    
        ////////////
        //
        //  Visible components
        //
        ////////////
        
        // Normal comment representation
        {   kind: "enyo.VFlexBox",
            className: "reddos-comment-wrapper",
            name: "wrapper",
            onclick: "openCommentMenu",
            components: [
                // Metadata header bar
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
                // Main content container
                {   kind: "enyo.HtmlContent",
                    name: "commentContent",
                    className: "reddos-comment-content",
                    onLinkClick: "commentLinkClick",
                    allowHtml: true,
                },
            ]
        },
        
        // Header row representation
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
    
    ////////////
    //
    //  Published item listeners
    //
    ////////////
    
    opChanged: function () { 
        this.$.commentAuthor.addRemoveClass("reddos-comment-author-op", (this.author == this.op));
    },
    
    depthChanged: function () {
        this.$.wrapper.applyStyle("margin-left", (14 + (this.depth*15)) + "px");
    },
    
    commentChanged: function () {
        this.$.commentContent.setContent(reddOS_Markdown.makeHtml(this.comment.unescapeHtml()));
    },
    
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
    
    ////////////
    //
    //  Comment presentation
    //
    ////////////
    
    // When invoked by parent class, this switches the presentation of the
    // comment from regular mode to "header mode"
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
    
    ////////////
    //
    //  Comment interaction
    //
    ////////////
    
    // Open comment context menu
    openCommentMenu: function(inSender, inEvent) {
        this.$.commentMenu.rowIndex = inEvent.rowIndex;
        this.$.commentMenuReplyOption.setCaption("Reply to " + this.getAuthor());
        this.$.commentMenu.openAtEvent(inEvent);
    },
    
    // Open reply dialog
    openReply: function(inSender, inEvent) {
        this.doOpenReply(inEvent, this.$.commentMenu.rowIndex - 1);
    },

    // Capture link click events and dispatch them as an event instead, to allow
    // the main app to fix them for e.g. relativeness, and opena new browser
    // window
    commentLinkClick: function (inSender, inUrl) {
        enyo.dispatch({type: "onLinkClick", url: inUrl});
    },
    
});
