<template>
  <qrcode-scanner
    @scaned="handleScaned"
    v-model:videoListIndex="videoListIndex"
    @update:videoListIndex="updateVIndex"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const videoListIndex = ref<number>(1) // 设备列表索引  默认1 后置摄像头（在一些机型上1为前置)
const updateVIndex = (e: number): void => {
  videoListIndex.value = e
  console.log('videoListIndex', videoListIndex.value)
}

function handleScaned(value: string) {
  console.log('扫描内容：', value)
  alert('扫描内容：' + value)
}
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}
</style>
