var jwt = require("jsonwebtoken");
var crypto = require( "crypto" );
var pem = require( "pem" );

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

	describe( "signed by asymetric key", function(){
		before( function( done ){
			pem.createCertificate({days:1, selfSigned: true}, function(err, keys){
				this.cert = keys.certificate;
				this.key = keys.serviceKey;
				done();
			}.bind(this));
		});

		it( "verifies correctly", function( done ){
			var payload = { test: "secret" };

			var token = jwt.sign( payload, this.key, { algorithm: 'RS256'} );
			jwt.verify( token, this.cert, function( err, result ){
				if( err ){  throw new Error( err ); }
				if( result.test != 'secret' ){
					throw new Error("secret doesn't match");
				}
				done();
			});
		});
	});
});
