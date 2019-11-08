function Path( path, callback, context = HashDress ) {

	this.context = context;
	this.context.paths.add( this );

	// Fix the path.
	this.path = this.context.fixPath( path );

	this.wild = false;

	if( this.path[ this.path.length - 1 ] === '*' ) {

		this.path = this.path.substring( 0, this.path.length - 1 );
		this.wild = true;

	}

	this.callback = callback.bind( this );

	var parsed = this.context.parsePath( this.path );

	this.list = parsed.list;
	this.parameters = parsed.parameters;

};

Path.prototype = {

	dispose: function() {

		this.context.paths.delete( this );

		this.list = undefined;
		this.parameters = undefined;
		this.callback = undefined;
		this.path = undefined;
		this.context = undefined;

		return undefined;

	},

	trigger: function( parameters ) {

		this.callback( undefined, parameters );

	},

	changePath: function( path ) {

		this.path = this.context.fixPath( path );

	}

};

module.exports = Path;
