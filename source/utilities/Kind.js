reddOS_Kind = {
	
	COMMENT: "t1",
	ACCOUNT: "t2",
	LINK: "t3",
	MESSAGE: "t4",
	SUBREDDIT: "t5",
	
	isKind: function(string, kind) {
		return (string == kind);
	},
	
	isComment: function(string) {
		return this.isKind(string, this.COMMENT);
	},
	
	isAccount: function(string) {
		return this.isKind(string, this.ACCOUNT);
	},
		
	isLink: function(string) {
		return this.isKind(string, this.LINK);
	},
	
	isMessage: function(string) {
		return this.isKind(string, this.MESSAGE);
	},
	
	isSubreddit: function(string) {
		return this.isKind(string, this.SUBREDDIT);
	},
};