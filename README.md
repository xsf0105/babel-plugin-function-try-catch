## babel4catch

一个自动给 function 函数加入 `try/catch` 的 `babel plugin`


### Install

```
yarn add babel4catch
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
webpack
```diff
rules: [{
  test: /\.js$/,
  exclude: /node_modules/,
  use: [
+    "babel4catch",
    "babel-loader",
  ]
}]
```
