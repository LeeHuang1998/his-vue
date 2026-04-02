<template>
    <!--  :class：根据值判断是否使用该样式，若为 true 则替换原 class v-loading.fullscreen.lock：开启加载动画 -->
    <div class="site-wrapper" :class="{ 'site-sidebar--fold': sidebar.sidebarFold }">

        <!-- 头部导航栏 -->
        <nav class="site-navbar" :class="{ 'site-navbar-fold': sidebar.sidebarFold }">
            <!-- 菜单栏头部区域 -->
            <div class="site-navbar__header">
                <h1 class="site-navbar__brand">
                    <a class="site-navbar__brand-lg">i 深健康体检系统</a>
                    <a href="" class="site-navbar__brand-mini">体检</a>
                </h1>
            </div>

            <!-- 导航栏 -->
            <div class="navbar-container" :class="{ 'navbar-container--fold': sidebar.sidebarFold }">
                <!-- 折叠菜单栏图标 -->
                <div class="switch" @click="handleSwitch">
                    <SvgIcon name="zhedie" class="icon-svg"></SvgIcon>
                </div>
                <!-- 导航栏右边用户操作 -->
                <div class="right-container">
                    <el-dropdown>
                        <!-- el-dropdown 鼠标移动到该区域时会有黑框，该样式默认依附于 el-dropdown 的第一个子元素上 -->
                        <span class="el-dropdown-link">
                            <span class="avatar-container">
                                <el-avatar shape="circle" :size="25" :src="user.avatar" :icon="UserFilled"></el-avatar>
                            </span>
                            <span class="user-name">{{ user.username }}</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="updatePassword">修改密码</el-dropdown-item>
                                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </nav>

        <!-- 左边菜单栏 -->
        <aside class="site-sidebar site-sidebar--dark">
            <div class="site-sitebar__innner">
                <!-- 菜单项，bgc 表示鼠标悬停在一级菜单时该选项的背景色，而不是整个菜单项的背景色 -->
                <el-menu :default-active="siteContent.menuActiveName || 'Home'" :collapse="sidebar.sidebarFold"
                    :collapse-transition="false" class="site-sidebar__menu" background-color="#263238"
                    active-text-color="#fff" text-color="#8a979e">
                    <el-menu-item index="MisHome" @click="$router.push({ name: 'MisHome' })">
                        <el-icon>
                            <SvgIcon name="home" class="icon-svg"></SvgIcon>
                        </el-icon>
                        <span slot="title">首页</span>
                    </el-menu-item>

                    <!-- :popper-class 的作用：为下拉子菜单设置样式 -->
                    <!-- 组织管理菜单项 -->
                    <el-sub-menu index="OrgManagement"
                        :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '__popper'">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="users_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">组织管理</span>
                        </template>
                        <!-- 部门管理：v-if="proxy.$isAuth(['ROOT','DEPT:SELECT'])" -->
                        <el-menu-item index="MisDept" @click="$router.push({ name: 'MisDept' })">
                            <el-icon>
                                <SvgIcon name="company_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">部门管理</span>
                        </el-menu-item>
                        <!-- 角色管理：v-if="proxy.$isAuth(['ROOT','ROLE:SELECT'])" -->
                        <el-menu-item index="MisRole" @click="$router.push({ name: 'MisRole' })">
                            <el-icon>
                                <SvgIcon name="role_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">角色管理</span>
                        </el-menu-item>
                        <!-- 用户管理：v-if="proxy.$isAuth(['ROOT','USER:SELECT'])" -->
                        <el-menu-item index="MisUser" @click="$router.push({ name: 'MisUser' })">
                            <el-icon>
                                <SvgIcon name="user_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">用户管理</span>
                        </el-menu-item>
                    </el-sub-menu>

                    <!-- 业务管理菜单项 -->
                    <el-sub-menu index="BusinessManagement"
                        :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '__popper'">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="trust_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">业务管理</span>
                        </template>
                        <!-- 体检套餐：v-if="proxy.$isAuth(['ROOT','GOODS:SELECT'])" -->
                        <el-menu-item index="MisGoods" @click="$router.push({ name: 'MisGoods' })">
                            <el-icon>
                                <SvgIcon name="goods_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">体检套餐</span>
                        </el-menu-item>
                        <el-menu-item index="MisBanner" @click="$router.push({ name: 'MisBanner' })">
                            <el-icon>
                                <SvgIcon name="banner_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">首页轮播图</span>
                        </el-menu-item>
                        <!-- 促销规则：v-if="proxy.$isAuth(['ROOT','RULE:SELECT'])" -->
                        <el-menu-item index="MisRule" @click="$router.push({ name: 'MisRule' })">
                            <el-icon>
                                <SvgIcon name="rule_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">促销规则</span>
                        </el-menu-item>
                        <!-- 客户档案：v-if="proxy.$isAuth(['ROOT','CUSTOMER:SELECT'])" -->
                        <el-menu-item index="MisCustomer" @click="$router.push({ name: 'MisCustomer' })">
                            <el-icon>
                                <SvgIcon name="customer_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">客户档案</span>
                        </el-menu-item>
                        <!-- 订单管理：v-if="proxy.$isAuth(['ROOT','ORDER:SELECT'])" -->
                        <el-menu-item index="MisOrder" @click="$router.push({ name: 'MisOrder' })">
                            <el-icon>
                                <SvgIcon name="order_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">订单管理</span>
                        </el-menu-item>
                        <!-- 客服IM：v-if="proxy.$isAuth(['ROOT','CUSTOMER_IM:SELECT'])" -->
                        <el-menu-item index="MisCustomerIM" @click="$router.push({ name: 'MisCustomerIM' })">
                            <el-icon>
                                <SvgIcon name="im_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">客服IM</span>
                        </el-menu-item>
                    </el-sub-menu>

                    <!-- 体检管理菜单项 -->
                    <el-sub-menu index="PEManagement"
                        :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '__popper'">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="night_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">体检管理</span>
                        </template>
                        <!-- 体检预约：v-if="proxy.$isAuth(['ROOT','APPOINTMENT:SELECT'])" -->
                        <el-menu-item index="MisAppointment" @click="$router.push({ name: 'MisAppointment' })">
                            <el-icon>
                                <SvgIcon name="appointment_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">体检预约</span>
                        </el-menu-item>
                        <!-- 体检签到：v-if="proxy.$isAuth(['ROOT','CUSTOMER_CHECKIN:SELECT'])" -->
                        <el-menu-item index="MisCustomerCheckin" @click="$router.push({ name: 'MisCustomerCheckin' })">
                            <el-icon>
                                <SvgIcon name="checkin_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">体检签到</span>
                        </el-menu-item>
                        <!-- 预约设置：v-if="proxy.$isAuth(['ROOT','APPPOINTMENT_RESTRICTION:SELECT'])" -->
                        <el-menu-item index="MisAppointmentRestriction"
                            @click="$router.push({ name: 'MisAppointmentRestriction' })">
                            <el-icon>
                                <SvgIcon name="setting_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">预约设置</span>
                        </el-menu-item>
                        <!-- 医生检查：v-if="proxy.$isAuth(['ROOT','CHECKUP:SELECT'])" -->
                        <el-menu-item index="MisDoctorCheckup" @click="$router.push({ name: 'MisDoctorCheckup' })">
                            <el-icon>
                                <SvgIcon name="doctor_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">医生检查</span>
                        </el-menu-item>
                        <!-- 体检报告：v-if="proxy.$isAuth(['ROOT','CHECKUP_REPORT:SELECT'])" -->
                        <el-menu-item index="MisCheckupReport" @click="$router.push({ name: 'MisCheckupReport' })">
                            <el-icon>
                                <SvgIcon name="file_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">体检报告</span>
                        </el-menu-item>


                    </el-sub-menu>

                    <!-- 系统设置菜单项 v-if="proxy.$isAuth(['ROOT','SYSTEM:SELECT'])" -->
                    <el-sub-menu index="SystemSetting"
                        :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '__popper'">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="system_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">系统设置</span>
                        </template>
                        <!-- 人员限流：v-if="proxy.$isAuth(['ROOT','FLOW_REGULATION:SELECT'])" -->
                        <el-menu-item index="MisFlowRegulation" @click="$router.push({ name: 'MisFlowRegulation' })">
                            <el-icon>
                                <SvgIcon name="people_fill" class="icon-svg"></SvgIcon>
                            </el-icon>
                            <span slot="title">人员限流</span>
                        </el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </div>
        </aside>

        <!-- 内容区 -->
        <div class="site-content__wrapper">
            <main class="site-content" :class="{ 'site-content--tabs': $route.meta.isTab }">
                <el-tabs v-if="$route.meta.isTab" v-model="siteContent.mainTabsActiveName" :closable="true"
                    @tab-click="clickTabHandle" @tab-remove="removeTabHandle">
                    <el-tab-pane v-for="item in siteContent.mainTabs" :label="item.title" :name="item.name">
                        <el-card :body-style="siteContent.siteContentViewHeight">
                            <!-- 避免浏览器通过缓存加载而不刷新页面，给 url 添加随机数后强制浏览器刷新，加载页面内容 -->
                            <router-view :key="route.query.random" />
                        </el-card>
                    </el-tab-pane>
                </el-tabs>
                <!-- 若点击的是首页等无需创建标签的菜单项，则直接显示 el-card -->
                <el-card v-else :body-style="siteContent.siteContentViewHeight">
                    <router-view :key="route.query.random" />
                </el-card>
            </main>
        </div>

        <!-- 修改密码弹窗 -->
        <el-dialog title="提示" v-model="updatePasswordDialog.dialogVisible" width="25%">
            <el-form :model="updatePasswordDialog.dataForm" :rules="updatePasswordDialog.dataRule" ref="dialogRef" label-width="80px">
                <el-form-item label="原密码" prop="password">
                    <el-input type="password" v-model="updatePasswordDialog.dataForm.password" placeholder="请输入原密码" maxlength="20" clearable></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="updatePasswordDialog.dataForm.newPassword" placeholder="请输入新密码" type="password" maxlength="20" clearable></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="updatePasswordDialog.dataForm.confirmPassword" placeholder="请确认新密码" type="password" maxlength="20" clearable></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="updatePasswordDialog.dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="updatePasswordSubmit()">确 定</el-button>
                </span>
            </template>
         </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import router from '../../router/index';
