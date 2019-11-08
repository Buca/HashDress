const HashDress = ( function() {

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

			return this;

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

	function Router( options = {} ) {

		// Options
		this.autoInit = options.autoInit !== undefined ? options.autoInit : false;

		// Hash/Router
		this.routerEnabled = options.routerEnabled || true;
		//this.listenToHashChanges = true;
		this.currentHash = undefined;

		// Paths
		this.pathsEnabled = true;
		this.paths = new Set();
		this.deltaTriggerPath = true;
		this.currentPath = {

			path: undefined,
			list: [],
			parameters: {}

		};

		// Query
		this.queriesEnabled = true;
		this.queries = new Map();
		this.deltaTriggerQueries = true;
		this.currentQueries = {

			queries: undefined,
			list: new Map()

		};

		// Fragment
		this.fragmentEnabled = true;
		this.currentFragment = undefined;

		// Constructors
		this.Path = Path;
		this.Query = Query;
		this.Router = Router;

		if( this.autoInit ) {

			this.init();

		}

	};

	Router.prototype = {

		_hashChange: function( hash, _historyMethod ) {

			if( this.currentHash !== hash && this.routerEnabled ) {

				var list,
					path, query, fragment;

				list = hash.split( '?' );

				if( list.length > 1 ) {

					list.push( ...list.pop().split( '#' ) );
					path = list[ 0 ];
					query = list[ 1 ];
					fragment = list.length > 2 ? list[ 2 ] : undefined;

				}

				else {

					list = list[ 0 ].substring( 1 ).split( '#' );
					path = '#' + list[ 0 ];
					query = undefined;
					fragment = list.length > 1 ? list[ 1 ] : undefined;

				}

				path = this._pathChange( path );
				query = this._queryChange( query );
				fragment = this._fragmentChange( fragment  ); 

				this.currentHash = path + query + fragment;

				if( _historyMethod === 'replace' ) {

					history.replaceState( null, null, this.currentHash );

				}

				else if( _historyMethod === 'push' ) {

					history.pushState( null, null, this.currentHash )

				}

			}

		},

		_pathChange: function( path ) {

			path = this.fixPath( path );

			if( ( this.currentPath.path !== path ||
				!this.deltaTriggerPath ) && this.pathsEnabled ) {

				this.triggerPath( path );

				this.currentPath.path = path;

			}

			return path;

		},

		_queryChange: function( queries ) {

			queries = queries !== undefined ? this.fixQueries( queries ) : '';

			if( ( !this.deltaTriggerQueries ||
				this.currentQueries !== queries ) &&
				this.queriesEnabled ) {


				this.triggerQueries( queries );

				this.currentQueries.queries = queries;

			}

			return queries;

		},

		_fragmentChange: function( fragment ) {

			if( this.fragmentEnabled && fragment !== undefined ) {

				this.triggerFragment( fragment );
				this.currentFragment = fragment;

			}

			return fragment !== undefined ? '#' + fragment : '';

		},

		setHash: function() {},

		setPath: function() {},

		setQuery: function() {},	

		fixPath: function( path ) {

			if( path.length > 1 ) {

				if( path[ 1 ] !== '/' ) {

					path = '#/' + path.substring( 1 );

				}

				else {

					path = '#/' + path.substring( 2 );

				}

				if( path.length > 2 && path[ path.length - 1 ] === '/' ) {

					path = path.substring( 0, path.length - 1 );

				}

			}

			else {

				path = '#/';

			}

			return path;

		},

		parsePath: function( path ) {

			// Path is assumed to be fixed.

			var list = path.split( '/' ),
				parameters = {};

			for( var i = 1; i < list.length; i ++ ) {

				if( list[ i ].indexOf( ':' ) !== -1 ) {

					parameters[ list[ i ].substring( 1 ) ] = {

						index: i

					};

				}

				else if( list[ i ] === '' ) {

					list.splice( i, 1 );

				}

			}

			return {

				path: path,
				list: list,
				parameters: parameters
				
			};

		},

		triggerPath: function( path ) {

			// Path is assumed to be fixed.

			// Parametric paths.
			var list = path.split( '/' );

			this.paths.forEach( function( entry ) {

				if( list.length === entry.list.length ||
					( entry.wild && entry.list.length <= list.length ) ) {

					for( var j = 0; j < entry.list.length; j ++ ) {

						if( entry.list[ j ][ 0 ] !== ':' &&
							list[ j ] !== entry.list[ j ] &&
							!( j === entry.list.length - 1 && entry.wild && entry.list[ j ] === list[ j ].substring( 0, entry.list ) ) ) {

							break;

						}

					}

					if( j === entry.list.length ) {

						var parameters = {};

						for( var param in entry.parameters ) {

							parameters[ param ] = 
								list[ entry.parameters[ param ].index ];

						}

						entry.callback( path, parameters );

					}

				}

			} );

		},

		fixQueries: function( query ) {

			if( query[ 0 ] !== '?' ) {

				query = '?' + query;

			}

			return query;

		},

		parseQueries: function( query ) {

			var list = query.split( '&' );

			list[ 0 ] = list[ 0 ].substring( 1 );

			for( var i = 0; i < list.length; i ++ ) {

				list[ i ] = list[ i ].split( '=' );

			}

			return list;

		},

		triggerQueries: function( queries ) {

			// remove queries

			queries = this.parseQueries( queries );

			var query;

			for( var i = 0; i < queries.length; i ++ ) {

				query = this.queries.get( queries[ i ][ 0 ] );

				if( query !== undefined && query.enabled ) {

					if( !this.deltaTriggerQueries ||
						query.value !== queries[ i ][ 1 ] ||
						!this.currentQueries.list.has( query.name ) ) {

						this.currentQueries.list.set( query.name, query );

						query.value = queries[ i ][ 1 ];
						query.method( query.value );

					}

				}

			}

		},

		triggerFragment: function( fragment ) {

			if( document.readyState === 'complete' ||
				document.readyState === 'interactive' ) {

			    var element = document.getElementById( fragment );

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

		},

		init: function() {

			this._hashChange( window.location.hash, 'replace' );

			var hashChange = function() {

				this._hashChange( window.location.hash, 'replace' );

			};
			
			hashChange = hashChange.bind( this );

			window.addEventListener( 'hashchange', hashChange );

		}

	};

	return new Router();

} )();
