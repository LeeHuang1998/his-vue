<template>
    <div v-if="proxy.$isAuth(['ROOT', 'ROLE:SELECT'])">
        <!-- 搜索表单区域 -->
        <el-form :inline="true" ref="roleSearchFormRef" :model="roleSearchForm" :rules="roleSearchForm.dataRule">
            <!-- 搜索框 -->
            <el-form-item prop="roleName">
                <el-input v-model="roleSearchForm.roleName" placeholder="请输入角色名称" maxlength="10" class="input"
                    clearable></el-input>
            </el-form-item>
            <!-- 按钮区域 -->
            <el-form-item>
                <el-button type="primary" :disabled="!proxy.$isAuth(['ROOT', 'ROLE:SELECT'])"
                    @click="searchHandle">查询</el-button>
                <el-button type="primary" :disabled="!proxy.$isAuth(['ROOT', 'ROLE:INSERT'])"
                    @click="insertHandle">新增</el-button>
                <el-button type="danger" :disabled="!proxy.$isAuth(['ROOT', 'ROLE:DELETE'])"
                    @click="deleteRoleHandle(undefined)">批量删除</el-button>
            </el-form-item>
        </el-form>

        <!-- 数据表格区域 -->
        <el-table :data="roleDataTable.roleDataList" :header-cell-style="{ 'background-color': '#f5f7fa' }" border
            stripe v-loading="roleDataTable.loading" @selection-change="selectionChangeHandle">
            <el-table-column type="selection" header-align="center" align="center" width="50"
                :selectable="selectable" />
            <el-table-column type="index" header-align="center" align="center" label="序号" width="100" fixed>
                <template #default="scope">
                    <span>{{ (roleDataTable.pageIndex - 1) * roleDataTable.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="roleName" header-align="center" align="center" label="角色名称" min-width="180" fixed />
            <el-table-column header-align="center" align="center" label="权限数量" min-width="140">
                <template #default="scope">
                    <span>{{ scope.row.permissions }} 个</span>
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" label="关联用户" min-width="140">
                <template #default="scope">
                    <span>{{ scope.row.users }} 人</span>
                </template>
            </el-table-column>
            <el-table-column prop="desc" header-align="center" align="center" label="备注" min-width="450"
                :show-overflow-tooltip="true" />
            <el-table-column header-align="center" align="center" label="内置角色" min-width="180">
                <template #default="scope">
                    <span>{{ scope.row.systemic ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <!-- 操作区域，fixed 为固定列的位置 -->
            <el-table-column fixed="right" header-align="center" align="center" label="操作" width="150">
                <template #default="scope">
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'ROLE:UPDATE'])"
                        :disabled="!proxy.$isAuth(['ROOT', 'ROLE:UPDATE']) || scope.row.id == 0"
                        @click="updateRoleHandle(scope.row.id)">修改</el-button>
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'ROLE:DELETE'])"
                        :disabled="!proxy.$isAuth(['ROOT', 'ROLE:DELETE']) || scope.row.id == 0 || scope.row.users > 0 || scope.row.systemic == true"
                        @click="deleteRoleHandle(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 底部分页区域 -->
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="roleDataTable.pageIndex" :page-sizes="[10, 20, 50]" :page-size="roleDataTable.pageSize"
            :total="roleDataTable.total" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <!-- 弹窗区域 -->
    <el-dialog v-if="proxy.$isAuth(['ROOT', 'ROLE:INSERT', 'ROLE:UPDATE'])" v-model="roleDialog.visible" draggable
        overflow :close-on-press-escape="true" :title="!roleDialog.dataForm.id ? '新增' : '修改'"
        :close-on-click-modal="false" custom-class="dialog" width="692px">
        <el-form :model="roleDialog.dataForm" ref="roleDialogRef" :rules="roleDialog.dataRule" label-width="60px">
            <el-form-item label="角色" prop="roleName">
                <el-input v-model="roleDialog.dataForm.roleName" class="dialog-input" :readonly="roleDialog.systemic"
                    clearable />
                <span class="note">（ 角色名称必须是2~10个字符之间 ）</span>
            </el-form-item>
            <el-form-item label="备注" prop="desc">
                <el-input v-model="roleDialog.dataForm.desc" class="dialog-input" type="textarea" autosize clearable />
                <span class="note">（ 备注信息必须是50个字符以内 ）</span>
            </el-form-item>
            <el-form-item label="权限" prop="permissions">
                <el-transfer v-model="roleDialog.dataForm.permissions" :data="roleDialog.permissionList"
                    :titles="['权限列表', '具备权限']" filterable filter-placeholder="请输入权限" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="roleDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="dialogFormSubmit">确定</el-button>
            </span>
        </template>
    </el-dialog>


