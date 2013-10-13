(function(){
	FRISBEE.myAjax = {
		// LaegueVine authentication token
		TOKEN: 'bearer 82996312dc',
		
		// get en post methods
		post: function(url,postData,callback){
			var xhr = this.createAndOpenRequest('POST', url, callback);
			// Send request (with data as a json string)
			xhr.send(JSON.stringify(postData));
		},
		
		get: function(url,callback){
			var xhr = this.createAndOpenRequest('GET', url, callback);
			// Send request
			xhr.send();
		},
		
		createAndOpenRequest: function(type, url, callback){
			var self = this;
			
			// start spinning
			FRISBEE.page.startLongProcess();
			
			// Create request
			var xhr = new XMLHttpRequest();
			
			// Open request
			xhr.open(type,url,true);
			
			// Set request headers
			xhr.setRequestHeader('Content-type','application/json');
			xhr.setRequestHeader('Authorization', this.TOKEN);
			xhr.onreadystatechange = ensureReadiness;
			
			function ensureReadiness () {
				if(xhr.readyState < 4) {
					return;
				}  
				if(xhr.status !== 200 && xhr.status !== 201) {
					FRISBEE.page.endLongProcess();
					return;
				}
				// all is well    
				if(xhr.readyState === 4) {
					// return JSON as JSON object
					callback(JSON.parse(xhr.response));
					// start spinning
					FRISBEE.page.endLongProcess();
				}
			};
			
			return(xhr);
		}
	};
})();