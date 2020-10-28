const parser = require("@babel/parser");
const traverse = require("babel-traverse").default;
const t = require("babel-types");
const template = require("@babel/template");
const core = require("@babel/core");
const LIMIT_LINE = 0;

module.exports = function(source) {
  // 1、解析
  let ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["dynamicImport"]
  });

  // 2、遍历
  traverse(ast, {
    FunctionExpression(path, state) { // Function 节点
      var node = path.node,
          params = node.params,
          blockStatement = node.body, // 函数function内部代码，将函数内部代码块放入 try 节点
          isGenerator = node.generator,
          isAsync = node.async;

      // =================================== 边界情况 return 处理 ============================
      // 1、如果有 try catch 包裹了
      // 2、防止 circle loops
      // 3、需要 try catch 的只能是语句，像 () => 0 这种的 body
      // 4、如果函数内容小于多少行数
      if (blockStatement.body && t.isTryStatement(blockStatement.body[0])
        || !t.isBlockStatement(blockStatement) && !t.isExpressionStatement(blockStatement)
        || blockStatement.body && blockStatement.body.length <= LIMIT_LINE) {
        return;
      }

      // 创建 catch 节点中的代码
      var catchStatement = template.statement(`ErrorCapture(error)`)();
      var catchClause = t.catchClause(t.identifier('error'),
            t.blockStatement(
              [catchStatement] //  catchBody
            )
          );

      // 创建 try/catch 的 ast
      var tryStatement = t.tryStatement(blockStatement, catchClause);
      // 创建新的函数节点
      var func = func = t.functionExpression(node.id, params, t.BlockStatement([tryStatement]), isGenerator, isAsync);
        
      // 替换原节点
      path.replaceWith(func);
    },
  });

  // 3、生成source源码
  return core.transformFromAstSync(ast, null, {
    configFile: false,
  }).code;
}