</template>

<script lang="ts" setup>

import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, getCurrentInstance, markRaw } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance() as any

// 搜索表单
const roleSearchForm = ref({
    roleName: '',
    dataRule: {
        roleName: [
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$', message: '请输入正确的角色名称' },
            { min: 1, max: 10, message: '长度在 1 到 10 个字符' }
        ]
    }
})

// 数据表格
const roleDataTable = ref({
    roleDataList: [],
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    selections: []
})

// 弹窗数据表单
const roleDialog = ref({
    visible: false,
    systemic: false,
    dataForm: {
        id: null,
        roleName: null,
        permissions: [],                        // 拥有的权限
        desc: null,
        changed: false
    },
    permissionList: [],                         // 所有的权限
    oldPermissionList: [],                      // 原来拥有的权限
    oldRoleName: null,
    oldDesc: null,
    dataRule: {
        roleName: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$', message: '请输入正确的角色名称', trigger: 'blur' },
            { min: 1, max: 10, message: '长度在 1 到 10 个字符' }
        ],
        desc: [
            { max: 50, message: '长度不能超过 50 个字符' }
        ],
        permissions: [
            { required: true, message: '角色权限不能为空', trigger: 'blur' },
            { required: false, message: '角色权限不能为空', trigger: 'change' }
        ]
    }
})

// // 获取角色表格数据
const getRoleList = () => {
    roleDataTable.value.loading = true

    // 查询参数
    let searchParam = {
        roleName: roleSearchForm.value.roleName,
        page: roleDataTable.value.pageIndex,
        length: roleDataTable.value.pageSize
    }

    // 发送请求
    proxy.$http('/mis/role/getRoleListByPage', 'POST', searchParam, true, resp => {
        roleDataTable.value.roleDataList = resp.rolePageData.pageList
        roleDataTable.value.total = resp.rolePageData.totalCount
        roleDataTable.value.loading = false
    })
}

getRoleList()

// 查询按钮
const searchHandle = () => {
    // 校验查询条件
    proxy.$refs['roleSearchFormRef'].validate((valid: any) => {
        if (valid) {
            // 设置页码为 1
            roleDataTable.value.pageIndex = 1
            getRoleList()
        }
    })
}

// 改变页面数据条数
const sizeChangeHandle = (val: number) => {
    roleDataTable.value.pageIndex = 1
    roleDataTable.value.pageSize = val
    getRoleList()
}

// 跳转到指定页面
const currentChangeHandle = (val: number) => {
    roleDataTable.value.pageIndex = val
    getRoleList()
}

// 发送请求获取所有权限
const searchAllPermission = () => {
    proxy.$http('/mis/permission/searchAllPermission', 'GET', null, true, resp => {
        let permissionList = []
        for (let permission of resp.allPermission) {
            // 因为是新添加的角色，所以所有的权限状态都是可用的
            let disabled = false
            // 穿梭框左侧列表项的数据要求必须有 key、label 和 disabled 属性
            permissionList.push({ key: permission.id, label: `${permission.moduleName}:${permission.actionName}`, disabled: disabled })
        }
        // 遍历完成后将其赋值到弹窗表单的权限列表中
        roleDialog.value.permissionList = permissionList
    })
}

// 新增按钮
const insertHandle = () => {
    roleDialog.value.visible = true

    // 设置默认数据
    roleDialog.value.dataForm.id = null
    roleDialog.value.systemic = false

    // 清空表单数据
    proxy.$nextTick(() => {
        proxy.$refs['roleDialogRef'].resetFields()
        proxy.$refs['roleDialogRef'].clearValidate()

        // 发送请求到后端查询所有的权限
        searchAllPermission()
    })

    console.log("insert operation");
}

