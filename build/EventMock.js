function EventMock() {};

EventMock.prototype = {

	constructor: EventMock,

	addEventListener: function( type, listener, context = this ) {

		if( this.listeners === undefined ) {

			this.listeners = {};

		}

		if( this.listeners[ type ] === undefined ) {

			this.listeners[ type ] = [];

		}

		this.listeners[ type ].push( { 

			listener: listener,
			context: context

		} );

	},

	on: function( type, listener, context = this ) {

		this.addEventListener( type, listener, context );

	},

	removeEventListener: function( type, listener ) {

		if( this.listeners === undefined ) return false;

		if( this.listeners[ type ] === undefined ) return false;

		for( var i = 0; i < this.listeners[ type ].length; i ++ ) {

			if( this.listeners[ type ][ i ].listener === listener ) {

				this.listeners[ type ].splice( i, 1 );

			}

		}

	},

	clearEventListeners: function() {

		if( this.listeners !== undefined ) this.listeners = undefined;

	},

	dispatch: function( type, data ) {

		if( this.listeners === undefined ) return false;

		if( this.listeners[ type ] === undefined ) return false;

		for( var i = 0; i < this.listeners[ type ].length; i ++ ) {

			this.listeners[ type ][ i ].listener.bind( 

				this.listeners[ type ][ i ].context

			)( data );

		}

	}

};
