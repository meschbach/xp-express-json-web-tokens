/*
 * Dependencies
 */
var express = require("express");
var bodyParser = require("body-parser" );
var express_jwt = require("express-jwt");
var jwt = require("jsonwebtoken"); 
var uuid = require("node-uuid");
var morgan = require( "morgan" );

/*
 * Generated (will remain as constants) 
 */
var jwtSigningSecret = uuid.v4();
var flag = uuid.v4();

/*
 * Options
 */
var port = 8000;

/*
 * Express application assembly
 */
var app = express();
app.use( morgan( "short" ) );

app.post( "/token", bodyParser.json(), function( request, response ){
	if( request.body.user == 'hobbit' && request.body.secret == 'tolken' ){
		var token = jwt.sign({ touch: 'stars' }, jwtSigningSecret.toString() );
		response.send( token );
		response.end();
	}else{
		response.statusCode = 422; //Totally not the right code for auth; but hey!  it's a prototype
		response.end();
	}
});

app.get( "/flag", express_jwt({ secret: jwtSigningSecret.toString() }), function( request, response ){
	response.json({ flag: flag });
});

/*
 * Listen for clients
 */
app.listen( port, function(){
	console.log( "Listening on ", port );
});
