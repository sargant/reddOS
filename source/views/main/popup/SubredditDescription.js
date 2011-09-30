enyo.kind({
    
    name: "reddOS.main.view.popup.SubredditDescription", 
    kind: "enyo.ModalDialog",
    lazy: false,
    
    caption: "Subreddit Description",
    layoutKind: "VFlexLayout",
    
    width: "600px",
    
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-subreddit-description-popup");
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
            {kind: "enyo.Scroller", 
                name: "descriptionScroller", 
                height: "500px", 
                components: [
                    {kind: "enyo.HtmlContent", 
                        name: "descriptionContent", 
                        className: "reddos-subreddit-description-content",
                        onLinkClick: "descriptionLinkClick",
                    }
                ]
            },
        ]},
        
        {kind: "HFlexBox", components: [
        
            {kind: "enyo.Spacer"}, 
            {kind: "enyo.Button", 
                content: "Close", 
                onclick: "dismiss"
            },
        ]},
    ],
        
    /***************************************************************************
     * Methods 
     */
     
    openDescription: function (inObject) {
        
        if(reddOS_Kind.isSubreddit(inObject) == false) {
            this.$.descriptionContent.setContent("This doesn't appear to be a subreddit!");
            return;
        }
        
        // Set caption, if possible
        
        if(typeof inObject.data.display_name != "undefined" && inObject.data.display_name != false) {
            this.setCaption(inObject.data.display_name);
        } else if(typeof inObject.data.url != "undefined" && inObject.data.url != false) {
            this.setCaption(inObject.data.url);
        }
        
        // Set description, if possible
        
        if(typeof inObject.data.description != "undefined" && inObject.data.description != false) {
            this.$.descriptionContent.setContent(reddOS_Markdown.makeHtml(inObject.data.description));
        } else {
            this.$.descriptionContent.setContent("This subreddit does not appear to have a description!");
        }
        
        this.openAtCenter();
    },
    
    descriptionLinkClick: function (inSender, inUrl) {
        enyo.dispatch({type: "onLinkClick", url: inUrl});
    },
    
    dismiss: function () {
        this.caption = "Subreddit Description";
        this.$.descriptionContent.setContent("");
        this.$.descriptionScroller.scrollTo(0,0);
        this.close();
    },
});
