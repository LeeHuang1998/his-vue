import { cookieUtil } from '../utils/CookieUtil';

export const auth = {
    isAuth: function (permission: string[]): boolean {
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
}

