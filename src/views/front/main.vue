<template>
    <!-- 顶部导航 -->
    <div class="top-nav">
        <div class="top-nav-container">
            <div class="top-nav-left">
                <span>欢迎来到 i 深健康体检！</span>
            </div>
            <div class="top-nav-right">
                <div class="login-container" v-if="user.username">
                    <p class="login-info">
                        <span>您好，{{ user.username }}</span>&nbsp;
                        <span @click="logout">[退出]</span>&nbsp;&nbsp;/
                        <span @click="router.push({ name: 'FrontMine' })">个人中心</span>/&nbsp;
                        <span>我的订单</span>
                    </p>
                </div>
                <div class="login-container" v-else>
                    <p>
                        <span class="login-btn" @click="toLogin">
                            登录 | 注册
                        </span>
                        <span class="login-btn" @click="toLogin">个人中心</span>
                    </p>
                </div>
                <p class="hot-line">
                    <span>全国服务热线：</span>
                    <span>12345</span>
                </p>
            </div>
        </div>
    </div>

    <div class="container">
        <header>
            <!-- logo -->
            <div class="logo-container" @click="router.push({ name: 'FrontIndex' })">
                <img src="../../assets/front/index/logo2.png" alt="logo" class="logo" />
                <div>
                    <h3>i深健康体检</h3>
                    <p>www.leehuang.com</p>
                </div>
            </div>
            <!-- 搜索框 -->
            <div class="search-container">
                <div class="keyword-input">
                    <div class="search-box">
                        <el-input v-model="header.keyword" placeholder="请输入关键词" size="large" maxlength="100" clearable>
                        </el-input>
                    </div>
                    <el-button class="search-btn" size="large" @click="searchGoods">搜索</el-button>
                </div>
                <div>
                    <el-tag v-for="tag in header.tags" :key="tag.lable" :type="tag.type" class="tag" effect="light"
                        :round="true" @click="tagHandle(tag.lable)">
                        {{ tag.lable }}
                    </el-tag>
                </div>
            </div>
            <!-- 用户操作区 -->
            <div class="operate-container">
                <div class="cart-container">
                    <el-icon class="cart-icon" :size="25">
                        <ShoppingCart />
                    </el-icon>
                    <span>购物车</span>
                </div>
            </div>
        </header>
    </div>


    <!-- 避免路由引用页面的时候浏览器不刷新内容，所以给 URL 添加随机数参数 -->
    <router-view :key="randomRouterKey" />

    <footer>
        <div class="aboutus-container">
            <ul class="list">
                <li class="list-item">
                    <img src="../../assets//front/index/d1.svg">
                    <div>
                        <h3>官方直营</h3>
                        <p>多家体检中心线上预约，专注健康检查</p>
                    </div>
                </li>
                <li class="list-item">
                    <img src="../../assets/front/index/d2.svg" alt="">
                    <div>
                        <h3>团队优势</h3>
                        <p>标准和智能化的医疗质量管理体系，打造生命周期健康管理服务</p>
                    </div>
                </li>
                <li class="list-item">
                    <img src="../../assets/front/index/d3.svg" alt="">
                    <div>
                        <h3>专业保证</h3>
                        <p>拥有行业专家、医护人员组成的专业医疗服务团队</p>
                    </div>
                </li>
                <li class="list-item">
                    <img src="../../assets/front/index/d4.svg" alt="">
                    <div>
                        <h3>售后服务</h3>
                        <p>未消费订单及时退、过期退、体检保障和隐私保障</p>
                    </div>
                </li>

            </ul>
        </div>
        <div class="other-container">
            <ul class="list">
                <li class="link-left">
                    <img src="../../assets/front/index/service.png" alt="">
                    <p class="tel">400-1234-5678</p>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">关于我们</a></li>
                        <li><a href="">企业简介</a></li>
                        <li><a href="">发展历程</a></li>
                        <li><a href="">产业生态</a></li>
                        <li><a href="">企业文化</a></li>
                    </ul>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">企业咨询</a></li>
                        <li><a href="">网络新闻</a></li>
                        <li><a href="">媒体报道</a></li>
                        <li><a href="">工作建设</a></li>
                    </ul>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">客户服务</a></li>
                        <li><a href="">帮助中心</a></li>
                        <li><a href="">预约通道</a></li>
                        <li><a href="">售后中心</a></li>
                        <li><a href="">隐私政策</a></li>
                    </ul>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">业务合作</a></li>
                        <li><a href="">友情链接</a></li>
                        <li><a href="">联系我们</a></li>
                    </ul>
                </li>
                <li class="link-right">
                    <div class="ercode">
                        <p>微信公众号</p>
                        <img src="../../assets/front/index/ercode-1.png" alt="">
                    </div>
                </li>
                <li class="link-right">
                    <div class="ercode">
                        <p>下载APP</p>
                        <img src="../../assets/front/index/ercode-2.png" alt="">
                    </div>
                </li>
            </ul>
        </div>
    </footer>

    <el-dialog ref="loginDialogRef" v-model="loginDialogForm.visible" width="600px" :close-on-click-modal="false"
        draggable :teleported="false" class="login-dialog">
        <div class="login-type">
            <div class="select-login-type">
                <span :class="{ red: loginDialogForm.loginType == 'sms' }"
                    @click="loginDialogForm.loginType = 'sms'">短信登陆</span>
                <span :class="{ red: loginDialogForm.loginType == 'password' }"
                    @click="loginDialogForm.loginType = 'password'">密码登录</span>
            </div>
        </div>

        <div class="loginForm">
            <el-form v-if="loginDialogForm.loginType == 'sms'" :model="loginDialogForm.phoneLoginForm"
                :rules="loginDialogForm.phoneLoginRules" :teleported="false" ref="phoneLoginFormRef">
                <el-form-item prop="phoneNum">
                    <div class="input-container">
                        <!-- 选择框：v-model 直接绑 areaCode -->
                        <el-select v-model="loginDialogForm.phoneLoginForm.areaCode" placeholder="区号"
                            popper-class="area-code-popper">
                            <el-option v-for="item in areaList" :key="item.code" :value="item.code">
                                <!-- 自定义插槽：左边国家/地区，右边区号 -->
                                <span style="float: left; min-width: 100px;">{{ item.name }}</span>
                                <span style="float: right; color: #999">{{ item.code }}</span>
                            </el-option>
                        </el-select>
                        <el-input v-model="loginDialogForm.phoneLoginForm.phoneNum" placeholder="请输入手机号"
                            oninput="value=value.replace(/[^\d]/g,'')" clearable>
                        </el-input>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
                <el-form-item prop="code">
                    <div class="input-container">
                        <el-input v-model="loginDialogForm.phoneLoginForm.code" placeholder="请输入验证码"
                            prefix-icon="Promotion" maxlength="6" clearable></el-input>
                        <el-button link class="code-btn" type="primary" @click="sendSmsCode"
                            :disabled="loginDialogForm.timer > 0">{{
                                loginDialogForm.loginBtnContent }}</el-button>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
            </el-form>
            <el-form v-if="loginDialogForm.loginType == 'password'" :model="loginDialogForm.passwordLoginForm"
                :rules="loginDialogForm.passwordLoginRules" ref="passwordLoginFormRef">
                <el-form-item prop="userName">
                    <div class="input-container">
                        <el-input v-model="loginDialogForm.passwordLoginForm.userName" prefix-icon="UserFilled"
                            placeholder="请输入用户名" clearable></el-input>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
                <el-form-item prop="password">
                    <div class="input-container">
                        <el-input v-model="loginDialogForm.passwordLoginForm.password" placeholder="请输入密码" clearable
                            type="password" :show-password="true" prefix-icon="WarningFilled"></el-input>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
            </el-form>
        </div>

        <div class="account-operation">
            <div class="register" @click="toRegister">注册账号</div>
            <div class="forget-password">忘记密码？</div>
        </div>

        <template #footer>
            <p class="login-btn-container">
                <el-button type="primary" @click="login" class="login-btn">登&nbsp;&nbsp;&nbsp;&nbsp;录</el-button>
            </p>
            <!-- 社交媒体登录 -->
            <div class="social-login">
                <p>其他登录方式</p>
                <div class="social-icons">
                    <div class="social-icon wechat">
                        <i></i>
                    </div>
                    <div class="social-icon gitee" @click="giteeLogin">
                        <i></i>
                    </div>
                    <div class="social-icon github">
                        <i></i>
                    </div>
                </div>
            </div>
        </template>
    </el-dialog>

    <!-- 注册弹窗 -->
    <el-dialog ref="registerDialogRef" v-model="registerDialog.visible" width="600px" :close-on-click-modal="false"
        draggable :teleported="false" class="login-dialog">
        <div class="register-title">
            <span>新用户注册</span>
        </div>
        <div class="register-form">
            <el-form :model="registerDialog.registerForm" :rules="registerDialog.registerRules" :teleported="false"
                ref="registerFormRef">
                <el-form-item prop="phoneNum">
                    <div class="input-container">
                        <!-- 选择框：v-model 直接绑 areaCode -->
                        <el-select v-model="registerDialog.registerForm.areaCode" placeholder="区号"
                            popper-class="area-code-popper">
                            <el-option v-for="item in areaList" :key="item.code" :value="item.code">
                                <!-- 自定义插槽：左边国家/地区，右边区号 -->
                                <span style="float: left; min-width: 100px;">{{ item.name }}</span>
                                <span style="float: right; color: #999">{{ item.code }}</span>
                            </el-option>
                        </el-select>
                        <el-input v-model="registerDialog.registerForm.phoneNum" placeholder="请输入手机号"
                            oninput="value=value.replace(/[^\d]/g,'')" clearable>
                        </el-input>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
                <el-form-item prop="code">
                    <div class="input-container">
                        <el-input v-model="registerDialog.registerForm.code" placeholder="请输入验证码"
                            prefix-icon="Promotion" maxlength="6" clearable></el-input>
                        <el-button link class="code-btn" type="primary" @click="sendSmsCode"
                            :disabled="loginDialogForm.timer > 0">{{
                                loginDialogForm.loginBtnContent }}</el-button>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
                <el-form-item prop="password">
                    <div class="input-container">
                        <el-input v-model="registerDialog.registerForm.password" placeholder="请输入密码" clearable
                            type="password" :show-password="true" prefix-icon="WarningFilled"></el-input>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <div class="input-container">
                        <el-input v-model="registerDialog.registerForm.confirmPassword" placeholder="请再次输入密码" clearable
                            type="password" :show-password="true" prefix-icon="WarningFilled"></el-input>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
            </el-form>
        </div>
        <div class="back-to-login">
            <span @click="toLogin">← 回到登录</span>
            <span style="color: #ff3b3b" @click="thirdPartyDialogBind">绑定已有账号 →</span>
        </div>
        <template #footer>
            <p class="login-btn-container">
                <el-button type="primary" @click="register"
                    class="login-btn">登&nbsp;&nbsp;录&nbsp;&nbsp;注&nbsp;&nbsp;册</el-button>
            </p>
        </template>
    </el-dialog>

    <!-- 绑定弹窗 -->
    <el-dialog ref="bindCustomerRef" v-model="thirdPartyUser.visable" width="600px" :close-on-click-modal="false"
        draggable :teleported="false" class="login-dialog">
        <div class="register-title">
            <span>绑定已有用户</span>
        </div>

        <div class="register-form">
            <el-form :model="thirdPartyUser.bindCustomerForm" :rules="thirdPartyUser.bindCustomerRules"
                :teleported="false" ref="bindCustomerFormRef">
                <el-form-item prop="phoneNum">
                    <div class="input-container">
                        <!-- 选择框：v-model 直接绑 areaCode -->
                        <el-select v-model="thirdPartyUser.bindCustomerForm.areaCode" placeholder="区号"
                            popper-class="area-code-popper">
                            <el-option v-for="item in areaList" :key="item.code" :value="item.code">
                                <!-- 自定义插槽：左边国家/地区，右边区号 -->
                                <span style="float: left; min-width: 100px;">{{ item.name }}</span>
                                <span style="float: right; color: #999">{{ item.code }}</span>
                            </el-option>
                        </el-select>
                        <el-input v-model="thirdPartyUser.bindCustomerForm.phoneNum" placeholder="请输入手机号"
                            oninput="value=value.replace(/[^\d]/g,'')" clearable>
                        </el-input>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
                <el-form-item prop="code">
                    <div class="input-container">
                        <el-input v-model="thirdPartyUser.bindCustomerForm.code" placeholder="请输入验证码"
                            prefix-icon="Promotion" maxlength="6" clearable></el-input>
                        <el-button link class="code-btn" type="primary" @click="sendSmsCode"
                            :disabled="loginDialogForm.timer > 0">{{
                                loginDialogForm.loginBtnContent }}</el-button>
                    </div>
                    <template #error="{ error }">
                        <div class="error-item">{{ error }}</div>
                    </template>
                </el-form-item>
            </el-form>
        </div>
        <div class="back-to-login">
            <span @click="toRegister">← 回到注册</span>
            <span style="color: #ff3b3b" @click="toLogin">回到登录 →</span>
        </div>
        <template #footer>
            <p class="login-btn-container">
                <el-button type="primary" @click="bindCustomer" class="login-btn">绑定账号</el-button>
            </p>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'

