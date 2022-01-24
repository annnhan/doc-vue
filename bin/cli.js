#!/usr/bin/env node

const fs = require('fs');
// const path = require('path');
const parser = require('../parser');
const argv = require('minimist')(process.argv.slice(2));
const defaultConfig = require('../config');
const type = argv.t || defaultConfig.type;
const inputFilePath = argv._[0];
const outputFilePath = argv._[1];
const code = fs.readFileSync(inputFilePath).toString();
const result = parser(code, {type});
fs.writeFileSync(outputFilePath, type === 'json' ? JSON.stringify(result, null, 2) : doc);
 