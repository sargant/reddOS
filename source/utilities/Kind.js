reddOS_Kind = {
	
	COMMENT: "t1",
	ACCOUNT: "t2",
	LINK: "t3",
	MESSAGE: "t4",
	SUBREDDIT: "t5",
	
	isKind: function(a, k) {
		
        if(a == null) {
            return false;
        }
		else if(typeof a == "string") {
			return (a == k);
		}
		else if(typeof a == "object") {
			
			if(typeof a.kind == "undefined") {
				return false;
			} else {
				return (a.kind == k);
			}
			
		} else {
			return false;
		}
	},
	
	isComment: function(a) {
		return this.isKind(string, this.COMMENT);
	},
	
	isAccount: function(a) {
		return this.isKind(a, this.ACCOUNT);
	},
		
	isLink: function(a) {
		return this.isKind(string, this.LINK);
	},
	
	isMessage: function(a) {
		return this.isKind(string, this.MESSAGE);
	},
	
	isSubreddit: function(a) {
		return this.isKind(a, this.SUBREDDIT);
	},
};