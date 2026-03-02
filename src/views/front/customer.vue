<template>
    <div class="customer-container">
        <el-menu :default-active="active" class="menu" @select="selectHandle">
            <!-- 菜单栏 -->
            <el-menu-item index="FrontMine">
                <el-icon>
                    <User />
                </el-icon>
                <span>账户信息</span>
            </el-menu-item>
            <el-menu-item index="FrontOrderList">
                <el-icon>
                    <Tickets />
                </el-icon>
                <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="FrontAppointmentList">
                <el-icon>
                    <Files />
                </el-icon>
                <span>体检预约</span>
            </el-menu-item>
            <el-menu-item index="FrontCustomerIm">
                <el-icon>
                    <Collection />
                </el-icon>
                <span>客服咨询</span>
            </el-menu-item>
        </el-menu>

        <!-- 内容区 -->
        <div class="content">
            <router-view />
        </div>
    </div>

</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import router from '../../router/index';

const { proxy } = getCurrentInstance();


const route = useRoute();

const active = ref('FrontMine');


const selectHandle = (index: string) => {
    router.push({ name: index });
}

onMounted(() => {
    active.value = route.name as string;
    
})
</script>

<style lang="less" scoped>
@import url("customer.less");
</style>