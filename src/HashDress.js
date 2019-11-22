const HashDress = ( function() {

	const Utils = {

		history: function( method, hash ) {

			if( method === 'replace' ) {

				history.replaceState( null, null, hash );

			}

			else if ( method === 'push' ) {

				history.pushState( null, null, hash );

			}

		},

		// Type Checks
		isString: function( string ) {

			return typeof string === 'string'; 

		},

		isArray: function( array ) {

			return Array.isArray( array );

		},

		// Hash
		parseHash: function( hash ) {

			var path = Utils.parsePath( Utils.extractPath( hash ) ),
				queries = Utils.parseQueries( Utils.extractQueries( hash ) ),
				fragment = Utils.parseFragment( Utils.extractFragment( hash ) );

			return {

				string: path.string + queries.string + fragment.string,
				path: path,
				queries: queries,
				fragment: fragment

			};

		},

		// Path
		parsePath: function( path ) {

			if ( !Utils.isString( path ) ) return path;

			var result = {

				string: path,
				list: []

			};

			path = path.split( '/' );

			for( var i = 0; i < path.length; i ++ ) {

				result.list[ i ] = {

					string: path[ i ],
					list: path[ i ].split( '-' ),
					parameters: {},
					listIndex: i

				}

				for( var j = 0; j < result.list[ i ].list.length; j ++ ) {

					if( result.list[ i ].list[ j ][ 0 ] === ':' ) {

						result.list[ i ].parameters[ result.list[ i ].list[ j ].substring( 1 ) ] = {

							listIndex: j,
							validate: undefined

						};

					}

				}

			}

			return result;

		},

		extractPath: function( hash ) {

			var queryIndex = hash.indexOf( '?', 2 ),
				fragIndex = queryIndex === -1 ? hash.indexOf( '#', 2 ) : -1;

			if( queryIndex !== -1 ) {

				hash = hash.substring( 0, queryIndex ); 

			}

			else if( fragIndex !== -1 ) {

				hash = hash.substring( 0, fragIndex );

			}

			return hash;

		},

		replacePath: function( hash, path ) {

			var queryIndex = hash.indexOf( '?', 2 ),
				fragIndex;

			if( queryIndex !== -1 ) {

				return path + hash.substring( queryIndex );

			}

			else {

				fragIndex = hash.indexOf( '#', 2 );

				if( fragIndex !== -1 ) {

					return path + hash.substring( fragIndex );

				}

			}

			return path;

		},

		validatePaths: function( validPath, path ) {

			path = Utils.parsePath( path );

			var validSeg, seg, paramName, parameters = {};

			for( var i = 0; i < validPath.list.length; i ++ ) {

				validSeg = validPath.list[ i ];

				if( validSeg.list[ validSeg.list.length - 1 ] )

				seg = path.list[ i ];

				for( var j = 0; j < validSeg.list.length; j ++ ) {

					if( j === validSeg.list.length - 1 &&
					    validSeg.list[ j ][ validSeg.list[ j ].length - 1 ] === '*' ) {

						return parameters;

					}

					else if( validSeg.list[ j ][ 0 ] !== ':' &&
						validSeg.list[ j ] !== seg.list[ j ] ) {

						return false;

					}

					else if( validSeg.list[ j ][ 0 ] === ':' ) {

						paramName = validSeg.list[ j ].substring( 0 );

						if( validSeg
								.list[ j ]
								.parameters[ paramName ]
								.validate !== undefined &&
							!validSeg
								.list[ j ]
								.parameters[ paramName ]
								.validate( seg.list[ j ] ) ) {

							return false;

						}

						else {

							parameters[ paramName ] = seg.list[ j ];

						}

					}

					// WILDCARD!

				}

			}

			return parameters;

		},

		// Queries
		parseQueries: function( queries ) {

			if ( !Utils.isString( queries ) ) return queries;

			var result = {

				string: queries,
				list: []

			};

			if ( queries === '' ) return result;

			queries = queries.substring( 1 ).split( '&' );

			for( var i = 0; i < queries.length; i ++ ) {

				var pair = queries[ i ].split( '=' );

				result.list[ i ] = {

					string: queries[ i ],
					name: pair[ 0 ],
					value: pair[ 1 ],
					listIndex: i

				};

			}

			return result;

		},

		extractQueries: function( hash ) {

			var queryIndex = hash.indexOf( '?', 2 ),
				fragIndex;

			if( queryIndex !== -1 ) {

				fragIndex = hash.indexOf( '#', 2 );

				if( fragIndex !== -1 ) {

					return hash.substring( queryIndex, fragIndex );

				}

				else {

					return hash.substring( queryIndex );

				}

			}

			return '';

		},

		// Query
		parseQuery: function( query ) {

			if( !Utils.isString( query ) ) return query;

			var pair = query.split( '=' );

			return {

				string: query,
				name: pair[ 0 ],
				value: pair[ 1 ]

			};

		},

		validateQuery: function( validQuery, query ) {

			query = Utils.parseQuery( query );

			if( query === undefined ) return false;

			if( query.name === validQuery.name ) {

				if( validQuery.valueParser !== undefined ) {

					query.value = validQuery.valueParser( query.value );

				}

				return query;

			}

			return false;

		},

		extractQuery: function( hash, queryName ) {

			var queries = Utils.extractQueries( hash );

			queries = Utils.parseQueries( queries );

			for( var i = 0; i < queries.list.length; i ++ ) {

				if( queries.list[ i ].name === queryName ) {

					return queries.list[ i ];

				}

			}

		},

		// Fragment
		parseFragment: function( fragment ) {

			return {

				string: fragment,
				value: fragment.substring( 1 )

			};

		},

		extractFragment: function( hash ) {

			var fragIndex = hash.indexOf( '#', 2 );

			if( fragIndex !== -1 ) {

				return hash.substring( fragIndex );

			}

			return '';

		}

	};

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

	window[ 'HashDress' ] = new Router();

} )();
