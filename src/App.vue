<template>
  <qrcode-scanner @scaned="handleScaned" />
</template>

<script lang="ts" setup>
function handleScaned(value: string) {
  console.log('扫描内容：', value)
  // alert('扫描内容：' + value)
}
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}
</style>