import { isBlank, isMobile } from '../../utils/validate'
import { cookieUtil } from '../../utils/CookieUtil';




import { computed, ref, getCurrentInstance, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义框架模型数据
const instance = getCurrentInstance();
const { proxy } = instance as any;                  // 通过 proxy 属性调用在 main.ts 文件中定义的公共变量和函数
const router = useRouter();


const header = ref({                                // 头部框架模型数据
    keyword: '',
    tags: [
        { lable: '入职体检', type: 'info' },
        { lable: '父母体检', type: 'info' },
        { lable: '女士体检', type: 'info' }
    ]
});


// 随机数
const randomRouterKey = computed(() => {
    const random = router.currentRoute.value.query.random;
    return random ? String(random) : Date.now();
});

const areaList = ref([
    { name: '中国大陆', code: '+0086' },
    { name: '中国香港', code: '+0852' },
    { name: '中国澳门', code: '+0853' },
    { name: '中国台湾', code: '+0886' },
    { name: '美国', code: '+0001' }
])

const user = ref({
    username: cookieUtil.getFrontendUser()?.username
})

const thirdPartyUser = ref({
    nickname: null,
    openId: null,
    platform: null,
    email: null,
    avatar: null,
    visable: false,
    bindCustomerForm: {
        areaCode: '+0086',           // 区号
        phoneNum: '',               // 手机号
        code: ''                    // 验证码   
    },
    bindCustomerRules: {
        phoneNum: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        code: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 6, max: 6, message: '验证码长度为6位', trigger: 'blur' }
        ]
    }
})

