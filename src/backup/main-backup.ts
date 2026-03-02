import { createApp } from 'vue';
import App from './App.vue';

// 创建一个 Vue 应用
const app = createApp(App);

// 导入路由配置
import router from './router';
app.use(router);                                            // 把路由配置整合到 Vue 应用中

import 'element-plus/dist/index.css';                       // 引用 ElementPlus 的 CSS 文件
import ElementPlus from 'element-plus';                     // 导入 ElementUI 组件库

// 导入 svg 依赖库
import 'virtual:svg-icons-register';

// 让日历控件每周从星期一开始，所以要导入简体中文场景
import locale from 'element-plus/es/locale/lang/zh-CN';

// 导入 Jquery
import $ from 'jquery';

// 导入 ElementUI 消息通知组件
import { ElMessage } from 'element-plus';


// 后端项目 url 地址，并声明为全局变量
let baseUrl = 'https://localhost:7700/his-api'
app.config.globalProperties.$baseUrl = baseUrl;        // 后端项目 url 地址全局变量，名称为 $baseUrl

// Minio 对象存储服务地址，并声明为全局变量
let minioUrl = 'http://localhost:9000/his'
app.config.globalProperties.$minioUrl = minioUrl;     // Minio 对象存储服务地址全局变量，名称为 $minioUrl

// 封装全局 ajax 公共函数
app.config.globalProperties.$http = function (url: string, method: string, data: JSON, async: boolean, func: Function) {

    // 根据 URL 前缀获取对应的 token，判断用户是否登录，若发送请求时没有携带 token，则后端会返回 401 错误，表示用户未登录
    let token = null;
    
    if (url.startsWith('/front/')) {
        // 前台请求
        const frontendUser = cookieUtil.getFrontendUser();
        token = frontendUser?.token || null;
    } else if (url.startsWith('/mis/')) {
        // 后台请求
        const backendUser = cookieUtil.getBackendUser();
        token = backendUser?.token || null;
    }

    // 设置请求头
    const headers: any = {};
    if (token) {
        headers.token = token;
    }

    $.ajax({
        url: baseUrl + url,
        dataType: 'json',                                       // json 表示返回的数据类型为 json
        contentType: 'application/json',                        // application/json 表示发送的数据类型为 json，后端接口接受的数据为 JSON 格式
        data: JSON.stringify(data),                             // 将传入的参数序列化
        type: method,                                           // 请求方式
        async: async,                                           // 是否异步
        traditional: true,                                      // 表示上传的数据已经过序列化，若为 true，则上传的数据中可以包含数组，若为 false，则后端无法接收到数组类型的数据
        xhrFields: { withCredentials: true },                   // 允许 ajax 请求跨域，携带 cookie
        headers: headers,
        success: function (resp: any) {
            // resp 的返回状态码为 200，表示请求成功，并继续执行传入的函数
            if (resp.code == 200) {
                func(resp);
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1200,             // 消息显示时间，单位为毫秒
                });
            }
        },
        // 返回的状态码为 401、500 或 ajax 请求失败，则显示错误消息
        error: function (e: any) {
            // ajax 请求错误
            if (e.status == undefined) {
                ElMessage.error({
                    message: '前端页面发送请求错误',
                    duration: 1200,
                })
            }
            else {
                // 后端返回错误
                let status = e.status;
                if (status == 401) {
                    ElMessage.error({
                        message: '用户未登录',
                        duration: 1200,
                    })
                    // 跳转到对应页面
                    if (url.startsWith('/front/')) {
                        router.push({
                            name: 'FrontIndex'
                        });
                    } else {
                        router.push({
                            name: 'MisLogin'
                        });
                    }
                } else {
                    if (!e.hasOwnProperty('responseText')) {
                        ElMessage.error({
                            message: '后端项目未启动，或 HTTP 请求提交的数据错误',
                            duration: 1200,
                        })
                    } else {
                        ElMessage.error({
                            message: e.responseText,
                            duration: 1200,
                        })
                    }
                }
            }
        }
    });
}

// 封装全局公共函数 isAuth，判断用户是否具有指定的权限进入页面，参数为指定的权限
app.config.globalProperties.$isAuth = function (permission: string[]) {
    // 从本地缓存中获取数据，若用户未登录，则 permissions 为 null
    const permissions: string[] | null = cookieUtil.getBackendUser()?.permissions || null;
    if (permissions) {
        let flag = false;
        // 判断当前本地权限数组 permissions 中是否包含有传入参数 permission 中的权限，若存在则直接返回 true 表示登录用户拥有指定的权限，否则返回 false
        for (let one of permission) {
            if (permissions.includes(one)) {
                flag = true;
                break;
            }
        }
        return flag;
    } else {
        return false;
    }
}

// 全局上传文件函数，用于上传图片
app.config.globalProperties.$upload = function ( url: string, formData: FormData, async: boolean = true, func: Function ) {

    // 根据 URL 前缀智能获取对应的 token，判断用户是否登录，若发送请求时没有携带 token，则后端会返回 401 错误，表示用户未登录
    let token = null;
    
    if (url.startsWith('/front/')) {
        // 前台请求
        const frontendUser = cookieUtil.getFrontendUser();
        token = frontendUser?.token || null;
    } else if (url.startsWith('/mis/')) {
        // 后台请求
        const backendUser = cookieUtil.getBackendUser();
        token = backendUser?.token || null;
    }

    // 设置请求头
    const headers: any = {};
    if (token) {
        headers.token = token;
    }

    $.ajax({
        url: baseUrl + url,
        type: 'POST',
        data: formData,                                     // 上传的文件数据
        async: async,
        // 默认情况下 jQuery 会自动设置 Content-Type 为 application/x-www-form-urlencoded，
        // 设置为 false 会阻止 jQuery 设置任何 Content-Type 头，让浏览器根据 FormData 内容自动设置，
        // 对于文件上传，需要让浏览器自动设置正确的 Content-Type，通常是 multipart/form-data 并带有正确的边界(boundary)
        contentType: false,
        // 控制是否对发送的数据进行处理。默认情况下，jQuery 会将数据对象转换为查询字符串（如 key1=value1&key2=value2），设置为 false 会阻止 jQuery 处理数据，保持 FormData 的原始格式                
        processData: false,
        // 设置 XMLHttpRequest 对象的属性。withCredentials: true 表示跨域请求时应该携带凭据（如 cookies、HTTP认证等）
        xhrFields: { withCredentials: true },
        headers: headers,
        success: function (resp: any) {
            if (resp.code == 200) {
                func(resp);
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1200,
                });
            }
        },
        error: function (e: any) {
            if (e.status == undefined) {
                ElMessage.error({
                    message: '文件上传失败',
                    duration: 1200,
                });
            } else {
                let status = e.status;
                if (status == 401) {
                    ElMessage.error({
                        message: '用户未登录',
                        duration: 1200,
                    });
                    if (url.startsWith('/front/')) {
                        router.push({
                            name: 'FrontIndex'
                        });
                    } else {
                        router.push({
                            name: 'MisLogin'
                        });
                    }
                } else {
                    ElMessage.error({
                        message: e.responseText || '文件上传失败',
                        duration: 1200,
                    });
                }
            }
        }
    });
};


// 把 ElementUI 组件库整合到 VUE 框架上
app.use(ElementPlus, {
    locale
});

// 使用 ElementPlus 自带的图标库
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { dataType } from 'element-plus/es/components/table-v2/src/common.mjs';
import { lo } from 'element-plus/es/locales.mjs';
import { cookieUtil } from './utils/CookieUtil';

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.mount('#app');
