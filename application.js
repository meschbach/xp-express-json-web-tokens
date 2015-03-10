/*
 * Copyright 2015 Mark Eschbach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
 * Data which should be stored elsewhere in the wild.
 */
var jwtSigningSecret = uuid.v4();

var teams = {
	red: {
		flag: uuid.v4(),
	},
	blue: {
		flag: uuid.v4()
	}
};

var users = {
	'spy' : { secret: 'v spy', team: "red" },
	'unicorn' : { secret: 'worth while', team: "blue" }
}

/*
 * Options
 */
var port = 8000;

/*
 * Express application assembly
 */
var app = express();
app.use( morgan( "short" ) );

/*
 * Token Generation
 */
app.post( "/token", bodyParser.json(), function( request, response ){
	var errors = [];
	var body = request.body, user, secret;
	if( !body ){ errors.push( "body required" ); } else {
		if( !body.user ){ errors.push( "user required" ); }else{ user = body.user; }
		if( !body.secret ){ errors.push( "secret required" ); }else{ secret = body.secret; }
	}
	if( errors.length > 0 ){
		response.statusCode = 422;
		return repsonse.json({ errors: errors });
	}

	var userEntity = users[ user ];
	if( !userEntity || userEntity.secret != secret ){
		response.statusCode = 401; //This is leaking user ids; don't do this in production 
		return response.end();
	}

	var payload = {
		name: user
	};

	var token = jwt.sign( payload, jwtSigningSecret.toString() );
	response.send( token );
	response.end();
});

/*
 * Middleware
 */
function locateUser( request, response, next ){
	/*
	 * Ensure we have a user
	 */
	var userName = request.user.name;
	var userEntity = users[ userName ];
	if( !userEntity ){
		response.statusCode = 401;
		return response.end();
	}

	request.user = userEntity;
	next();
}

function locateTeam( request, response, next ){
	/*
	 * Ensure the team exists
	 */
	var teamEntity = teams[request.params.team];
	if( !teamEntity ){
		response.statusCode = 404;
		return response.end();
	}

	request.team = teamEntity;
	next();
}

/*
 * Protected routes
 */
var jwt_middleware = express_jwt({ secret: jwtSigningSecret.toString() });
app.get( "/team/:team/flag", jwt_middleware, locateUser, locateTeam, function( request, response ){
	if( request.user.team != request.params.team ){
		response.statusCode = 403;
		response.end();
	}else{
		response.json({ flag: request.team.flag });
	}
});

/*
 * Listen for clients
 */
app.listen( port, function(){
	console.log( "Listening on ", port );
});
