enyo.kind({
	
	name: "reddOS.service.RedditUserInformation",
	kind: "enyo.Component",
	
	errorResponses: {
		TIMEOUT: "request timed out",
		BAD_RESPONSE: "reddit sent bad data",
	},
	
	create: function() {
		this.inherited(arguments);
	},
	
	/***************************************************************************
	 * Published Items
	 */
	
	events: {
		onSuccess: "",
		onFailure: "",
	},
	
	published: {
		timeout: "10000",
	},
	
	/***************************************************************************
	 * Components
	 */
	
	components: [
		
		{name: "userInformationWebService", 
			kind: "enyo.WebService", 
			timeout: this.timeout,
			url: "http://www.reddit.com/api/me.json", 
			method: "GET",
			onSuccess: "userInformationWebServiceSuccess",
			onFailure: "userInformationWebServiceFailure",
		},
		
	],
		
	/***************************************************************************
	 * Methods
	 */
		
	refreshData: function() {
		this.$.userInformationWebService.call();
	},
	
	userInformationWebServiceSuccess: function(inSender, inResponse, inRequest) {
		if(typeof inResponse.data == "undefined") {
			this.doFailure();
		} else {
			this.doSuccess(inResponse.data);
		}
	},
	
	userInformationWebServiceFailure: function() {
		this.doFailure();
	},
})