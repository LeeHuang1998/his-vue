<template>
    <button ref="backToTopBtn" class="back-to-top" :class="{ show: isVisible }" @click="scrollToTop" title="返回顶部">
        ↑
    </button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 获取按钮元素，设置初始状态为不可见
const backToTopBtn = ref(null);
const isVisible = ref(false);

// 滚动监听回调
function handleScroll() {
    // 如果页面垂直滚动距离（window.pageYOffset）大于300像素，就将 isVisible 设为true，否则为 false
    isVisible.value = window.pageYOffset > 300
}

// 回到顶部
const scrollToTop = () => {
    // 使用 window.scrollTo 方法滚动到页面顶部，设置 behavior 为 'smooth' 使滚动过程平滑
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })

}

// 组件加载完成后，使用事件监听器监听滚动事件，滚动时触发 handleScroll 函数
onMounted(() => window.addEventListener('scroll', handleScroll))
// 组件销毁前，手动移除监听，防止组件卸载后仍然执行事件处理函数，组件被反复创建/销毁时造成 内存泄漏 或 多次绑定。
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))



</script>

<style scoped>
.back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    background: linear-gradient(45deg, #3498db, #2ecc71);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
    z-index: 1000;
    border: none;
    font-size: 24px;
}

.back-to-top.show {
    opacity: 1;
    visibility: visible;
}

.back-to-top:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    background: linear-gradient(45deg, #2980b9, #27ae60);
}
</style>