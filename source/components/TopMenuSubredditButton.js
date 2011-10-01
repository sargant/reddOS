enyo.kind({
    
    name: "reddOS.component.TopMenuSubredditButton",
    kind: "enyo.CustomButton",
    
    className: "reddos-topmenu-subreddit-button",
    cssNamespace: "reddos-topmenu-subreddit-button",
    allowDrag: true,
    subreddit: null,
    
    create: function() {
        this.inherited(arguments);
    },
});
