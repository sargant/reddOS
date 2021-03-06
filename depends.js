/**
 * Central dependencies list
 *
 * This contains a list of all files required for running an instance
 * of reddOS. Order is important, kinds must be listed in such an order
 * that later kinds have no unfulfilled dependencies
 */

enyo.depends(

    // CSS Stylesheets
    "css/about.css",
    "css/comments.css",
    "css/global.css",
    "css/headerbar.css",
    "css/login.css",
    "css/secondcolumn.css",
    "css/storyviewer.css",
    "css/subredditdescription.css",
    "css/topmenu.css",
    
    // 3rd Party Components
    "source/3rdparty/pagedown.js",
    "source/3rdparty/ScrollBarsScroller.js",
    
    // Standalone utility objects
    "source/utilities/Date.js",
    "source/utilities/ExtendedObjects.js",
    "source/utilities/Kind.js",
    "source/utilities/Settings.js",
    
    // Individual, reusable UI components
    "source/components/NormalComment.js",
    "source/components/RecursiveComment.js",
    "source/components/SubredditStory.js",
    "source/components/TopMenuSubredditButton.js",
    
    // Internet and local services
    "source/services/GenericManager.js",
    "source/services/HistoryManager.js",
    "source/services/RedditAuthentication.js",
    "source/services/RedditLoadComments.js",
    "source/services/RedditHide.js",
    "source/services/RedditSave.js",
    "source/services/RedditSubredditContents.js",
    "source/services/RedditSubscribedSubreddits.js",
    "source/services/RedditSubmitComment.js",
    "source/services/RedditUserInformation.js",
    "source/services/RedditVote.js",
    "source/services/reddOSUpdates.js",
    "source/services/StoredObjectManager.js",
    
    // Views, in reverse order of hierarchy
    "source/views/main/popup/About.js",
    "source/views/main/popup/CommentReply.js",
    "source/views/main/popup/Login.js",
    "source/views/main/popup/Settings.js",
    "source/views/main/popup/SubredditDescription.js",
    
    "source/views/main/contentviewer/CommentView.js",
    "source/views/main/contentviewer/WebView.js",

    "source/views/main/secondcolumn/Subreddit.js",
    
    "source/views/main/ContentViewer.js",
    "source/views/main/HeaderBar.js",
    "source/views/main/TopMenu.js",
    "source/views/main/SecondColumn.js",
    
    // Main application object
    "source/views/Main.js"
);
