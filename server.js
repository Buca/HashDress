const express = require('express');
const server = express();

server.use( express.static( 'src' ) );

const port = 4000;

server.get( '/*', function ( req, res ) {

	if( req.url !== '/' ) {

		res.redirect( req.protocol + '://' + req.get( 'host' ) + '/#' + req.url );

	}

	else {

		res.send();

	}

} );

server.listen( port, function () {

    console.log( 'Server listening at ' + port + '.' );

} );