import SvgIcon from '../../components/SvgIcon.vue';

import { getCurrentInstance, ref, provide, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UserFilled } from '@element-plus/icons-vue';
import { cookieUtil } from '../../utils/CookieUtil';

// import { Component, Vue, Watch } from 'vue-property-decorator';

const { proxy } = getCurrentInstance() as any;

// 左边菜单栏状态数据
const sidebar = ref({
    sidebarFold: false,                     // 左边菜单栏是否折叠
    sidebarLayoutSkin: 'dark',              // 左边菜单栏主题
})

// 内容区状态数据
const siteContent = ref<{
    documentClientHeight: number;
    siteContentViewHeight: {};
    height: number | null;
    mainTabs: { title: string, name: string }[];
    mainTabsActiveName: string;
    menuActiveName: string;
}>({
    documentClientHeight: 0,                // 浏览器可视区域高度
    siteContentViewHeight: {},              // 内容区样式高度
    height: null,                           // 内容区高度具体值
    mainTabs: [],                           // 打开的标签页
    mainTabsActiveName: '',                 // 当前激活的标签页名称
    menuActiveName: '',                     // 当前激活的菜单名称
})

// 用户状态数据
const user = ref({
    username: cookieUtil.getBackendUser()?.name,             // 用户名
    avatar: '',                                                                                     // 用户头像
    updatePasswordVisable: false,                                                                   // 修改密码弹窗是否显示
})

