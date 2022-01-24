// 根据 vue 文件语法解析 API 文档
const os = require('os');

const { parse, babelParse } = require('@vue/compiler-sfc');
const traverse = require('@babel/traverse').default;
const defaultConfig = require('./config');
const docIdentifierReg = /^[\s*]*?@doc/;

let scriptCode = '';

// 解析注释中的文档内容
function parseComment(commentNode) {
  const result = {};
  const { value } = commentNode;
  let lines = value.split(/\r?\n/);
  lines = lines.map((l) => l.trim().replace(/^\*\s*/, '')).filter((i) => !!i);
  lines.forEach((line) => {
    const [key, ...desc] = line.split(' ');
    const docKey = key.replace(/^@/, '').replace(/^doc/, 'desc');
    if (docKey === 'param') {
      const [paramName, ...paramDesc] = desc;
      const param = {
        name: paramName.trim(),
        desc: paramDesc.join(' ').trim(),
      };
      if (result.params) {
        result.params.push(param);
      } else {
        result.params = [param];
      }
    } else {
      result[docKey] = desc.join(' ').trim();
    }
  });
  return result;
}

// 根据 loc 截取字符;
function getLocContent(loc) {
  const lines = scriptCode.split(/\r?\n/).filter((lineContnt, index) => {
    return index >= loc.start.line - 1 && index <= loc.end.line - 1;
  });
  const lastIdx = lines.length - 1;
  if (lines.length === 1) {
    return lines[0].substring(loc.start.column, loc.end.column);
  }
  lines[0] = lines[0].substring(loc.start.column);
  lines[lastIdx] = lines[lastIdx].substring(0, loc.end.column);
  return lines.join(os.EOL);
}

// 解析 SFC
function parseSFC(code) {
  return parse(code);
}

// 解析 JS AST
function parseScriptAST(code) {
  scriptCode = code;
  return babelParse(scriptCode, {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}

// 提取 slots 文档
function genSlots(ast) {
  const result = [];
  (function find(node, index, list) {
    if (node.tag === 'slot') {
      const desc = list[index - 2];
      if (desc && desc.type === 3) {
        const descContent = desc.content.trim();
        if (docIdentifierReg.test(descContent)) {
          result.push({
            name: node.props.filter((prop) => prop.name === 'name')[0].value.content,
            ...parseComment({ value: descContent }),
          });
        }
      }
    }
    if (node.children && node.children.length) {
      node.children.forEach((n, i) => {
        find(n, i, node.children);
      });
    }
  })(ast);
  return result;
}

// 提取事件文档
function genEvents(eventsNode) {
  const result = [];
  eventsNode.value.elements.forEach((node) => {
    if (node.leadingComments && node.leadingComments.length) {
      const commentNode = node.leadingComments[0];
      const descContent = commentNode.value.trim();
      if (docIdentifierReg.test(descContent)) {
        const prop = {
          name: node.value,
          ...parseComment(commentNode),
        };
        result.push(prop);
      }
    }
  });
  return result;
}

// 提取 props 文档
function genProps(propsNode) {
  const result = [];
  propsNode.value.properties.forEach((node) => {
    if (node.leadingComments && node.leadingComments.length) {
      const commentNode = node.leadingComments[0];
      const descContent = commentNode.value.trim();
      if (docIdentifierReg.test(descContent)) {
        const prop = {
          name: node.key.name,
          ...parseComment(commentNode),
        };
        node.value.properties.forEach((item) => {
          const valueNode = item.value;
          let value = valueNode.value ?? valueNode.name ?? valueNode.expression?.name;
          if (valueNode.type === 'ArrowFunctionExpression') {
            value = getLocContent(valueNode.body.loc);
          } else {
            value = getLocContent(valueNode.loc);
          }
          prop[item.key.name] = value;
        });
        result.push(prop);
      }
    }
  });
  return result;
}
// 提取 methods 文档
 function genMethods(methodsNode) {
  const result = [];
  methodsNode.value.properties.forEach((node) => {
    if (node.leadingComments && node.leadingComments.length) {
      const commentNode = node.leadingComments[0];
      const descContent = commentNode.value.trim();
      if (docIdentifierReg.test(descContent)) {
        const method = {
          name: node.key.name,
          ...parseComment(commentNode),
        };
        result.push(method);
      }
    }
  });
  return result;
}

// 生成文档 json 数据
function genJson(code) {
  const { template, script } = parseSFC(code).descriptor;
  const scriptAST = parseScriptAST(script.content);
  const json = {
    slots: genSlots(template.ast),
  };
  traverse(scriptAST, {
    CallExpression(p) {
      const callNode = p.node;
      if (callNode.callee.name === 'defineComponent') {
        const argNode = callNode.arguments[0];
        argNode.properties.forEach((optionNode) => {
          switch (optionNode.key.name) {
            case 'props':
              json.props = genProps(optionNode);
              break;
            case 'methods':
              json.methods = genMethods(optionNode);
              break;
            case 'emits':
              json.events = genEvents(optionNode);
              break;
            default:
              break;
          }
        });
      }
    },
  });
  return json;
}

module.exports = function(code = '', config = {}){
  config = Object.assign({}, defaultConfig, config);
  switch (config.type) {
    case 'html':
      break;
    case 'md':
      break;
    default:
      return genJson(code);
  }
}