<template>
    <div class="searchForm">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item prop="keyword">
                <el-input v-model="dataForm.keyword" placeholder="套餐名称 / 姓名 / 电话" class="keyword"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item class="date">
                <el-date-picker v-model="dataForm.date" type="date" placeholder="选择日期" :editable="false"
                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="Search" @click="searchHandle()">查询</el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
                    <el-radio-button :value="'all'">全部</el-radio-button>
                    <el-radio-button :value="'close'">已结束</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </div>


    <div class="table-conatainer" v-show="!empty">
        <el-table :data="data.dataList" class="appointment-table" :header-cell-style="{ 'background': '#f5f7fa' }"
            border v-loading="data.loading">
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="goodsTitle" header-align="center" align="center" label="套餐名称" min-width="250"
                fixed />
            <el-table-column prop="name" header-align="center" align="center" label="体检人" min-width="120" />
            <el-table-column prop="appointmentDate" header-align="center" align="center" label="预约日期" min-width="120" />
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="120" />
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" link :disabled="scope.row.filePath == null"
                        @click="downloadHandle(scope.row.name, scope.row.filePath)">
                        体检报告
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <div class="empty" v-show="empty">
        <el-empty :image-size="200" />
    </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';

import router from '../../router/index';

import { dayjs, ElMessage } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
const { proxy } = getCurrentInstance() as any;

let empty = ref(false);

// 搜索表单
const dataForm = ref({
    keyword: null,
    date: null,
    status: null,
    statusLabel: '全部',
});

// 表单验证规则
const dataRule = ref({
    keyword: [
        { required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,30}$', message: '关键字内容不正确' }
    ]
});

// 表格数据
const data = ref({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false
});

// 分页查询
const loadAppoinmentData = () => {
    data.value.loading = true;

    if (dataForm.value.statusLabel == '全部') {
        dataForm.value.status = null;
    } else {
        dataForm.value.status = 4;
    }
    let json = {
        page: data.value.pageIndex,
        length: data.value.pageSize,
        keyword: dataForm.value.keyword,
        appointmentDate: dataForm.value.date,
        status: dataForm.value.status
    };

    proxy.$http('/front/appointment/searchAppointmentByPage', 'POST', json, true, resp => {
        if (resp.code == 200) {
            let statusEnum = {
            '1': '未签到',
            '2': '已签到',
            '3': '已结束',
            '4': '已关闭'
        };

        console.log(resp.pageData);
        

        let pageData = resp.pageData
        
        for (let one of pageData.pageList) {
            one.status = statusEnum[one.status + ""];
        }

        data.value.dataList = pageData.pageList;
        data.value.totalCount = pageData.totalCount;
        data.value.loading = false;

        empty.value = data.value.dataList.length == 0;
            
        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 1500
            })
        }
    })
}

const sizeChangeHandle = (val: any) => {
    data.value.pageSize = val;
    data.value.pageIndex = 1;
}

const currentChangeHandle = (val: any) => {
    data.value.pageIndex = val;
}


onMounted(() => {
    loadAppoinmentData();
})

</script>


<style lang="less" scoped>
@import url("appointment_list.less");
</style>
