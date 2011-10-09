enyo.kind({
    
    name: "reddOS.main.view.popup.CommentReply", 
    kind: "enyo.ModalDialog",
    lazy: false,
    
    caption: "Reply",
    layoutKind: "VFlexLayout",
    
    width: "600px",
    
    parentComment: null,
    rowIndex: null,
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-comment-reply-popup");
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onNewComment: "",
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        {name: "submitCommentService",
            kind: "reddOS.service.RedditSubmitComment",
            onSuccess: "submitCommentSuccess",
            onFailure: "submitCommentFailure",
        },
        
        {   name: "storedObjectManager",
            kind: "reddOS.service.StoredObjectManager"
        },
    
        {kind: "enyo.Group", components: [
            {   kind: "enyo.Scroller",
                name: "inputScroller", 
                height: "200px",
                components: [
                    {   name: "commentInput",
                        kind: "enyo.RichText", 
                        hint: "", 
                        richContent: false, 
                        flex: 1, 
                        style: "font-size: 10px !important; padding: 10px", 
                        styled: false
                    },
                ]
            },
        ]},
        
        {kind: "HFlexBox", components: [
        
            {kind: "enyo.Button", 
                content: "Cancel", 
                onclick: "dismiss",
                flex: 1,
            },
            
            {kind: "enyo.ActivityButton", 
                className: "enyo-button-affirmative",
                name: "submitButton",
                content: "Submit", 
                onclick: "submit",
                flex: 1
            },
        ]},
    ],
        
    /***************************************************************************
     * Methods 
     */
     
    openAndPopulate: function (inParent, rowIndex) {
        this.parentComment = inParent;
        this.rowIndex = rowIndex;
        
        if (rowIndex == -1) {
            this.setCaption("New comment");
        } else {
            this.setCaption("Reply to " + this.parentComment.data.author);
        }
        
        this.$.submitButton.setCaption("Submit");
        
        this.$.submitButton.setActive(false);
        this.openAtCenter();
    },
    
    submit: function () {
        this.$.submitButton.setActive(true);
        
        var currentUser = this.$.storedObjectManager.getItem("user_info");
        
        if (reddOS_Kind.isAccount(currentUser)) {
            this.$.submitCommentService.submitComment(currentUser.data.modhash, this.parentComment.data.name, this.$.commentInput.getValue());
        }
    },
    
    submitCommentSuccess: function (inSender, inID, inCommentContents) {
        this.doNewComment(this.rowIndex, inID, inCommentContents);
        this.dismiss();
    },
    
    submitCommentFailure: function () {
        this.$.submitButton.setActive(false);
        this.$.submitButton.setCaption("Failed. Try again?");
    },
    
    dismiss: function () {
        this.$.submitButton.setCaption("Submit");
        this.parent = null;
        this.$.commentInput.setValue("");
        this.setCaption("Reply");
        this.$.inputScroller.scrollTo(0,0);
        this.close();
    },
});
