<template>
    <div v-if="proxy.$isAuth(['ROOT', 'APPOINTMENT:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item>
                <el-date-picker v-model="dataForm.date" type="date" placeholder="选择日期" :editable="false"
                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" clearable />
            </el-form-item>
            <el-form-item prop="name">
                <el-input v-model="dataForm.name" placeholder="姓名" maxlength="10" class="input" clearable />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="dataForm.tel" placeholder="电话号码" maxlength="11" class="input" clearable />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">查询</el-button>
                <el-button type="danger" :disabled="!proxy.$isAuth(['ROOT', 'APPOINTMENT:DELETE'])"
                    @click="deleteHandle(undefined)">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="未签到">未签到</el-radio-button>
                    <el-radio-button value="已签到">已签到</el-radio-button>
                    <el-radio-button value="已结束">已结束</el-radio-button>
                    <el-radio-button value="已关闭">已关闭</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle">
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"
                fixed />
            <el-table-column type="index" header-align="center" align="center" width="70" label="序号" fixed>
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="姓名" width="120" fixed />
            <el-table-column prop="sex" header-align="center" align="center" label="性别" width="70" />
            <el-table-column prop="age" header-align="center" align="center" label="年龄" width="70" />
            <el-table-column prop="tel" header-align="center" align="center" label="联系电话" width="150" />
            <el-table-column prop="pid" header-align="center" align="center" label="身份证号" width="190" />
            <el-table-column prop="appointmentDate" header-align="center" align="center" label="预约日期" width="190" />
            <el-table-column header-align="center" align="center" label="备注" width="200">
                <template #default="scope">
                    <el-tooltip effect="dark" :content="scope.row.desc || ''" placement="bottom"
                        :disabled="!(scope.row.desc && scope.row.desc.length > 20)" raw-content>
                        <div class="text-ellipsis-cell">
                            {{ scope.row.desc }}
                        </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="goodsTitle" header-align="center" align="center" label="体检套餐" min-width="200">
                <template #default="scope">
                    <el-tooltip effect="dark" :content="scope.row.goodsTitle || ''" placement="bottom"
                        :disabled="!(scope.row.goodsTitle && scope.row.goodsTitle.length > 10)" raw-content>
                        <div class="text-ellipsis-cell">
                            {{ scope.row.goodsTitle }}
                        </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" label="状态" width="120" />
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="danger" link
                        :disabled="!proxy.$isAuth(['ROOT', 'APPOINTMENT:DELETE']) || scope.row.status != '未签到'"
                        @click="deleteHandle(scope.row.id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref } from 'vue';
import { dayjs, ElMessage, ElMessageBox } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const { proxy } = getCurrentInstance() as any;

// 搜索表单
const dataForm = ref({
    name: null,
    tel: null,
    date: dayjs().format('YYYY-MM-DD'),
    statusLabel: '全部',
    status: null
});

const dataRule = ref({
    name: [
        { pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误', trigger: 'blur' }
    ],
    tel: [
        { pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误', trigger: 'blur' }
    ]
});

// 表格数据
const data = ref({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: []
});

// 分页查询数据
const loadMisAppointmentPageData = () => {
    data.value.loading = true;
    if (dataForm.value.statusLabel == '全部') {
        dataForm.value.status = null;
    } else if (dataForm.value.statusLabel == '未签到') {
        dataForm.value.status = 1;
    } else if (dataForm.value.statusLabel == '已签到') {
        dataForm.value.status = 2;
    } else if (dataForm.value.statusLabel == '已结束') {
        dataForm.value.status = 3;
    } else if (dataForm.value.statusLabel == '已关闭') {
        dataForm.value.status = 4;
    }

    let json = {
        name: dataForm.value.name,
        tel: dataForm.value.tel,
        appointmentDate: dataForm.value.date,
        status: dataForm.value.status,
        page: data.value.pageIndex,
        length: data.value.pageSize
    };

    proxy.$http('/mis/appointment/searchAppointmentByPageForMis', 'POST', json, true, function (resp: any) {
        let pageData = resp.pageData;

        let statusEnum = {
            '1': '未签到',
            '2': '已签到',
            '3': '已结束',
            '4': '已关闭'
        };
        for (let one of pageData.pageList) {
            one.status = statusEnum[one.status];
        }
        data.value.dataList = pageData.pageList;
        data.value.totalCount = pageData.totalCount;
        data.value.loading = false;
    });
}

// 条件查询
const searchHandle = () => {
    proxy.$refs['form'].validate(valid => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.value.date == '') {
                dataForm.value.date = null;
            }
            if (dataForm.value.name == '') {
                dataForm.value.name = null;
            }
            if (dataForm.value.tel == '') {
                dataForm.value.tel = null;
            }
            if (data.value.pageIndex != 1) {
                data.value.pageIndex = 1;
            }
            loadMisAppointmentPageData();
        } else {
            return false;
        }
    });
}

// 删除预约
const deleteHandle = (id: any) => {
    let ids = id == undefined ? data.value.selections.map((item: any) => item.id) : [id]

    if (ids.length == 0) {
        ElMessage.warning({
            message: '没有选中记录',
            duration: 1200
        });
    } else {
        ElMessageBox.confirm(`确定要删除选中的记录？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            let json = { ids: ids };
            proxy.$http('/mis/appointment/deleteAppointmentByIds', 'POST', json, true, function (resp) {
                if (resp.code == 200) {
                    if (resp.rows > 0) {
                        ElMessage.success({
                            message: '删除成功',
                            duration: 1200
                        });
                        loadMisAppointmentPageData();
                    } else {
                        ElMessage.warning({
                            message: '未能删除记录',
                            type: 'warning',
                            duration: 1200
                        });
                    }
                } else {
                    ElMessage.error({
                        message: resp.message,
                        duration: 1200
                    });
                }
            });
        });
    }
}

// 分页, 每页条数改变
const sizeChangeHandle = (val) => {
    data.value.pageSize = val;
    data.value.pageIndex = 1;
    loadMisAppointmentPageData();
}

// 分页, 当前页改变
const currentChangeHandle = (val) => {
    data.value.pageIndex = val;
    loadMisAppointmentPageData();
}

// 被选中记录
const selectionChangeHandle = (val) => {
    data.value.selections = val;
}

// 是否能被选中
const selectable = (row, index) => {
    if (row.status != '未签到') {
        return false
    }
    return true
}

onMounted(() => {
    loadMisAppointmentPageData();
})

</script>

<style lang="less" scoped>
@import url("appointment.less");
</style>
