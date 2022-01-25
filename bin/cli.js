#!/usr/bin/env node
const fs = require('fs');
// const path = require('path');
const parser = require('../parser');
const argv = require('minimist')(process.argv.slice(2));
const defaultConfig = require('../config');
const inputFilePath = argv._[0];
const outputFilePath = argv._[1];

let type = outputFilePath.split('.').pop().trim();
type = /^(json|md|html)$/.test(type) ? type : defaultConfig.type;

const code = fs.readFileSync(inputFilePath).toString();
const result = parser(code, {type});
fs.writeFileSync(
  outputFilePath || `${inputFilePath}.${type}`, 
  type === 'json' ? JSON.stringify(result, null, 2) : result
);
 