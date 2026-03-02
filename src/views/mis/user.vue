<template>
    <!-- 页面部分 -->
    <div v-if="proxy.$isAuth(['ROOT', 'USER:SELECT'])">
        <!-- 顶部搜索条件表单 -->
        <el-form :inline="true" :model="searchForm" :rules="dataRule" ref="searchFormRef">
            <!-- 条件区域 -->
            <el-form-item prop="name">
                <el-input v-model="searchForm.name" placeholder="姓名" maxlength="10" class="input" clearable>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchForm.sex" placeholder="性别" class="input" clearable>
                    <el-option label="男" value="男"></el-option>
                    <el-option label="女" value="女"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchForm.role" placeholder="角色" class="input" clearable>
                    <el-option v-for="role in searchForm.roleList" :key="role.id" :label="role.roleName"
                        :value="role.roleName"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchForm.deptId" placeholder="部门" class="input" clearable>
                    <el-option v-for="dept in searchForm.deptList" :key="dept.id" :label="dept.deptName"
                        :value="dept.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchForm.status" placeholder="状态" class="input" clearable>
                    <el-option label="在职" value="1"></el-option>
                    <el-option label="离职" value="2"></el-option>
                </el-select>
            </el-form-item>
            <!-- 按钮区域 -->
            <el-form-item>
                <el-button type="primary" @click="searchHandle">查询</el-button>
                <el-button type="primary" :disabled="!proxy.$isAuth(['ROOT', 'USER:INSERT'])"
                    @click="addHandle">新增</el-button>
                <el-button type="danger" :disabled="!proxy.$isAuth(['ROOT', 'USER:DELETE'])"
                    @click="deleteHandle(undefined)">批量删除</el-button>
            </el-form-item>
        </el-form>

        <!-- 数据表格 -->
        <!-- header-cell-style：表头单元格样式     border：表格中单元格带有边框    stripe：斑马纹  @selection-change：勾选复选框后触发该事件     -->
        <el-table :data="dataTable.dataList" :header-cell-style="{ 'background-color': '#f5f7fa' }" border stripe
            v-loading="dataTable.loading" @selection-change="selectionChangeHandle">
            <!-- 数据区域 -->
            <!-- selectable 属性的功能是表格在显示记录时，用指定的函数计算当前行的复选框是否被禁用 -->
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center"
                width="50" />
            <el-table-column type="index" header-align="center" align="center" label="序号" width="100">
                <template #default="scope">
                    <span>{{ (dataTable.pageIndex - 1) * dataTable.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="姓名" min-width="100" />
            <el-table-column prop="sex" header-align="center" align="center" label="性别" min-width="60" />
            <el-table-column prop="tel" header-align="center" align="center" label="电话" min-width="130" />
            <el-table-column prop="email" header-align="center" align="center" label="邮箱" min-width="100"
                :show-overflow-tooltip="true" />
            <el-table-column prop="hiredate" header-align="center" align="center" label="入职时间"
                min-width="130"></el-table-column>
            <el-table-column prop="roles" header-align="center" align="center" label="角色" min-width="150"
                :show-overflow-tooltip="true" />
            <el-table-column prop="dept" header-align="center" align="center" label="部门" min-width="120" />
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="100" />
            <!-- 操作区域 -->
            <el-table-column header-align="center" align="center" label="操作" width="150">
                <template #default="scope">
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'USER:UPDATE'])"
                        @click="updateHandle(scope.row.id)">修改</el-button>
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'USER:DELETE'])"
                        :disabled="scope.row.root === 1 || scope.row.status === '离职'"
                        @click="dismissHandle(scope.row.id)">离职</el-button>
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'USER:DELETE'])"
                        @click="deleteHandle(scope.row.id)" :disabled="scope.row.root === 1">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 底部分页区域 -->
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="dataTable.pageIndex" :page-sizes="[10, 20, 50]" :page-size="dataTable.pageSize"
            :total="dataTable.total" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <!-- 弹窗部分 -->
    <el-dialog v-if="proxy.$isAuth(['ROOT', 'USER:INSERT', 'USER:UPDATE'])" v-model="dialog.visable"
        :title="!dialog.dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" width="450px" draggable overflow
        :close-on-press-escape="true">
        <!-- 弹窗数据表单 -->
        <el-form :model="dialog.dataForm" :rules="dialog.dataRule" ref="dialogFormRef" label-width="80px">
            <!-- 填写数据部分 -->
            <el-form-item prop="username" label="用户名">
                <el-input v-model="dialog.dataForm.username" placeholder="请输入用户名" clearable maxlength="20"
                    :disabled="dialog.update"></el-input>
            </el-form-item>
            <el-form-item v-if="!dialog.update" prop="password" label="密码">
                <el-input v-model="dialog.dataForm.password" type="password" placeholder="请输入密码" clearable
                    maxlength="20" @input="value => dialog.dataForm.password = value.replace(/\s+/g, '')"
                    @paste="e => e.preventDefault()"></el-input>
            </el-form-item>
            <el-form-item prop="name" label="姓名">
                <el-input v-model="dialog.dataForm.name" placeholder="请输入姓名" clearable maxlength="10"></el-input>
            </el-form-item>
            <el-form-item prop="sex" label="性别">
                <el-select v-model="dialog.dataForm.sex" placeholder="请选择性别" clearable>
                    <el-option lable="男" value="男"></el-option>
                    <el-option lable="女" value="女"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="tel" label="电话">
                <el-input v-model="dialog.dataForm.tel" placeholder="请输入电话" clearable maxlength="11"></el-input>
            </el-form-item>
            <el-form-item prop="email" label="邮箱">
                <el-input v-model="dialog.dataForm.email" placeholder="请输入邮箱" clearable maxlength="20"></el-input>
            </el-form-item>
            <el-form-item prop="hiredate" label="入职时间">
                <el-date-picker v-model="dialog.dataForm.hiredate" type="date" placeholder="请选择入职时间" :editable="false"
                    format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
            <el-form-item prop="role" label="角色">
                <el-select v-model="dialog.dataForm.role" placeholder="请选择角色" class="dialog-input" multiple clearable>
                    <el-option v-for="role in searchForm.roleList" :key="role.id" :label="role.roleName"
                        :value="role.id" :disabled="role.roleName == '超级管理员'"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="deptId" label="部门">
                <el-select v-model="dialog.dataForm.deptId" placeholder="请选择部门" class="dialog-input" clearable>
                    <el-option v-for="dept in searchForm.deptList" :key="dept.id" :label="dept.deptName"
                        :value="dept.id"></el-option>
                </el-select>
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

