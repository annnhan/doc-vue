// 根据 vue 文件语法解析 API 文档
const os = require('os');
const {marked} = require ('marked');
const json2md = require("json2md")
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
  (eventsNode.elements || eventsNode.value.elements).forEach((node) => {
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
  (propsNode.properties || propsNode.value.properties).forEach((node) => {
    if (node.leadingComments && node.leadingComments.length) {
      const commentNode = node.leadingComments[0];
      const descContent = commentNode.value.trim();
      if (docIdentifierReg.test(descContent)) {
        const prop = {
          name: node.key.name,
          ...parseComment(commentNode),
        };
        (node.properties || node.value.properties).forEach((item) => {
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
  (methodsNode.properties || methodsNode.value.properties).forEach((node) => {
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
  const ret = parseSFC(code);
  const { template, script , scriptSetup} = ret.descriptor;
  const scriptAST = parseScriptAST((script || scriptSetup).content);
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
      if (callNode.callee.name === 'defineProps') {
        const argNode = callNode.arguments[0];
        json.props = genProps(callNode.arguments[0]);
      }
      if (callNode.callee.name === 'defineEmits') {
        const argNode = callNode.arguments[0];
        json.events = genEvents(argNode);
      }
    },
  });
  return json;
}

function genMd(code){
  const json =  genJson(code);
  const mdList = [];
  Object.keys(json).forEach(key => {
    mdList.push({h2: key});
    const docs = json[key];
    if(docs && docs.length) {
      const table = {rows: []};
      mdList.push({table});
      switch (key) {
        case 'slots':
        case 'events':
          table.headers = ['name','desc']
          break;
        case 'props':
          table.headers = ['name','type','desc','default','required']
          break;
        case 'methods':
          table.headers = ['name','desc','params','returns']
          break;
        default:
          break;
      }
      docs.forEach(doc => {
        if(key === 'methods' && doc.params && doc.params.length) {
          doc.params = doc.params.map(param => {
            return `${param.name}: ${param.desc}`
          }).join('</br>')
        }
        doc.params = doc.params || '';
        doc.default = doc.default || '';
        doc.required = doc.required || '';
        doc.type = doc.type || '';
        doc.returns = doc.returns || '';
        table.rows.push(doc);
      })
    }
    
  });
  return json2md(mdList);;
}

function genHtml(code){
  return marked.parse(genMd(code));
}

module.exports = function(code = '', config = {}){
  config = Object.assign({}, defaultConfig, config);
  switch (config.type) {
    case 'html':
      return genHtml(code);
    case 'md':
      return genMd(code);
    default:
      return genJson(code);
  }
}