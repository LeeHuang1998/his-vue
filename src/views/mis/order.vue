<template>
    <!-- 搜索表单 -->
    <div v-if="proxy.$isAuth(['ROOT', 'ORDER:SELECT'])">
        <el-form :inline="true" :model="orderDataForm" :rules="orderDataRule" ref="form">
            <el-form-item prop="code">
                <el-input v-model="orderDataForm.code" placeholder="套餐编号" maxlength="20" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="outTradeNo">
                <el-input v-model="orderDataForm.outTradeNo" placeholder="订单号" maxlength="64" class="keyword"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="keyword">
                <el-input v-model="orderDataForm.keyword" placeholder="套餐名称" class="keyword" maxlength="50"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="orderDataForm.tel" placeholder="电话号码" maxlength="11" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item class="range">
                <el-date-picker v-model="orderDataForm.dateRange" type="daterange" range-separator="~"
                    start-placeholder="起始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item>
                <el-select v-model="orderDataForm.status" class="input" placeholder="订单状态" clearable="clearable">
                    <el-option label="未付款" value="1" />
                    <el-option label="已关闭" value="2" />
                    <el-option label="已付款" value="3" />
                    <el-option label="已退款" value="4" />
                    <el-option label="已预约" value="5" />
                    <el-option label="已结束" value="6" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">查询</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" v-if="proxy.$isAuth(['ROOT', 'ORDER:UPDATE'])" :icon="Refresh"
                    @click="openDialogHandler">同步支付结果</el-button>
            </el-form-item>
        </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
        @selection-change="selectionChangeHandle" @expand-change="expand" :row-key="data.getRowKeys"
        :expand-row-keys="data.expands">
        <!-- 折叠面板内容 -->
        <el-table-column type="expand">
            <template #default="scope">
                <div class="content-container">
                    <div class="left-panel">
                        <el-card class="box-card" shadow="never">
                            <div class="info">
                                <div class="left">
                                    <el-avatar :size="57" shape="square" :src="scope.row.photo">
                                        <el-icon size="35">
                                            <UserFilled />
                                        </el-icon>
                                    </el-avatar>
                                </div>
                                <div class="right">
                                    <h4 class="customer-name">{{ scope.row.name }}</h4>
                                    <p class="customer-desc">
                                        <el-icon class="icon">
                                            <User />
                                        </el-icon>
                                        <span class="value">{{ scope.row.sex }}</span>
                                        <el-icon class="icon">
                                            <Phone />
                                        </el-icon>
                                        <span class="value">{{ scope.row.tel }}</span>
                                        <el-icon class="icon">
                                            <Calendar />
                                        </el-icon>
                                        <span class="value">{{ scope.row.registerTime }}</span>
                                    </p>
                                </div>
                            </div>
                            <el-divider />
                            <el-row :gutter="16">
                                <el-col :span="6">
                                    <div class="statistic-card">
                                        <el-statistic :value="scope.row.number - scope.row.appointmentNum" suffix="个">
                                            <template #title>
                                                <div class="title">可预约体检</div>
                                            </template>
                                        </el-statistic>
                                    </div>
                                </el-col>
                                <el-col :span="6">
                                    <div class="statistic-card">
                                        <el-statistic :value="scope.row.num" suffix="个">
                                            <template #title>
                                                <div class="title">已预约体检</div>
                                            </template>
                                        </el-statistic>
                                    </div>
                                </el-col>
                                <el-col :span="6">
                                    <div class="statistic-card">
                                        <el-statistic :value="scope.row.number" suffix="个">
                                            <template #title>
                                                <div class="title">总计数量</div>
                                            </template>
                                        </el-statistic>
                                    </div>
                                </el-col>
                            </el-row>
                        </el-card>
                        <el-descriptions :column="1" class="order-code" border>
                            <el-descriptions-item label="订单编号：" label-align="center">
                                {{ scope.row.outTradeNo }}
                            </el-descriptions-item>
                            <el-descriptions-item label="付款编号：" label-align="center">
                                {{ scope.row.transactionId == null ? "无" : scope.row.transactionId }}
                            </el-descriptions-item>
                            <el-descriptions-item label="退款编号：" label-align="center">
                                {{ scope.row.outRefundNo == null ? "无" : scope.row.outRefundNo }}
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                    <div class="right-panel">
                        <el-table :data="data.appointment" :header-cell-style="{ 'background': '#f5f7fa' }" height="350"
                            border>
                            <el-table-column label="序号" type="index" label-align="center" align="center" min-width="90">
                                <template #default="scope">
                                    <span>{{ scope.$index + 1 }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="name" label="体检人" label-align="center" align="center"
                                min-width="180" />
                            <el-table-column prop="sex" label="性别" label-align="center" align="center"
                                min-width="120" />
                            <el-table-column prop="age" label="年龄" label-align="center" align="center"
                                min-width="120" />
                            <el-table-column prop="tel" label="电话" label-align="center" align="center"
                                min-width="180" />
                            <el-table-column prop="date" label="体检日" label-align="center" align="center"
                                min-width="180" />
                            <el-table-column prop="status" label="状态" label-align="center" align="center"
                                min-width="130" />
                        </el-table>
                    </div>
                </div>

            </template>
        </el-table-column>
        <el-table-column type="selection" header-align="center" align="center" width="50" :selectable="selectable" />
        <el-table-column type="index" header-align="center" align="center" width="100" label="序号">
            <template #default="scope">
                <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="goodsTitle" header-align="left" align="center" min-width="150" label="套餐名称" />
        <el-table-column prop="outTradeNo" header-align="left" align="center" min-width="150" label="订单号" />
        <el-table-column header-align="center" align="center" min-width="80" label="价格">
            <template #default="scope">
                <span>￥{{ scope.row.goodsPrice }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="number" header-align="center" align="center" min-width="40" label="数量" />
        <el-table-column header-align="center" align="center" min-width="100" label="总计">
            <template #default="scope">
                <span>￥{{ scope.row.totalAmount }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="status" header-align="center" align="center" min-width="50" label="状态" />
        <el-table-column prop="createTime" header-align="center" align="center" min-width="140" label="下单时间" />
        <el-table-column prop="refundTime" header-align="center" align="center" min-width="140" label="退款时间" />
        <el-table-column header-align="center" align="center" width="200" label="操作">
            <template #default="scope">
                <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'ORDER:SELECT'])"
                    @click="viewHandle(scope.row.snapshotId)">
                    预览
                </el-button>
                <el-button type="danger" link v-if="proxy.$isAuth(['ROOT', 'ORDER:DELETE'])"
                    :disabled="scope.row.status != '已关闭'" @click="deleteHandle(scope.row.id)">
                    删除
                </el-button>
                <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'ORDER:UPDATE'])"
                    :disabled="scope.row.status != '已付款'" @click="updateHandle(scope.row.id)">
                    线下退款
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="data.pageIndex"
        :page-sizes="[10, 20, 50]" :page-size="data.pageSize" :total="data.totalCount"
        layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>

    <!-- 同步支付弹窗弹窗 -->
    <el-dialog v-model="payResultDialog.visible" title="同步支付状态窗口" width="450px" :draggable="true" :overflow="true"
        :align-center="true" :close-on-click-modal="false">
        <p style="margin-bottom: 30px;">请输入需要同步支付状态的订单号：</p>
        <el-form :model="payResultDialog.checkResultForm" ref="checkResultForm" label-position="right"
            label-width="auto" :rules="payResultDialog.checkRules">
            <el-form-item label="订单号" prop="outTradeNo">
                <el-input type="input" v-model="payResultDialog.checkResultForm.outTradeNo" placeholder="请输入订单号"
                    maxlength="64"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="payResultDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="checkPaymentResultHandle">确定</el-button>
            </div>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, onMounted } from 'vue';
