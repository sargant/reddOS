/**
 * A general kind for storing an array of unrelated objects
 * 
 * The primary use for this is for caching JSON objects in "hibernation" mode,
 * such that the application can boot quickly with the right user details etc.
 * and then silently update in the background if incorrect.
 */

enyo.kind({
    
    name: "reddOS.service.StoredObjectManager",
    
    keyName: "reddOS.stored-object",
    
    create: function () {
        this.inherited(arguments);
    },
    
    /**
     * Returns the object if found in the array, otherwise returns
     * EXACTLY null.
     */
    getItem: function (searchname) {
        var index = this.__getItemIndex(searchname);
        return (index < 0) ? null : this.cache[i].object;
    },
    
    /**
     * Gets the ID of the searched item in the array. Only useful internally,
     * use getItem instead.
     */
    
    __getItemIndex: function (searchname) {
        
        searchname = new String(searchname);
        if(!searchname) return -1;
        
        var i = this.cache.length;
        while (i--) {
            if (this.cache[i].name && this.cache[i].name == searchname) {
                return i
            }
        }
        return -1;
    },
    
    /**
     * Sets the item by keyname. Will overwrite old values.
     */
    setItem: function (keyname, inObject) {
        
        keyname = new String(keyname);
        if(!keyname) return false;
        
        var existing_item = this.__getItemIndex(keyname);
        
        if (existing_item === -1) {
            this.cache.push({
                name: keyname,
                object: inObject,
                updated: reddOS_Date.now(),
            });
        } else {
            this.cache[existing_item].object = inObject;
            this.cache[existing_item].updated = reddOS_Date.now();
        }
        
        this.store();
        return true;
    },
});