import { getCurrentInstance, ref, onMounted, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { dayjs, ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue'

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as any;

// 条件搜索表单
const searchForm = ref({
    name: '',
    sex: '',
    role: null,
    deptId: null,
    status: '',
    roleList: [],
    deptList: []
});


// 条件搜索表单验证规则
const dataRule = ref({
    // 姓名验证格式：1-10 个简体汉字
    name: [{ reuired: true, pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '请输入正确的姓名' }],
})

// 数据表格
const dataTable = ref({
    dataList: [],                       // 数据列表
    pageIndex: 1,                       // 当前页码
    pageSize: 10,                       // 每页显示条数
    total: 0,                           // 总条数
    loading: false,                     // 加载状态
    selections: []                      // 多选数据
});

// 用户名校验
const validateCheckUsername = (rule, value, callback) => {
    if (!dialog.value.update) {
        proxy.$http('/mis/user/checkUsername', 'POST', { username: value }, true, resp => {
            if (resp.exists === 1) {
                callback(new Error('用户名已存在'))
            } else {
                callback()
            }
        })
    } else {
        // ✅ 修改模式下必须调用 callback()
        callback()
    }
}
// 弹窗数据表单
const dialog = ref({
    visable: false,                     // 弹窗显示状态
    update: false,                     // 弹窗类型：新增/修改
    dataForm: {
        id: null,
        username: null,                 // 用户名
        password: null,                 // 密码
        name: null,                     // 姓名
        sex: null,                      // 性别
        tel: null,                      // 电话
        email: null,                    // 邮箱
        hiredate: dayjs(new Date()).format('YYYY-MM-DD'),                 // 入职时间
        role: [],                       // 角色
        deptId: null,                   // 部门
        status: null                    // 状态
    },
    dataRule: {
        username: [
            { required: true, message: '用户名不能为空', trigger: 'blur' },
            { pattern: '^[a-zA-Z0-9]{5,20}$', message: '请输入正确的用户名', trigger: 'blur' },
            { validator: validateCheckUsername, trigger: 'blur' }
        ],
        password: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { pattern: '^[a-zA-z0-9]{5,20}$', message: '请输入正确的密码', trigger: 'blur' }
        ],
        name: [
            { required: true, pattern: '', message: '姓名不能为空', trigger: 'blur' },
            { pattern: '^[\u4e00-\u9fa5]{2,10}$', message: '请输入正确的姓名', trigger: 'blur' }
        ],
        sex: [{ required: true, message: '性别不能为空', trigger: 'blur' }],
        tel: [{ required: true, message: '电话不能为空', trigger: 'blur' }],
        email: [
            { required: true, message: '邮箱不能为空', trigger: 'blur' },
            { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        hiredate: [{ required: true, message: '入职时间不能为空', trigger: 'blur' }],
        role: [{ required: true, message: '角色不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
    }
})


// 查询角色和部门列表
const getAllRoles = () => {
    proxy.$http('/mis/role/getAllRoles', 'GET', null, true, resp => {
        searchForm.value.roleList = resp.roleList
    })
}

const getAllDepts = () => {
    proxy.$http('/mis/dept/getAllDepts', 'GET', null, true, resp => {
        searchForm.value.deptList = resp.deptList
    })
}

getAllRoles();
getAllDepts();


// 获取用户数据列表
const getUserList = () => {
    dataTable.value.loading = true
    // 传递的查询参数模型
    let searchParam = {
        page: dataTable.value.pageIndex,
        length: dataTable.value.pageSize,
        name: searchForm.value.name,
        sex: searchForm.value.sex,
        role: searchForm.value.role,
        deptId: searchForm.value.deptId,
        status: searchForm.value.status
    }

    // 发送请求到后端接口
    proxy.$http('/mis/user/getUserListByPage', 'POST', searchParam, true, resp => {
        // 查询结果
        let pageData = resp.pageData

        // 将数据中的 status 由数字转换为文字
        for (let user of pageData.pageList) {
            if (user.status == 1) {
                user.status = '在职'
            } else if (user.status == 2) {
                user.status = '离职'
            }
        }

        // 赋值给页面数据模型
        dataTable.value.dataList = pageData.pageList
        dataTable.value.total = pageData.totalCount
        dataTable.value.loading = false
    })
}

getUserList();

// 条件搜索
const searchHandle = () => {
    // 对输入和数据进行验证
    proxy.$refs['searchFormRef'].validate((valid: boolean) => {
        if (valid) {
            // 通过验证，清理验证结果
            proxy.$refs['searchFormRef'].clearValidate()
            // 默认显示第一页数据
            dataTable.value.pageIndex = 1
            // 重新查询数据
            getUserList()
        } else {
            return false
        }
    })
}

// 新增 button 点击
const addHandle = () => {
    dialog.value.visable = true

    // 清空表单数据，需要等待 DOM 元素渲染完成
    proxy.$nextTick(() => {
        // 清空校验结果
        proxy.$refs['dialogFormRef'].clearValidate()
        proxy.$refs['dialogFormRef'].resetFields();
    })

    dialog.value.dataForm.id = null
    dialog.value.update = false
}

// 更新 button 点击
const updateHandle = (id: number) => {

    dialog.value.visable = true
    dialog.value.update = true
    dialog.value.dataForm.id = id

    // 回显表单数据 DOM 元素渲染完成
    proxy.$nextTick(() => {
        // 先从数据库中查询该用户信息，回显到弹窗中
        proxy.$http('/mis/user/getUserById', 'POST', { id: id }, true, resp => {
            // 清空校验结果
            proxy.$refs['dialogFormRef'].clearValidate()

            // 回显数据
            let updateUserInfo = resp.updateUserInfo

            dialog.value.dataForm.username = updateUserInfo.username
            dialog.value.dataForm.name = updateUserInfo.name
            dialog.value.dataForm.sex = updateUserInfo.sex
            dialog.value.dataForm.tel = updateUserInfo.tel
            dialog.value.dataForm.email = updateUserInfo.email
            dialog.value.dataForm.hiredate = updateUserInfo.hiredate
            dialog.value.dataForm.role = updateUserInfo.role                        // 回显角色，由于后端返回的对象类型是 UpdateUserTo，与接收时相同，所以无需额外转换操作
            dialog.value.dataForm.deptId = updateUserInfo.deptId
            dialog.value.dataForm.status = updateUserInfo.status
        })
    })
}

// 弹窗提交
const dialogFormSubmit = () => {
    // 对输入和数据进行验证
    proxy.$refs['dialogFormRef'].validate((valid: boolean) => {

        if (valid) {
            // 校验通过，获取弹窗表单数据，将其转换为 JSON 数据
            let userData = {
                id: dialog.value.dataForm.id,
                username: dialog.value.dataForm.username,
                password: dialog.value.dataForm.password,
                name: dialog.value.dataForm.name,
                sex: dialog.value.dataForm.sex,
                tel: dialog.value.dataForm.tel,
                email: dialog.value.dataForm.email,
                hiredate: dayjs(dialog.value.dataForm.hiredate).format('YYYY-MM-DD'),               // dataForm 中的值为日期对象，将其转换为字符串
                role: dialog.value.dataForm.role,
                deptId: dialog.value.dataForm.deptId,
                status: dialog.value.dataForm.status
            }

            // 清空校验结果
            proxy.$refs['dialogFormRef'].clearValidate()
            // 判断是新增还是修改
            // 发送请求到后端接口，根据是否传入 id 来判断新增还是修改
            proxy.$http(`/mis/user/${dialog.value.update == false ? 'insertUser' : 'updateUser'}`, 'POST', userData, true, resp => {
                if (resp.rows == 1) {
                    ElMessage.success({
                        message: dialog.value.update == false ? '新增成功' : '修改成功',
                        duration: 1200,
                        onClose: () => {
                            // 关闭弹窗
                            dialog.value.visable = false
                            // 重新查询数据
                            getUserList()
                        }
                    })
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1000,
                    })
                }
            })
        }
    })
}

// 复选框是否能被选中
const selectable = (row: any, index: number) => {
    // 将多个角色分割为字符串
    let roleList = row.roles.split('，')
    // 超级管理员复选框不能被选中
    if (roleList.includes("超级管理员")) {
        return false
    }
    return true
}

// 操作选中数据行，val 为数组，其中存储了被选中行数据
const selectionChangeHandle = (val) => {
    // 将选中的数据行存储到 dataTable.value.selections 中
    dataTable.value.selections = val;
}

// 删除和批量删除窗口
// 注意：批量删除的点击事件 @click="deleteHandle()"，需要传入 undefined 或加括号且不传入参数，否则 Vue 会将原生 DOM 事件对象自动作为第一个参数传递给方法
const deleteHandle = (id: any) => {
    // 判断当前是单行删除还是批量删除，根据是否传入 id 来判断，若传入单个 id 需要包装为数组
    let ids = id !== undefined ? [id] : dataTable.value.selections.map((item: any) => item.id)

    // 若没有选中任何行，则提示用户
    if (ids.length == 0) {
        ElMessage.warning({
            message: '没有选中记录',
            duration: 1000
        })
    } else {
        ElMessageBox.confirm(`是否确定删除选中的记录？`, '警告', {
            type: 'warning',
            icon: markRaw(Delete),
            draggable: true,
            overflow: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        }).then(() => {
            // 确定删除，发送请求到后端接口中
            proxy.$http('/mis/user/deleteUserByIds', 'POST', { ids: ids }, true, resp => {
                if (resp.rows > 0) {
                    ElMessage.success({
                        message: '删除成功',
                        duration: 1200,
                        onClose: () => {
                            // 重新查询数据
                            getUserList()
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

// 员工离职
const dismissHandle = (id: number) => {
    ElMessageBox.confirm('是否确定将选中的员工离职？', '警告', {
        type: 'warning',
        draggable: true,
        overflow: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    }).then(() => {
        // 确定离职，发送请求到后端接口中
        proxy.$http('/mis/user/dismissUserById', 'POST', { id: id }, true, resp => {
            if (resp.rows == 1) {
                ElMessage.success({
                    message: '操作成功',
                    duration: 1200,
                    onClose: () => {
                        // 重新查询数据
                        getUserList()
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
        // 取消操作
        ElMessage.info({
            message: '取消操作',
            duration: 1000
        })
    })
}

// 选择每页显示条数
const sizeChangeHandle = (val: number) => {
    // 选择后根据新的分页条件查询数据
    dataTable.value.pageIndex = 1
    dataTable.value.pageSize = val
    getUserList()
}

// 跳转到指定页面
const currentChangeHandle = (val: number) => {
    // 选择后根据新的分页条件查询数据
    dataTable.value.pageIndex = val
    getUserList()
}

</script>

<style lang="less" scoped>
.dialog-input {
    width: 100% !important;
}
</style>
