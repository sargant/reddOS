enyo.kind({
    
    name: "reddOS.main.view.popup.CommentReply", 
    kind: "enyo.ModalDialog",
    lazy: false,
    
    caption: "Reply",
    layoutKind: "VFlexLayout",
    
    width: "600px",
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-comment-reply-popup");
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
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
            
            {kind: "enyo.Button", 
                className: "enyo-button-affirmative",
                content: "Submit", 
                onclick: "submit",
                flex: 1
            },
        ]},
    ],
        
    /***************************************************************************
     * Methods 
     */
     
    openAndPopulate: function (inComment, rowIndex) {
        this.setCaption("Reply to " + inComment.data.author);
        this.openAtCenter();
    },
    
    dismiss: function () {
        this.$.commentInput.setValue("");
        this.setCaption("Reply");
        this.$.inputScroller.scrollTo(0,0);
        this.close();
    },
});
