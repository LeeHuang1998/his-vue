import { Client, type IMessage } from '@stomp/stompjs';             // 前端 STOMP 客户端库
import SockJS from 'sockjs-client/dist/sockjs';                     // WebSocket 降级兼容库
import { ref, onUnmounted } from 'vue';

import { wsUrl } from '../config/index';

/**
 * WebSocket：是一种全双工通信协议，建立在 TCP 连接之上，允许服务器和客户端之间进行实时、双向的数据传输。
 * WebSocket 的局限性：
 *      1. 没有消息结构，只能传输纯文本或二进制，没有消息头、消息类型等概念
 *      2. 没有订阅机制，无法指定"我只想接收某类消息"
 *      3. 没有路由机制，无法根据目的地分发消息
 *      4. 没有心跳机制，需要自己实现检测连接是否存活
 *      5. 没有重连机制，断线后需要自己实现重连逻辑
 *      6. 没有认证机制，需要在消息体中手动携带 token
 * STOMP ：是一个面向消息的简单文本协议，定义了消息的格式和通信规则
 * STOMP 消息由三部分组成：命令 + 头部 + 消息体，使用类似路径的格式来标识目的地
 */


export function useWebSocket() {
    // STOMP 客户端
    const client = ref<Client | null>(null);

    // token：用户登录成功后返回的 token，onMessage：收到服务端消息后的回调函数，subscribeDestination：要订阅的主题地址
    const connect = (token: string, onMessage: (msg: IMessage) => void, subscribeDestination: string) => {
        // 校验 token 是否存在，不存在则直接返回，不建立连接
        if (!token) {
            console.error('WebSocket 连接失败: 缺少 Token');
            return;
        }

        // 连接前，先清理可能存在的旧连接，防止同一个主题重复订阅，以及内存泄漏等问题
        if (client.value?.connected) {
            // deactivate()：断开连接，清理重连机制，结束心跳，只有在已连接状态时才调用
            client.value.deactivate();
        }

        // 创建 STOMP 客户端实例
        client.value = new Client({
            webSocketFactory: () => new SockJS(wsUrl),                              // 指定 WebSocket 的创建方式。使用工厂函数，每次创建时返回一个新的 SockJS 实例
            connectHeaders: { Authorization: `Bearer ${token}` },                   // STOMP 连接请求头，携带认证信息。Bearer 是 OAuth 2.0 标准规定的令牌前缀，后端通过 Authorization 头获取 token
            reconnectDelay: 5000,                                                   // 重连间隔，如果连接断开，5 秒后自动重连
            heartbeatIncoming: 10000,                                               // 期望服务端每 10 秒发送一次心跳
            heartbeatOutgoing: 10000,                                               // 客户端每 10 秒向服务端发送一次心跳
            onConnect: () => {                                                      // 连接成功后的回调函数
                console.log('WebSocket 连接成功');
                // 第一个参数：订阅目的地，第二个参数：消息回调函数，第三个参数：订阅请求头（同样携带 token，防止跨域伪造订阅）
                client.value?.subscribe(subscribeDestination, onMessage, {          // 连接成功后，订阅指定主题，并把收到的消息交给调用方传入的 onMessage 处理
                    Authorization: `Bearer ${token}`
                });
            },
            onDisconnect: () => {                                                   // 断开连接后的回调函数
                console.log('WebSocket 已断开');
            },
            onStompError: (frame) => {                                              // STOMP 协议层错误的回调，从帧头中获取错误信息
                console.error('WebSocket 错误:', frame.headers['message']);
            }
        });

        client.value.activate();                                                    // 激活客户端，真正发起连接，开始心跳，前面是在配置客户端，连接建立后会触发 onConnect 回调
    };

    // 主动断开连接方法
    const disconnect = () => {
        if (client.value?.connected) {
            client.value.deactivate();
        }
    };

    // 组件卸载时自动断开
    onUnmounted(() => {
        disconnect();
    });

    return { connect, disconnect };
}