// 打开绑定已有帐户弹窗
const thirdPartyDialogBind = () => {
    registerDialog.value.visible = false;
    loginDialogForm.value.visible = false;
    thirdPartyUser.value.visable = true;
}


// 登录表单
const loginDialogForm = ref({
    visible: false,
    loginType: 'sms',                // 登录方式，默认为短信登录
    loginBtnContent: '发送验证码',
    timer: 0,                        // 倒计时时间
    phoneLoginForm: {
        areaCode: '+0086',           // 区号
        phoneNum: '',               // 手机号
        code: ''                    // 验证码   
    },
    passwordLoginForm: {
        userName: '',               // 用户名
        password: ''                // 密码
    },
    phoneLoginRules: {
        phoneNum: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        code: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 6, max: 6, message: '验证码长度为6位', trigger: 'blur' }
        ]
    },
    // 密码登录表单验证规则
    passwordLoginRules: {
        userName: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 12, message: '用户名长度为3-12个字符', trigger: 'blur' }
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 18, message: '密码长度为6-18个字符', trigger: 'blur' }
        ]
    }
})

// 新密码和确认密码校验
const validateConfirmPassword = (rule, value, callback) => {
    if (value !== registerDialog.value.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

// 注册弹窗
const registerDialog = ref({
    visible: false,
    thirdPartyLogin: false,
    registerForm: {
        areaCode: '+0086',
        phoneNum: '',
        code: '',
        password: '',
        confirmPassword: ''
    },
    registerRules: {
        phoneNum: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        code: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 6, max: 6, message: '验证码长度为6位', trigger: 'blur' }
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 18, message: '密码长度为6-18个字符', trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: validateConfirmPassword, trigger: 'blur' }
        ]
    }
})

