import { createApp } from 'vue';
import App from './App.vue';

// 创建 Vue 应用
const app = createApp(App);

// 导入路由配置
import router from './router';

// 导入样式和 SVG
import 'element-plus/dist/index.css';
import 'virtual:svg-icons-register';

// 导入插件
import elementPlus from './plugins/element-plus';
import globalProperties from './plugins/global-properties';

// 导入 TUIKit 插件
import tencentIM from './plugins/tencent-im';


// import { TUIComponents, TUIChatKit, genTestUserSig } from './TUIKit';
// TUIChatKit.components(TUIComponents, app)

// const SDKAppID = 1600115809;
// TUIChatKit.init({
//     SDKAppID
// });


// 使用插件
app.use(router);
app.use(elementPlus);
app.use(globalProperties);
app.use(tencentIM);

// 挂载应用
app.mount('#app');