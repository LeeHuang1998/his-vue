import Cookies from 'js-cookie';

// 定义用户类型
interface FrontendUser {
  username: string;
  token: string;
}

interface BackendUser {
  name: string;
  permissions: string[];
  token: string;
}

class CookieUtil {
  // Cookie 键名常量
  private readonly FRONTEND_USER_KEY = 'frontend_user';
  private readonly BACKEND_USER_KEY = 'backend_user';

  // 默认配置
  private defaultOptions = {
    path: '/',                                        // Cookie 路径
    secure: import.meta.env.PROD,    // 生产环境启用 HTTPS
    sameSite: 'lax' as const,                      // CSRF 防护
  };

  // 🏪 前台用户操作
  setFrontendUser(user: FrontendUser, rememberMe: boolean = false): void {
    const expires = rememberMe ? 30 : 7;                        // 30 天或 7 天
    this.setObject(this.FRONTEND_USER_KEY, user, expires);
  }

  getFrontendUser(): FrontendUser | null {
    return this.getObject<FrontendUser>(this.FRONTEND_USER_KEY);
  }

  removeFrontendUser(): void {
    this.remove(this.FRONTEND_USER_KEY);
  }

  // 🖥️ 后台用户操作
  setBackendUser(user: BackendUser, rememberMe: boolean = false): void {
    const expires = rememberMe ? 15 : 7;                        // 15 天或 7 天
    this.setObject(this.BACKEND_USER_KEY, user, expires);
  }

  getBackendUser(): BackendUser | null {
    return this.getObject<BackendUser>(this.BACKEND_USER_KEY);
  }

  removeBackendUser(): void {
    this.remove(this.BACKEND_USER_KEY);
  }

  // 通用方法，设置对象到 Cookie
  private setObject(key: string, value: any, days: number): void {
    try {
      const options = {                           // 展开默认配置，设置 cookie 的属性，包括路径、安全性和 SameSite 以及过期时间
        ...this.defaultOptions,
        expires: days
      };

      Cookies.set(key, JSON.stringify(value), options);         // 设置 cookie，将对象转换为 JSON 字符串
    } catch (error) {
      console.error(`Cookie设置失败 [${key}]:`, error);
    }
  }

  // 通用方法，从 Cookie 获取对象
  private getObject<T>(key: string): T | null {
    try {
      const data = Cookies.get(key);
      if (!data) return null;                                 // 不存在返回 null

      return JSON.parse(data) as T;                           // 反序列化并类型断言
    } catch (error) {
      console.error(`Cookie解析失败 [${key}]:`, error);
      this.remove(key);                                       // 解析失败时清除损坏的cookie
      return null;
    }
  }

  private remove(key: string): void {
    Cookies.remove(key, { path: this.defaultOptions.path });  // 删除时保持路径一致
  }

  // 🧹 清除所有用户数据
  clearAllUserData(): void {
    this.removeFrontendUser();
    this.removeBackendUser();
  }

  // 🔍 检查用户登录状态
  isFrontendLoggedIn(): boolean {
    return !!this.getFrontendUser();                        // 双重否定转布尔值
  }

  isBackendLoggedIn(): boolean {
    return !!this.getBackendUser();
  }
}

// 创建单例实例
export const cookieUtil = new CookieUtil();