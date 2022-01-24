<template>
  <div class="component-crt-crud">
    <search-form :search-schema="searchFormSchema" @search="search" @reset="handleReset" />
    <div class="table-wrapper">
      <div class="table-wrapper-header">
        <a-button type="primary" @click="create"> <PlusOutlined />添加{{ crudName }}</a-button>
        <a-button v-if="isDownload" type="primary" @click="download">
          <ExportOutlined />导出
        </a-button>
      </div>
      <a-table
        :is-select="isSelect"
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="paginationInfo"
        :row-key="rowKey"
        @handleSelectRow="handleSelectRow"
        @change="handleTableChange"
      >
        <template v-for="item in Object.keys($slots)" #[item]="data" :key="item">
          <slot :name="item" v-bind="data || {}"></slot>
        </template>
        <template #action="{ record }">
          <a-button v-if="isShowRow" type="link" size="small" @click="show(record)"
            ><EyeOutlined />查看</a-button
          >
          <a-button v-if="isEditRow" type="link" size="small" @click="edit(record)"
            ><EditOutlined />编辑</a-button
          >
          <a-popconfirm
            v-if="isDeleteRow"
            :title="`确定删除吗?`"
            ok-text="确定"
            cancel-text="取消"
            @confirm="del(record)"
          >
            <a-button type="link" size="small"> <ControlOutlined />删除 </a-button>
          </a-popconfirm>
          <!-- @doc 自定义操作列内容 -->
          <slot name="customAction"></slot>
        </template>
      </a-table>
    </div>

    <slot name="modal"></slot>
    <a-modal
      v-if="!$slots.modal"
      v-model:visible="modalVisible"
      :title="modalTitle"
      :width="modalWidth"
      :footer="detailEditable ? undefined : null"
      @ok="saveDetail"
    >
      <template v-if="detailEditable" #footer>
        <a-button @click="modalVisible = false">取消</a-button>
        <a-button type="primary" @click="saveDetail">保存</a-button>
      </template>
      <template v-else #footer><span></span></template>
      <a-form ref="modalForm" :model="detail" :label-col="{ style: { width: modalLabelWidth } }">
        <a-form-item
          v-for="item of modalFormSchema"
          :key="item.id"
          :label="item.label"
          :rules="item.rules"
          :name="item.model"
        >
          <a-input
            v-if="item.itemType === 'input'"
            v-model:value="detail[item.model]"
            :readonly="!detailEditable || item.disabled"
          />
          <a-textarea
            v-if="item.itemType === 'textarea'"
            v-model:value="detail[item.model]"
            :readonly="!detailEditable || item.disabled"
          />
          <a-select
            v-if="item.itemType === 'select'"
            v-model:value="detail[item.model]"
            :readonly="!detailEditable || item.disabled"
            :show-search="item.showSearch"
          >
            <a-select-option
              v-for="option of item.selectDownList"
              :key="option.value"
              :value="option.value"
              >{{ option.label }}</a-select-option
            >
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, reactive, ref } from 'vue';
  import { omit } from 'lodash-es';
  import { message, Table as aTable } from 'ant-design-vue';
  import {
    EyeOutlined,
    EditOutlined,
    ControlOutlined,
    ExportOutlined,
  } from '@ant-design/icons-vue';
  import searchForm from './search-form.vue';
  import { params, paginationInfo, SearchSchema } from './config';

  interface BaseObject {
    [propName: string]: any;
  }

  export default defineComponent({
    components: {
      searchForm,
      aTable,
      EyeOutlined,
      EditOutlined,
      ControlOutlined,
      ExportOutlined,
    },

    props: {
      // @doc 增删改查目标的名称
      crudName: {
        type: String,
        default: '',
      },

      // @doc 详情弹窗表单字段配置列表
      modalFormSchema: {
        type: Array as PropType<SearchSchema[]>,
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
        type: Array as PropType<SearchSchema[]>,
        default: () => [],
      },

      // @doc 查询表单col组件的span属性
      colSpan: {
        type: Number,
        default: 8,
      },

      // @doc 表格列，同 a-table 的 columns 参数
      columns: {
        type: Array as PropType<any[]>,
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
    },

    emits: [
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
    ],

    setup() {
      return reactive({
        detail: ref({}), // 详情
        tableData: ref([]), // 表格数据
        modalTitle: '', // 弹窗标题
        modalVisible: false, // 显示弹窗
        detailEditable: false, // 弹窗可编辑
        loading: true,
        params, // 查询表格参数
        paginationInfo, // 分页信息
      });
    },

    watch: {
      detail: {
        handler(detail) {
          this.$emit('detailChange', detail);
        },
        deep: true,
      },
    },

    mounted() {
      this.fetchList();
    },

    methods: {
      /**
       * @doc 添加一行
       */
      create() {
        this.$emit('createClick');
        this.detail = ref({});
        this.clearDetailValidate();
        this.modalTitle = `添加${this.crudName}`;
        this.modalVisible = true;
        this.detailEditable = true;
      },

      /**
       * @doc 编辑一行
       * @param record 该行数据
       */
      async edit(record: BaseObject) {
        this.$emit('editClick', record);
        await this.fetchDetail(record);
        this.clearDetailValidate();
        this.modalTitle = `编辑${this.crudName}`;
        this.modalVisible = true;
        this.detailEditable = true;
      },

      /**
       * @doc 查看一行
       * @param record 该行数据
       */
      async show(record: BaseObject) {
        this.$emit('showClick', record);
        await this.fetchDetail(record);
        this.clearDetailValidate();
        this.modalTitle = `查看${this.crudName}`;
        this.modalVisible = true;
        this.detailEditable = false;
      },

      /**
       * @doc 删除一行
       * @param record 该行数据
       */
      async del(record: BaseObject) {
        this.$emit('deleteClick', record);
        const data = { ...record };
        this.deleteRowFunc(data).then(() => {
          this.fetchList();
          message.success('操作成功');
        });
      },

      // 详情保存
      saveDetail() {
        const exec = this.modalTitle.includes('添加') ? this.createRowFunc : this.updateRowFunc;
        (this.$refs.modalForm as BaseObject)
          .validate()
          .then(() => {
            exec(this.detail).then(() => {
              this.modalVisible = false;
              this.fetchList();
            });
            message.success('操作成功');
          })
          .catch((r) => {
            console.error(r);
          });
      },

      // 清除详情表单验证
      clearDetailValidate() {
        const modalForm = this.$refs.modalForm as BaseObject;
        if (modalForm) {
          modalForm.clearValidate();
        }
      },

      // 获取单行数据
      async fetchDetail(record) {
        const promise = this.searchRowFunc(record[this.rowKey]);
        if (promise.then) {
          promise.then((detail) => {
            this.detail = ref(detail);
          });
        }
        return promise;
      },

      // @doc 获取列表数据
      async fetchList() {
        this.loading = true;
        Object.keys(this.params).forEach((k) => {
          if (this.params[k] === undefined) {
            this.params = omit(this.params, [k]);
          }
        });
        const pms = this.searchListFunc(this.params);
        if (pms && pms.then) {
          pms
            .then((res) => {
              const { current, total, records } = res || {};
              this.tableData = records && records.length ? records : [];
              this.paginationInfo.total = total;
              this.paginationInfo.current = current;
              this.paginationInfo.showTotal = (t) => `共查询到 ${t} 条数据`;
            })
            .finally(() => {
              this.loading = false;
            });
        }
      },

      // 表单查询
      search(payload: BaseObject) {
        this.params = payload;
        this.fetchList();
      },

      // 选择行
      handleSelectRow(payload: BaseObject) {
        const { selectedRowKeys, selectedRows } = payload;
        if (selectedRows.length) {
          console.log(selectedRowKeys, selectedRows);
        }
      },

      // 点击分页
      handleTableChange(payload: BaseObject) {
        this.params.size = payload?.pageSize;
        this.params.current = payload?.current;
        this.fetchList();
      },

      // 表单重置
      handleReset(payload: BaseObject) {
        this.params = payload;
        this.fetchList();
      },

      // 导出
      download() {
        this.$emit('downloadClick');
      },
    },
  });
</script>
<style lang="less" scoped>
  .component-crt-crud {
    .table-wrapper {
      background-color: #fff;
      padding: 24px;
      margin-top: 24px;
      box-shadow: 0 1px 4px #00152914;
      &-header {
        padding-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        button {
          margin-right: 16px;
        }
      }
      &-footer {
        text-align: right;
        padding-top: 24px;
      }
    }
  }
</style>
