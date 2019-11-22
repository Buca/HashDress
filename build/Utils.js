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
