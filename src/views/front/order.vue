<template>
    <div class="order-page">
        <!-- 商品信息 -->
        <div class="goods-info">
            <div class="header">
                <span>商品信息</span>
                <span>单价</span>
                <span>数量</span>
                <span>小计</span>
            </div>
            <div class="goods-item">
                <div class="goods-detail">
                    <img :src="orderData.goodsData.img" alt="产品图片" />
                    <div class="goods-desc">
                        <h2>{{ orderData.goodsData.title }}</h2>
                        <h3>{{ orderData.goodsData.description }}</h3>
                        <p v-if="orderData.goodsData.rule">折扣：</p>
                    </div>
                </div>
                <div class="unit-price">¥ {{ orderData.goodsData.unitPrice }}</div>
                <div class="quantity">
                    <el-input-number size="small" v-model="orderData.goodsData.quantity" :min="1" :max="10" />
                </div>
                <div class="subtotal">¥ {{ (orderData.goodsData.unitPrice * orderData.goodsData.quantity).toFixed(2) }}
                </div>
            </div>
        </div>

        <!-- 收货地址和支付方式 -->
        <div class="address-payment">
            <div class="address-item">
                <div class="header">收货地址 <span>(电子卡号卡密将以短信形式发送至以下手机号)</span></div>
                <div class="address-detail" v-if="orderData.address.id != null">
                    <div class="info-detail">
                        <div class="personal-info">
                            <span>{{ orderData.address.name }}</span>
                            <span>{{ orderData.address.tel }}</span>
                        </div>
                        <div class="dividing-line"></div>
                        <div>
                            <span>{{ orderData.address.province }}</span>
                            <span v-if="orderData.address.city != '' && orderData.address.city != null">{{
                                orderData.address.city }}</span>
                            <span>{{ orderData.address.district }}</span>
                            <span>{{ orderData.address.detail }}</span>
                        </div>
                    </div>
                    <div class="personal-opearte">
                        <el-button link type="primary" @click="openAddressDialog">选择其他地址</el-button>
                    </div>
                </div>
                <div v-else>
                    <el-empty :image-size="45">
                        <el-button link type="primary" @click="openAddressDialog">→ 请选择地址</el-button>
                    </el-empty>
                </div>
            </div>
            <div class="payment-method">
                <div class="header">支付方式</div>
                <div class="options">
                    <div class="payment" :class="{ active: orderData.payment === 'alipay' }"
                        @click="orderData.payment = 'alipay'">
                        <div class="alipay"></div>
                        <div class="payment-text">支付宝支付</div>
                        <div class="check"><i class="check-icon">√</i></div>
                    </div>
                    <div class="payment" :class="{ active: orderData.payment === 'wechatpay' }"
                        @click="orderData.payment = 'wechatpay'">
                        <div class="alipay"></div>
                        <div class="payment-text">支付宝支付</div>
                        <div class="check"><i class="check-icon">√</i></div>
                    </div>
                </div>
            </div>
            <div class="note">支付后，预计48小时内发货</div>
        </div>

        <!-- 订单备注 -->
        <div class="order-notes">
            <div class="header">订单备注</div>
            <textarea v-model="orderData.orderNotes" placeholder="选填" maxlength="300" rows="3"></textarea>
            <div class="char-count">{{ orderData.orderNotes.length }}/300</div>
        </div>

        <!-- 订单总结 -->
        <div class="order-summary">
            <div class="summary-item">
                <span>商品合计：</span>
                <span>¥ {{ orderData.orderTotalAmount }}</span>
            </div>
            <div class="summary-item">
                <span>折扣：</span>
                <span>-¥ {{ orderData.discountAmount }}</span>
            </div>
            <div class="total">
                <div class="orderNo">
                    <span>订单编号：{{ orderData.outTradeNo }}</span>
                </div>
                <div class="total-price">
                    <span>应付金额：</span>
                    <span class="amount">¥ {{ orderData.payableAmount }}</span>
                    <button class="submit-btn" @click="goToPay" :disabled="orderData.orderStatus !== 1">
                        {{ orderStatusText }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <el-dialog v-model="addressDialog.visible" width="800px" title="选择地址" draggable center>
        <div class="address-list">
            <el-scrollbar height="450px" v-if="addressDialog.addressList.length > 0">
                <div v-for="address in addressDialog.addressList" class="address-item">
                    <!-- 添加默认标识 -->
                    <div class="default-badge" v-if="address.isDefault"></div>
                    <span class="default-text" v-if="address.isDefault">默认</span>
                    <div class="address-info">
                        <div class="personal-detail">
                            <div class="personal-info">
                                <span>{{ address.name }}</span>
                                <span>{{ address.tel }}</span>
                            </div>
                            <div class="dividing-line"></div>
                            <div class="address-detail">
                                <span>{{ address.province }}</span>
                                <span v-if="address.city != '' && address.city != null">{{ address.city }}</span>
                                <span>{{ address.district }}</span>
                                <span>{{ address.detail }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="personal-opearte">
                        <el-button link type="primary" @click="selectAddress(address.id)">选择该地址</el-button>
                    </div>
                </div>
            </el-scrollbar>

            <div class="address-empty" v-else @click="router.push({ name: 'FrontMine' })">
                <el-empty description="无地址信息" :image-size="200">
                    <el-button type="primary" link>→ 无地址信息，去添加</el-button>
                </el-empty>
            </div>
        </div>
    </el-dialog>

    <!-- 支付二维码弹窗 -->
    <el-dialog v-model="qrCodeDialog.visible" width="300px" title="请扫码支付" draggable center align-center destroy-on-close
        @close="onQrDialogClose">
        <div class="qr-code-container">
            <!-- 1. 支付成功 -->
            <div v-if="qrCodeDialog.result === 'success'" class="pay-success">
                <el-result icon="success" title="付款成功" subTitle="即将跳转到订单列表"></el-result>
            </div>

            <!-- 2. 支付失败/取消 -->
            <div v-else-if="qrCodeDialog.result === 'fail'" class="pay-fail" style="text-align: center; padding: 20px">
                <el-result icon="error" title="支付失败" subTitle="请重试或联系客服"></el-result>
                <el-button type="primary" @click="refreshCode">重新支付</el-button>
            </div>

            <!-- 3. 二维码容器（始终存在于 DOM） -->
            <div v-else class="qr-code-wrapper">
                <canvas id="qr-code" class="qr-code" width="260" height="260"></canvas>
            </div>

            <!-- 4. 二维码生成中 -->
            <div v-if="qrCodeDialog.isGenerating && !qrCodeDialog.qrCode" style="text-align: center; margin-top: 10px">
                <el-icon name="loading" class="spinner" style="font-size: 24px; margin-bottom: 8px"></el-icon>
                <div>正在生成支付二维码...</div>
            </div>

            <!-- 5. 二维码生成失败 -->
            <div v-else-if="!qrCodeDialog.qrCode && !qrCodeDialog.isGenerating"
                style="text-align: center; margin-top: 10px">
                <el-icon name="close" style="color: #F56C6C; font-size: 20px; margin-bottom: 8px"></el-icon>
                <div>二维码生成失败，请刷新重试</div>
            </div>

            <!-- 6. 刷新按钮和其他提示 -->
            <div v-if="qrCodeDialog.result === null" class="refresh-qrcode">
                <el-button link type="primary" @click="refreshCode" :disabled="qrCodeDialog.isGenerating">
                    <el-icon>
                        <RefreshRight />
                    </el-icon> 刷新二维码
                </el-button>
            </div>

            <div v-if="qrCodeDialog.result === null"
                style="text-align: center; color: #666; font-size: 14px; margin-top: 10px">
                请使用支付宝 App 扫码支付
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, getCurrentInstance, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import QRCode from 'qrcode'
// WebSocket
import { useWebSocket } from '../../utils/useWebSocketUtil';
import { cookieUtil } from '../../utils/CookieUtil';

const { proxy } = getCurrentInstance() as any;

const route = useRoute();                   // 获取当前路由对象
const router = useRouter();                 // 获取路由跳转对象

// 引入 WebSocket
const { connect, disconnect } = useWebSocket();

const orderData = ref({
    outTradeNo: '20230503000001',
    goodsData: {
        img: 'https://placehold.co/120x120',
        title: '新感恩敬老中级体检套餐',
        description: '「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）',
        unitPrice: 399,
        quantity: 1,
        rule: '',
        subtotal: 399
    },
    address: {
        id: null,
        name: null,
        tel: null,
        province: null,
        city: null,
        district: null,
        detail: null
    },
    payment: null as string | null,
    orderNotes: '',
    orderTotalAmount: 0,                                  // 订单总金额
    discountAmount: 0,                                    // 折扣
    payableAmount: 0,                                     // 应付金额
    orderStatus: 1,                                       // 订单状态：1未付款，2已关闭，3已付款，4已退款，5已预约，6已结束'
})

// 订单状态
const orderStatusText = computed(() => {
    const map: Record<number, string> = {
        1: '提交订单',
        2: '已关闭',
        3: '已付款',
        4: '已退款',
        5: '已预约',
        6: '已结束'
    }
    return map[orderData.value.orderStatus] ?? '未知状态'
})

// 地址弹窗
const addressDialog = ref({
    visible: false,
    addressList: []
})

// 打开地址弹窗
const openAddressDialog = () => {
    addressDialog.value.visible = true

    proxy.$http('/front/customer/mine/address/addressList', 'GET', null, true, resp => {
        addressDialog.value.addressList = resp.addressList
    })
}

// 选择地址
const selectAddress = (id: number) => {

    let selectAddress = addressDialog.value.addressList.find((item: any) => {
        return item.id == id
    })

    orderData.value.address.id = selectAddress.id
    orderData.value.address.name = selectAddress.name
    orderData.value.address.tel = selectAddress.tel
    orderData.value.address.province = selectAddress.province
    orderData.value.address.city = selectAddress.city
    orderData.value.address.district = selectAddress.district
    orderData.value.address.detail = selectAddress.detail

    addressDialog.value.visible = false

    // todo 更新地址到 order 中，或者提交订单时再更新
}

// qrcode 弹窗
const qrCodeDialog = ref({
    visible: false,
    qrCode: '',
    canRefresh: true,                                   // 是否可以刷新
    isGenerating: false,                                // 是否正在生成
    result: null as null | 'success' | 'fail',          // null=未支付, 'success'=成功, 'fail'=失败 
})

// 支付成功处理
const handlePaymentSuccess = (outTradeNo: string) => {
    qrCodeDialog.value.result = 'success';
    ElMessageBox.alert('支付成功！', '提示', {
        confirmButtonText: '确定',
        type: 'success'
    })

    // 3秒后自动关闭弹窗并跳转
    setTimeout(() => {
        qrCodeDialog.value.visible = false;
        router.push({ name: 'FrontOrderList' });
    }, 3000);
};

// 支付失败处理
const handlePaymentFailure = (outTradeNo: string) => {
    qrCodeDialog.value.result = 'fail';
    ElMessage.warning('支付失败或已取消');
};


// 重置生成状态 + 2 秒冷却
const resetQrState = () => {
    qrCodeDialog.value.isGenerating = false;
    setTimeout(() => {
        qrCodeDialog.value.canRefresh = true;
    }, 2000);
};

/* 提交订单 */
// 创建支付二维码
const createQrCode = (isRefresh: boolean) => {

    // 标记正在生成，防止重复点击
    if (qrCodeDialog.value.isGenerating) return;

    // 正在生成二维码，禁止刷新
    qrCodeDialog.value.isGenerating = true
    qrCodeDialog.value.canRefresh = false
    qrCodeDialog.value.qrCode = ''              // 清空之前的二维码

    // 2. 等待 DOM 渲染完成
    nextTick().then(() => {
        // 获取画布
        const canvas = document.getElementById('qr-code') as HTMLCanvasElement;

        if (!canvas) {
            ElMessage.error('二维码画布未找到');
            qrCodeDialog.value.visible = false;
            return;
        }

        // 清空画布
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        // 订单参数
        let payJson = {
            outTradeNo: orderData.value.outTradeNo,
            subject: orderData.value.goodsData.title,
            totalAmount: orderData.value.payableAmount,

            paymentType: orderData.value.payment,
            addressId: orderData.value.address.id,

            isRefresh: isRefresh
        }

        // 发送请求生成二维码
        proxy.$http('/front/pay/createQrCode', 'POST', payJson, true, resp => {
            if (resp.code === 200 && resp.qrCode) {
                // 1. 打开弹窗
                if (qrCodeDialog.value.visible === false) {
                    qrCodeDialog.value.visible = true
                }

                // 2. 将二维码渲染到画布上
                QRCode.toCanvas(canvas, resp.qrCode, { width: 260 }, error => {
                    if (error) {
                        console.error('生成二维码失败:', error);
                        ElMessage.error('二维码生成失败');
                        disconnect();
                    } else {
                        qrCodeDialog.value.qrCode = resp.qrCode;            // 标记已生成
                    }
                    resetQrState();
                });
            } else {
                console.error('生成二维码异常:', resp.msg)
                ElMessage.error(resp.msg || '接口错误，生成支付二维码失败')
                resetQrState();
                disconnect();
            }
        })
    });
}

// 刷新二维码
const refreshCode = () => {
    if (qrCodeDialog.value.isGenerating) {
        ElMessage.warning('二维码正在生成中...')
        return
    }
    createQrCode(true)
}

// 点击提交订单，生成 QrCode
const goToPay = () => {
    // 先判断提交的数据是否完全
    if (orderData.value.address.id == null) {
        qrCodeDialog.value.visible = false
        ElMessage.error({
            message: '地址不能为空',
            duration: 2000
        })
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return
    }

    if (orderData.value.payment == null) {
        qrCodeDialog.value.visible = false
        ElMessage.error({
            message: '支付方式不能为空',
            duration: 2000
        })
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return
    }

    if (qrCodeDialog.value.isGenerating) {
        qrCodeDialog.value.canRefresh = false
        ElMessage.warning('二维码正在生成中...');
        return;
    }

    // 判断当前窗口是否已打开，已打开则刷新二维码，未打开则生成二维码
    if (qrCodeDialog.value.visible) {
        // 已打开，仅刷新二维码
        refreshCode();
        return;
    } else {
        // 重置状态
        qrCodeDialog.value = {
            visible: true,
            qrCode: '',
            canRefresh: true,
            isGenerating: false,
            result: null
        };

        // 获取 token
        const token = cookieUtil.getFrontendUser()?.token || ''; 

        // 建立 WebSocket 连接
        connect(token, (message) => {
            const result = JSON.parse(message.body);
            if (result.outTradeNo !== orderData.value.outTradeNo) return;

            if (result.status === 'success') {
                handlePaymentSuccess(orderData.value.outTradeNo);
            } else if (result.status === 'failure') {
                handlePaymentFailure(orderData.value.outTradeNo);
            }
        }, `/topic/payment/${orderData.value.outTradeNo}`);

        // 生成二维码
        createQrCode(false);
    }
}

// 弹窗关闭处理
const onQrDialogClose = () => {
    // 仅在非支付成功状态时断开
    if (qrCodeDialog.value.result !== 'success') {
        disconnect();
    }
}

// 组件卸载时清理连接
onUnmounted(() => {
    disconnect();
})

onMounted(() => {
    let outTradeNo = route.params.outTradeNo

    if (!outTradeNo) {
        proxy.$message.error('订单号不存在')
        router.push({ name: 'FrontOrderList' })
    } else {
        // 发送请求到接口查询订单详细信息
        proxy.$http(`/front/order/orderDetails/${outTradeNo}`, 'GET', {}, true, resp => {
            if (resp.code == 200) {
                let orderDetailVO = resp.orderDetailVO

                console.log(orderDetailVO);

                // 设置 orderData
                orderData.value.outTradeNo = orderDetailVO.outTradeNo

                orderData.value.goodsData.img = orderDetailVO.goodsVO.images
                orderData.value.goodsData.title = orderDetailVO.goodsVO.title
                orderData.value.goodsData.description = orderDetailVO.goodsVO.description
                orderData.value.goodsData.unitPrice = orderDetailVO.goodsVO.currentPrice.toFixed(2)
                orderData.value.goodsData.rule = orderDetailVO.ruleName
                orderData.value.goodsData.quantity = orderDetailVO.number

                if (orderDetailVO.addressVO) {
                    orderData.value.address.id = orderDetailVO.addressVO.id
                    orderData.value.address.name = orderDetailVO.addressVO.name
                    orderData.value.address.tel = orderDetailVO.addressVO.tel
                    orderData.value.address.province = orderDetailVO.addressVO.province
                    orderData.value.address.city = orderDetailVO.addressVO.city == null ? '' : orderDetailVO.addressVO.city
                    orderData.value.address.district = orderDetailVO.addressVO.district
                    orderData.value.address.detail = orderDetailVO.addressVO.detail
                }

                orderData.value.payment = orderDetailVO.payment == null ? '' : orderDetailVO.payment
                orderData.value.orderNotes = orderDetailVO.orderNotes == null ? '' : orderDetailVO.orderNotes

                orderData.value.orderStatus = orderDetailVO.status

                orderData.value.orderTotalAmount = orderDetailVO.orderTotalAmount.toFixed(2)
                orderData.value.discountAmount = orderDetailVO.discountAmount.toFixed(2)
                orderData.value.payableAmount = orderDetailVO.payableAmount.toFixed(2)

            } else {
                proxy.$message.error(resp.message)
            }
        })
    }
})

</script>

<style lang="less" scoped>
@import url('order.less');
</style>