// import { computed } from 'vue';

// const randomRouterKey = computed(() => {
//     const random = router.currentRoute.value.query.random;
//     return random ? String(random) : Date.now();
// });

// 计算浏览器可视区域高度
function resetDocumentClientHeight() {
    siteContent.value.documentClientHeight = document.documentElement.clientHeight;
}

// 计算内容区高度
function loadsiteContentViewHeight() {
    // 内容区高度 = 浏览器可视区域高度 - 顶部导航栏高度 - card 上下外填充 - 上下边框
    let viewHeight = siteContent.value.documentClientHeight - 50 - 30 - 2;
    // 若跳转页面需要 tab 控件，则 card 高度还需要减去 40px（tab 控件高度）
    if (route.meta.isTab) {
        viewHeight -= 40;
    }
    // 保存内容区高度
    siteContent.value.height = viewHeight;
    // 设置 css 样式
    siteContent.value.siteContentViewHeight = { minHeight: viewHeight + 'px' };
}

// 当浏览器窗口发生变化时，动态调整高度
window.onresize = () => {
    // 重新获取当前窗口的可视区高度
    resetDocumentClientHeight();
    // 重新计算内容区高度
    loadsiteContentViewHeight();
}

const route = useRoute();

// 点击菜单栏选项后，通过 router 跳转页面时，打开新的标签页
function routeHandle(route) {
    // 每次跳转页面时，计算内容区的高度，计算完成后在视图层中给 :body-style 绑定样式
    loadsiteContentViewHeight();
    resetDocumentClientHeight();

    // 判断点击的菜单项是否需要创建新的 tab 控件：首页和已打开的 tab 控件不创建
    if (route.meta.isTab) {
        // 创建新的 tab 前需判断 mainTabs 中是否已存在该 tab（数组中不会存在同名 tab，所以筛选后只会有一个 tab）
        let tab = siteContent.value.mainTabs.filter((item) => item.name === route.name)[0];
        if (tab == null) {
            // 创建新的 tab
            tab = {
                title: route.meta.title,
                name: route.name,
            };
            siteContent.value.mainTabs.push(tab);
        }
        siteContent.value.mainTabsActiveName = tab.name;            // 设置当前激活的 tab 控件
        siteContent.value.menuActiveName = tab.name;                // 设置当前激活的菜单项
    } else {
        siteContent.value.mainTabs = [];                            // 清空已打开的 tab 控件
        siteContent.value.mainTabsActiveName = '';                  // 清空当前激活的 tab 控件
        siteContent.value.menuActiveName = "MisHome";               // 设置当前激活的菜单项
    }
}
// 进入页面时直接执行 routeHandle，把当前路由加载页面对应的 tab 选中
// 例如直接通过浏览器地址栏输入地址进入页面，需要让内容区创建并选中该页面对应的 tab

