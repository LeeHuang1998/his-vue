<template>
  <router-view></router-view>
  <BackToTop></BackToTop>
  
  
</template>

<script setup lang="ts">
import BackToTop from './components/BackToTop.vue';
</script>


<style>
/* 全局生效，覆盖 body */
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: rgb(245, 245, 245);
  /* 这里换成你想要的颜色 */
}
</style>
