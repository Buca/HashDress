function Query( name, method, context = HashDress, checkHash = true ) {

	this.context = context;
	this.context.queries.set( name, this );

	this.name = name;
	this.method = method.bind( this );

	this.value = undefined;

	this.enabled = true;

};

Query.prototype = {

	enable: function() {

		this.enabled = true;

		return this;

	},

	disable: function() {

		this.enabled = false;

		return this;

	},

	trigger: function( value ) {

		this.method( value );

	},

	dispose: function() {

		this.context.query.delete( this.name );

		this.name = undefined;
		this.method = undefined;
		this.value = undefined;
		this.enabled = undefined;
		this.context = undefined;

		return undefined;

	}

};

module.exports = Query;
