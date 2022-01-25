## slots

| name | desc |
| ---- | ---- |
| customAction | 自定义操作列内容 |
| modal | 弹窗内容 |

## props

| name | type | desc | default | required |
| ---- | ---- | ---- | ------- | -------- |
| crudName | String | 增删改查目标的名称 | '' |  |
| modalFormSchema | Array as PropType<SearchSchema[]> | 详情弹窗表单字段配置列表 | [] |  |
| modalWidth | String | 详情弹窗宽度 | '1200px' |  |
| modalLabelWidth | String | 详情弹窗表单label宽度 | '300px' |  |
| searchFormSchema | Array as PropType<SearchSchema[]> | 查询表单字段配置列表 | [] |  |
| colSpan | Number | 查询表单col组件的span属性 | 8 |  |
| columns | Array as PropType<any[]> | 表格列，同 a-table 的 columns 参数 | [] |  |
| rowKey | String \|| null | 表格rowKey 同 a-table 的 rowKey 参数 | 'id' |  |
| isSelect | Boolean | 是否可选择 | false |  |
| isDownload | Boolean | 是否可导出 | false |  |
| isDeleteRow | Boolean | 是否可删除单行数据 | false |  |
| isEditRow | Boolean | 是否可编辑单行数据 | false |  |
| isShowRow | Boolean | 是否可查看单行数据 | false |  |
| searchListFunc | Function | 查询列表方法 | () => Promise.resolve() |  |
| searchRowFunc | Function | 查询单行数据方法 | () => Promise.resolve() |  |
| createRowFunc | Function | 添加方法 | () => Promise.resolve() |  |
| updateRowFunc | Function | 更新方法 | () => Promise.resolve() |  |
| deleteRowFunc | Function | 删除方法 | () => Promise.resolve() |  |

## events

| name | desc |
| ---- | ---- |
| downloadClick | 导出按钮点击 |
| createClick | 添加按钮点击 |
| showClick | 查看按钮点击 |
| editClick | 编辑按钮点击 |
| deleteClick | 删除按钮点击 |
| detailChange | 详情数据变更 |

## methods

| name | desc | params | returns |
| ---- | ---- | ------ | ------- |
| create | 添加一行 |  |  |
| edit | 编辑一行 | record: 该行数据 |  |
| show | 查看一行 | record: 该行数据 |  |
| del | 删除一行 | record: 该行数据 |  |
| fetchList | 获取列表数据 |  |  |