const tagHandle = (tag: string) => {
    header.value.keyword = tag;
}

// 从 url 地址中获取 keyword，当跳转到搜索页面时回显到搜索框中
let keyword = router.currentRoute.value.query.keyword;
header.value.keyword = keyword

const searchGoods = () => {
    router.push(
        {
            name: 'FrontGoodsList',
            query: { keyword: header.value.keyword, random: new Date().getTime() }
        }
    );
}

// 发送验证码
const sendSmsCode = () => {

    // 判断当前是哪个窗口打开的，并赋值给 phoneNum
    let phoneNum = ''
    let areaCode = '+0086'

    if (loginDialogForm.value.visible) {
        phoneNum = loginDialogForm.value.phoneLoginForm.phoneNum
        areaCode = loginDialogForm.value.phoneLoginForm.areaCode
    } else if (registerDialog.value.visible) {
        phoneNum = registerDialog.value.registerForm.phoneNum
        areaCode = registerDialog.value.registerForm.areaCode
    } else if (thirdPartyUser.value.visable) {
        phoneNum = thirdPartyUser.value.bindCustomerForm.phoneNum
        areaCode = thirdPartyUser.value.bindCustomerForm.areaCode
    }

    if (isBlank(phoneNum)) {
        ElMessage.error({
            message: '请填写手机号码',
            duration: 1000
        });
    } else if (!isMobile(phoneNum)) {
        ElMessage.error({
            message: '手机号码错误',
            duration: 1000
        });
    } else {

        let phone = {
            phoneNum: phoneNum,
            areaCode: areaCode
        }

        // 发送请求
        proxy.$http('/front/customer/sendSmsCode', 'POST', phone, true, resp => {
            if (resp.code = 200 && resp.result) {
                ElMessage.success({
                    message: resp.msg,
                    duration: 1000
                })

                // 设置倒计时
                loginDialogForm.value.timer = 60;
                let timer = setInterval(function () {
                    loginDialogForm.value.timer--;
                    loginDialogForm.value.loginBtnContent = `重新获取(${loginDialogForm.value.timer}秒)`;
                    if (loginDialogForm.value.timer == 0) {
                        clearInterval(timer);
                        loginDialogForm.value.loginBtnContent = '获取短信验证码';
                    }
                }, 1000);
            } else if (resp.code == 200 && !resp.result) {
                const sec = Number(resp.msg)     // 捕获数字部分

                ElMessage.info({
                    message: "请勿频繁发送短信",
                    duration: 1000
                })

                if (sec !== 0) {
                    loginDialogForm.value.timer = sec
                    let timer = setInterval(function () {
                        loginDialogForm.value.timer--;
                        loginDialogForm.value.loginBtnContent = `重新获取(${loginDialogForm.value.timer}秒)`;
                        if (loginDialogForm.value.timer == 0) {
                            clearInterval(timer);
                            loginDialogForm.value.loginBtnContent = '获取短信验证码';
                        }
                    }, 1000);
                }
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1500
                })
            }
        })
    }
}