import router from '../../router/index';
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance() as any;

const orderDataForm = ref({
    code: null,
    outTradeNo: null,
    keyword: null,
    tel: null,
    dateRange: [],
    status: null
});
// 表单校验规则
const orderDataRule = ref({
    code: [
        { min: 6, message: '编号不能少于6个字符' },
        { pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }
    ],
    outTradeNo: [
        { min: 6, message: '订单号不能少于6个字符' },
        { pattern: '^[a-zA-Z0-9]{6,20}$', message: '订单号格式错误' }
    ],
    keword: [
        { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '名称格式错误' }
    ],
    tel: [
        { pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }
    ]
});

// 表格数据
const data = ref({
    dataList: [
        {
            "amount": "3,377",
            "snapshotId": "642c4fdb3925dd0e35cb0a38",
            "registerTime": "2023-03-17",
            "sex": "男",
            "num": 0,
            "photo": "",
            "number": 1,
            "createTime": "2023-08-04 12:37",
            "goodsPrice": "3,377",
            "outTradeNo": "44DCED2D0FC34EA498C647E565BC4ABB",
            "name": "张大军",
            "goodsTitle": "新感恩敬老高级体检套餐",
            "tel": "13312345678",
            "id": 87,
            "status": "已关闭",
            "createDate": "2023-08-04"
        }
    ],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: [],
    expands: [],                        // 某一行记录的折叠面板展开，就把这一行记录的主键值放到 expands 数组中，若收起则从该数组中删除主键值
    getRowKeys(row) {                   // 获取被展开折叠面板的订单 id，点开时就能获取到订单 id
        return row.id;
    },
    appointment: []
});

