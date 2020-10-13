const traverse = require("babel-traverse").default;
const t = require("babel-types");
const parser = require("@babel/parser");
const core = require("@babel/core");
var template = require("@babel/template");
var DISABLE_COMMENT = 'disable-try-catch';
var LIMIT_LINE = 0;

// 这里可以做点什么，比如用 sdk 将错误捕获上报等
// const reporter = () => {
//   console.log(error);
// }

const generateTryCatch = (path) => {
  try {
    var node = path.node,
        params = node.params,
        blockStatement = node.body,
        isGenerator = node.generator,
        isAsync = node.async;

    // =================================== 边界情况 return 处理 ============================
    // 1、如果有try catch包裹了，则不需要
    // 2、防止 circle loops 
    // 3、需要 try catch 的只能是语句，像 () => 0 这种的 body，是不需要的
    // 4、如果函数内容小于等于 LIMIT_LINE 行不 try catch，当然这个函数可以暴露出来给用户设置
    if (blockStatement.body && t.isTryStatement(blockStatement.body[0])
      || !t.isBlockStatement(blockStatement) && !t.isExpressionStatement(blockStatement)
      || blockStatement.body && blockStatement.body.length <= LIMIT_LINE) {
      return;
    }

    // 获取函数开头注解，如果注解为 disable-try-catch 则跳过
    var commentsNode = blockStatement.body.length > 0
      ? blockStatement.body[0].leadingComments
      : blockStatement.innerComments || blockStatement.trailingComments
    if (commentsNode && commentsNode[0].value.indexOf(DISABLE_COMMENT) > -1) {
      path.skip();
    }


    // =================================== 编辑新节点 ============================
    var catchStatement = template.statement(`console.log(error)`)(); // 将 console.log(error) 转为 ast，如下：
    /**
     * catchStatement {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: [Object],
            property: [Object],
            computed: false,
            loc: undefined
          },
          arguments: [ [Object] ],
          loc: undefined
        },
        loc: undefined
      }
      
      也可以下面这样做：
      var catchStatement = template.statement(`var t = ${reporter.toString()}`)();
      var catchBody = catchStatement.declarations[0].init.body;
     */
    var catchClause = t.catchClause(t.identifier('error'),
      t.blockStatement(
        [catchStatement] //  catchBody
      )
    );
    var tryStatement = t.tryStatement(blockStatement, catchClause);


    // =================================== 插入新节点 ============================
    var func = null;
    // 判断：类方法、对象方法、函数申明、函数表达式
    if (t.isClassMethod(node)) {
      // 用 t.classMethod 生成 ast
      func = t.classMethod(node.kind, node.key, params, t.BlockStatement([tryStatement]), node.computed, node.static); // t.BlockStatement([tryStatement]) 新的 ast 节点
    } else if (t.isObjectMethod(node)) {
      func = t.objectMethod(node.kind, node.key, params, t.BlockStatement([tryStatement]), node.computed);
    } else if (t.isFunctionDeclaration(node)) {
      func = t.functionDeclaration(node.id, params, t.BlockStatement([tryStatement]), isGenerator, isAsync);
    } else {
      func = t.functionExpression(node.id, params, t.BlockStatement([tryStatement]), isGenerator, isAsync);
    }


    // =================================== 替换 ============================
    path.replaceWith(func);
  } catch(error) {
    throw error;
  }
}

module.exports = function(source) {
  // 1、源码解析
  let ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["dynamicImport"]
  });

  // 2、遍历
  traverse(ast, {
    FunctionExpression(path, state) { // Function 节点
      console.log('Function 函数!')
      generateTryCatch(path);
    },
    ArrowFunctionExpression(path, state){ // 箭头函数 节点
      console.log('箭头函数!')
      generateTryCatch(path);
    },
    // JS的其它表达（如class、for、switch等）共170种左右...
  });

  //  3、转为处理后的源码，形如：
  /**
   * var fn = function () {
        try {
          console.log(t);
        } catch (error) {
          console.log(error);
        }
      };
   */
  return core.transformFromAstSync(ast, null, {
    configFile: false // 屏蔽 babel.config.js，否则会注入 polyfill 使得调试变得困难
  }).code;
}