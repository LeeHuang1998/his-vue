import { createRouter, createWebHistory } from 'vue-router';
import { cookieUtil } from '../utils/CookieUtil';

import type { RouteRecordRaw } from 'vue-router';

const history = createWebHistory();                 // 创建 history 模式的路由实例

const routes: Array<RouteRecordRaw> = [             // 定义路由数组
    // 首页
    {
        path: '/front',                                                 // 前端首页路由 url 地址
        name: 'Front',                                                  // 路由名称，可以与 url 地址不相同
        component: () => import('../views/front/main.vue'),             // 路由组件
        children: [
            // 首页
            {
                path: 'index',
                name: 'FrontIndex',
                component: () => import('../views/front/index.vue')
            },
            // 套餐详情购买页
            {
                path: 'goods/:id(\\d+)',                  // goods/:id
                name: 'FrontGoods',
                component: () => import('../views/front/goods.vue')
            },
            // 商品列表页
            {
                path: 'goodsList',
                name: 'FrontGoodsList',
                component: () => import('../views/front/goods_list.vue')
            },
            // 订单数据页
            {
                path: 'orderDetails/:outTradeNo?',
                name: 'FrontOrderDetails',
                component: () => import('../views/front/order.vue')
            },
            // 个人中心页面
            {
                path: 'customer',
                name: 'FrontCustomer',
                component: () => import('../views/front/customer.vue'),
                children: [
                    // 个人信息
                    {
                        path: 'mine',
                        name: 'FrontMine',
                        component: () => import('../views/front/mine.vue')
                    },
                    // 订单列表
                    {
                        path: 'order',
                        name: 'FrontOrderList',
                        component: () => import('../views/front/order_list.vue')
                    },
                    // 客服 im
                    {
                        path: 'customer_im',
                        name: 'FrontCustomerIm',
                        component: () => import('../views/front/customer_im.vue')
                    },
                    // 预约列表
                    {
                        path: 'appointment_list',
                        name: 'FrontAppointmentList',
                        component: () => import('../views/front/appointment_list.vue')
                    }
                ]
            },
            {
                path: 'goods_snapshot/:id/:mode',
                name: 'FrontGoodsSnapshot',
                component: () => import('../views/front/goods_snapshot.vue')
            }
        ]
    },
    // mis 主页面
    {
        path: '/mis',
        name: 'MisMain',
        component: () => import('../views/mis/main.vue'),
        children: [
            {
                path: '/home',
                name: 'MisHome',
                component: () => import('../views/mis/home.vue'),
                meta: {
                    title: '首页'
                }
            },
            {
                path: '/dept',
                name: 'MisDept',
                component: () => import('../views/mis/dept.vue'),
                meta: {
                    title: '部门管理',
                    isTab: true
                }
            },
            {
                path: '/role',
                name: 'MisRole',
                component: () => import('../views/mis/role.vue'),
                meta: {
                    title: '角色管理',
                    isTab: true
                }
            },
            {
                path: '/user',
                name: 'MisUser',
                component: () => import('../views/mis/user.vue'),
                meta: {
                    title: '用户管理',
                    isTab: true
                }
            },
            {
                path: '/goods',
                name: 'MisGoods',
                component: () => import('../views/mis/goods.vue'),
                meta: {
                    title: '体检套餐管理',
                    isTab: true
                }
            },
            {
                path: '/banner',
                name: 'MisBanner',
                component: () => import('../views/mis/banner.vue'),
                meta: {
                    title: '首页轮播图管理',
                    isTab: true
                }
            },
            {
                path: 'order',
                name: 'MisOrder',
                component: () => import('../views/mis/order.vue'),
                meta: {
                    title: '订单管理',
                    isTab: true
                }
            },
            {
                path: 'rule',
                name: 'MisRule',
                component: () => import('../views/mis/rule.vue'),
                meta: {
                    title: '促销规则',
                    isTab: true
                }
            },
            {
                path: '/customer_im',
                name: 'MisCustomerIM',
                component: () => import('../views/mis/customer_im.vue'),
                meta: {
                    title: '客服IM',
                    isTab: true
                }
            },
            {
                path: 'appointment',
                name: 'MisAppointment',
                component: () => import('../views/mis/appointment.vue'),
                meta: {
                    title: '体检预约',
                    isTab: true
                }
            },
            {
                path: 'customer_checkin',
                name: 'MisCustomerCheckin',
                component: () => import('../views/mis/customer_checkin.vue'),
                meta: {
                    title: '体检签到',
                    isTab: true
                }
            },
            {
                path: 'checkup',
                name: 'MisDoctorCheckup',
                component: () => import('../views/mis/doctor_checkup.vue'),
                meta: {
                    title: '医生检查',
                    isTab: true
                }
            },
            {
                path: 'flow_regulation',
                name: 'MisFlowRegulation',
                component: () => import('../views/mis/flow_regulation.vue'),
                meta: {
                    title: '人员限流',
                    isTab: true
                }
            },
        ]
    },
    // mis 登录页
    {
        path: '/mis/login',
        name: 'MisLogin',
        component: () => import('../views/mis/login.vue')
    },
    // 404 页面
    {
        path: '/404',
        name: '404',
        component: () => import('../views/404.vue')
    },
    {
        path: '/:pathMatch(.*)*',                                       // 匹配所有未定义的路由，重定向到 404 页面
        redirect: '/404'
    }
];

const router = createRouter({                                           // 创建路由实例
    history,
    routes,
    scrollBehavior(to, from, savedPosition) {                           // 页面跳转后的滚动行为
        // 若是浏览器 前进或后退 操作，保持原有滚动位置
        if (savedPosition) {
            if (to.name === 'FrontIndex') {
                return { left: 0, top: 0 }
            }
        } else {
            // 否则每次进入新页面都滚动到顶部
            return { top: 0 };
        }
    }
});

// 配置登陆拦截，在路由跳转之前进行判断
/*
    to: Route 对象，即要进入的目标路由对象
    from: Route 对象，即当前导航正要离开的路由
    next: Function，执行完守卫逻辑后，必须调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
*/
router.beforeEach((to, from, next) => {
    // 从本地缓存中获取用户信息，判断用户是否登录以及当前登录用户所拥有的权限
    const permissions = cookieUtil.getBackendUser()?.permissions;
    const backendUserToken = cookieUtil.getBackendUser()?.token;
    const FrontendUserToken = cookieUtil.getFrontendUser()?.token;

    // to.fullpath: 获取当前要进入的路由地址
    let fullpath = to.fullPath;
    // mis 端登录的角色有多种，需要进行登陆检查和权限检查，若不符合则跳转到登录页
    if (fullpath.startsWith('/mis') && fullpath != '/mis/login') {
        if (permissions == null || permissions.length == 0 || backendUserToken == null || backendUserToken == '') {
            next({ name: 'MisLogin' });
            // next()
        } else {
            next();

        }
    } else if (fullpath.startsWith('/front/customer') || fullpath.startsWith('/front/goods_snapshot')) {
        // 判断当前进入的页面为用户页面或获取用户快照页面，该页面为客户页面，登录的用户角色相同，只需要判断用户是否登录即可
        if (FrontendUserToken == null || FrontendUserToken == '') {
            next({ name: 'FrontIndex' });
        } else {
            next()
        }
    } else {
        next();
    }
})

export default router;
