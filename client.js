var request = require( "request" );

request( "http://localhost:8000/flag", function( err, response, body ){
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
