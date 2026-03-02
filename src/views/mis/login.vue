<template>
    <div class="page">
        <div class="panel">
            <div class="login-left">
                <img src="../../assets/login/big.png" alt="" class="big">
            </div>
            <div class="login-right">
                <div class="title-container">
                    <h2>i 深健康体检系统</h2>
                    <span>V1.0</span>
                </div>
                <div v-if="!qr.qrCodeVisable">
                    <div class="row">
                        <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="user" size="large" clearable></el-input>
                    </div>
                    <div class="row">
                        <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password clearable
                        @input="value => loginForm.password = value.replace(/\s+/g, '')" @paste="e => e.preventDefault()">
                        </el-input>
                    </div>
                    <div class="row">
                        <el-button type="primary" class="btn" size="large" @click="login">登录系统</el-button>
                    </div>
                    <div class="row"><a class="switch-login">二维码登录</a></div>
                </div>
                <div v-if="qr.qrCodeVisable">
                    <div class="qrcode-container">
                        <img :src="qr.qrCode" height="153" class="qrcode" alt="">
                        <img src="../../assets/login/phone.png" alt="" height="148">
                    </div>
                    <div class="row"><a class="switch-login">账号密码登录</a></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref } from 'vue';
import { isUsername, isPassword } from '../../utils/validate';
import { cookieUtil } from '../../utils/CookieUtil';

import router from '../../router/index';


// 获取当前是上下文对象
const { proxy } = getCurrentInstance() as any;

// 登录表单数据
const loginForm = ref({
    username: '',
    password: ''
});

// 登录
const login = () => {
    // 验证格式
    if(!isUsername(loginForm.value.username)) {
        proxy.$message({
            message: '用户名格式不正确',
            type: 'error',
            duration: 1200
        })
        return;
    }
    if(!isPassword(loginForm.value.password)) {
        proxy.$message({
            message: '密码格式不正确',
            type: 'error',
            duration: 1200
        })
        return;
    }
    // 接收参数
    const loginData = {
        username: loginForm.value.username,
        password: loginForm.value.password
    };
    proxy.$http('/mis/user/login', 'POST', loginData, true, resp => {
        // 登录成功，将 token 和 permissions 存储到本地
        if(resp.result){

            // 用户信息保存到 cookie
            let user = {
                name: resp.name,
                permissions: resp.permissions,
                token: resp.token
            }

            cookieUtil.setBackendUser(user)

            // 跳转到首页
            router.push({ name: 'MisHome' });
        } else {
            proxy.$message({
                message: resp.msg,
                type: 'error',
                duration: 1200
            })
        }
    })
    
}

// TODO qrcode 登录
const qr = ref({
    qrCodeVisable: false,
    qrCode: '',
    uuid: null,
    qrCodeTimer: null,
    loginTimer: null
});

</script>

<style lang="less" scoped="scoped">
    @import url('login.less');
</style>
