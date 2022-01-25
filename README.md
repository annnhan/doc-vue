<a href="https://github.com/annnhan/docvue/blob/main/README-CN.md" style="float: right">
  简体中文
</a>

# docvue
<a href="https://www.npmjs.com/package/docvue"><img src="https://img.shields.io/npm/v/docvue" /></a>
<img src="https://img.shields.io/badge/node-%3E%3D12.2.0-blue" />
<img src="https://img.shields.io/badge/icense-MIT-green" />

A API documentation generator for Vue3 single file component.

## Installation

```bash
# for local
npm i docvue

# or for global
npm i -g docvue
```

## Write api description in Vue file
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

## Use on the command line

```bash
docvue xxx.vue xxx.json

```
"xxx.vue" is the path of your vue file , "xxx.json" is the path of your API documentation file.
### Output document format
Based on the suffix of the input documentation file, the API documentation will be automatically generated in one of the following formats: "json\md\html", the default is "json".

```bash
# Output a json documentation
docvue xxx.vue xxx.json

# Output a markdown documentation
docvue xxx.vue xxx.md

# Output a html documentation
docvue xxx.vue xxx.html
```

## Use in Node.js

docvue is a function that accepts 2 parameters, the first is the source string and the second is the options object, returns the document data.

```js
const docvue = require('docvue');
const code = `your code`;
const result = docvue(code);  // by default, result is json object
const mdResult = docvue(code, {type: 'md'});  // mdResult is markdown string
const htmlResult = docvue(code, {type: 'md'});  // htmlResult is html string
```

### Options
#### -t or --type
Specify the type of document, input one of them: "json\md\html"，default is "json" 