routeHandle(route)

// 点击 tab 标签跳转页面
function clickTabHandle(tab) {
    router.push({ name: tab.paneName });
}

import type { TabPaneName } from 'element-plus'
// 点击关闭 tab 标签，并跳转到前一个 tab 标签
function removeTabHandle(tabName: TabPaneName) {
    siteContent.value.mainTabs = siteContent.value.mainTabs.filter((item) => item.name !== tabName);
    // 跳转到前一个 tab 标签，如果没有，则跳转到首页
    siteContent.value.mainTabsActiveName = siteContent.value.mainTabs.length > 0 ? siteContent.value.mainTabs[siteContent.value.mainTabs.length - 1].name : 'MisHome';
    router.push({ name: siteContent.value.mainTabsActiveName });
}

// 点击菜单栏折叠按钮
function handleSwitch() {
    sidebar.value.sidebarFold = !sidebar.value.sidebarFold;
}

const logout = () => {
    // 发送请求到后端接口中
    proxy.$http('/mis/user/logout', 'GET', null, true, resp => {
        // 移除本地存储中的 token 和 permissions
        cookieUtil.clearAllUserData();
        // 跳转到登录页面
        router.push({ name: 'MisLogin' })

    })
    console.log('退出登录');
}

// 原密码和新密码校验
const validateNewPassword = (rule, value, callback) => {
    if (value === updatePasswordDialog.value.dataForm.password) {
        callback(new Error('新密码不能与原密码相同'))
    } else {
        callback(new Success(''))
    }
}

// 新密码和确认密码校验
const validateConfirmPassword = (rule, value, callback) => {
    if (value !== updatePasswordDialog.value.dataForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

// 修改密码表单数据
const updatePasswordDialog = ref({
    dialogVisible: false,                   // 修改密码弹窗是否显示
    dataForm: {
        password: '',                       // 原密码
        newPassword: '',                    // 新密码
        confirmPassword: '',                // 确认密码
    },
    dataRule: {                             // 校验规则
        password: [{ required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误', trigger: 'blur'}],
        newPassword: [
            { required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误', trigger: 'blur' },
            { validator: validateNewPassword, trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误', trigger: 'blur' },
            { validator: validateConfirmPassword, trigger: 'blur' }
        ]
    }
})

// 打开修改密码弹窗
const updatePassword = () => {
    updatePasswordDialog.value.dialogVisible = true;

    // 重置表单数据（通过 ref 获取到表单组件，调用 resetFields 方法重置表单），$nextTick 方法用于在 DOM 渲染后执行回调函数
    proxy.$nextTick(() => {
        proxy.$refs['dialogRef'].resetFields();
    })
}

// 修改密码
function updatePasswordSubmit() {
    proxy.$refs['dialogRef'].validate((valid) => {
        if (valid) {
            let updateData = {
                password: updatePasswordDialog.value.dataForm.password,
                newPassword: updatePasswordDialog.value.dataForm.newPassword
            }

            // 发送请求到后端接口中
            proxy.$http('/mis/user/updatePassword', 'POST', updateData, true, resp => {
                if (resp.rows == 1) {
                    proxy.$message({
                        type: 'success',
                        message: '修改密码成功',
                        duration: 600,
                        onClose: () => {
                            // 关闭弹窗
                            updatePasswordDialog.value.dialogVisible = false;
                        }
                    })
                } else {
                    proxy.$message({
                        type: 'error',
                        message: '修改密码失败',
                        duration: 800
                    });
                }
            });
        }
    })
}


// 监听路由对象，当发生路由跳转时，调用 routeHandle 判断是否需要新建 tab 标签
watch(
    () => router,
    () => {
        routeHandle(route)
    },
    // immediate：在侦听器创建时就立即出发回调，响应式数据变化之后继续执行回调
    // deep：深度监听，通过 watch 监听的 ref 对象默认是浅层侦听的，直接修改嵌套的对象属性不会触发回调执行，需要开启 deep
    { immediate: true, deep: true }
)

</script>

<style lang="scss">
@import '../../assets/scss/index.scss';

.el-dropdown-link {
    display: flex;
    outline: unset;
}

.avatar-container {
    vertical-align: -8px;
    margin-right: 6px;
    margin-top: 7px;
}


.user-name {
    font-size: 14px;
    margin-top: 2px;
}

</style>
