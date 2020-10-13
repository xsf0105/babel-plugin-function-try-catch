## babel4catch

A babel plugin that automatically adds `try/catch` to function.(一个能为函数自动添加 `try/catch` 的 babel 插件)


### Install

```
yarn add babel4catch
or
npm install babel4catch
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
