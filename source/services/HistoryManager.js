enyo.kind({
    
    name: "reddOS.service.HistoryManager",
    kind: "enyo.Component",
    
    keyName: "reddOS.history",
    defaultLifespan: 14 * 24 * 3600,
    
    cache: [],
    
    create: function () {
        this.inherited(arguments);
        enyo.dispatcher.rootHandler.addListener(this);
        this.reload();
    },
    
    events: {
        onUpdate: "",
    },
    
    /**
     * When one instance of a history manager saves back to event storage,
     * it sends a global event. This captures the event and reloads the data
     * in all active instances
     */
    reddOSHistoryUpdatedHandler: function (inSender, inEvent) {
        this.reload();
    },
    
    /**
     * Reload the history from localStorage. Fires an event when finished,
     * allowing owners to handle the new data
     */
    reload: function () {
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
    },
    
    /**
     * Write the current history to localStorage
     */
    store: function () {
        window.localStorage.setItem(this.keyName, enyo.json.stringify(this.cache));
        enyo.dispatch({type: "reddOSHistoryUpdated"});
    },
    
    /**
     * Checks if a link is visited, by reddit fullname
     */
    isVisited: function (searchname) {
        return (this.__isVisitedIndex(searchname) == -1) ? false : true;
    },
    
    /**
     * Returns the cache index of the link if visited. Use the wrapper function
     * "isVisited" for true/false values
     */
    __isVisitedIndex: function (searchname) {
        var i = this.cache.length;
        while (i--) {
            if (this.cache[i].name && this.cache[i].name == searchname) {
                return i;
            }
        }
        return -1;
    },

    /**
     * Adds a visited link to the list. If supplied with one argument,
     * it will use the current time.
     */
    setVisited: function (fullname, time_visited) {
    
        if(!fullname) return false;
        if(!time_visited) time_visited = reddOS_Date.now();
        
        var existing_link_index = this.__isVisitedIndex(fullname);
        
        if(existing_link_index > -1) {
            this.cache[existing_link_index].time = time_visited;
        } else {
            this.cache.push({
                name: fullname,
                time: time_visited
            });
        }
        
        this.store();
        return true;
    },
    
    /**
     * Removes links from the list older than a certain threshold. Defaults
     * to the value in this.defaultLifespan
     */
    prune: function (maxage) {
    
        if(!maxage) maxage = this.defaultLifespan;
        var i = this.cache.length;
        var newcache = [];
        newcache.length = 0;
        var earliest_time = reddOS_Date.now() - maxage;
        
        while (i--) {
            if (!this.cache[i].time || this.cache[i].time >= earliest_time) {
                newcache.push(this.cache[i]);
            }
        }
        
        this.cache.length = 0;
        this.cache = newcache;
        this.store();
    },
    
    /**
     * Clears the entire link history
     */
    clear: function () {
        this.cache.length = 0;
        this.store();
    },
});
