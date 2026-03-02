<template>
    <div v-if="proxy.$isAuth(['ROOT', 'RULE:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="ruleSearchFormRef">
            <el-form-item prop="ruleName">
                <el-input v-model="dataForm.ruleName" placeholder="规则名称" maxlength="20" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">查询</el-button>
                <el-button type="primary" :disabled="!proxy.$isAuth(['ROOT', 'RULE:INSERT'])" @click="addHandle()">
                    新增
                </el-button>
            </el-form-item>
        </el-form>
    </div>

    <el-table :data="ruleData.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border
        v-loading="ruleData.loading">
        <el-table-column type="index" header-align="center" align="center" width="100" label="序号">
            <template #default="scope">
                <span>{{ (ruleData.pageIndex - 1) * ruleData.pageSize + scope.$index + 1 }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="ruleName" header-align="center" align="center" min-width="150" label="规则名称" />
        <el-table-column prop="remark" header-align="left" align="left" min-width="350" label="备注信息" />
        <el-table-column prop="count" header-align="center" align="center" min-width="80" label="关联套餐数量" />
        <el-table-column header-align="center" align="center" width="150" label="操作">
            <template #default="scope">
                <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'RULE:UPDATE'])"
                    @click="updateHandle(scope.row.id)">
                    修改
                </el-button>
                <el-button type="danger" link :disabled="scope.row.count > 0"
                    v-if="proxy.$isAuth(['ROOT', 'RULE:DELETE'])" @click="deleteHandle(scope.row.id)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
        :current-page="ruleData.pageIndex" :page-sizes="[10, 20, 50]" :page-size="ruleData.pageSize"
        :total="ruleData.totalCount" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>

    <el-dialog :title="!ruleDialog.dataForm.id ? '新增' : '修改'"
        v-if="proxy.$isAuth(['ROOT', 'RULE:INSERT', 'RULE:UPDATE'])" :close-on-click-modal="false"
        v-model="ruleDialog.visible" custom-class="dialog" width="500px">
        <el-form :model="ruleDialog.dataForm" ref="ruleDialogFormRef" :rules="ruleDialog.dataRule" label-width="80px">
            <el-form-item label="规则名称" prop="name">
                <el-input v-model="ruleDialog.dataForm.name" maxlength="20" clearable />
            </el-form-item>
            <el-form-item label="规则内容" prop="rule">
                <el-input v-model="ruleDialog.dataForm.rule" type="textarea" clearable />
            </el-form-item>
            <el-form-item label="备注信息">
                <el-input v-model="ruleDialog.dataForm.remark" type="textarea" clearable />
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="ruleDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="ruleDialogSubmitHandle">确定</el-button>
            </span>
        </template>
    </el-dialog>


</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, onMounted } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import router from '../../router/index';
import { ElMessage, ElMessageBox } from 'element-plus';
const { proxy } = getCurrentInstance();

// 搜索表单
const dataForm = ref({
    ruleName: null
});

// 搜索表单规则
const dataRule = ref({
    ruleName: [
        { required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$', message: '规则名称不正确' }
    ]
});

// 表格数据
const ruleData = ref({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false
});

// 新增/修改弹窗
const ruleDialog = ref({
    visible: false,
    dataForm: {
        id: null,
        name: null,
        remark: null,
        rule: null
    },
    dataRule: {
        ruleName: [
            { required: true, message: '规则名称不能为空' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$', message: '规则名称不正确' }
        ],
        rule: [{ required: true, trigger: 'blur', message: '规则内容不能为空' }]
    }
});


// 获取分页数据
const loadRuleData = () => {
    ruleData.value.loading = true;
    let json = {
        page: ruleData.value.pageIndex,
        length: ruleData.value.pageSize,
        name: dataForm.value.ruleName
    };
    proxy.$http('/mis/rule/searchRuleDataByPage', 'POST', json, true, resp => {
        if (resp.code == 200) {
            let pageData = resp.pageData;
            ruleData.value.dataList = pageData.pageList;
            ruleData.value.totalCount = pageData.totalCount;
            ruleData.value.loading = false;
        } else {
            ElMessage.error({
                message: resp.message,
                duration: 1500
            })
        }

    });
}

// 条件查询
const searchHandle = () => {
    proxy.$refs['ruleSearchFormRef'].validate(valid => {
        if (valid) {
            proxy.$refs['ruleSearchFormRef'].clearValidate();
            if (dataForm.value.ruleName == '') {
                dataForm.value.ruleName = null;
            }
            if (ruleData.value.pageIndex != 1) {
                ruleData.value.pageIndex = 1;
            }
            loadRuleData();
        } else {
            return false;
        }
    });
}

// 点击新增按钮
const addHandle = () => {
    ruleDialog.value.dataForm.id = null;
    // remark 是非必填数据，需要手动清空
    ruleDialog.value.dataForm.remark = null;
    ruleDialog.value.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs['ruleDialogFormRef'].resetFields();
        proxy.$refs['ruleDialogFormRef'].clearValidate();
    });
}

// 点击更新按钮
const updateHandle = (id) => {
    ruleDialog.value.dataForm.id = id;
    ruleDialog.value.visible = true;

    proxy.$nextTick(() => {
        proxy.$refs['ruleDialogFormRef'].resetFields();
        proxy.$refs['ruleDialogFormRef'].clearValidate();

        proxy.$http('/mis/rule/searchRuleById', 'POST', { id: id }, true, function (resp) {
            ruleDialog.value.dataForm.name = resp.pageVO.ruleName;
            ruleDialog.value.dataForm.rule = resp.pageVO.rule;
            ruleDialog.value.dataForm.remark = resp.pageVO.remark;
        });
    });
}

// 弹窗表单提交
const ruleDialogSubmitHandle = () => {
    proxy.$refs['ruleDialogFormRef'].validate(valid => {
        if (valid) {
            let json = {
                id: ruleDialog.value.dataForm.id,
                name: ruleDialog.value.dataForm.name,
                rule: ruleDialog.value.dataForm.rule,
                remark: ruleDialog.value.dataForm.remark
            }

            proxy.$http(`/mis/rule/${ruleDialog.value.dataForm.id == null ? 'insertRule' : 'updateRule'}`, 'POST', json, true, resp => {
                if (resp.code == 200 && resp.rows == 1) {
                    ElMessage.success({
                        message: '新增规则成功',
                        duration: 1500
                    })
                    ruleDialog.value.visible = false;
                    loadRuleData();
                } else {
                    proxy.$message({
                        message: '新增规则失败：' + resp.msg,
                        type: 'error',
                        duration: 2000
                    });
                }
            }
            );
        }
    });
}

// 修改每页数据量
const sizeChangeHandle = (val) => {
    ruleData.value.pageSize = val;
    ruleData.value.pageIndex = 1;
    loadRuleData();
}

// 修改当前页码
const currentChangeHandle = (val) => {
    ruleData.value.pageIndex = 1;
    loadRuleData();
}

// 点击删除按钮
const deleteHandle = (id) => {
    ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        proxy.$http('/mis/rule/deleteRuleById', 'POST', { id: id }, true, resp => {
            if (resp.code == 200 && resp.rows == 1) {
                ElMessage.success({
                    message: '删除成功',
                    duration: 1500
                })
                loadRuleData();
            } else {
                ElMessage.error({
                    message: '删除失败：' + resp.msg,
                    duration: 1500
                })
            }
        })
    })
}

onMounted(() => {
    loadRuleData();
})

</script>
