/**
 * reddOS.view.main.SecondColumn
 *
 * Generic container for secondary level data. At the moment this is just
 * story listings, but eventually will include user profile information, etc.
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.SecondColumn",
    
    // Base class
    kind: "VFlexBox",
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-secondcolumn");
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onObjectSend: ""
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        
        // Container for all possible views
        {   name: "secondColumnContent", 
            kind: "enyo.Pane",
            transitionKind: "enyo.transitions.Simple",
            flex: 1,
            components: [
            
                // Placeholder view (no data loaded)
                {   name: "secondColumnPlain",
                    layoutKind: "VFlexLayout",
                    pack: "end",
                    components: [
                        {   kind: "enyo.Toolbar", 
                            className: "reddos-toolbar",
                            components: [
                                {   name: "secondColumnTitle", 
                                    kind: "enyo.HtmlContent", 
                                    style: "color: white; font-weight: bold"
                                },
                            ],
                        },
                        {   flex: 1
                        },
        
                        {   kind: "enyo.Toolbar",
                            className: "reddos-toolbar",
                            components: [
                                {   kind: "enyo.GrabButton"
                                },
                                {   kind: "enyo.Spacer"
                                },
                            ]
                        },
                    ],
                },
                
                // Listing of available stories (subreddit view)
                {   name: "secondColumnSubreddit", 
                    kind: "reddOS.view.main.secondcolumn.Subreddit",
                    onObjectSend: "doObjectSend",
                },
            ],
        },
    ],
        
    /***************************************************************************
     * Methods
     */
        
    // Receive objects from parent, and if a subreddit object,
    // redispatch appropriately
    receiveObject: function(inObject) {
        
        if(reddOS_Kind.isSubreddit(inObject)) {
            this.$.secondColumnSubreddit.receiveObject(inObject);
            this.$.secondColumnContent.selectView(this.$.secondColumnSubreddit);
        }
    },
});
