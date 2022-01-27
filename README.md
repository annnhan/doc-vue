# doc-vue
<a href="https://www.npmjs.com/package/doc-vue"><img src="https://img.shields.io/npm/v/doc-vue" /></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/badge/node-%3E%3D12.2.0-blue" /></a>
<a href="https://github.com/annnhan/doc-vue/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" /></a>
<a href="https://github.com/annnhan/doc-vue/blob/main/README-CN.md"><img src="https://img.shields.io/badge/-简体中文-yellowgreen" /></a>

A API documentation generator for Vue3 single file component.
## Table of Contents

- [Installation](#installation)
- [Write API Description](#write-API-description)
- [Command Line Usage](#command-line-usage)
- [Programmatic Usage](#programmatic-usage)
- [Options](#options)
- [License](#license)

## Installation

```bash
# for local
npm i doc-vue

# or for global
npm i -g doc-vue
```

## Documentation Syntax
Add a comment beginning with "@doc" as api description at the "slot", "props", "emits", "methods" declarations in the code. 

```js
<template>
  <div class="component-crt-crud">
    <!-- @doc the custom actions buttons -->
    <slot name="customAction"></slot>
    <!-- @doc the modal content -->
    <slot name="modal"></slot>
  </div>
</template>
<script lang="ts">
  import { defineComponent} from 'vue';
  export default defineComponent({

    props: {
      // @doc name of crud
      crudName: {
        type: String,
        default: '',
      },
      // @doc modal form fieds
      modalFormSchema: {
        type: Array as PropType<SearchSchema[]>,
        default: () => [],
      },
    },

    emits: [
      // @doc download button click event
      'downloadClick',
    ],

    setup() {
      return {};
    },
    methods: {
      /**
       * @doc show detal 
       * @param record detail data object
       */
      async show(record: BaseObject) {
        //...
      },

      // @doc fetch table data 
      async fetchList() {
        //...
      },
    },
  });
</script>
```

## Command Line Usage

```bash
docvue xxx.vue xxx.json

```
"xxx.vue" is the path of your vue file , "xxx.json" is the path of your API documentation file.
### Output Document Format
Based on the suffix of the input documentation file, the API documentation will be automatically generated in one of the following formats: "json\md\html", the default is "json". See [demo](https://github.com/annnhan/doc-vue/tree/main/demo).

```bash
# Output a json documentation
docvue xxx.vue xxx.json

# Output a markdown documentation
docvue xxx.vue xxx.md

# Output a html documentation
docvue xxx.vue xxx.html
```

## Programmatic Usage

docvue is a function that accepts 2 parameters, the first is the source string and the second is the options object, returns the document data.

```js
const docvue = require('doc-vue');
const code = `your code`;
const result = docvue(code);  // by default, result is json object
const mdResult = docvue(code, {type: 'md'});  // mdResult is markdown string
const htmlResult = docvue(code, {type: 'html'});  // htmlResult is html string
```

### Options
#### type
Specify the type of document, input one of them: "json\md\html"，default is "json" 

## License
MIT