const HashDress = (function() {

	let scope;

	function HashDress () {

		scope = this;

		this._currentHash = null;		 //string
		this._currentDirectory = null; //string
		this._currentQueries = null;   //string

		this._queryMethods = {};

		this._directories = {};
		this._wildcards = {};

		this._enableClosestMatch = true;


	};

	HashDress.prototype = Object.assign( HashDress.prototype, {

		/*
		**	PRIVATE
		*/

		_stringEquality: function( itemA, itemB ) {

			const stringA = typeof itemA !== 'string' ? JSON.stringify( itemA ) : itemA,
				  stringB = typeof itemB !== 'string' ? JSON.stringify( itemB ) : itemB;

			if( stringA === stringB ) return true;

			return false;

		},

		_shallowEquality: function( itemA, itemB ) {

			const keysA = itemA.keys(),
				  keysB = itemB.keys();

			if( keysA.length === keysB.length ) {


				for( var i = 0; i < keysA.length; i ++ ) {

					if( itemA[ keysA[ i ] ] !== itemB[ keysA[ i ] ] )  {

						return false;

					}

				}

				return true;

			}

			return false;

		},


		/* Hash related private methods */

		_onHash: function( hash ) {

			// Check that the hashes are equal

			if( this._currentHash !== hash ) {

				const parsed = hash.split( '?' );

				//parsed[ 0 ] = directory path
				//parsed[ 1 ] = query string(s)

				parsed[ 0 ] = this._onDir( parsed[ 0 ] );

				this._currentHash = parsed[ 0 ];

				if( parsed.split > 1 ) {

					const query = hash.substr( parsed[ 0 ].length );

					parsed[ 1 ] = this._onQuery( query );

					/* question mark will be added by the _onQuery */

					if( parsed[ 1 ].length > 0 )

					this._currentHash += '?' + parsed[ 1 ];

				}

				history.replaceState( null, null, this._currentHash );

			}

		},


		/* Directory related private methods */

		_smallestParentDirectory: function( path ) {

			let parentPath = undefined;

			for ( let dirPath in this._directories ) {

				if ( path.length >= dirPath.length && path.indexOf( dirPath ) !== -1 && ( parentPath === undefined || parentPath.length < dirPath.length  ) ) {

					parentPath = dirPath;

				}

			}

			return parentPath;

		},

		_fixDir: function( path ) {

			if( path.length > 1 ) {

				if( path[ 1 ] !== '/' ) {

					path = '#/' + path.substr( 1 );

				}

				else {

					path = '#/' + path.substr( 2 );
				}

			}

			else {

				path = '#/';

			}

			return path;

		},

		_runDir: function( path, _notFound = true ) {

			for( let wildcard in this._wildcards ) {

				let subPath;

				if( wildcard.length < path.length ) {

					subPath = path.substring( 0, wildcard.length - 1 ) + '*';

					if( wildcard === subPath ) {

						this._wildcards[ wildcard ]( path );

					}

				}

			}

			if( this._directories[ path ] !== undefined ) {

				this._directories[ path ]( path );

			}

			else if( this._enableClosestMatch ) {

				let parentPath;

				parentPath = this._smallestParentDirectory( path );

				if ( parentPath !== undefined ) {

					this._directories[ parentPath ]( path );

				}

				else if( this._directories[ 'not-found' ] !== undefined && _notFound ) {

					this._directories[ path ]( path );

				}

			}

			else if( this._directories[ 'not-found' ] !== undefined && _notFound ) {

				this._directories[ path ]( path );

			}

		},

		_onDir: function( path ) {

			if( this._currentDirectory !== path ) {

				path = this._fixDir( path );

				if ( this._currentDirectory !== path ) {

					this._currentDir = path;

					this._runDir( path );

				}

				return path;

			}

		},


		/* Query related private methods */

		_fixQuery: function( query ) {

			/* should probably return a set of queries */

			/* check wheter the question mark is inside quates don't remove those */
			/* replace all other question marks with 'and': & */

			const queries = query.split( '?' );

			query = queries[ 0 ];

			for( var i = 1; i < queries.length; i ++ ) {

				query += '&' + queries[ i ];


			}

			return query;

		},

		_runQuery: function( query ) {

			const queries = query.split( '&' );

			for( var i = 0; i < queries.length; i ++ ) {

				let queryItem, queryName, queryParam;

				queryItem = queries[ i ].split( '=' );

				queryName = queryItem[ 0 ];
				queryParam = JSON.parse( queryItem[ 1 ] );

				if( this._queryMethods[ queryName ] !== undefined && 
					!this._queryMethods[ queryName ].equal( this._queryMethods[ queryName ].param, param ) ) {

					this._queryMethods[ queryName ].param = queryParam;

					this._queryMethods[ queryName ].method( queryParam );

				}

			}

		},

		_onQuery: function( query ) {

			if( this._currentQueries !== query ) {

				query = this._fixQuery( query );

				if ( this._currentQueries !== query ) {

					this._currentQueries = query;
					this._runQuery( query );

				}

			}

			return query;

		},


		/*
		** PUBLIC METHODS
		*/

		/* Directory related public methods */

		createDir: function( path, callback ) {

			path = this._fixDir( path );

			//console.log(path)

			if( path[ path.length - 1 ] === '*' ) {

				this._wildcards[ path ] = callback

			} else {

				this._directories[ path ] = callback;

			}

		},

		setDir: function( path, _history = 'replace' ) {

			path = this._fixDir( path );

			this._currentHash = path + this._currentQueries;

			this._runDir( path );

			if( _history === 'replace' ) {

				history.replaceState( null, null, this._currentHash );

			}

			else if( _history === 'push' ) {

				history.pushState( null, null, this._currentHash )

			}

		},
		
		disposeDir: function( path ) {

			path = this._fixDir( path );

			this._directories[ path ] = undefined;

		},

		/* Query related public methods */

		createQuery: function( name, method, _equality = this._stringEquality ) {

			this._queryMethods[ name ] = {

				name: name,
				method: method,
				equality: _equality,
				param: undefined

			};

		},

		setQuery: function( name, param, _history = 'replace' ) {

			if( this._currentQueryMethods[ name ] === undefined ) {

				this._currentQueryMethods[ name ] = this._queryMethods[ name ];

				if( this._currentQueries.length === 0 ) {

					this._currentQueries += '?';

				}

			}

			this._currentQueries += name + '=' + JSON.stringify( param );

			this._currentHash = this._currentDirectory + this._currentQueries;

			this._currentQueryMethods[ name ].method( param );

			if( _history === 'replace' ) {

				history.replaceState( null, null, this._currentHash );

			}

			else if( _history === 'push' ) {

				history.pushState( null, null, this._currentHash )

			}

		},

		removeQuery: function( name, _history = 'replace' ) {

			if( this._currentQueryMethods[ name ] !== undefined ) {

				this._currentQueryMethods[ name ] = undefined;

				const queryString = name + '=' + JSON.stringify( this._queryMethods.param ),
					  index = this._currentQueries.indexOf( queryString );

				this._currentQueries = this._currentQueries.substring( 0, index )
									 + this._currentQueries.substring( queryString.length + ( queryString.length + 1 < this._currentQueries.length ? 1 : 0 ), this._currentQueries.length );

				if( this._currentQueries.length === 1 ) {

					this._currentQueries = '';

				}

				this._currentHash = this._currentDirectory + this._currentQueries;

				if( _history === 'replace' ) {

					history.replaceState( null, null, this._currentHash );

				}

				else if( _history === 'push' ) {

					history.pushState( null, null, this._currentHash )

				}

			}
		
		},

		disposeQuery: function( name, _history = 'replace' ) {

			if( this._queryMethods[ name ] !== undefined ) {

				this.removeQuery( name, _history );

				this._queryMethods[ name ] = undefined;

			}

		},
		
		init: function() {

			this._onHash( window.location.hash );

			window.addEventListener( 'hashchange', function () {

				scope._onHash( window.location.hash );

			} );

		}

	} );

	return HashDress;

} )();