// 修改按钮
const updateRoleHandle = (id: any) => {
    roleDialog.value.visible = true

    proxy.$nextTick(() => {
        // 清空表单信息
        proxy.$refs['roleDialogRef'].resetFields()
        // 清除之前的校验结果
        proxy.$refs['roleDialogRef'].clearValidate()

        // 查询所有权限并回显到权限列表中
        searchAllPermission()

        // 发送请求到后端接口查询角色信息
        proxy.$http('/mis/role/getRoleById', 'POST', { id: id }, true, resp => {

            // 回显数据到弹窗中
            roleDialog.value.dataForm.id = resp.role.id
            roleDialog.value.dataForm.roleName = resp.role.roleName
            roleDialog.value.dataForm.desc = resp.role.desc

            // 回显具备权限列表数据
            roleDialog.value.dataForm.permissions = JSON.parse(resp.role.permissions)

            // 用于后面判断是否发生变化
            roleDialog.value.oldDesc = resp.role.desc
            roleDialog.value.oldRoleName = resp.role.roleName
            roleDialog.value.oldPermissionList = JSON.parse(resp.role.permissions)

            // 默认权限，重置权限时可以使用
            let defautlPermissions = JSON.parse(resp.role.defaultPermissions);
        })
    })

}

// 弹窗表单提交
const dialogFormSubmit = () => {
    // 判断是否通过校验
    proxy.$refs['roleDialogRef'].validate((valid: any) => {
        if (valid) {
            // 判断该角色关联的权限列表是否发生改变
            // 通过将新旧权限数组中的元素进行排序然后拼接成字符串，再比较两个权限数组的字符串是否相同
            // 新权限数组
            roleDialog.value.dataForm.permissions.sort((a, b) => {
                return a - b;
            })

            // 原权限数组
            roleDialog.value.oldPermissionList.sort((a, b) => {
                return a - b;
            })

            // 比较 roleName、desc、permissions 是否发生变化
            if (roleDialog.value.dataForm.permissions.join() != roleDialog.value.oldPermissionList.join()
                || roleDialog.value.oldDesc != roleDialog.value.dataForm.desc
                || roleDialog.value.oldRoleName != roleDialog.value.dataForm.roleName) {
                roleDialog.value.dataForm.changed = true
            } else {
                roleDialog.value.dataForm.changed = false
            }


            console.log("提交的 desc: " + roleDialog.value.dataForm.desc);


            // 发送请求
            proxy.$http(roleDialog.value.dataForm.id ? '/mis/role/updateRole' : '/mis/role/insertRole', 'POST', roleDialog.value.dataForm, true, resp => {
                if (resp.rows == 1) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1200,
                        onClose: () => {
                            roleDialog.value.visible = false
                            getRoleList()
                        }
                    })
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1200
                    })
                }
            })
        }
    })
}

// 复选框是否能被选中
const selectable = (row: any) => {
    if (row.id == 0 || row.systemic == true || row.users > 0) {
        return false
    }
    return true
}

// 复选框数据
const selectionChangeHandle = (val: any) => {
    roleDataTable.value.selections = val
}

// 删除操作
const deleteRoleHandle = (id: any | undefined) => {

    let ids = id != undefined ? [id] : roleDataTable.value.selections.map((item: any) => item.id)

    // 判断是否有被选中的记录
    if (ids.length == 0) {
        ElMessage.warning({
            message: '没有记录被选中',
            duration: 1000
        })
    } else {
        ElMessageBox.confirm('确定要删除选中的角色吗？', '警告', {
            type: 'warning',
            icon: markRaw(Delete),
            draggable: true,
            overflow: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        }).then(() => {
            proxy.$http('/mis/role/deleteRole', 'POST', { ids: ids }, true, resp => {
                if (resp.rows > 0) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1200,
                        onClose: () => {
                            getRoleList()
                        }
                    })
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1200
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