var request = require( "request" );
var base = "http://localhost:8000";

function rest( method, resource, body, auth, next ){
	var options = { method: method, uri: base + resource };
	if( body ){
		options.json = body;
	}
	if( auth ){
		options.headers = {};
		options.headers["Authorization"] = auth;
	}
	return request(options, next);
}

function rest_post( resource, body, auth, next ){
	return rest( "POST", resource, body, auth, next );
}
function rest_get( resource, auth, next ){
	return rest( "GET", resource, undefined, auth, next );
}

var token ;
rest_post( "/token", { user: "spy", secret: "v spy" }, token, function( err, response, body ){
	if( err ){ return console.error( "request error: ", err.toString() ); }
	if( response.statusCode != 200 ){
		return console.error( "failed to get toekn", response.statusCode );
	}
	token = "Bearer "+ body;

	rest_get( "/team/blue/flag", token, function( err, res, body ){
		if( err ) {
			return console.error( "Error: ", err );
		}

		var code = res.statusCode;
		if( code == 200 ){
			console.log( JSON.parse( body ) );
		}else{
			console.error( "Status: ", code );
		}
	});
});
