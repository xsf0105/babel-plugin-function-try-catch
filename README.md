## babel-plugin-function-try-catch
> Babel plugin that can add `try/catch` to function automatically.


### Usage

Install:
```
yarn add babel-plugin-function-try-catch
or
npm install babel-plugin-function-try-catch
```

### Example

before:
```js
var fn = function(){
  console.log('hello world');
}
```

after:
```js
var fn = function () {
  try {
    console.log(2);
  } catch (error) {
    console.log(error);
  }
};
```

## How to config
webpack:
```diff
rules: [{
  test: /\.js$/,
  exclude: /node_modules/,
  use: [
+    "babel-plugin-function-try-catch",
    "babel-loader",
  ]
}]
```
