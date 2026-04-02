import type { App } from 'vue';
import { baseUrl, minioUrl } from '../config/index';
import { http } from '../utils/request';
import { auth } from '../utils/auth';
import { getPdf } from '../utils/pdfUtil';

export default {
  install(app: App) {
    // 全局配置
    app.config.globalProperties.$baseUrl = baseUrl;
    app.config.globalProperties.$minioUrl = minioUrl;
    
    // 全局方法
    app.config.globalProperties.$http = http.request;
    app.config.globalProperties.$upload = http.upload;
    app.config.globalProperties.$download = http.download;
    app.config.globalProperties.$isAuth = auth.isAuth;
    app.config.globalProperties.$getPdf = getPdf;
  }
};