function Router ( ) {

	EventMock.call( this );

	this.hash = {

		current: {
			string: null
		},
		enabled: true,
		deltaTrigger: false

	};

	this.paths = {

		current: {
			string: '',
			list: [],
			parameters: {}
		},
		list: [],
		enabled: true,
		deltaTrigger: false

	};

	this.queries = {

		current: {
			string: '',
			list: []
		},
		enabled: true,
		deltaTrigger: false,
		list: []

	};

	this.fragment = {

		current: {
			string: '',
			value: ''
		},
		deltaTrigger: false

	};

	// Constructors
	this.Path = Path.bind( null, this );
	this.Query = Query.bind( null, this );
	this.Router = Router;

	// Hash Change
	this.on( 'hash-change', function( hash ) {

		this.hash.current.string = hash.string;

		// If: deltaTriggering is false or the paths are not equal.
		if( this.paths.enabled && ( !this.paths.deltaTrigger || 
			hash.paths.string !== this.paths.current.string ) ) {

			this.dispatch( 'path-change', hash.path );

		}

		// If: deltaTriggering is false or the paths are not equal.
		if( this.queries.enabled && ( !this.queries.deltaTrigger || 
			hash.queries.string !== this.queries.current.string ) ) {

			this.dispatch( 'queries-change', hash.queries );

		}

		// If: deltaTriggering is false or the paths are not equal.
		if( this.fragment.enabled && ( !this.fragment.deltaTrigger || 
			hash.fragment.string !== this.fragment.current.string ) ) {

			this.dispatch( 'fragment-change', hash.fragment );

		}

	} );

	this.on( 'path-change', function( path ) {

		this.paths.current = path;

		this.triggerPaths( path );

	} );

	this.on( 'queries-change', function( queries ) {

		this.queries.current = queries;

		this.triggerQueries( queries );

	} );

	this.on( 'fragment-change', function( fragment ) {

		this.fragment.current = fragment;

		this.triggerFragment( fragment );

	} );

	var hashChange = function() {

		if( this.hash.enabled ) {

			var hash = Utils.parseHash( window.location.hash );

			if( this.hash.enabled && ( !this.hash.deltaTrigger || 
				hash.string !== this.hash.current.string ) ) {

				this.dispatch( 'hash-change', hash );

			}

		}

	}.bind( this );

	window.addEventListener( 'hashchange', hashChange );

	hashChange();

};

