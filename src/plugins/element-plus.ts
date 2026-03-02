import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import locale from 'element-plus/es/locale/lang/zh-CN';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import type { App } from 'vue';

export default {
  install(app: App) {
    app.use(ElementPlus, { locale });
    
    // 注册图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component);
    }
  }
};