// 点击登录按钮
const toLogin = () => {
    registerDialog.value.visible = false
    thirdPartyUser.value.visable = false
    loginDialogForm.value.visible = true

    proxy.$nextTick(() => {
        if (loginDialogForm.value.loginType == 'sms') {
            proxy.$refs['phoneLoginFormRef'].resetFields()
            proxy.$refs['phoneLoginFormRef'].clearValidate()
        } else if (loginDialogForm.value.loginType == 'password') {
            proxy.$refs['passwordLoginFormRef'].resetFields()
            proxy.$refs['passwordLoginFormRef'].clearValidate()
        }

    })
}

// 点击注册按钮
const toRegister = () => {
    loginDialogForm.value.visible = false
    thirdPartyUser.value.visable = false

    registerDialog.value.visible = true

    proxy.$nextTick(() => {
        proxy.$refs['registerFormRef'].clearValidate()
    })
}

// 注册请求
const register = () => {
    proxy.$refs['registerFormRef'].validate((valid: boolean) => {
        if (valid) {

            let registerUrl = null
            let registerJson = null

            if (registerDialog.value.thirdPartyLogin != true) {
                registerUrl = '/front/customer/register'

                registerJson = {
                    phoneNum: registerDialog.value.registerForm.phoneNum,
                    areaCode: registerDialog.value.registerForm.areaCode,
                    password: registerDialog.value.registerForm.password,
                    smsCode: registerDialog.value.registerForm.code,
                }
            } else {
                registerUrl = '/front/customer/thirdParty/register'

                registerJson = {
                    phoneNum: registerDialog.value.registerForm.phoneNum,
                    areaCode: registerDialog.value.registerForm.areaCode,
                    password: registerDialog.value.registerForm.password,
                    smsCode: registerDialog.value.registerForm.code,
                    nickname: thirdPartyUser.value.nickname,
                    openId: thirdPartyUser.value.openId,
                    avatar: thirdPartyUser.value.avatar,
                    email: thirdPartyUser.value.email,
                    platform: thirdPartyUser.value.platform
                }
            }

            console.log("注册发送的 json：", registerJson);

            proxy.$http(registerUrl, 'POST', registerJson, true, resp => {
                if (resp.code === 200) {

                    // 保存到 cookie
                    cookieUtil.setFrontendUser(resp.result)

                    user.value.username = resp.result.username

                    // 初始化表单数据
                    registerDialog.value.registerForm.phoneNum = ''
                    registerDialog.value.registerForm.areaCode = '+0086'
                    registerDialog.value.registerForm.password = ''
                    registerDialog.value.registerForm.code = ''

                    ElMessage.success({
                        message: resp.msg,
                        duration: 1500
                    })

                    // 关闭注册窗口
                    registerDialog.value.visible = false
                    loginDialogForm.value.visible = false

                } else if (resp.code == 4003 || resp.code == 4004 || resp.code == 4006 || resp.code == 4007 || resp.code == 4008) {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1000
                    })
                }
                else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    })
                }
            })
        }
    })
}

