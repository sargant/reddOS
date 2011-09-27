 enyo.kind({
    
    name: "reddOS.view.main.contentviewer.WebView",
    kind: "enyo.VFlexBox",
    
    flex: 1,
    
    events: {
        onToggleView: "",
    },
    
    components: [
    
        {kind: "enyo.Menu", name: "linkShareMenu", components: [
            {caption: "Open in browser", onclick: "openInBrowser"},
        ]},
    
        {kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {kind: "enyo.ToolButton", icon: "images/menu-icon-back.png", onclick: "webBrowserBack"},
            
                {kind: "HtmlContent", name: "webBrowserTitle", flex: 1,
                    style: "margin-left: 8px; font-size: 16px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"},
                {kind: enyo.Spinner, name: "webBrowserLoading"},
            
            ]
        },
    
        {name: "webBrowser", kind: "WebView", minFontSize: 0, flex: 1, width: "100%", height: "100%",
            onLoadStarted: "webBrowserLoadStarted",
            onLoadStopped: "webBrowserLoadStopped",
            onPageTitleChanged: "webBrowserTitleChanged",
        },
        
        {kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {kind: enyo.GrabButton},
                
                {kind: "enyo.ToolButton", 
                    name: "toolbarCommentsButton", 
                    icon: "images/menu-icon-comments.png", 
                    onclick: "loadComments",
                },
                
                {kind: "enyo.Spacer"},
                {kind: "enyo.ToolButton", 
                    name: "linkShareButton",
                    icon: "images/menu-icon-share.png", 
                    onclick: "shareLink",
                },
                {kind: "enyo.ToolButton", 
                    name: "toolbarRefreshButton",
                    icon: "images/menu-icon-refresh.png", 
                    onclick: "webBrowserRefresh",
                },
            ]
        },
    ],
    
    /***************************************************************************
     * Methods
     */
    
    receiveUrl: function (inUrl) {
    
        if(this.$.webBrowser.getUrl() == inUrl) return;
        
        if(reddOS_Settings.getSetting("imgurDeepLink") && inUrl.match(/^http:\/\/(www\.)?imgur.com\/[A-Za-z0-9]+$/gi)) {
            inUrl = inUrl.replace(/http:\/\/(www\.)?imgur/gi, "http://i.imgur");
            inUrl += ".jpg";
        }
        
        this.$.webBrowser.setUrl(inUrl);
    },
    
    shareLink: function () {
        this.$.linkShareMenu.openAtControl(this.$.linkShareButton, {left: 90, top: -50});
    },
    
    openInBrowser: function () {
        enyo.dispatch({type: "onLinkClick", url: this.$.webBrowser.getUrl()});
    },
    
    loadComments: function () {
        this.doToggleView();
    },
    
    webBrowserBack: function() {
        this.$.webBrowser.goBack();
    },
    
    webBrowserRefresh: function() {
        if(typeof this.$.webBrowser.reloadPage == "function") {
            this.$.webBrowser.reloadPage();
        } else {
            this.$.webBrowser.refresh();
        }
    },
    
    webBrowserTitleChanged: function(inSender, inTitle) {
        
        if(inTitle == "image_title") {
            inTitle = this.$.webBrowser.getUrl();
        }
        
        this.$.webBrowserTitle.setContent(inTitle);
    },
    
    webBrowserLoadStarted: function() {
        this.$.webBrowserTitle.setContent(this.$.webBrowser.getUrl());
        this.$.webBrowserLoading.show();
    },
    
    webBrowserLoadStopped: function() {
        this.$.webBrowserLoading.hide();
    },
});
