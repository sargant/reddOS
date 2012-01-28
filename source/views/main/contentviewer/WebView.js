/**
 * reddOS.view.main.contentViewer
 *
 * Provides a simple web browser with rudimentary controls, used for viewing
 * linked stories and content.
 */
 
 enyo.kind({
    
    // Class identifier
    name: "reddOS.view.main.contentviewer.WebView",
    
    // Base class
    kind: "enyo.VFlexBox",
    
    // Inherited properties
    flex: 1,
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onToggleView: "",
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
    
        ////////////
        //
        //  Popup menus
        //
        ////////////
    
        {   kind: "enyo.Menu",
            name: "linkShareMenu",
            components: [
                {   caption: "Open in browser",
                    onclick: "openInBrowser"
                },
            ]
        },
        
        ////////////
        //
        //  Visible components
        //
        ////////////
    
        // Top toolbar - back button, title, activity indicator
        {   kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {   kind: "enyo.ToolButton",
                    icon: "images/menu-icon-back.png",
                    onclick: "webBrowserBack"
                },
                {   kind: "HtmlContent",
                    name: "webBrowserTitle",
                    flex: 1,
                    style: "margin-left: 8px; font-size: 16px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                },
                {   kind: enyo.Spinner,
                    name: "webBrowserLoading"
                },
            ]
        },
    
        // Main web browser window
        {   kind: "enyo.Pane", 
            name: "webViewPane", 
            flex: 1, 
            transitionKind: "enyo.transitions.Simple",
            components: [
                {   name: "webBrowser",
                    kind: "WebView",
                    minFontSize: 0,
                    width: "100%",
                    height: "100%",
                    onLoadStarted: "webBrowserLoadStarted",
                    onLoadStopped: "webBrowserLoadStopped",
                    onPageTitleChanged: "webBrowserTitleChanged",
                },
            ]
        },
        
        // Bottom toolbar
        {   kind: "enyo.Toolbar", 
            className: "reddos-toolbar",
            components: [
                {   kind: enyo.GrabButton
                },
                {   kind: "enyo.ToolButton", 
                    name: "toolbarCommentsButton", 
                    icon: "images/menu-icon-comments.png", 
                    onclick: "loadComments",
                },
                {   kind: "enyo.Spacer"
                },
                {   kind: "enyo.ToolButton", 
                    name: "linkShareButton",
                    icon: "images/menu-icon-share.png", 
                    onclick: "shareLink",
                },
                {   kind: "enyo.ToolButton", 
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
    
    // Receive a new URL to load from the parent class
    receiveUrl: function (inUrl) {
    
        // If we are already at this URL, do nothing
        if(this.$.webBrowser.getUrl() == inUrl) return;
        
        // If the "deep link" setting is true and the URL matches,
        // rewrite it
        if(reddOS_Settings.getSetting("imgurDeepLink") && inUrl.match(/^http:\/\/(www\.)?imgur.com\/[A-Za-z0-9]+$/gi)) {
            inUrl = inUrl.replace(/http:\/\/(www\.)?imgur/gi, "http://i.imgur");
            inUrl += ".jpg";
        }
        
        // Navigate to page
        this.$.webBrowser.setUrl(inUrl);
    },
    
    // Open the sharing menu
    shareLink: function () {
        this.$.linkShareMenu.openAtControl(this.$.linkShareButton, {left: 90, top: -50});
    },
    
    // Due to relative URLs, we want to dispatch an onLinkClick event instead
    // of opening a window ourselves, to be handled elsewhere
    openInBrowser: function () {
        enyo.dispatch({type: "onLinkClick", url: this.$.webBrowser.getUrl()});
    },
    
    // Request the parent class switches to comments view
    loadComments: function () {
        this.doToggleView();
    },
    
    ////////////
    //
    //  Web browser commands
    //
    ////////////
    
    // Back button
    webBrowserBack: function() {
        this.$.webBrowser.goBack();
    },
    
    // Refresh
    webBrowserRefresh: function() {
    
        // reloadPage will only be available if we have an already loaded page
        if(typeof this.$.webBrowser.reloadPage == "function") {
            this.$.webBrowser.reloadPage();
        } else {
            this.$.webBrowser.refresh();
        }
    },
    
    ////////////
    //
    //  Web browser event callbacks
    //
    ////////////
    
    // Page title changed
    webBrowserTitleChanged: function(inSender, inTitle) {
        
        // If the link is directly to an image "image_title" is returned.
        // Instead, diaply the URL
        if(inTitle == "image_title") {
            inTitle = this.$.webBrowser.getUrl();
        }
        
        this.$.webBrowserTitle.setContent(inTitle);
    },
    
    // Loading activity started
    webBrowserLoadStarted: function() {
        this.$.webBrowserTitle.setContent(this.$.webBrowser.getUrl());
        this.$.webBrowserLoading.show();
    },
    
    // Loading activity finished
    webBrowserLoadStopped: function() {
        this.$.webBrowserLoading.hide();
    },
});
