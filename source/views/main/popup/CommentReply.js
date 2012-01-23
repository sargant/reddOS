/**
 * reddOS.view.main.popup.CommentReply
 *
 * Modal dialog containing UI elements for entry of user comments
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.main.view.popup.CommentReply", 
    
    // Base class
    kind: "enyo.ModalDialog",
    
    // Inherited properties
    lazy: false,
    caption: "Reply",
    layoutKind: "VFlexLayout",
    width: "600px",
    
    // Local properties
    parentComment: null,
    rowIndex: null,
    
    // Constructor
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
    
        ////////////
        //
        //  Register Services
        //
        ////////////
        
        // Comment submission service
        {   name: "submitCommentService",
            kind: "reddOS.service.RedditSubmitComment",
            onSuccess: "submitCommentSuccess",
            onFailure: "submitCommentFailure",
        },
        
        // Local data caching service
        {   name: "storedObjectManager",
            kind: "reddOS.service.StoredObjectManager"
        },
        
        ////////////
        //
        //  Visual Components
        //
        ////////////
    
        // A textarea inside a scroller for long comment entry
        {   kind: "enyo.Group",
            components: [
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
            ]
        },
        
        // Submission and dismissal buttons
        {   kind: "HFlexBox",
            components: [
                {   kind: "enyo.Button", 
                    content: "Cancel", 
                    onclick: "dismiss",
                    flex: 1,
                },
                {   kind: "enyo.ActivityButton", 
                    className: "enyo-button-affirmative",
                    name: "submitButton",
                    content: "Submit", 
                    onclick: "submit",
                    flex: 1
                },
            ]
        },
    ],
        
    /***************************************************************************
     * Methods 
     */
     
    ////////////
    //
    //  Comment submission and callbacks
    //
    ////////////
    
    // Pass data to comment submission service
    submit: function () {
        this.$.submitButton.setActive(true);
        
        var currentUser = this.$.storedObjectManager.getItem("user_info");
        
        // Sanity check - cached user is a real user
        if (reddOS_Kind.isAccount(currentUser)) {
            this.$.submitCommentService.submitComment(currentUser.data.modhash, this.parentComment.data.name, this.$.commentInput.getValue());
        }
    },
    
    // Callback for successful comment submission
    submitCommentSuccess: function (inSender, inID, inCommentContents) {
        this.doNewComment(this.rowIndex, inID, inCommentContents);
        this.dismiss();
    },
    
    // Callback for failed comment submission
    submitCommentFailure: function () {
        this.$.submitButton.setActive(false);
        this.$.submitButton.setCaption("Failed. Try again?");
    },
    
    ////////////
    //
    //  UI construction and dismissal
    //
    ////////////
    
    // Open the dialog and insert relevant data
    openAndPopulate: function (inParent, rowIndex) {
        this.parentComment = inParent;
        this.rowIndex = rowIndex;
        
        // If rowIndex is -1, then we are submitting directly to the parent
        if (rowIndex == -1) {
            this.setCaption("New comment");
        } else {
            this.setCaption("Reply to " + this.parentComment.data.author);
        }
        
        this.$.submitButton.setCaption("Submit");
        
        this.$.submitButton.setActive(false);
        this.openAtCenter();
    },
    
    // Close the dialog and reset all input fields to their default values
    dismiss: function () {
        this.$.submitButton.setCaption("Submit");
        this.parent = null;
        this.$.commentInput.setValue("");
        this.setCaption("Reply");
        this.$.inputScroller.scrollTo(0,0);
        this.close();
    },
});
