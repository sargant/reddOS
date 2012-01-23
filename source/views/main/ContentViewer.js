/**
 * reddOS.view.main.StoryViewer
 *
 * Container for both comment viewer and web viewer. Caches the link
 * object for easy switching between the two without going back to the parent.
 */

enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.StoryViewer",
    
    // Parent class
    kind: "VFlexBox",
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.addClass("reddos-storyviewer");
    },
    
    // Cache the received link object for easy switching
    // between story and comments
    linkCache: null,
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        // Container for all types of viewable content
        {   kind: "Pane",
            name: "contentPane",
            transitionKind: "enyo.transitions.Simple",
            flex: 1,
            className: "reddos-story-view",
            components: [
            
                // Empty (default) view
                {   name: "plainView",
                    layoutKind: "VFlexLayout", 
                    components: [
                        // Top toolbar
                        {   kind: "enyo.Toolbar",
                            className: "reddos-toolbar"
                        },
                        // Simple container
                        {   kind: "enyo.VFlexBox",
                            flex: 1, 
                            pack: "center",
                            align: "center", 
                            components: [
                                {   kind: "enyo.Image",
                                    src: "images/reddOS_filler.png"
                                },
                            ]
                        },
                        // Bottom toolbar
                        {   kind: "enyo.Toolbar",
                            className: "reddos-toolbar",
                            components: [
                                {   kind: "enyo.GrabButton"
                                },
                                {   kind: "enyo.Spacer"
                                },
                            ]
                        },
                    ]
                },
                
                // Web View
                {   name: "webView", 
                    kind: "reddOS.view.main.contentviewer.WebView",
                    onToggleView: "toggleLinkCommentView",
                    flex: 1
                },
                
                // Comment View
                {   name: "commentView", 
                    kind: "reddOS.view.main.contentviewer.CommentView",
                    onToggleView: "toggleLinkCommentView",
                    flex: 1
                },
            ]
        },
    ],
        
    /***************************************************************************
     * Methods
     */
        
    // Receive a passed object from parent - a story or comments thread
    receiveObject: function(inObject) {
        
        // Check it's the kind of object we accept
        if(reddOS_Kind.isLink(inObject) == false) return;
        
        // Cache the object
        this.linkCache = inObject;
        
        if(this.linkCache.data.is_self == true) {
            // If a selfpost, then the story and comments are the same thing
            this.$.commentView.receiveObject(this.linkCache);
            this.$.contentPane.selectView(this.$.commentView);
            
        } else if(typeof this.linkCache.target == "undefined" || this.linkCache.target == "link") {
            // If explicitly a link, or explicitly undefined, go to the link
            this.$.webView.receiveUrl(this.linkCache.data.url);
            this.$.contentPane.selectView(this.$.webView);
            
        } else {
            // For all other non-empty values, go to the comments
            this.$.commentView.receiveObject(this.linkCache);
            this.$.contentPane.selectView(this.$.commentView);
        }
    },
    
    // Toggle between story and comment viewers
    toggleLinkCommentView: function () {
    
        if(this.$.contentPane.getViewName() == "commentView") {
            this.$.webView.receiveUrl(this.linkCache.data.url);
            this.$.contentPane.selectView(this.$.webView);
        } else {
            this.$.commentView.receiveObject(this.linkCache);
            this.$.contentPane.selectView(this.$.commentView);
        }
    },
});
