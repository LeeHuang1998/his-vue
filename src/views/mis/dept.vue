<template>
    <div v-if="proxy.$isAuth(['ROOT', 'DEPT:SELECT'])">
        <!-- 顶部搜索条件表单，inline 属性为 true 可以让表单域变为行内的表单域 -->
        <el-form :inline="true" :model="deptSearchForm" :rules="deptSearchForm.dataRule" ref="deptSearchFormRef">
            <!-- 条件区域 -->
            <el-form-item prop="deptName">
                <el-input v-model="deptSearchForm.deptName" placeholder="部门名称" maxlength="10" class="input" clearable>
                </el-input>
            </el-form-item>
            <!-- 按钮区域 -->
            <el-form-item>
                <el-button type="primary" @click="searchDeptHandle">查询</el-button>
                <el-button type="primary" :disabled="!proxy.$isAuth(['ROOT', 'DEPT:INSERT'])"
                    @click="addDeptHandle">新增</el-button>
                <el-button type="danger" :disabled="!proxy.$isAuth(['ROOT', 'USER:DELETE'])"
                    @click="deleteDeptHandle(undefined)">批量删除</el-button>
            </el-form-item>
        </el-form>

        <!-- 数据表格 -->
        <!-- header-cell-style：表头单元格样式     border：表格中单元格带有边框    stripe：斑马纹  @selection-change：勾选复选框后触发该事件     -->
        <el-table :data="deptDataTable.deptDataList" :header-cell-style="{ 'background-color': '#f5f7fa' }" border
            stripe v-loading="deptDataTable.loading" @selection-change="selectionChangeHandle">
            <!-- 数据区域 -->
            <!-- selectable 属性的功能是表格在显示记录时，用指定的函数计算当前行的复选框是否被禁用 -->
            <el-table-column type="selection" header-align="center" align="center" width="50"
                :selectable="selectable" />
            <el-table-column type="index" header-align="center" align="center" label="序号" width="120" fixed>
                <template #default="scope">
                    <span>{{ (deptDataTable.pageIndex - 1) * deptDataTable.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="deptName" header-align="center" align="center" label="部门名称" min-width="170" fixed />
            <el-table-column prop="tel" header-align="center" align="center" label="联系电话" min-width="170" />
            <el-table-column prop="email" header-align="center" align="center" label="邮箱" min-width="230"
                :show-overflow-tooltip="true" />
            <el-table-column header-align="center" align="center" label="员工数量" min-width="140">
                <template #default="scope">
                    <span>{{ scope.row.emp }} 人</span>
                </template>
            </el-table-column>
            <el-table-column prop="desc" header-align="center" align="center" label="备注" min-width="350"
                :show-overflow-tooltip="true" />
            <!-- 操作区域，fixed 为固定列的位置 -->
            <el-table-column fixed="right" header-align="center" align="center" label="操作" width="150">
                <template #default="scope">
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'DEPT:UPDATE'])"
                        @click="updateDeptHandle(scope.row.id)">修改</el-button>
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'DEPT:DELETE']) || scope.row.emp > 0"
                        :disabled="!proxy.$isAuth(['ROOT', 'DEPT:DELETE']) || scope.row.emp > 0"
                        @click="deleteDeptHandle(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 底部分页区域 -->
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="deptDataTable.pageIndex" :page-sizes="[10, 20, 50]" :page-size="deptDataTable.pageSize"
            :total="deptDataTable.total" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <!-- 弹窗区域 -->
    <el-dialog v-if="proxy.$isAuth(['ROOT', 'DEPT:INSERT', 'DEPT:UPDATE'])" v-model="dialog.visable"
        :title="dialog.update ? '修改' : '新增'" :close-on-click-modal="false" width="450px" draggable overflow
        :close-on-press-escape="true">
        <el-form :model="dialog.dataForm" :rules="dialog.dataRules" ref="deptFormRef" label-width="80px">
            <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="dialog.dataForm.deptName" placeholder="请输入部门名称" clearable maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="tel">
                <el-input v-model="dialog.dataForm.tel" placeholder="请输入联系电话" clearable maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="dialog.dataForm.email" placeholder="请输入邮箱" clearable maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="desc">
                <el-input type="textarea" autosize v-model="dialog.dataForm.desc" placeholder="请输入备注信息"
                    clearable></el-input>
            </el-form-item>
        </el-form>
        <!-- 弹窗按钮部分 -->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visable = false">取 消</el-button>
                <el-button type="primary" @click="dialogFormSubmit">确 定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>

