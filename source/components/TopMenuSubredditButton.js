/**
 * reddOS.component.TopMenuSubredditButton
 *
 * A simple reusable component to save on clutter in reddOS.view.main.TopMenu
 */
 
enyo.kind({
    
    // Class identifier
    name: "reddOS.component.TopMenuSubredditButton",
    
    // Base class
    kind: "enyo.CustomButton",
    
    // Inherited properties
    className: "reddos-topmenu-subreddit-button",
    cssNamespace: "reddos-topmenu-subreddit-button",
    allowDrag: true,
    
    // Local properties
    subreddit: null,
    
    // Constructor
    create: function() {
        this.inherited(arguments);
    },
});
