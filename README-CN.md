
# doc-vue
<a href="https://www.npmjs.com/package/doc-vue"><img src="https://img.shields.io/npm/v/doc-vue" /></a>
<img src="https://img.shields.io/badge/node-%3E%3D12.2.0-blue" />
<img src="https://img.shields.io/badge/icense-MIT-green" />
<a href="https://github.com/annnhan/doc-vue"><img src="https://img.shields.io/badge/-English-yellowgreen" /></a>

一个 Vue3 单文件组件 API 文档生成器。

## 安装

```bash
# for local
npm i doc-vue

# for global
npm i -g doc-vue
```

## 文档写法
在代码中的 “slot”、“props”、“emits”、“methods” 定义处添加以 “@doc” 开头的注释作为 api 描述。

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

## 在命令行中使用

```bash
docvue xxx.vue xxx.json

```
"xxx.vue" 是你的 vue 文件路径, "xxx.json" 是 API 文档文件路径.

### 输出的文档格式
根据输入的文档文件的后缀名，会自动生成以下格式之一的 API 文档: "json\md\html"，默认为 "json"。 查看 [demo](https://github.com/annnhan/doc-vue/tree/main/demo)。

```bash
# 输出一个 json 文件
docvue xxx.vue xxx.json

# 输出一个 markdown 文件
docvue xxx.vue xxx.md

# 输出一个 html 文件
docvue xxx.vue xxx.html
```

## 在 Nodejs 中使用

docvue 为一个函数，接受2个参数，第一个为源码字符串，第二个为选项对象，返回文档数据。
```js
const docvue = require('doc-vue');
const code = `your code`;
const result = docvue(code);  // by default, result is json object
const mdResult = docvue(code, {type: 'md'});  // result is markdown string

```

### 选项
#### type
docvue 函数的指定文档类型，输入其中之一：“json\md\html”，默认为“json”。

## License
MIT