<!-- 自定义组件，用于在其他前端页面中引入 svg 图片 -->
<template>
    <svg aria-hidden="true"><use :xlink:href="symbolId" /></svg>
</template>

<script>
import { defineComponent, computed } from 'vue';

// 按照官方要求配置
export default defineComponent({
    name: 'SvgIcon',
    props: {
        prefix: {
            type: String,
            default: 'icon'                 //引用 SVG 文件时省去文件名的 icon 前缀
        },
        name: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const symbolId = computed(() => `#${props.prefix}-${props.name}`);
        return { symbolId };
    }
});
</script>
