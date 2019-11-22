//const EventMock = require( 'EventMock.js' ),
//	  Utils = require( 'Utils.js' );

function Path( router, path, onTrigger = undefined, checkCurrent = true ) {

	EventMock.call( this );

	if( router !== undefined ) router.attach( this );

	path = Utils.parsePath( path );

	this.string = null;
	this.list = [];
	this.parameters = {};
	this.enabled = true;
	this.entered = false;
	this.triggerContext = this;
	this.onTrigger = onTrigger;
	this.disposed = false;

	Object.assign( this, path );

	if( this.enabled && checkCurrent ) {

		var path = Utils.parsePath( Utils.extractPath( window.location.hash ) ),			
			valid = this.validate( path );

		if( valid !== false ) {

			this.onTrigger.bind( this.triggerContext )( path );
			this.dispatch( 'trigger', path );

		}

	}

	this.on( 'enter', function() {

		this.entered = true;

	} );

	this.on( 'leave', function() {

		this.entered = false;

	} )

};


Path.prototype = Object.assign( Object.create( EventMock.prototype ), {

	constructor: Path,

	trigger: function( path, context = this.triggerContext ) {

		path = Utils.parsePath( path );

		this.onTrigger.bind( context )( path );
		this.dispatch( 'trigger', path );

		return this;

	},

	validate: function( path ) {

		return Utils.validatePaths( this, path );

	},

	enable: function() {

		this.enabled = true;

		return this;

	},

	disable: function() {

		this.enabled = false;

		return this;

	},

	dispose: function() {

		this.clearEventListeners();

		for( var props in this ) {

			this[ props ] = undefined;

		}

		this.disposed = true;

		return undefined;

	},

} );


//module.exports = Path;
