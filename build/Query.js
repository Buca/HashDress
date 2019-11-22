function Query( router, name, onTrigger, checkCurrent = true ) {

	EventMock.call( this );

	if( router !== undefined ) router.attach( this );

	this.name = name;
	this.value = undefined;

	this.enabled = true;
	this.entered = false;
	this.triggerContext = this;
	this.onTrigger = onTrigger;

	this.disposed = false;

	if( this.enabled && checkCurrent ) {

		var query = Utils.parseQuery( Utils.extractQuery( window.location.hash, this.name ) ),
			valid = this.validate( query );

		if( valid !== false ) {

			this.trigger( valid );

		}

	}

};

Query.prototype = Object.assign( Object.create( EventMock.prototype ), {

	constructor: Query,

	trigger: function( query, context = this.triggerContext ) {

		query = Utils.parseQuery( query );

		this.value = query.value;

		this.onTrigger.bind( context )( query );
		this.dispatch( 'trigger', query );

		return this;

	},

	validate: function( query ) {

		return Utils.validateQuery( this, query );

	},

	enable: function() {

		this.enabled = true;

		return this;

	},

	disable: function() {

		this.enabled = false;

		return this;

	},

	dispose: function( router ) {
		
		this.clearEventListeners();

		for( var props in this ) {

			this[ props ] = undefined;

		}

		this.disposed = true;

		return undefined;

	}

} );
