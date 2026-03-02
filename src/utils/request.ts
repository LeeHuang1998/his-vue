// 导入 Jquery
import $ from 'jquery';

// 导入 ElementUI 消息通知组件
import { ElMessage } from 'element-plus';

import router from '../router/index';
import { cookieUtil } from './CookieUtil';

import { baseUrl } from '../config/index';

// 保持原有的回调函数方式
export const http = {
  request: function(url: string, method: string, data: any, async: boolean = true, func?: Function) {
    // 原有的 $http 完整逻辑
    let token = null;
    
    if (url.startsWith('/front/goods/searchSnapshotForMis')) {
      const backendUser = cookieUtil.getBackendUser();
      token = backendUser?.token || null;
    } else if (url.startsWith('/mis/')) {
      const backendUser = cookieUtil.getBackendUser();
      token = backendUser?.token || null;
    } else if (url.startsWith('/front/')) {
      const frontendUser = cookieUtil.getFrontendUser();
      token = frontendUser?.token || null;
    }

    const headers: any = {};
    if (token) {
      headers.token = token;
    }

    $.ajax({
      url: baseUrl + url,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      type: method,
      async: async,
      traditional: true,
      xhrFields: { withCredentials: true },
      headers: headers,
      success: function (resp: any) {
        if (resp.code == 200) {
          if (func) {
            func(resp);
          }
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
            message: '前端页面发送请求错误',
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
            if (!e.hasOwnProperty('responseText')) {
              ElMessage.error({
                message: '后端项目未启动，或 HTTP 请求提交的数据错误',
                duration: 1200,
              });
            } else {
              ElMessage.error({
                message: e.responseText,
                duration: 1200,
              });
            }
          }
        }
      }
    });
  },
  
  upload: function(url: string, formData: FormData, async: boolean = true, func?: Function) {
    // 原有的 $upload 完整逻辑
    let token = null;
    
    if (url.startsWith('/front/')) {
      const frontendUser = cookieUtil.getFrontendUser();
      token = frontendUser?.token || null;
    } else if (url.startsWith('/mis/')) {
      const backendUser = cookieUtil.getBackendUser();
      token = backendUser?.token || null;
    }

    const headers: any = {};
    if (token) {
      headers.token = token;
    }

    $.ajax({
      url: baseUrl + url,
      type: 'POST',
      data: formData,
      async: async,
      contentType: false,
      processData: false,
      xhrFields: { withCredentials: true },
      headers: headers,
      success: function (resp: any) {
        if (resp.code == 200) {
          if (func) {
            func(resp);
          }
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
  }
};