enyo.kind({
    
    name: "reddOS.service.HistoryManager",
    kind: "enyo.Component",
    
    keyName: "reddOS.history",
    lifespan: 14 * 24 * 3600,
    
    cache: [],
    
    
    create: function () {
        this.inherited(arguments);
        enyo.dispatcher.rootHandler.addListener(this);
        this.reload();
    },
    
      
    reddOSHistoryUpdatedHandler: function (inSender, inEvent) {
        this.reload();
    },
    
    
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
    },
    
    
    store: function () {
        window.localStorage.setItem(this.keyName, enyo.json.stringify(this.cache));
        enyo.dispatch({type: "reddOSHistoryUpdated"});
    },
    
    
    isVisited: function (searchname) {
        return (this.__isVisitedIndex(searchname) == -1) ? false : true;
    },
    
    
    __isVisitedIndex: function (searchname) {
        var i = this.cache.length;
        while (i--) {
            if (this.cache[i].name && this.cache[i].name == searchname) {
                return i;
            }
        }
        return -1;
    },

    
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
    
    
    prune: function (maxage) {
    
        if(!maxage) maxage = this.lifespan;
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
    
    
    clear: function () {
        this.cache.length = 0;
        this.store();
    }
});
