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
 * Storage Layer interface
 */
function user_find_by_name( id ){
	return users[id];
}

/*
 * Options
 */
var port = 8000;

/*
 * Token generating middleware
 */
function authorization_middleware( req, resp, next ){
	var authorization = req.headers.authorization;
	if( !authorization ){ return next(); }

	var schemeAndSecret = authorization.split( " " );
	var scheme = schemeAndSecret[0];
	var secret = schemeAndSecret[1];
	if( scheme == "Basic" ){
		var decoded = new Buffer( secret, 'base64' ).toString('utf8');
		var separator = decoded.indexOf(":");
		if( separator == -1 ){
			console.log( "No separator found" );
			resp.statusCode = 401;
			return resp.end();
		}

		var alias = decoded.substring( 0, separator );
		var secret = decoded.substring( separator + 1 );
		var user = user_find_by_name( alias );
		if( !user || user.secret != secret ){
			resp.statusCode = 401;
			return resp.end();
		}

		req.user = user;
		req.user.name = alias;
		return move_on();
	}else if( scheme == "Bearer" ){
		jwt.verify( secret, jwtSigningSecret, function( error, decoded ){
			if( error ){
				console.log( "JWT error: ", error );
				resp.statusCode = 401;
				resp.end();
			}

			var user = user_find_by_name( decoded.name );
			req.user = user;
			req.user.name = decoded.name;
			move_on();
		});
	}else{
		resp.statusCode = 401;
		return resp.end();
	}

	function move_on(){
		if( req.headers['jwt-token'] == "please" ){
			var payload = {
				name: req.user.name
			};

			var token = jwt.sign( payload, jwtSigningSecret.toString() );
			resp.setHeader("JWT-Token", token);
		}
		next();
	}
}

/*
 * Express application assembly
 */
var app = express();
app.use( morgan( "short" ) );

/*
 * Token Generation
 */
app.post( "/token", authorization_middleware, bodyParser.json(), function( request, response ){
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
app.get( "/team/:team/flag", authorization_middleware, locateTeam, function( request, response ){
	if( !request.user || request.user.team != request.params.team ){
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
