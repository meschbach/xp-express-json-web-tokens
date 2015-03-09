var express = require("express");
var jwt = require("express-jwt");
var id = require("node-uuid").v4();

var port = 8000;

var app = express();
app.get( "/flag", function( request, response ){
	response.json({ flag: id });
});

app.listen( port, function(){
	console.log( "Listening on ", port );
});
