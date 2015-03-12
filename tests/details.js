var jwt = require("jsonwebtoken");
var crypto = require( "crypto" );

describe( "JWT", function(){
	describe( "wrong symetric key", function(){
		it( "errors", function(){
			var signingKey = crypto.randomBytes( 8 );
			var verifyKey = crypto.randomBytes( 8 );
			var payload = { use: "your evil" };

			var token = jwt.sign( payload, signingKey );
			try {
				var decoded = jwt.verify( token, verifyKey );
				throw new Error("Expected to fail.");
			}catch( e ){
			}
		});
	});
});