const payResultDialog = ref({
    visible: false,
    checkResultForm: {
        outTradeNo: ''
    },
    checkRules: {
        outTradeNo: [
            { required: true, message: '订单号不能为空', trigger: 'blur' },
            { min: 6, message: '订单号不能少于6个字符' },
            { pattern: '^[a-zA-Z0-9]{6,20}$', message: '订单号格式错误' }
        ]
    }
})

const orderStatusEnum = {
    "1": "未付款",
    "2": "已关闭",
    "3": "已付款",
    "4": "已退款",
    "5": "已预约",
    "6": "已结束",
    "7": "退款中",
    "8": "退款失败"
}

// 页面加载数据
const loadOrderDataList = () => {

    data.value.loading = true;

    let range = orderDataForm.value.dateRange

    let json = {
        page: data.value.pageIndex,
        length: data.value.pageSize,
        keyword: orderDataForm.value.keyword,
        code: orderDataForm.value.code,
        outTradeNo: orderDataForm.value.outTradeNo,
        tel: orderDataForm.value.tel,
        status: orderDataForm.value.status,
        startDate: (range != null && range.length == 2) ? range[0] : null,
        endDate: (range != null && range.length == 2) ? range[1] : null,
        customerId: null
    };

    proxy.$http('/mis/order/searchOrderListByPage', 'POST', json, true, function (resp) {

        if (resp.code == 200) {
            let pageList = resp.pageData.pageList;
            for (let orderVO of pageList) {
                orderVO.status = orderStatusEnum[orderVO.status + ""]
                orderVO.goodsPrice = orderVO.goodsPrice.toFixed(2)
                orderVO.totalAmount = orderVO.totalAmount.toFixed(2)
            }
            data.value.dataList = pageList;
            data.value.totalCount = resp.pageData.totalCount;
            data.value.loading = false;
        } else {
            ElMessage.error({
                message: resp.message,
                duration: 2000
            })
        }
    });
}

// 条件查询
const searchHandle = () => {

    proxy.$refs['form'].validate(valid => {

        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (orderDataForm.value.keyword == '') {
                orderDataForm.value.keyword = null;
            }
            if (orderDataForm.value.code == '') {
                orderDataForm.value.code = null;
            }
            if (orderDataForm.value.outTradeNo == '') {
                orderDataForm.value.outTradeNo = null;
            }
            if (orderDataForm.value.tel == '') {
                orderDataForm.value.tel = null;
            }
            if (orderDataForm.value.status == '') {
                orderDataForm.value.status = null;
            }
            if (data.value.pageIndex != 1) {
                data.value.pageIndex = 1;
            }
            loadOrderDataList();
        } else {
            return false;
        }
    });
}
// 改变页面数据量大小
const sizeChangeHandle = (val: number) => {
    data.value.pageSize = val;
    data.value.pageIndex = 1;
    loadOrderDataList()
}
// 改变当前页码
const currentChangeHandle = (val: number) => {
    data.value.pageIndex = val;
    loadOrderDataList()
}

