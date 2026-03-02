<template>
    <div class="panel-container">
        <div class="home-TUIKit-main" :style="data.siteContent.style">
            <div class="conversation">
                <TUISearch class="TUIKit-search" />
                <TUIConversation @handleSwitchConversation="handleCurrentConversation" />
            </div>
            <div class="TUIKit-chat">
                <TUIChat />
            </div>
        </div>
        <div class="customer-info">
            <!--这里是新添加的内容-->
            <el-card class="box-card" shadow="never">
                <div class="info">
                    <div class="left">
                        <el-avatar :size="57" shape="square" :src="data.customer.photo">
                            <el-icon size="35">
                                <UserFilled />
                            </el-icon>
                        </el-avatar>
                    </div>
                    <div class="right">
                        <h4 class="customer-name">{{ data.customer.name }}</h4>
                        <p class="customer-desc">
                            <el-icon class="icon">
                                <User />
                            </el-icon>
                            <span class="value">{{ data.customer.sex }}</span>
                            <el-icon class="icon">
                                <Phone />
                            </el-icon>
                            <span class="value">{{ data.customer.tel }}</span>
                            <el-icon class="icon">
                                <Calendar />
                            </el-icon>
                            <span class="value">{{ data.customer.createTime }}</span>
                        </p>
                    </div>
                </div>
                <el-divider />
                <el-row :gutter="16">
                    <el-col :span="10">
                        <div class="statistic-card">
                            <el-statistic :value="data.statistic.amount" suffix="元">
                                <template #title>
                                    <div class="title">累计消费金额</div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="7">
                        <div class="statistic-card">
                            <el-statistic :value="data.statistic.count" suffix="笔">
                                <template #title>
                                    <div class="title">有效订单数量</div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="7">
                        <div class="statistic-card">
                            <el-statistic :value="data.statistic.number" suffix="个">
                                <template #title>
                                    <div class="title">体检套餐数量</div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                </el-row>
            </el-card>
            <el-table :data="data.order.dataList" border style="width: 100%" class="orders-table"
                :header-cell-style="{ 'background': '#f5f7fa' }">
                <el-table-column type="index" header-align="center" align="center" width="80" label="序号">
                    <template #default="scope">
                        <span>{{ (data.order.pageIndex - 1) * data.order.pageSize + scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="goodsTitle" label="套餐名称" header-align="left" align="left" min-width="200" />
                <el-table-column prop="createDate" label="购买日期" header-align="center" align="center" min-width="120" />
                <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="100" />
            </el-table>
            <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
                :current-page="data.order.pageIndex" :page-sizes="[5, 10, 20, 50]" :page-size="data.order.pageSize"
                :total="data.order.totalCount" layout="total, sizes, prev, pager, next, jumper">
            </el-pagination>
        </div>
    </div>

</template>

<script lang="ts" setup>
import { reactive, ref, Ref, getCurrentInstance, onMounted } from 'vue';

import { TUILogin } from '@tencentcloud/tui-core-lite';
import { isPC } from '../../TUIKit/utils/env';
import { ElMessage } from 'element-plus';

const { proxy } = getCurrentInstance() as any;

const data = reactive({
    env: isPC,

    siteContent: {
        documentClientHeight: 0,
        height: null,
        style: null
    },
    customer: {
        id: null,
        name: "--",
        sex: "--",
        tel: "--",
        photo: "--",
        createTime: "--"
    },
    statistic: {
        amount: 0,
        count: 0,
        number: 0
    },
    order: {
        dataList: [],
        pageIndex: 1,
        pageSize: 5,
        totalCount: 0,
        loading: false,
    }
});

// 获取 客服im 数据
const searchServiceImAccount = () => {
    proxy.$http("/mis/customer/im/searchServiceImAccount", "GET", null, true, function (resp) {
        let result = resp.imAccountVO
        let account = result.account;
        let sdkAppId = result.sdkAppId
        let userSig = result.userSig

        TUILogin.login({
            SDKAppID: sdkAppId,
            userID: account,
            userSig: userSig,
        });

    })
}

// 获取用户订单数据
const loadOrderList = () => {
    data.order.loading = true;
    let json = {
        customerId: data.customer.id,
        page: data.order.pageIndex,
        length: data.order.pageSize
    }

    proxy.$http("/mis/order/searchOrderListByPage", "POST", json, true, function (resp) {

        let statusEnum = {
            "1": "未付款",
            "2": "已关闭",
            "3": "已付款",
            "4": "已退款",
            "5": "已预约",
            "6": "已结束",
        }
        let page = resp.pageData;

        for (let one of page.pageList) {
            one.status = statusEnum[one.status + ""]
        }
        data.order.dataList = page.pageList
        data.order.totalCount = page.totalCount;
        data.order.loading = false;

    })
}

// 点击客户 im 时，查询客户信息
const handleCurrentConversation = (value: string) => {

    let account = value.substr(3);  //获取客户IM账号
    let customerId = account.split("_")[1]  //获取客户主键值
    data.customer.id = customerId

    let json = { id: customerId }

    
    //查询客户基本信息和订单统计数据
    proxy.$http("/mis/customer/im/searchCustomerSummary", "POST", json, true, function (resp) {
        if (resp.code == 200) {
            console.log("用户数据：", resp.customerImOrderVO);

            let result = resp.customerImOrderVO
            data.customer.name = result.name
            data.customer.sex = result.sex
            data.customer.tel = result.tel
            data.customer.createTime = result.createTime
            data.customer.photo = result.photo
            data.statistic.amount = result.totalAmount
            data.statistic.count = result.totalCount
            data.statistic.number = result.number
        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 1500,
            })
        }
    })

    //加载订单分页记录
    loadOrderList()

    console.log("页面数据", data);
}

function loadSiteContentViewHeight() {
    let height = data.siteContent.documentClientHeight - 50 - 30 - 2;
    height -= 80;
    data.siteContent.height = height
    data.siteContent.style = `height: ${height}px`
}

// 每页数据数
const sizeChangeHandle = (val: number) => {
    data.order.pageSize = val;
    data.order.pageIndex = 1;
    loadOrderList();
}

// 页码跳转
const currentChangeHandle = (val: number) => {
    data.order.pageIndex = val;
    loadOrderList();
}

onMounted(() => {

    searchServiceImAccount();

    data.siteContent.documentClientHeight = document.documentElement['clientHeight'];

    loadSiteContentViewHeight();

    window.onresize = () => {
        data.siteContent.documentClientHeight = document.documentElement['clientHeight'];
        loadSiteContentViewHeight();
    };
})
</script>


<style lang="less">
@import url("customer_im.less");
</style>
