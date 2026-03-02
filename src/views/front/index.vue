<template>
    <div class="index-container">
        <div class="banner">
            <el-carousel :height="bannerHeight + 'px'" :autoplay="false">
                <el-carousel-item v-for="(image, index) in carouselImage.images" :key="index">
                    <img :src="image" alt="">
                </el-carousel-item>
            </el-carousel>
            <div class="notice-container">
                <div class="notice">
                    <el-icon>
                        <Bell />
                    </el-icon>
                    <p>官方商城直营，无中间商，为家人健康护航。立即行动，守护爱与健康！</p>
                </div>
            </div>
        </div>

        <div class="service-container">
            <div class="service-item">
                <img src="../../assets/front/index/service-icon-1.png" alt="">
                <div>
                    <h4>体检预约</h4>
                    <span>一站式预约服务</span>
                </div>
            </div>
            <div class="service-item">
                <img src="../../assets/front/index/service-icon-2.png" alt="">
                <div>
                    <h4>报告查询</h4>
                    <span>体检报告快速查询</span>
                </div>
            </div>
            <div class="service-item">
                <img src="../../assets/front/index/service-icon-3.png" alt="">
                <div>
                    <h4>活动热卖</h4>
                    <span>健康好价趁热行动</span>
                </div>
            </div>
            <div class="service-item">
                <img src="../../assets/front/index/service-icon-4.png" alt="">
                <div>
                    <h4>企业专区</h4>
                    <p>企业专属健康服务</p>
                </div>
            </div>
        </div>

        <div class="goods-container">
            <nav>
                <p>活动专区</p>
                <el-link class="check-more" :icon="Plus" underline="never" @click="moreHandle(1)">查看更多</el-link>
            </nav>
            <ul class="goods-list">
                <li class="goods-item" v-for="goods in goodsList.part_1" :key="goods.id">
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

        <div class="goods-container">
            <nav>
                <p>热卖专区</p>
                <el-link class="check-more" :icon="Plus" underline="never" @click="moreHandle(2)">查看更多</el-link>
            </nav>
            <ul class="goods-list">
                <li class="goods-item" v-for="goods in goodsList.part_2" :key="goods.id">
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

        <div class="goods-container">
            <nav>
                <p>新品推荐</p>
                <el-link class="check-more" :icon="Plus" underline="never" @click="moreHandle(3)">查看更多</el-link>
            </nav>
            <ul class="goods-list">
                <li class="goods-item" v-for="goods in goodsList.part_3" :key="goods.id">
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

        <div class="enterprise-goods">
            <div class="content">
                <h3>企业团检</h3>
                <p>为您的企业定制专属健康福利计划</p>
                <div class="goods-container">
                    <img src="http://localhost:9000/his/front/goods/enterprise_1.svg" alt="">
                    <img src="http://localhost:9000/his/front/goods/enterprise_2.svg" alt="">
                </div>
            </div>
        </div>

        <div class="partner-container">
            <h3>—&nbsp;&nbsp;合作伙伴&nbsp;&nbsp;—</h3>
            <el-carousel height="220px" :autoplay="false">
                <el-carousel-item>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c1.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c2.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c3.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c4.png" />
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c5.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c6.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c7.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c8.png" />
                        </el-col>
                    </el-row>
                </el-carousel-item>
                <el-carousel-item>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c9.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c10.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c11.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c12.png" />
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c13.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c14.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c15.png" />
                        </el-col>
                        <el-col :span="6">
                            <img class="logo" src="../../assets/front/index/c16.png" />
                        </el-col>
                    </el-row>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'


const { proxy } = getCurrentInstance() as any
const router = useRouter()

const carouselImage = ref({
    images: []
})

const goodsList = ref({
    part_1: [],
    part_2: [],
    part_3: []
})

/* 设置窗口宽度变化数据 */
const BASE_W = 1600                 // 临界宽度
let maxW = ref(window.innerWidth)   // 最大窗口宽度
const ratio = 530 / maxW.value      // 530 px 对应的最大比例
const bannerHeight = ref(530)       // 初始值

// 设置窗口宽度，当宽度小于 1600 时，不再变化
function syncHeight() {
    const w = window.innerWidth
    if (w > BASE_W) {
        // 窗口大于 1600 时，等比例变化
        bannerHeight.value = Math.round(w * ratio)
    } else {
        // 窗口 ≤ 1600 时，固定为 1600 时的宽高
        bannerHeight.value = Math.round(BASE_W * ratio)
    }
}

// 获取 index 页数据信息
const getIndexPageData = () => {
    let ids = [1, 2, 3]
    proxy.$http('/front/index/getIndexPageData', 'POST', { ids: ids }, true, resp => {
        let indexPageData = resp.indexPageData

        carouselImage.value.images = indexPageData.bannerList

        indexPageData.partGoods.forEach(item => {
            // 根据 goods 中的 partId 来判断当前商品属于哪个部分，然后添加到对应的数组中
            const key = `part_${item.partId}`
            if (goodsList.value[key]) {
                goodsList.value[key].push(item);
            }
        })
    })
}

// 根据分区跳转商品列表页
const moreHandle = (partId: number) => {
    router.push({ 
        name: "FrontGoodsList", 
        query: { partId: partId, random: new Date().getTime() }
    })
}

// 跳转到商品详情页
const goToGoodsPage = (goodsId: number) => {
    router.push({ name: "FrontGoods", params: { id: goodsId } })
}


onMounted(() => {
    // 设置事件监听器，当窗口大小变化时，同步高度
    syncHeight()
    window.addEventListener('resize', syncHeight)

    getIndexPageData()
})

// 当组件实例即将被卸载（从 DOM 中移除）时，移除事件监听器，防止内存泄漏
onBeforeUnmount(() => {
    window.removeEventListener('resize', syncHeight)
})

</script>

<style lang="less" scoped>
@import url(index.less);
</style>