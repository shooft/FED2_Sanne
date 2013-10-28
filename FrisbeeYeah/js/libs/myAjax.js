(function(){
	FRISBEE.myAjax = {
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
		
		del: function(url,callback){
			var xhr = this.createAndOpenRequest('DELETE', url, callback);
			// Send request
			xhr.send();
		},
		
		createAndOpenRequest: function(type, url, callback){
			var self = this;
			
			// Create request
			var xhr = new XMLHttpRequest();
			
			// Open request
			xhr.open(type,url,true);
			
			// Set request headers
			xhr.setRequestHeader('Content-type','application/json');
			xhr.setRequestHeader('Authorization', FRISBEE.settings.lvToken);
			xhr.onreadystatechange = ensureReadiness;
			
			function ensureReadiness () {
				if(xhr.readyState < 4) {
					return;
				}  
				
				if(xhr.readyState === 4) {
					if(xhr.status == 200 && type == "GET") {
						// return JSON as JSON object
						callback(JSON.parse(xhr.response));
					}
					
					else if (xhr.status == 201 && type == "POST") {
						// return JSON as JSON object
						callback(JSON.parse(xhr.response));
					}
					
					else if (xhr.status == 204 && type == "DELETE") {
						// return JSON as JSON object
						callback(xhr);
					}
					
					else {
						return;
					} 
				}
			};
			
			return(xhr);
		}
	};
})();