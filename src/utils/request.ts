// 导入 Jquery
import $ from 'jquery';

// 导入 ElementUI 消息通知组件
import { ElMessage } from 'element-plus';

import router from '../router/index';
import { cookieUtil } from './CookieUtil';

import { baseUrl } from '../config/index';

// 创建 http 请求对象
export const http = {
  request: function (url: string, method: string, data: any, async: boolean = true, func?: Function) {
    let token = null;

    // 根据请求路径获取 token（前后台的登录用户 token，其中 /front/goods/searchSnapshotForMis 中需要获取后台登录用户的 token，用于后台中获取前台商品页面的快照）
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

    // 创建请求头，token 在请求头中
    const headers: any = {};
    if (token) {
      headers.token = token;
    }

    // 向后端接口发送 ajax 请求
    $.ajax({
      url: baseUrl + url,                             // 请求地址
      dataType: 'json',                               // 数据类型，将后端返回的数据按照 json 格式解析
      contentType: 'application/json',                // 设置请求头为 application/json，发送 json 格式数据到后端接口中
      data: JSON.stringify(data),                     // 将传入的 js 对象数据转为 json
      type: method,                                   // 请求方式
      async: async,                                   // 是否异步请求
      traditional: true,                              // 传参方式
      xhrFields: { withCredentials: true },           // 允许携带 cookie
      headers: headers,                               // 请求头数据
      success: function (resp: any) {
        if (resp.code == 200) {
          if (func) {
            func(resp);                               // 调用传入的函数，将返回结果返回给调用的函数，在页面中自己处理
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
          return;
        }

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
          return;
        }

        if (!e.hasOwnProperty('responseText')) {
          ElMessage.error({
            message: '后端项目未启动，或 HTTP 请求提交的数据错误',
            duration: 1200,
          });
          return;
        }

        // 统一解析后端返回的 JSON 错误结构
        let errorMsg = '请求失败';

        try {
          const result = JSON.parse(e.responseText);
          errorMsg = result.msg || result.error || errorMsg;
        } catch (err) {
          // 如果后端返回的不是 JSON，则回退为原始文本
          errorMsg = e.responseText || errorMsg;
        }
        ElMessage.error({
          message: errorMsg,
          duration: 1200,
        });
      }
    });
  },

  // 文件下载方法
  download: async function (url: string, method: string = 'GET') {
    let token = null;

    if (url.startsWith('/mis/')) {
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

    try {
      const response = await fetch(baseUrl + url, {
        method: method,
        headers: headers,
        credentials: 'include'
      });

      if (response.status === 401) {
        ElMessage.error({
          message: '用户未登录',
          duration: 1200,
        });

        if (url.startsWith('/front/')) {
          router.push({ name: 'FrontIndex' });
        } else {
          router.push({ name: 'MisLogin' });
        }
        return;
      }

      // 2. 非成功响应
      if (!response.ok) {
        let errorMsg = '文件下载失败';

        try {
          const contentType = response.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            const result = await response.json();
            errorMsg = result.msg || errorMsg;
          } else {
            errorMsg = await response.text() || errorMsg;
          }
        } catch (e) {
          // 忽略解析异常，使用默认提示
        }

        ElMessage.error({
          message: errorMsg,
          duration: 1200,
        });
        return;
      }

      // 3. 获取文件名
      const disposition = response.headers.get('Content-Disposition');
      let fileName = '体检报告.pdf';

      if (disposition) {
        const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^"]+)"?/);
        if (match) {
          fileName = decodeURIComponent(match[1] || match[2]);
        }
      }

      // 4. 获取 blob
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // 5. 触发浏览器下载
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 6. 释放 URL
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      ElMessage.error({
        message: '文件下载失败',
        duration: 1200,
      });
    }
  },

  // 文件上传方法
  upload: function (url: string, formData: FormData, async: boolean = true, func?: Function) {
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
          return;
        }

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
          return;
        }

        // 统一解析后端返回的 JSON 错误结构
        let errorMsg = '文件上传失败';

        try {
          const result = JSON.parse(e.responseText);
          errorMsg = result.msg || result.error || errorMsg;
        } catch (err) {
          // 如果不是 JSON，则回退显示原始文本
          errorMsg = e.responseText || errorMsg;
        }

        ElMessage.error({
          message: errorMsg,
          duration: 1200,
        });
      }
    });
  }
};