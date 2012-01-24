/**
 * reddOS.service.RedditAuthentication
 *
 * A service for performing user authentication requests
 */
 enyo.kind({
    
    // Class identifier
    name: "reddOS.service.RedditAuthentication",
     
    // Base class
    kind: "enyo.Component",
    
    // Local properties
    errorResponses: {
        TIMEOUT: "request timed out",
        BAD_RESPONSE: "reddit sent bad data",
    },
    
    // Constructor
    create: function() {
        this.inherited(arguments);
        this.$.loginWebService.setTimeout(this.timeout);
        this.$.logoutWebService.setTimeout(this.timeout);
    },
    
    /***************************************************************************
     * Published Items
     */
    
    events: {
        onLoginSuccess: "",
        onLoginFailure: "",
        onLogoutSuccess: "",
        onLogoutFailure: "",
    },
    
    published: {
        timeout: 20000,
    },
    
    /***************************************************************************
     * Components
     */
    
    components: [
        {   name: "loginWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            method: "POST",
            onSuccess: "loginReturnSuccess", 
            onFailure: "loginReturnFailure",
            headers: {
                "Origin": "http://www.reddit.com"
            },
        },
        {   name: "logoutWebService", 
            kind: "enyo.WebService", 
            timeout: this.timeout,
            url: "http://www.reddit.com/logout", 
            method: "POST",
            onSuccess: "logoutReturnSuccess", 
            onFailure: "logoutReturnFailure", 
        },
    ],
        
    /***************************************************************************
     * Methods
     */
    
    ////////////
    //
    //  Login related methods
    //
    ////////////
    
    // Perform login with a given username and password
    doLogin: function (username, password) {
        this.$.loginWebService.setUrl("http://www.reddit.com/api/login/"+username);
        this.$.loginWebService.call({
            user: username,
            passwd: password,
            api_type: "json"
        });
    },
    
    // Internal login webservice callback success
    loginReturnSuccess: function(inSender, inResponse) {
        if(typeof inResponse.json.errors == "undefined") {
            this.doLoginFailure(this.errorResponses.BAD_DATA);
        }
        else if(inResponse.json.errors.length == 0) {
            this.doLoginSuccess();
        } else {
            this.doLoginFailure(inResponse.json.errors[0][1]);
        }
    },
    
    // Internal login webservice callback failure
    loginReturnFailure: function() {
        this.doLoginFailure(this.errorResponses.TIMEOUT);
    },
    
    ////////////
    //
    //  Logout related methods
    //
    ////////////
    
    // Perform a logout. Requires a username to prevent people simply linking
    // to the logout api URL.
    doLogout: function(userhash) {
        this.$.logoutWebService.call({uh: userhash});
    },
    
    // Internal logout webservice callback success
    logoutReturnSuccess: function() {
        this.doLogoutSuccess();
    },
    
    // Internal logout webservice callback failure
    logoutReturnFailure: function() {
        this.doLogoutFailure();
    },
});
