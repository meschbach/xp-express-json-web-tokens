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
		var type = "Bearer ";
		if( auth.substring( 0, type.length ) != type ){
			options.headers["JWT-Token"] = "please";
		}
	}
	return request(options, next);
}

function rest_post( resource, body, auth, next ){
	return rest( "POST", resource, body, auth, next );
}
function rest_get( resource, auth, next ){
	return rest( "GET", resource, undefined, auth, next );
}

var token = "Basic " + new Buffer( "spy" + ":" + "v spy" ).toString( "base64" );
rest_post( "/token", { user: "spy", secret: "v spy" }, token, function( err, response, body ){
	if( err ){ return console.error( "request error: ", err.toString() ); }
	if( response.statusCode != 200 ){
		return console.error( "failed to get toekn", response.statusCode );
	}
	var token = response.headers['jwt-token'];
	token = "Bearer "+ token;

	rest_get( "/team/red/flag", token, function( err, res, body ){
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
