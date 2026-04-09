<template>
    <div v-if="proxy.$isAuth(['ROOT', 'CHECKUP_REPORT:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="dataForm.name" placeholder="姓名" maxlength="20" class="input" clearable="clearable" />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="dataForm.tel" placeholder="电话号码" maxlength="11" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="waybillCode">
                <el-input v-model="dataForm.waybillCode" placeholder="快递单号" maxlength="24" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">查询</el-button>
            </el-form-item>
            <el-form-item>
                <el-upload :action="upload.action" name="file" accept=".xlsx" :headers="upload.headers"
                    :show-file-list="false" :before-upload="excelBeforeUpload" :on-success="excelUploadSuccess"
                    :on-error="excelUploadError">
                    <el-button type="primary">导入运单</el-button>
                </el-upload>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.status" @change="searchHandle()">
                    <el-radio-button value="">全部</el-radio-button>
                    <el-radio-button :value="1">未生成</el-radio-button>
                    <el-radio-button :value="2">生成中</el-radio-button>
                    <el-radio-button :value="3">已生成</el-radio-button>
                    <el-radio-button :value="4">已寄出</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border
            v-loading="data.loading">
            <el-table-column type="index" header-align="center" align="center" width="100" label="序号" fixed>
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" label="姓名" width="120" min-width="50" fixed />
            <el-table-column prop="appointmentDate" header-align="center" align="center" label="体检日期" width="150" />
            <el-table-column prop="sex" header-align="center" align="center" label="性别" width="80" />
            <el-table-column prop="age" header-align="center" align="center" label="年龄" width="80" />
            <el-table-column prop="tel" header-align="center" align="center" label="电话" width="150" />
            <el-table-column prop="status" header-align="center" align="center" label="报告状态" width="140">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" size="default" effect="dark"
                        style="font-size: 13px;">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="generatedTime" header-align="center" align="center" label="生成报告时间" width="180">
                <template #default="scope">
                    <span>{{ scope.row.generatedTime != null ? dayjs(scope.row.generatedTime).format('YYYY-MM-DD hh:mm:ss') : null }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="waybillCode" header-align="center" align="center" label="快递单号" />
            <el-table-column prop="waybillDate" header-align="center" align="center" label="寄出日期" width="150" />
            <el-table-column fixed="right" header-align="center" align="center" width="250" label="操作">
                <template #default="scope">
                    <!-- 只有预约体检的状态为已完成（3）时才可以生成报告 -->
                    <el-button type="primary" link :disabled="scope.row.appointmentStatus != 3"
                        @click="createReportHandle(scope.row.reportId, scope.row.status)">
                        生成报告
                    </el-button>
                    <el-button type="success" link :disabled="!(scope.row.status == '3' || scope.row.status == '4')"
                        @click="downloadReportHandle(scope.row.reportId)">
                        下载报告
                    </el-button>
                    <el-button type="danger" link :disabled="scope.row.status != '3'"
                        @click="identifyWaybillHandle(scope.row.id, scope.row.name, scope.row.tel)">
                        录入运单
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <!-- 快递单号窗口 -->
    <el-dialog title="录入运单" v-if="proxy.$isAuth(['ROOT', 'CHECKUP_REPORT:UPDATE'])" :close-on-click-modal="false"
        v-model="dialog.visible" width="420px">
        <el-alert title="请上传快递运单照片，系统将自动识别运单中的信息，然后请您核对无误后，提交运单信息" type="success" :closable="false" />
        <el-upload :action="dialog.upload.action" name="file" accept=".jpg,.jpeg" :headers="dialog.upload.headers"
            :show-file-list="false" :before-upload="waybillBeforeUpload" :on-success="waybillUploadSuccess"
            :on-error="waybillUploadError">
            <el-button type="primary">上传运单</el-button>
        </el-upload>
        <el-divider border-style="dashed">认真核对下方运单信息</el-divider>
        <table class="waybill-table">
            <tr>
                <th>收件人姓名：</th>
                <td>{{ dialog.data.recName }}</td>
            </tr>
            <tr>
                <th>收件人电话：</th>
                <td>{{ dialog.data.recTel }}</td>
            </tr>
            <tr>
                <th>运单号码：</th>
                <td>{{ dialog.data.waybillCode }}</td>
            </tr>
        </table>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">取消</el-button>
                <el-button type="primary"
                    :disabled="dialog.data.waybillCode == null || dialog.data.name != dialog.data.recName || dialog.data.recTel.substr(7, 4) != dialog.data.telEnd"
                    @click="dataFormSubmit">
                    提交运单
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type UploadFile, type UploadFiles, type UploadRawFile } from 'element-plus'

import { useWebSocket } from '../../utils/useWebSocketUtil';
import { cookieUtil } from '../../utils/CookieUtil';

import { dayjs } from 'element-plus'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrBefore)

const { proxy } = getCurrentInstance() as any;

const dataForm = ref({
    name: null,
    tel: null,
    waybillCode: null,
    status: ""
});

// 体检报告
const data = ref({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false
});

