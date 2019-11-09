# HashDress
An extra small and fast client-side routing library with a focus on API simplicity and usability. HashDress supports static, parametric and wildcard paths, query syntax and fragment-identifier functionality.

## Installation
### Client-side
The `HashDress.js` and `Hash>Dress.min.js` can be found inside the `src/` folder, once you have it in your project or wherever, add `<script src="path/to/HashDress.js" type="text/javascript"></scipt>` in the head or body of your html file, and your ready to roll!

### Server-side ( optional )
The server-side script is **very optional** and can be replaced with your own implementation. It basicly has one job: ff your server gets requested for example, the URL `https://example.com/blog/post-title/`, it will redirect you to `https://example.com/#/blog/post-title/`. Here it added the prefix `#/ infront of the url`.

The server file can also be found in the `src/` folder of this repository as `server.js`. It requires express to be installed so `npm install express` if you don't already have it. Or as I mentioned earlier: you could build one yourself with your own back-end frameworks, just check out the sourcecode of `server.js`. Then after you have the file where you need it run it `node server.js` and you're done (almost). The server file will make a folder named `public` in the same directory as `server.js` publicly available. This can be changed pretty easily to any folder you want by exchanging the path string to you own folder path.

## Usage

### Example Usage: creating a static Path.
Here's a setup where if the user supplies the address `http://example.com/#/` it will show `'Welcome to the root!', '#/'` in the console.
```javascript

var root = HashDress.Path( '#/', function( suppliedPath ) {

  console.log( 'Welcome to the root!', suppliedPath );

} );

```
### Example Usage: creating a wildcard Path.
Here's a setup where if the user supplies any address, for example `http://example.com/#/any/path/.../` it will show `'This is wild!', '#/any/path/.../'` in the console.
```javascript

var wildRoot = HashDress.Path( '#/*', function( suppliedPath ) {

  console.log( 'This is wild!', path );

} );
```

### Example Usage: creating a parametric Path.
Here's a setup where if the user supplies the address `http://example.com/#/my-category/some-title/` it will show `{ category: 'my-category', title: 'some-title' }, /my-category/some-title/'` in the console.
```javascript

var HashDress.Path( '#/:category/:title', function( path, params ) {

  console.log( params, path );

} );
```
