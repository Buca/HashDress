# HashDress
A library to handle changes in the URLs hash. It's kind of like like a server framework, supports directories, redirecting, and query strings ( in a very generalized manner ), but instead of using a server it's done all in the client.

## Installation
### Client-side
The `HashDress.js` can be found inside the `src/` folder, once you have it in your project or wherever, add `<script src="path/to/HashDress.js" type="text/javascript"></scipt>` in the head or body of your html file. Then create a new hash managing unit from the HashDress `constructor` with:

```javascript
const myHashManager = new HashDress();
```
And your ready to roll!

### Server-side ( optional )
The server-side script is very optional and can be replaced with your own implementation. It basicly has one job: If your server gets requested the URL `https://example.com/blog/post-title/` it will redirect you to `https://example.com/#/blog/post-title/`, so it adds `#/` if neccesary.

The server file can be found in the root this repository as `server.js` it requires for express to be installed so `npm install express` if you don't already have it. Or as I mentioned earlier: you could build one yourself with your own back-end frameworks, just check out the sourcecode of `server.js`. Then after you have the file where you need it run it `node server.js` and you're done (almost). The server file assumes that you want to make folder `src/` public, do you can change that pretty easily to any folder you want:  just change the string to you own folder path.

## Setup

### A basic setup
Here's a basic setup where if the user supplies the address `http://example.com/#/only-this/` it will show an alert with text: `Only this page is available.' and an alert with text: 'You're at the wrong place maan.'
```javascript

const myHashManager = new HashDress();

myHashManager.createDir( '#/only-this/', function( path /* this is the path supplied by the user */ ) {

  if( path !== '#/only-this/' ) {
     
     alert( "You're at the wrong place maan." );
    
  }
  
  else {
    
    alert( "Only this page is available." );
  
  }

} );

// Running the init function is not optional
// and if you want HashDress to react with
// your directories and query ( methods ),
// you need to define them before running .init() .

myHashManager.init();

```