Router.prototype = Object.assign( Object.create( EventMock.prototype ), {

	constructor: Router,

	// Hash
	setHash: function( hash, historyMethod = 'replace', trigger = true ) {

		hash = Utils.parseHash( hash );

		Utils.history( 
			historyMethod, 
			hash.string
		);

		if( trigger ) {

			if( this.hash.enabled ) {

				if( this.hash.enabled && ( !this.hash.deltaTrigger || 
					hash.string !== this.hash.current.string ) ) {

					this.dispatch( 'hash-change', hash );

				}

			}

		}

		return this;

	},

	getHash: function() {

		return this.hash.current.string;

	},

	enable: function() {

		this.hash.enabled = true;

		return this;

	},

	disable: function() {

		this.hash.enabled = false;

		return this;

	},


	// Path
	triggerPaths: function( path ) {

		path = Utils.parsePath( path );

		if( !this.paths.enabled ) return this;

		for( var i = this.paths.list.length - 1; 0 <= i; i -- ) {

			var regPath = this.paths.list[ i ];

			if( regPath.disposed ) this.paths.list.splice( i, 1 );

			var valid = regPath.validate( path );

			if( valid !== false ) {

				valid = Object.assign( valid, path );

				regPath.trigger( valid );

				if( !regPath.entered ) {

					regPath.dispatch( 'enter', valid );

				}

			}

			else if( regPath.entered ) {

				regPath.dispatch( 'leave', path );

			}

		}

		return this;

	},

	setPath: function( path, historyMethod = 'replace', trigger = true ) {

		path = Utils.parsePath( path );

		Utils.history( 
			historyMethod, 
			path.string + this.queries.current.string + this.fragment.current.string
		);

		if( trigger ) {

			this.triggerPaths( path );

		}

		return this;

	},

	getPath: function() {

		return this.paths.current.string;

	},

	enablePaths: function() {

		this.paths.enabled = true;

		return this;

	},

	disablePaths: function() {

		this.paths.enabled = false;

		return this;

	}, 


	// Queries
	triggerQueries: function( queries ) {

		if( !this.queries.enabled ) return this;

		queries = Utils.parseQueries( queries );

		for( var i = 0; i < queries.list.length; i ++ ) {

			for( var j = this.queries.list.length - 1; 0 <= j; j -- ) {

				var regQuery = this.queries.list[ j ];

				if( regQuery.disposed ) this.paths.list.splice( j, 1 );

				var valid = regQuery.validate( queries.list[ i ] );

				if( valid !== false ) {

					valid = Object.assign( valid, queries.list[ i ] );

					regQuery.trigger( valid );

				}

			}

		}

		return this;

	},

	setQueries: function( queries, historyMethod = 'replace', trigger = true ) {

		queries = Utils.parseQueries( path );

		Utils.history( 
			historyMethod, 
			this.paths.current.string + queries.string + this.fragment.current.string
		);

		if( trigger ) {

			this.triggerQueries( queries );

		}

	},

	getQueries: function() {

		return this.queries.current.string;

	},


	// Fragment
	triggerFragment: function( fragment ) {

		if( this.fragment.enabled ) {

			fragment = Utils.parseFragment( fragment );

			this.fragment.current = fragment;

			if( document.readyState === 'complete' ) {

			    var element = document.getElementById( fragment.value );

				if( element !== null ) {

					element.scrollIntoView();

				}

			}

			else {

			    window.addEventListener( 'DOMContentLoaded', function() {

			        var element = document.getElementById( fragment );

					if( element !== null ) {

						element.scrollIntoView();
					}

			    } );

			}

		}

	},

	setFragment: function( fragment, historyMethod = 'replace', trigger = true ) {

		fragment = Utils.parseFragment( fragment );

		Utils.history( 
			historyMethod, 
			this.paths.current.string + this.queries.current.string + fragment.string
		);

		if( trigger ) {

			this.triggerFragment( path );

		}

	},

	getFragment: function() {

		return this.fragment.current.string;

	},


	// Detach & Attach
	detach: function( instance ) {

		if( instance === undefined ) {

			this.detach( this.paths.list );
			this.detach( this.queries.list );

		}

		else if( !Utils.isArray( instance ) ) instance = [ instance ];

		if ( Utils.isArray( instance ) ) {

			var index;

			for( var i = 0; i < instance.length; i ++ ) {

				if( instance[ i ] instanceof Path ) {

					index = this.paths.list.indexOf( instance[ i ] );

					if( index !== -1 )  { 

						this.paths.splice( index, 1 );
						instance.detach( this, false );

					}

				}

				else if( instance instanceof Query ) {

					index = this.queries.list.indexOf( instance[ i ] );

					if( index !== -1 ) this.queries.splice( index, 1 );

				}

				else throw TypeError( 'The argument needs to be an instance of Path or Query or array of Paths and Queries.' );

			}

		}

	},

	attach: function( instance ) {

		if( !Utils.isArray( instance ) ) instance = [ instance ];

		if( Utils.isArray( instance ) ) {

			var index;

			for( var i = 0; i < instance.length; i ++ ) {

				if( instance[ i ] instanceof Path ) {

					index = this.paths.list.indexOf( instance[ i ] );

					if( index === -1 ) this.paths.list.push( instance[ i ] );

				}

				else if( instance[ i ] instanceof Query ) {

					index = this.queries.list.indexOf( instance[ i ] );

					if( index === -1 ) this.queries.list.push( instance[ i ] );

				}

				else throw TypeError( 'The argument needs to be an instance of Path or Query or array of Paths and Queries.' );

			}

		}

	},


	// Dispose
	dispose: function( detach = false ) {

		this.clearEventListeners();

		if( detach ) {

			this.detach();

		}

		for( var props in this ) {

			this[ props ] = undefined;

		}

		return undefined;

	}

} );
