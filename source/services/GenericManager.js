enyo.kind({
    
    name: "reddOS.service.GenericManager",
    kind: "enyo.Component",
    
    cache: [],
    
    create: function () {
        this.inherited(arguments);
        enyo.dispatcher.rootHandler.addListener(this);
        this.reload();
    },
    
    events: {
        onUpdate: "",
    },
    
    published: {
        keyName: "",
    },
    
    /**
     * When one instance of a history manager saves back to event storage,
     * it sends a global event. This captures the event and reloads the data
     * in all active instances
     */
    reddOSGenericManagerHandler: function (inSender, inEvent) {
        if (inEvent.keyName && inEvent.keyName == this.keyName) {
            this.reload();
        }
    },
    
    /**
     * Reload the history from localStorage. Fires an event when finished,
     * allowing owners to handle the new data
     */
    reload: function () {
        if (this.keyName) {
            this.cache.length = 0;
            var contents = window.localStorage.getItem(this.keyName);
        
            if (!contents) {
                this.cache = [];
            } else {
                this.cache = enyo.json.parse(contents);
            }
        
            if(!enyo.isArray(this.cache)) {
                this.cache = [];
            }
        
            this.doUpdate(this.cache);
        } else {
            console.error("No keyname set");
        }
    },
    
    /**
     * Write the current cache to localStorage, and flag to other instances
     * that the data has changed
     */
    store: function () {
        if (this.keyName) {
            window.localStorage.setItem(this.keyName, enyo.json.stringify(this.cache));
            enyo.dispatch({type: "reddOSGenericManager", keyName: this.keyName});
        }
    },
    
    /**
     * Clears the entire link history
     */
    clear: function () {
        this.cache.length = 0;
        this.store();
    },
});
