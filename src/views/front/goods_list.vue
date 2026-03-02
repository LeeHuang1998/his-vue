<template>
    <div class="list-container">
        <div class="breadcrumb">
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item :to="{ name: 'FrontIndex' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>体检套餐列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- 条件查询 -->
        <div class="search-condition">
            <el-row :gutter="0" class="row">
                <el-col :span="2"><span class="label">【 分类 】</span></el-col>
                <el-col :span="2" v-for="item in condition.type">
                    <span :class="item.active ? 'item active' : 'item'" @click="selectHandle('type', item.name)">
                        {{ item.name }}
                    </span>
                </el-col>
            </el-row>
            <el-row :gutter="0" class="row">
                <el-col :span="2"><span class="label">【 性别 】</span></el-col>
                <el-col :span="2" v-for="item in condition.sex">
                    <span :class="item.active ? 'item active' : 'item'" @click="selectHandle('sex', item.name)">
                        {{ item.name }}
                    </span>
                </el-col>
            </el-row>
            <el-row :gutter="0" class="row">
                <el-col :span="2"><span class="label">【 价格 】</span></el-col>
                <el-col :span="2" v-for="item in condition.priceType">
                    <span :class="item.active ? 'item active' : 'item'" @click="selectHandle('priceType', item.name)">
                        {{ item.name }}
                    </span>
                </el-col>
            </el-row>
        </div>

        <!-- 单选框查询 -->
        <div class="search-radio">
            <el-radio-group v-model="radio" @change="selectRadio">
                <el-radio value="最新" size="large">最新</el-radio>
                <el-radio value="销量" size="large">销量</el-radio>
            </el-radio-group>
            <div class="sort-operate" @click="selectPrice">
                <span>价格</span>
                <SvgIcon :name="priceOrder.icon" class="sort-icon" />
            </div>
        </div>

        <!-- 商品列表 -->
        <div class="goods-container">
            <div class="goods-empty" v-if="listData.goodsList.length == 0">
                <el-empty description="无体检套餐" :image-size="200" />
            </div>
            <ul v-else class="goods-list" v-infinite-scroll="loadGoodsList">
                <li class="goods-item" v-for="goods in listData.goodsList" :key="goods.id">
                    <div class="goods"  @click="goToGoodsPage(goods.id)">
                        <div class="img-desc">
                            <img :src="goods.image" alt="">
                            <!-- 遮罩层 -->
                            <div class="img-overlay">
                                <p class="overlay-desc">{{ goods.description }}</p>
                            </div>
                        </div>
                        <el-tooltip effect="dark" placement="top" :hide-after="0">
                            <h4>{{ goods.title }}</h4>
                            <template #content>
                                <div style="width: 370px;">{{ goods.title }}
                                </div>
                            </template>
                        </el-tooltip>

                        <el-tooltip class="box-item" effect="dark" placement="top" :hide-after="0">
                            <template #content>
                                <div style="width: 370px;">{{ goods.description }}
                                </div>
                            </template>
                            <p class="desc">
                                <span>折</span>
                                {{ goods.description }}
                            </p>
                        </el-tooltip>
                        <div class="price">
                            <span class="current-price">￥{{ goods.currentPrice }}</span>
                            <span class="initial-price">￥{{ goods.initialPrice }}</span>
                            <span class="sales-volumn">已售 {{ goods.salesVolume }}</span>
                        </div>
                        <el-button class="buy-now-btn">立即购买</el-button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue'

import SvgIcon from '../../components/SvgIcon.vue';
import router from '../../router/index';

const { proxy } = getCurrentInstance() as any;

// 查询表单
const searchForm = ref({
    keyword: null,
    partId: null,
    type: null,
    sex: null,
    priceType: null,
    orderType: null
});

// 单选框查询
let radio = ref(null);

const priceOrder = ref({
    icon: 'sort-default',
    type: 'default'
});

// 查询条件
const condition = ref({
    type: [
        { name: '不限', active: true },
        { name: '父母体检', active: false },
        { name: '入职体检', active: false },
        { name: '职场白领', active: false },
        { name: '个人高端', active: false },
        { name: '中青年体检', active: false }
    ],
    sex: [
        { name: '不限', active: true },
        { name: '男性', active: false },
        { name: '女性', active: false }
    ],
    priceType: [
        { name: '不限', active: true },
        { name: '0~100', value: 1, active: false },
        { name: '100~500', value: 2, active: false },
        { name: '500~1000', value: 3, active: false },
        { name: '1000以上', value: 4, active: false }
    ]
});

// 商品数据
const listData = ref({
    goodsList: [],
    pageIndex: 0,
    pageSize: 15,
    totalCount: 0,
    isLast: false
})