// 登录请求
const login = () => {

    let type = loginDialogForm.value.loginType
    let form = ''
    let identity = null
    let credential = null

    if (type == 'sms') {
        form = 'phoneLoginFormRef'
        identity = loginDialogForm.value.phoneLoginForm.phoneNum
        credential = loginDialogForm.value.phoneLoginForm.code
    } else if (type == 'password') {
        form = 'passwordLoginFormRef'
        identity = loginDialogForm.value.passwordLoginForm.userName
        credential = loginDialogForm.value.passwordLoginForm.password
    }

    proxy.$refs[form].validate((valid: boolean) => {

        if (valid) {

            let loginJson = {
                type: type,
                identity: identity,
                credential: credential,
                areaCode: loginDialogForm.value.phoneLoginForm.areaCode
            }

            // 发送请求
            proxy.$http('/front/customer/login', 'POST', loginJson, true, resp => {
                if (resp.code === 200) {
                    // 保存到 cookie
                    cookieUtil.setFrontendUser(resp.result)
                    user.value.username = resp.result.username

                    ElMessage.success({
                        message: resp.msg,
                        duration: 1500
                    })

                    // 关闭登录窗口
                    loginDialogForm.value.visible = false
                    registerDialog.value.visible = false
                    thirdPartyUser.value.visable = false
                } else if (resp.code == 4003 || resp.code == 4004 || resp.code == 4005 || resp.code == 4007) {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    })
                }
                else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    })
                }
            })
        }
    })
}

