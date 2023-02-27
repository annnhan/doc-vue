<template>
  <div class="component-crt-crud">
    嘻嘻嘻嘻嘻嘻嘻
    <!-- @doc 自定义操作列内容 -->
    <slot name="customAction"></slot>
    <!-- @doc 弹窗内容 -->
    <slot name="modal"></slot>
  </div>
</template>
<script lang="ts" setup>

  const props = defineProps({
      // @doc 增删改查目标的名称
      crudName: {
        type: String,
        default: '',
      },

      // @doc 详情弹窗表单字段配置列表
      modalFormSchema: {
        type: Array ,
        default: () => [],
      },

      // @doc 详情弹窗宽度
      modalWidth: {
        type: String,
        default: '1200px',
      },

      // @doc 详情弹窗表单label宽度
      modalLabelWidth: {
        type: String,
        default: '300px',
      },

      // @doc 查询表单字段配置列表
      searchFormSchema: {
        type: Array ,
        default: () => [],
      },

      // @doc 查询表单col组件的span属性
      colSpan: {
        type: Number,
        default: 8,
      },

      // @doc 表格列，同 a-table 的 columns 参数
      columns: {
        type: Array,
        default: () => [],
      },

      // @doc 表格rowKey 同 a-table 的 rowKey 参数
      rowKey: {
        type: String || null,
        default: 'id',
      },

      // @doc 是否可选择
      isSelect: {
        type: Boolean,
        default: false,
      },

      // @doc 是否可导出
      isDownload: {
        type: Boolean,
        default: false,
      },

      // @doc 是否可删除单行数据
      isDeleteRow: {
        type: Boolean,
        default: false,
      },

      // @doc 是否可编辑单行数据
      isEditRow: {
        type: Boolean,
        default: false,
      },

      // @doc 是否可查看单行数据
      isShowRow: {
        type: Boolean,
        default: false,
      },

      // @doc 查询列表方法
      searchListFunc: {
        type: Function,
        default: () => () => Promise.resolve(),
      },

      // @doc 查询单行数据方法
      searchRowFunc: {
        type: Function,
        default: () => () => Promise.resolve(),
      },

      // @doc 添加方法
      createRowFunc: {
        type: Function,
        default: () => () => Promise.resolve(),
      },

      // @doc 更新方法
      updateRowFunc: {
        type: Function,
        default: () => () => Promise.resolve(),
      },

      // @doc 删除方法
      deleteRowFunc: {
        type: Function,
        default: () => () => Promise.resolve(),
      },
    });

  const emits = defineEmits([
    // @doc 导出按钮点击
    'downloadClick',
    // @doc 添加按钮点击
    'createClick',
    // @doc 查看按钮点击
    'showClick',
    // @doc 编辑按钮点击
    'editClick',
    // @doc 删除按钮点击
    'deleteClick',
    // @doc 详情数据变更
    'detailChange',
  ]);


</script>
<style></style>