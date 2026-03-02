/// <reference types="vite/client" />

// 项目文件类型声明
declare module '*.vue' {
    import { defineComponent } from 'vue'
    const Component: ReturnType<typeof defineComponent>
    export default Component
}

