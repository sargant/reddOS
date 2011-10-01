enyo.kind({
    
    name: "reddOS.service.reddOSUpdates",
    kind: "enyo.Component",
    
    downloadUrl: "https://github.com/sargant/reddOS/downloads",
    
    create: function() {
        this.inherited(arguments);
        this.$.reddOSUpdatesWebService.setTimeout(this.timeout);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onUpdateAvailable: "",
    },
    
    published: {
        timeout: 20000,
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        
        {   name: "reddOSUpdatesWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "https://raw.github.com/sargant/reddOS/master/appinfo.json",
            method: "GET",
            onSuccess: "reddOSUpdatesWebServiceSuccess",
            onFailure: "reddOSUpdatesWebServiceFailure",
        },
        
        {   name: "dashboard", 
            kind: "enyo.Dashboard", 
            onTap: "dashboardTap", 
            appId: null
        },
    ],
        
    /***************************************************************************
     * Methods
     */
     
    check: function () {
        this.$.reddOSUpdatesWebService.call();
    },
    
    reddOSUpdatesWebServiceSuccess: function(inSender, inResponse, inRequest) {
    
        try {
            var l = enyo.fetchAppInfo().version.split(".",3);
            var r = inResponse.version.split(".",3);
            
            if(
                (r[0] > l[0]) 
                || ((r[0]==l[0]) && (r[1] > l[1]))
                || ((r[0]==l[0]) && (r[1]==l[1]) && (r[2]>l[2]))
            ) {
                enyo.windows.addBannerMessage("New version "+(inResponse.version)+" available!", "{}", "images/dashboard-small.png");
                this.$.dashboard.push({icon: "images/dashboard-large.png", title: "reddOS " + inResponse.version + " available", text: "Tap to install via GitHub & Preware"});
                //this.doUpdateAvailable(inResponse.version, this.downloadUrl);
            }
        } catch(e) {}
    },
    
    reddOSUpdatesWebServiceFailure: function() {},
    
    dashboardTap: function (inSender) {
        this.$.dashboard.pop();
        window.open(this.downloadUrl);
    }
});
