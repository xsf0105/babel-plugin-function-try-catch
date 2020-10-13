## babel4catch
一个自动给 function 函数加入 try/catch 的 babel loader

before:
```
var fn = function(){
  console.log('hello world');
}
```

after:
```
var fn = function () {
  try {
    console.log(2);
  } catch (error) {
    console.log(error);
  }
};
```


## How to config
.babelrc
```
{
  "plugins": ["babel4catch"]
}
```