const searchGoodsList = () => {

    // 判断是否为最后一页，若为最后一页则直接返回
    if (listData.value.isLast) {
        return;
    }

    // 创建请求数据
    let searchReq = {
        keyword: searchForm.value.keyword,
        partId: searchForm.value.partId,
        type: searchForm.value.type,
        sex: searchForm.value.sex,
        priceType: searchForm.value.priceType,
        orderType: searchForm.value.orderType,
        page: listData.value.pageIndex,
        length: listData.value.pageSize
    }

    proxy.$http('/front/goods/searchGoodsListByPage', 'POST', searchReq, true, resp => {
        console.log(resp);

        let pageList = resp.pageData.pageList

        // 判断是否有数据，如果没有数据则设置为最后一页
        if (pageList == null || pageList.length == 0) {
            listData.value.isLast = true
            listData.value.pageIndex -= 1
        } else {
            // 设置渲染数据
            listData.value.goodsList = listData.value.goodsList.concat(pageList)
            listData.value.totalCount = resp.pageData.totalCount
        }
    })
}

// 滚动加载数据
const loadGoodsList = () => {
    // 判断是否为最后一页，若为最后一页则直接返回
    if (listData.value.isLast) {
        return;
    }

    listData.value.pageIndex += 1
    searchGoodsList();
}

// 选择查询条件
const selectHandle = (key, value) => {
    console.log(key, value);

    // 遍历查询条件
    condition.value[key].forEach(item => {
        if (item.name == value) {
            // 将 active 设置为 true，改变样式
            item.active = true

            // 判断是否为 priceType，若不是，则查询条件为 item.name，否则为 item.value
            if (key != 'priceType') {
                searchForm.value[key] = (item.name == '不限' ? null : item.name);
            } else {
                searchForm.value[key] = (item.name == '不限' ? null : item.value);
            }
        } else {
            item.active = false;
        }
    })

    // 将渲染数据设置为默认
    listData.value.goodsList = []
    listData.value.pageIndex = 1
    listData.value.pageSize = 15
    listData.value.isLast = false

    // 查询数据
    searchGoodsList();
}

// 选择单选查询
const selectRadio = (value: string) => {
    // 价格图标恢复成默认
    priceOrder.value.icon = 'sort-default';
    priceOrder.value.type = 'default';

    if (value == '最新') {
        searchForm.value.orderType = 1;
    } else if (value == '销量') {
        searchForm.value.orderType = 2;
    }

    // 将渲染数据设置为默认
    listData.value.goodsList = []
    listData.value.pageIndex = 1
    listData.value.pageSize = 15
    listData.value.isLast = false

    // 查询数据
    searchGoodsList();
}

// 选择价格排序
const selectPrice = () => {
    // 将单选框设置为 null
    radio = ref(null);

    // 默认时为升序，升序的值为 3，降序的值为 4
    if (priceOrder.value.type == 'default') {
        // 默认时，点击后变为升序图标，类型改为升序，值为 3
        priceOrder.value.icon = 'sort-asc';
        priceOrder.value.type = 'asc';
        searchForm.value.orderType = 3;
    } else if (priceOrder.value.type == 'asc') {
        // 升序时，点击后变为降序图标，类型改为降序，值为 4
        priceOrder.value.icon = 'sort-desc';
        priceOrder.value.type = 'desc';
        searchForm.value.orderType = 4;
    } else if (priceOrder.value.type == 'desc') {
        // 降序时，点击后变为升序图标，类型改为升序，值为 3
        priceOrder.value.icon = 'sort-asc';
        priceOrder.value.type = 'asc';
        searchForm.value.orderType = 3;
    }

    // 将渲染数据设置为默认
    listData.value.goodsList = []
    listData.value.pageIndex = 1
    listData.value.pageSize = 15
    listData.value.isLast = false

    // 查询数据
    searchGoodsList();
}

// 跳转到商品详情页
const goToGoodsPage = (goodsId: number) => {
    router.push({ name: "FrontGoods", params: { id: goodsId } })
}

onMounted(() => {
    // 进入页面后，获取路由传递的参数
    let keyword = router.currentRoute.value.query.keyword;
    let partId = router.currentRoute.value.query.partId

    if (keyword == '' || keyword == null) {
        searchForm.value.keyword = null;
    } else {
        searchForm.value.keyword = keyword;
    }

    if (partId == '' || partId == null) {
        searchForm.value.partId = null;
    } else {
        searchForm.value.partId = partId;
    }

    loadGoodsList();
})
</script>

<style lang="less" scoped>
@import url("goods_list.less");
</style>