const dataRule = ref({
    name: [
        { required: false, pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误' }
    ],
    tel: [
        { required: false, pattern: '^1[1-9]\\d{9}$', message: '电话格式错误' }
    ],
    waybillCode: [
        { required: false, pattern: '^[0-9a-zA-Z]{10,24}$', message: '快递单号格式错误' }
    ]
});

// 体检报告状态
const statusMap = {
    1: { text: '未生成', type: 'danger' },
    2: { text: '生成中', type: 'warning' },
    3: { text: '已生成', type: 'success' },
    4: { text: '已邮寄', type: 'primary' },
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'


// 运单信息窗口
const dialog = ref({
    visible: false,
    upload: {
        action: `${proxy.$baseUrl}/mis/checkup/report/identifyWaybill`,
        headers: {
            "token": localStorage.getItem('token')
        },
        data: {
            id: null
        }
    },
    data: {
        id: null,
        recName: null,
        recTel: null,
        waybillCode: null,
        name: null,
        telEnd: null
    }
})

// 查询运单
const searchHandle = () => {
    proxy.$refs['form'].validate(valid => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.value.name == '') {
                dataForm.value.name = null;
            }
            if (dataForm.value.tel == '') {
                dataForm.value.tel = null;
            }
            if (dataForm.value.waybillCode == '') {
                dataForm.value.waybillCode = null;
            }
            if (data.value.pageIndex != 1) {
                data.value.pageIndex = 1;
            }
            loadDataList();
        } else {
            return false;
        }
    });
}

// 页面加载数据
const loadDataList = () => {
    data.value.loading = true

    let json = {
        page: data.value.pageIndex,
        length: data.value.pageSize,
        name: dataForm.value.name,
        tel: dataForm.value.tel,
        waybillCode: dataForm.value.waybillCode,
        status: dataForm.value.status
    }

    proxy.$http('/mis/checkup_report/searchCheckupReportByPage', 'POST', json, true, resp => {
        if (resp.code == 200) {

            let pageData = resp.pageData

            data.value.dataList = pageData.pageList
            data.value.totalCount = pageData.totalCount
            data.value.pageIndex = pageData.pageIndex
            data.value.pageSize = pageData.pageSize

            data.value.loading = false

        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 2000
            })
        }
    })
}

// 改变页面数据量
const sizeChangeHandle = (val: number) => {
    data.value.pageSize = val;
    data.value.pageIndex = 1;
    loadDataList();
}

// 改变当前页
const currentChangeHandle = (val: number) => {
    data.value.pageIndex = val;
    loadDataList();
}

// 生成体检报告
const createReportHandle = (id: number, status: number) => {
    let text = '';

    if (status === 1) {
        text = "确定【手动】生成体检报告吗？"
    } else if (status === 3) {
        text = "该报告已经生成，是否【重新生成】？"
    } else {
        ElMessage.warning({
            message: '当前状态不允许生成体检报告',
            duration: 2000
        });
        return;
    }

    ElMessageBox.confirm(text, '提示信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        proxy.$http('/mis/checkup_report/createReport', 'POST', { id: id }, true, resp => {
            if (resp.code == 200) {
                let result = resp.result
                if (result) {
                    ElMessage.success({
                        message: '成功提交体检报告生成请求',
                        duration: 2000
                    })
                    loadDataList()
                } else {
                    ElMessage.warning({
                        message: '体检报告已生成或正在生成中，请勿重复点击',
                        duration: 2000
                    })
                }
            } else {
                ElMessage.error({
                    message: '提交体检报告生成请求失败',
                    duration: 2000
                })
            }
        })
    }).catch(() => {
        ElMessage.info({
            message: '已取消操作',
            duration: 2000
        })
    })
}

// 下载体检报告
const downloadReportHandle = (id: number) => {
    proxy.$download(`/mis/checkup_report/downloadReport/${id}`);
}

// 报告数据上传前处理，参数为上传的文件， 若返回 false 或者返回 Promise 且被 reject，则停止上传
const excelBeforeUpload = (rawFile: UploadRawFile) => {

}

// 上传报告
const upload = ref({
    action: `${proxy.$baseUrl}/mis/checkup/report/importWaybills`,
    headers: {
        "token": localStorage.getItem('token')
    },
});

// 体检报告文件上传成功时的处理
const excelUploadSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {

}

// 体检报告文件上传失败时的处理
const excelUploadError = (err: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {

}

// 录入运单
const identifyWaybillHandle = (id: number, name: string, tel: string) => {

}

// 运单照片上传前的处理，参数为上传的文件， 若返回 false 或者返回 Promise 且被 reject，则停止上传
const waybillBeforeUpload = (file: UploadRawFile) => {

}

// 运单照片上传成功时的处理
const waybillUploadSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {

}

// 运单照片上传失败时的处理
const waybillUploadError = (err: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {

}

// 提交运单数据
const dataFormSubmit = () => {

}

/* webSocket 接收广播消息 */
const { connect } = useWebSocket();

onMounted(() => {
    loadDataList();
    connect(cookieUtil.getBackendUser()?.token || '', (message) => {
        // 收到消息，刷新页面
        loadDataList();
    }, '/topic/checkup-report');
});

</script>

<style lang="less" scoped>
@import url('checkup_report.less');
</style>