// gitee 登录
const giteeLogin = () => {

    // 发送请求到接口中生成 state， 防止 CSRF 攻击
    proxy.$http('/OAuth2.0/gitee/state', 'GET', null, true, resp => {
        if (resp.code == 200) {
            const state = resp.result.state;
            const codeChallenge = resp.result.code_challenge;
            const codeChallengeMethod = resp.result.code_challenge_method;
            const clientId = resp.result.client_id;
            const redirectUri = encodeURIComponent(resp.result.redirect_uri);       // 回调到当前登录页

            // 构建包含 PKCE 的授权 URL
            const authUrl = `https://gitee.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;

            // 跳转到授权页面
            window.location.href = authUrl;

        } else {
            console.error('OAuth初始化失败:', resp.msg);
            fallbackGiteeLogin();
        }
    })
}

// gitee 登录降级方案
const fallbackGiteeLogin = () => {
    const clientId = '2ac2e89203f98dd8ffeacedf87372b44182e4e4bdaa051c3994ef469ec0ef236';
    const redirectUri = encodeURIComponent('https://localhost:7700/his-api/OAuth2.0/giteeLogin/success');       // 回调到当前登录页
    const state = generateRandomString(16);                                                                     // 生成随机 state

    window.location.href = `https://gitee.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
}

// 生成随机字符串用于 state 参数
const generateRandomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 绑定已有账号
const bindCustomer = () => {
    proxy.$refs['bindCustomerFormRef'].validate((valid: boolean) => {
        if (valid) {
            let thirdPartyBindJson = {
                nickname: thirdPartyUser.value.nickname,
                openId: thirdPartyUser.value.openId,
                platform: thirdPartyUser.value.platform,
                email: thirdPartyUser.value.email,
                avatart: thirdPartyUser.value.avatar,
                phoneNum: thirdPartyUser.value.bindCustomerForm.phoneNum,
                smsCode: thirdPartyUser.value.bindCustomerForm.code,
                areaCode: thirdPartyUser.value.bindCustomerForm.areaCode
            }

            // 发送请求绑定账号
            proxy.$http('/front/customer/thirdParty/bind', 'POST', thirdPartyBindJson, true, resp => {
                if (resp.code === 200) {
                    // 保存到 cookie
                    cookieUtil.setFrontendUser(resp.result)
                    user.value.username = resp.result.username

                    ElMessage.success({
                        message: resp.msg,
                        duration: 1500
                    })

                    // 关闭登录窗口
                    loginDialogForm.value.visible = false
                    registerDialog.value.visible = false
                    thirdPartyUser.value.visable = false
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    })
                }
            })

        }
    })
}

// 退出登录
const logout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 发送请求
        proxy.$http('/front/customer/logout', 'GET', null, true, resp => {
            if (resp.code === 200) {

                user.value.username = null

                // 清除 cookie
                cookieUtil.removeFrontendUser()

                ElMessage.success({
                    message: resp.msg,
                    duration: 1500
                })
                router.push({ name: 'FrontIndex' })
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1500
                })
            }
        })
    })
}

// 判断当前是否已登录
const isLogin = () => {
    let loginUser = cookieUtil.getFrontendUser()

    

    if (loginUser != null) {
        // 检查 token 是否有效
        proxy.$http('/front/customer/checkLogin', 'GET', null, true, function (resp) {
            console.log(resp);
            console.log(loginUser.token);
        
            if (resp.result) {
                user.value.username = loginUser.username
            } else {
                ElMessage.info({
                    message: '登录出错，请重试',
                    duration: 1500
                })
                // 清除 cookie
                cookieUtil.removeFrontendUser()
            }
        });
    } else if (loginUser == null && route.query.redirectToken == null) {
        // router.push({ name: 'FrontIndex' })
    }
}

const route = useRoute()

onMounted(() => {

    isLogin()

    const redirectToken = route.query.redirectToken

    // 判断当前是否为登录
    if (redirectToken) {
        router.push({ name: 'FrontIndex' })
        // 发送请求到接口查询用户信息
        proxy.$http('/front/customer/getLoginInfoByToken?redirectToken=' + redirectToken, 'GET', null, true, resp => {
            if (resp.loginInfo.isNew != true) {

                let loginUser = {
                    username: resp.loginInfo.username,
                    token: resp.loginInfo.token,
                }
                // 登录成功，保存到 cookie
                cookieUtil.setFrontendUser(loginUser)

                user.value.username = resp.loginInfo.username

                ElMessage.success({
                    message: '第三方平台登录成功',
                    duration: 1200
                })

            } else if (resp.loginInfo.isNew == true) {
                ElMessage.success({
                    message: '授权登录成功，新用户请完善信息',
                    duration: 2000
                })

                // 打开注册弹窗
                registerDialog.value.visible = true
                registerDialog.value.thirdPartyLogin = true

                // 第三方平台信息
                thirdPartyUser.value.nickname = resp.loginInfo.nickname
                thirdPartyUser.value.avatar = resp.loginInfo.avatar
                thirdPartyUser.value.email = resp.loginInfo.email
                thirdPartyUser.value.platform = resp.loginInfo.platform
                thirdPartyUser.value.openId = resp.loginInfo.openId

            } else {
                ElMessage.error({
                    message: "授权登录失败，请重试",
                    duration: 1500
                })
            }
        })
    }
})
</script>

<style lang="less" scoped>
@import url('main.less');
</style>