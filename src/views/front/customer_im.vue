<template>
    <div class="im-container">
        <div class="home-TUIKit-main">
            <div class="conversation">
                <TUISearch class="TUIKit-search" />
                <TUIConversation />
            </div>
            <div class="TUIKit-chat">
                <TUIChat />
            </div>
        </div>
    </div>

</template>

<script setup>

import { reactive, ref, getCurrentInstance, toRefs, onMounted } from 'vue';
import { TUILogin } from '@tencentcloud/tui-core-lite';
import { isPC } from '../../TUIKit/utils/env';


//初始化TUIKit环境
const data = reactive({
    env: isPC
});

const { proxy } = getCurrentInstance();

const loadImPage = () => {
    proxy.$http("/front/customer/im/createImAccount", "GET", null, true, function (resp) {
        let result = resp.imAccount
        let account = result.account;
        let sdkAppId = result.sdkAppId
        let userSig = result.userSig

        //登陆客户IM账号

        TUILogin.login({
            SDKAppID: sdkAppId,
            userID: account,
            userSig: userSig,
        });

    })
}

onMounted(() => {
    loadImPage()
})


</script>

<style lang="less">
@import url("customer_im.less");
</style>
