enyo.kind({
    
    name: "reddOS.service.HistoryManager",
    kind: "reddOS.service.GenericManager",
    
    keyName: "reddOS.history",
    defaultLifespan: 14 * 24 * 3600,
    
    create: function () {
        this.inherited(arguments);
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
});
