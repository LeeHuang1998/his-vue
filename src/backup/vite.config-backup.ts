import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

//导入 ElementPlus 相关依赖库
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 配置 svg 依赖库
import path from 'path'
import { resolve } from 'path'
import viteSvgIcons, { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        //配置按需自动加载 ElementPlus 控件
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        //引用 ElementPlus 控件库
        Components({
            resolvers: [ElementPlusResolver()]
        }),
        // 引用 svg 图标素材文件插件
        createSvgIconsPlugin({
            // 指定需要缓存的图标文件夹
            iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
            // 指定 symbolId 格式
            symbolId: '[name]'
        })
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')  // 将 @ 映射到 src 目录
        }
    },
    server: {
        host: 'localhost',
        port: 7600,
        cors: true
    }
});