import { getCurrentInstance, ref, markRaw } from 'vue'
import {  ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance() as any;

// 查询表单数据
const deptSearchForm = ref({
    deptName: '',
    dataRule: {
        deptName: [
            { pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '请输入正确的部门名称' },
            { min: 1, max: 10, message: '长度在 1 到 10 个字符'}
        ]
    }
})

// 数据表格
const deptDataTable = ref({
    deptDataList: [],
    pageIndex: 1,                       // 当前页码
    pageSize: 10,                       // 每页显示条数
    total: 0,                           // 总条数
    loading: false,                     // 加载状态
    selections: []                      // 多选数据
})

// 弹窗数据表单
const dialog = ref({
    visable: false,
    update: false,
    dataForm: {
        id: null,
        deptName: null,
        tel: null,
        email: null,
        desc: null
    },
    dataRules: {
        deptName: [
            { required: true, message: '用户名不能为空', trigger: 'blur' },
            { pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '请输入正确的部门名称', trigger: 'blur' },
            { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        tel: [
            { pattern: '^1[1-9]\\d{9}$|^(0\\d{2,3}\-){0,1}[1-9]\\d{6,7}$', message: '请输入正确的联系电话', trigger: 'blur' }
        ],
        email: [
            { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        desc: [
            { max: 50, message: '长度不能超过 50 个字符' }
        ]
    }
})

// 点击新增按钮
const addDeptHandle = (id) => {
    dialog.value.visable = true

    // 清空表单数据
    proxy.$nextTick(() => {
        // 清空校验结果和表单数据
        proxy.$refs['deptFormRef'].clearValidate()
        proxy.$refs['deptFormRef'].resetFields()
    })

    // 设置默认表单数据
    dialog.value.update = false
    dialog.value.dataForm.id = null
}

// 修改部门按钮
const updateDeptHandle = (id: number) => {
    dialog.value.visable = true
    dialog.value.update = true
    dialog.value.dataForm.id = id

    // 清空校验结果
    proxy.$nextTick(() => {

        // 发送请求到后端，根据 id 查询该部门信息，回显到表单中
        proxy.$http('/mis/dept/getDeptById', 'POST', { id: id }, true, resp => {
            // resp.deptInfo

            // 清空表单校验信息
            proxy.$refs['deptFormRef'].clearValidate()

            // 回显表单数据
            dialog.value.dataForm.deptName = resp.deptInfo.deptName
            dialog.value.dataForm.tel = resp.deptInfo.tel
            dialog.value.dataForm.email = resp.deptInfo.email
            dialog.value.dataForm.desc = resp.deptInfo.desc
        })

    })
}

// 提交弹窗表单
const dialogFormSubmit = () => {
    // 判断校验是否通过
    proxy.$refs['deptFormRef'].validate((valid: boolean) => {
        if (valid) {
            // 校验通过，准备表单 JSON 数据

            let formDataJson = {
                id: dialog.value.dataForm.id,
                deptName: dialog.value.dataForm.deptName,
                tel: dialog.value.dataForm.tel,
                email: dialog.value.dataForm.email,
                desc: dialog.value.dataForm.desc
            }

            // 发送请求
            proxy.$http(dialog.value.update ? '/mis/dept/update' : '/mis/dept/insert', 'POST', formDataJson, true, resp => {

                if (resp.rows == 1) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1200,
                        onClose: () => {
                            // 重新获取部门列表
                            dialog.value.visable = false
                            getDeptList()
                        }
                    })
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1000
                    })
                }
            })
        }
    })

}

// 获取部门列表数据
const getDeptList = () => {
    deptDataTable.value.loading = true

    let searchParam = {
        deptName: deptSearchForm.value.deptName,
        page: deptDataTable.value.pageIndex,
        length: deptDataTable.value.pageSize
    }

    proxy.$http('/mis/dept/getDeptListByPage', 'POST', searchParam, true, resp => {
        deptDataTable.value.deptDataList = resp.deptPageData.pageList
        deptDataTable.value.total = resp.deptPageData.totalCount
        deptDataTable.value.loading = false
    })
}

getDeptList();

// 查询按钮
const searchDeptHandle = () => {
    // 校验查询条件
    proxy.$refs['deptSearchFormRef'].validate((valid: boolean) => {
        if (valid) {
            // 清空校验结果
            proxy.$refs['deptSearchFormRef'].clearValidate()
            // 将页码设置为 1 
            deptDataTable.value.pageIndex = 1
            // 重新获取数据
            getDeptList()
        }
    })
}

// 指定页面数据条数
const sizeChangeHandle = (val: number) => {
    // 将当前页码设置为第一页
    deptDataTable.value.pageIndex = 1
    // 设置页面数据条数
    deptDataTable.value.pageSize = val
    // 重新获取数据
    getDeptList()
}

// 跳转到指定页面
const currentChangeHandle = (val: number) => {
    // 修改当前页码
    deptDataTable.value.pageIndex = val
    // 重新获取数据
    getDeptList()
}

// 复选框是否能被选中，有员工的部门无法被删除
const selectable = (row: any, index: number) => {
    if (row.emp > 0) {
        return false;
    }
    return true;
}

// 复选框勾选事件
const selectionChangeHandle = (val: any) => {
    // 将被选中的记录添加到 selections 中，val 中包含了所有被选中的记录
    deptDataTable.value.selections = val
}

// 删除部门
const deleteDeptHandle = (id: number | undefined) => {
    // 判断是单个删除还是批量删除，并将 id 或 多个 id 包装为数组
    let ids = id != undefined ? [id] : deptDataTable.value.selections.map((item: any) => item.id)

    // 判断是否有被选中的记录
    if (ids.length == 0) {
        ElMessage.warning({
            message: '没有记录被选中',
            duration: 1000
        })
    } else {
        ElMessageBox.confirm('确定要删除选中的记录吗？', '警告', {
            type: 'warning',
            icon: markRaw(Delete),
            draggable: true,
            overflow: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        }).then(() => {
            // 发送请求
            proxy.$http('/mis/dept/delete', 'POST', { ids: ids }, true, resp => {
                if (resp.rows != 0) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1200,
                        onClose: () => {
                            // 重新获取部门列表
                            getDeptList()
                        }
                    })
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1000
                    })
                }
            })
        }).catch(() => {
            // 取消删除
            ElMessage.info({
                message: '取消删除',
                duration: 1000
            })
        })
    }
}
</script>

<style></style>