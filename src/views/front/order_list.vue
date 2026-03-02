<template>
    <div class="order-container">
        <el-form :inline="true" :model="searchOrderForm" :rules="searchOrderForm.dataRules" ref="form">
            <el-form-item prop="keyword">
                <el-input v-model="searchOrderForm.keyword" placeholder="套餐标题 / 订单编号" size="default" class="keyword"
                    maxlength="30" clearable />
            </el-form-item>
            <el-form-item>
                <el-button size="default" type="primary" :icon="Search" @click="searchHandle()">查询</el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="searchOrderForm.statusLabel" size="default" @change="searchHandle()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="未付款">未付款</el-radio-button>
                    <el-radio-button value="已关闭">已关闭</el-radio-button>
                    <el-radio-button value="已付款">已付款</el-radio-button>
                    <el-radio-button value="已退款">已退款</el-radio-button>
                    <el-radio-button value="已预约">已预约</el-radio-button>
                    <el-radio-button value="已结束">已结束</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>

        <div class="order-list" v-show="orderData.orderList.length > 0">
            <div class="order" v-for="order in orderData.orderList" :key="order.id">
                <div class="header">
                    <div class="datetime">{{ dayjs(order.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
                    <div class="uuid">
                        订单号：
                        <span>{{ order.outTradeNo }}</span>
                    </div>
                    <div class="detail" @click="searchSnapshotHandle(order.snapshotId)">
                        查看商品快照
                    </div>
                </div>
                <div class="content">
                    <div class="goods-info" @click="router.push({ name: 'FrontGoods', params: { id: order.goodsId } })">
                        <img :src="order.goodsImage" class="image" />
                        <div class="info">
                            <h4>{{ order.goodsTitle }}</h4>
                            <p>{{ order.goodsDescription }}</p>
                        </div>
                    </div>
                    <div class="price">
                        <span class="label">套餐单价</span>
                        <span class="value">￥{{ order.goodsPrice.toFixed(2) }}</span>
                    </div>
                    <div class="number">
                        <span class="label">购买数量</span>
                        <span class="value">×{{ order.number }}</span>
                    </div>
                    <div class="amount">
                        <span class="label">合计</span>
                        <span class="value">￥{{ order.payableAmount.toFixed(2) }}</span>
                    </div>
                    <div class="status">
                        <span class="label">状态</span>
                        <span class="value">{{ statusTextMap[order.status] }}</span>
                    </div>
                    <div class="operate">
                        <!-- 未付款可以取消订单 -->
                        <el-button v-if="order.status === 1" type="primary" :disabled="order.disabled"
                            @click="paymentHandle(order.outTradeNo)">
                            去付款
                        </el-button>
                        <el-button v-if="order.status == 1" type="danger" @click="closeOrderHandle(order.outTradeNo)">
                            取消订单
                        </el-button>
                        <el-button v-if="order.status == 3" type="primary"
                            :disabled="order.appointCount == order.number"
                            @click="appointHandle(order.id, order.number, order.appointCount)">
                            预约体检
                        </el-button>
                        <el-button v-if="order.status == 6" type="primary">获取发票</el-button>
                        <el-button v-if="order.status == 3" type="danger"
                            :disabled="order.appointCount > 0 || order.disabled" @click="refundClickHandle(order)">
                            退款
                        </el-button>
                        <el-button type="danger" v-if="order.status == 7 || order.status == 4"
                            @click="checkRefundHandle(order.outTradeNo)">
                            查看退款结果
                        </el-button>
                    </div>
                </div>
            </div>
            <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
                :current-page="orderData.pageIndex" :page-sizes="[10, 20, 50]" :page-size="orderData.pageSize"
                :total="orderData.totalCount" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
        <div class="empty" v-show="!(orderData.orderList.length > 0)">
            <el-empty :image-size="200" />
        </div>
    </div>

    <!-- 退款弹窗 -->
    <el-dialog v-model="refundDialog.visible" title="退款窗口" width="450px" :draggable="true" :overflow="true"
        :align-center="true" :close-on-click-modal="false">
        <el-form :model="refundDialog.refundForm" ref="refundReasonRef" label-position="right" label-width="auto"
            :rules="refundDialog.refundReasonRules">
            <p>退款订单号：{{ refundDialog.outTradeNo }}</p>
            <div class="refund-order-info">
                <img :src="refundDialog.goodsImage" class="image" />
                <div class="goods-info">
                    <div class="goods-title">{{ refundDialog.goodsTitle }}</div>
                    <div class="order-info">
                        <div class="goods-count">商品数量：x{{ refundDialog.goodsCount }}</div>
                        <div class="refund-amount">付款金额：￥{{ refundDialog.refundAmount }}</div>
                    </div>
                </div>

            </div>
            <el-form-item label="退款原因" prop="refundReason">
                <el-input type="textarea" v-model="refundDialog.refundForm.refundReason" placeholder="请输入退款原因"
                    maxlength="200"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="refundDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="refundHandle">确定</el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 预约体检弹窗 -->
    <el-dialog title="体检预约" :close-on-click-modal="false" v-model="appointDialog.visible" width="550px">
        <el-form :model="appointDialog.dataForm" ref="dialogForm" :rules="appointDialog.dataRule" label-width="80px">
            <fieldset class="appointment">
                <legend>
                    <h4>我的预约</h4>
                </legend>
                <el-form-item label="预约日期" prop="date">
                    <el-date-picker v-model="appointDialog.dataForm.date" type="date" placeholder="选择日期"
                        :editable="false" format="YYYY-MM-DD" value-format="YYYY-MM-DD" :disabled-date="disabledDate" />
                    <span style="margin-left: 15px;">提示：不可预约今日</span>
                </el-form-item>
                <el-form-item label="体检人" prop="name">
                    <el-input v-model="appointDialog.dataForm.name" placeholder="输入姓名" maxlength="10" clearable />
                </el-form-item>
                <el-form-item label="身份证号" prop="pid">
                    <el-input v-model="appointDialog.dataForm.pid" placeholder="输入身份证号" maxlength="18" clearable />
                </el-form-item>
                <el-form-item label="电话号码" prop="tel">
                    <el-input v-model="appointDialog.dataForm.tel" placeholder="输入电话号码" maxlength="11" clearable />
                </el-form-item>
                <el-form-item label="备注信息">
                    <el-input v-model="appointDialog.dataForm.company" placeholder="输入备注信息" maxlength="100" clearable />
                </el-form-item>
            </fieldset>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="appointDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="appointmentDialogSubmit">确定</el-button>
            </span>
        </template>
    </el-dialog>



</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';

import router from '../../router/index';
import { cookieUtil } from '../../utils/CookieUtil';

import { dayjs, ElMessage, ElMessageBox } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { proxy } = getCurrentInstance() as any;

let empty = ref(false);

// 搜索表单
const searchOrderForm = ref({
    keyword: '',
    statusLabel: '全部',
    status: null,
    dataRules: {
        keyword: [
            { required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,30}$', message: '关键字内容不正确' }
        ]
    }
});

// 订单数据
const orderData = ref({
    orderList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false
});

// 退款弹窗
const refundDialog = ref({
    visible: false,
    outTradeNo: '',
    goodsId: null,
    goodsImage: '',
    goodsTitle: '',
    goodsCount: 0,
    refundAmount: 0,
    refundForm: {
        refundReason: ''
    },
    refundReasonRules: {
        refundReason: [
            { required: true, message: '必须填写退款原因' },
            { min: 1, max: 200, message: '退款原因长度在 1 到 200 个字符' }
        ]
    }
})

// 预约体检弹窗
const appointDialog = ref({
    visible: false,
    number: null,
    appointCount: null,
    dataForm: {
        orderId: null,
        date: null,
        name: null,
        pid: null,
        tel: null,
        mailingAddress: null,
        company: null
    },
    dataRule: {
        date: [{ required: true, message: '日期不能为空' }],
        name: [
            { required: true, message: '姓名不能为空' },
            { pattern: '^[\u4e00-\u9fa5]{2,10}$', message: '姓名格式错误' }
        ],
        pid: [
            { required: true, message: '身份证号不能为空' },
            { pattern: '^[0-9Xx]{18}$', message: '身份证号格式错误' }
        ],
        tel: [
            { required: true, message: '电话号码不能为空' },
            { pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }
        ]
    }
});

function disabledDate(date) {
    //只能预约从明天起未来 30 天的体检
    let bool = dayjs(date).isBetween(dayjs(), dayjs().add(31, 'day'));
    return !bool;
}

// 文字状态映射
const statusMap = {
    '全部': null,
    '未付款': 1,
    '已关闭': 2,
    '已付款': 3,
    '已退款': 4,
    '已预约': 5,
    '已结束': 6
};

// 数字状态映射
const statusTextMap = {
    1: '未付款',
    2: '已关闭',
    3: '已付款',
    4: '已退款',
    5: '已预约',
    6: '已结束'
};

// 分页查询及条件查询
const searchHandle = () => {

    // 构建查询参数
    const params = new URLSearchParams();
    params.append('page', orderData.value.pageIndex.toString());
    params.append('length', orderData.value.pageSize.toString());

    if (searchOrderForm.value.keyword) {
        params.append('keyword', searchOrderForm.value.keyword.trim());
    }

    const statusValue = statusMap[searchOrderForm.value.statusLabel];
    if (statusValue !== null && statusValue !== undefined && statusValue !== '') {
        params.append('status', statusValue.toString());
    }
    // 请求 URL
    const requestUrl = `/front/order/orderList?${params.toString()}`;

    orderData.value.loading = true

    proxy.$http(requestUrl, 'GET', null, true, resp => {
        orderData.value.loading = false

        if (resp.code === 200) {
            if (resp.orderData.pageList.length === 0) {
                orderData.value.orderList = []
                empty.value = true
                orderData.value.totalCount = 0
            } else {
                orderData.value.orderList = resp.orderData.pageList
                orderData.value.totalCount = resp.orderData.totalCount
            }
        } else {
            ElMessage({
                message: resp.message,
                type: 'error',
                duration: 1200,
            })
            empty.value = true
        }
    })
}

const sizeChangeHandle = (val: number) => {
    orderData.value.pageSize = val
    orderData.value.pageIndex = 1
    searchHandle()
}

const currentChangeHandle = (val: number) => {
    orderData.value.pageIndex = val
    searchHandle()
}

// 查看商品快照
const searchSnapshotHandle = (snapshotId: string) => {
    router.push({
        name: 'FrontGoodsSnapshot',
        params: { id: snapshotId, mode: "front" }
    });
}

// 关闭订单
const closeOrderHandle = (outTradeNo: string) => {
    ElMessageBox.confirm('确定要关闭订单吗？', '提示', {
        comfirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 发送请求到后端关闭订单
        proxy.$http('/front/order/closeOrder', 'POST', { outTradeNo: outTradeNo }, true, resp => {
            if (resp.code == 200) {
                ElMessage.success({
                    message: resp.msg,
                    duration: 2000
                })
                searchHandle()
            } else {
                ElMessage.success({
                    message: resp.msg,
                    duration: 2000
                })
            }
        })
    })
}

// 去付款按钮
const paymentHandle = (outTradeNo: string) => {
    router.push({ name: 'FrontOrderDetails', params: { outTradeNo: outTradeNo } })

}

// 预约按钮
const appointHandle = (id: number, number: number, appointCount: number) => {
    if (appointCount == 0) {
        ElMessageBox.confirm("该订单预约体检后将无法退款，是否预约体检？", '提示信息', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            appointDialog.value.visible = true;
            appointDialog.value.dataForm.orderId = id;
            appointDialog.value.number = number;
            appointDialog.value.appointCount = ++appointCount;
            proxy.$nextTick(() => {
                proxy.$refs['dialogForm'].resetFields();
            });
        });
    }

}

// 预约体检弹窗提交
const appointmentDialogSubmit = () => {
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            let json = {
                orderId: appointDialog.value.dataForm.orderId,
                appointmentDate: appointDialog.value.dataForm.date,
                name: appointDialog.value.dataForm.name,
                pid: appointDialog.value.dataForm.pid,
                tel: appointDialog.value.dataForm.tel,
                desc: appointDialog.value.dataForm.company
            };
            proxy.$http('/front/appointment/insertAppointment', 'POST', json, true, function (resp) {
                if (resp.code == 200) {
                    let result = resp.result
                    if (result == "预约成功") {
                        ElMessage({
                            message: result,
                            type: 'success',
                            duration: 1200
                        });
                        appointDialog.value.visible = false;
                        searchHandle();
                    } else {
                        proxy.$message({
                            message: result,
                            type: 'error',
                            duration: 1200
                        });
                    }
                }

            });
        }
    });
}

