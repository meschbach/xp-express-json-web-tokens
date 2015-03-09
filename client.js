var request = require( "request" );
var base = "http://localhost:8000";

function rest_post( resource, body, next ){
	return request({ method: "POST", uri: base + resource, json: body }, next);
}

rest_post( "/token", { user: "hobbit", secret: "tolken" }, function( err, response, body ){
	if( err ){ return console.error( "request error: ", err.toString() ); }
	if( response.statusCode != 200 ){
		return console.error( "failed to get toekn", response.statusCode );
	}
	var token = body;

	request({ uri: "http://localhost:8000/flag", headers: { 'Authorization': 'Bearer ' + token } }, function( err, response, body ){
		if( err ) {
			return console.error( "Error: ", err );
		}

		var code = response.statusCode;
		if( code == 200 ){
			console.log( JSON.parse( body ) );
		}else{
			console.error( "Status: ", code ); 
		}
	});
});
