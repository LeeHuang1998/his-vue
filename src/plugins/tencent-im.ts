// src/plugins/tencent-im.ts
import { App } from 'vue';
import { TUIComponents, TUIChatKit, genTestUserSig } from '../TUIKit';

const SDKAppID = 1600115809;

export default {
    install(app: App) {
        // 注册 TUI 组件
        TUIChatKit.components(TUIComponents, app);

        // 初始化 SDK
        TUIChatKit.init({
            SDKAppID,
        });
    }
};