// 点击退款按钮
const refundClickHandle = (order: any) => {

    ElMessageBox.confirm('确定要申请退款吗？', '提示', {
        comfirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 发送请求到后端关闭订单
        refundDialog.value.visible = true

        console.log(order);

        refundDialog.value.outTradeNo = order.outTradeNo
        refundDialog.value.goodsId = order.goodsId
        refundDialog.value.goodsImage = order.goodsImage
        refundDialog.value.goodsTitle = order.goodsTitle
        refundDialog.value.goodsCount = order.number
        refundDialog.value.refundAmount = order.payableAmount.toFixed(2)
    })
}


// 退款请求
const refundHandle = () => {

    let refundJson = {
        outTradeNo: refundDialog.value.outTradeNo,
        goodsId: refundDialog.value.goodsId,
        goodsCount: refundDialog.value.goodsCount,
        refundAmount: refundDialog.value.refundAmount,
        refundReason: refundDialog.value.refundForm.refundReason
    }

    proxy.$http('/front/order/refund', 'POST', refundJson, true, resp => {
        if (resp.code == 200) {
            ElMessage.success({
                message: resp.msg,
                duration: 2000
            })
            refundDialog.value.visible = false

            ElMessageBox.alert('退款请求申请中，请耐心等待退款信息', '提示', {
                comfirmButtonText: '确定',
                showClose: false,
                type: 'success'
            }).then(() => {
                searchHandle()
            })
        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 2000
            })
        }
    })
}

// 查看退款结果
const checkRefundHandle = (outTradeNo: string) => {
    proxy.$http('/front/order/checkRefund', 'POST', { outTradeNo: outTradeNo }, true, resp => {
        if (resp.code == 200) {
            console.log(resp);

            ElMessageBox.confirm(resp.refundResult, '查询退款', {
                comfirmButtonText: '确定',
                type: 'success'
            })
        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 2000
            })
        }
    })
}

onMounted(() => {

    if (!cookieUtil.isFrontendLoggedIn()) {
        // 未登录，跳转到首页
        ElMessage({
            message: '请先登录',
            type: 'error',
            duration: 1200,
        })
        router.push({ name: "FrontIndex" });
        return
    }

    // 初始化状态
    searchOrderForm.value.statusLabel = '全部';
    searchOrderForm.value.keyword = '';

    // 分页查询
    searchHandle()
})
</script>

<style lang="less" scoped>
@import url("order_list.less");
</style>