// 打开弹窗
const openDialogHandler = () => {
    payResultDialog.value.visible = true;

    proxy.$nextTick(() => {
        proxy.$refs['checkResultForm'].resetFields();
        proxy.$refs['checkResultForm'].clearValidate();
    })

}

// 同步支付结果
const checkPaymentResultHandle = () => {
    let json = {
        outTradeNo: payResultDialog.value.checkResultForm.outTradeNo
    }

    proxy.$http('/mis/order/checkPaymentResult', 'POST', json, true, resp => {
        if (resp.code == 200) {
            if (resp.paymentResult == 0) {
                ElMessage.error({
                    message: '订单号不存在',
                    duration: 2000
                })
            } else {
                ElMessageBox.alert('同步成功，订单状态为：' + orderStatusEnum[resp.paymentResult + ""], '同步结果', {
                    confirmButtonText: '确定',
                }).then(() => {
                    loadOrderDataList()
                })
            }
        }
    })
}


// 快照预览
const viewHandle = (snapshotId: string) => {
    router.push(
        { name: 'FrontGoodsSnapshot', params: { id: snapshotId, mode: "mis" } }
    );
}

// 展开折叠面板
const expand = (row, expandedRows) => {
    // expandedRows 不为空，则有面板展开
    if (expandedRows.length > 0) {
        //先把所有展开的面板收起
        data.value.expands = [];
        // 获取需要展开的面板的 orderId
        if (row) {
            data.value.appointment = []
            let json = {
                id: row.id
            }
            // 查询该订单的预约体检数据
            proxy.$http("/mis/appointment/searchAppointmentByOrderId", "POST", json, true, resp => {
                let appointmentList = resp.appointmentVOList
                let statusEnum = {
                    "1": "未签到",
                    "2": "已签到",
                    "3": "已结束",
                    "4": "已关闭"
                }
                // 状态转换为文字
                for (let appointment of appointmentList) {
                    appointment.status = statusEnum[appointment.status + ""]
                }
                data.value.appointment = resp.appointmentVOList

            })
            // 往 expands 添加数据，里面的数据就是要展开的订单记录折叠面板
            data.value.expands.push(row.id);
        } else {
            data.value.expands = [];
        }
    }
}

// 复选框是否可用
const selectable = (row, index) => {
    if (["未付款", "已关闭"].includes(row.status)) {
        return true;
    }
    return false;
}

// 复选框被选中
const selectionChangeHandle = (val) => {
    data.value.selections = val;
}

// 删除订单
const deleteHandle = (id: number) => {
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        let json = {
            id: id
        }
        proxy.$http('/mis/order/deleteOrderById', 'POST', json, true, resp => {
            if (resp.code == 200 && resp.rows > 0) {
                ElMessage.success({
                    message: "删除成功",
                    duration: 2000
                })
                loadOrderDataList()
            } else {
                ElMessage.error({
                    message: "删除失败，请重试",
                    duration: 2000
                })
            }
        })
    })
}

// 线下退款
const updateHandle = (id) => {
    ElMessageBox.confirm('确定该订单线下退款成功？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        proxy.$http('/mis/order/updateRefundOrderById', 'POST', { id: id }, true, resp => {
            if (resp.code == 200 && resp.rows > 0) {
                ElMessage.success({
                    message: "线下退款操作成功",
                    duration: 2000
                })
                loadOrderDataList()
            } else {
                ElMessage.error({
                    message: "操作失败，请重试",
                    duration: 2000
                })
            }
        })
    })
}

onMounted(() => {
        loadOrderDataList()
    })

</script>

<style lang="less" scoped>
@import url('order.less');
</style>
