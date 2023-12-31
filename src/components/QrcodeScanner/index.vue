<template>
  <div class="relative h-100vh overflow-hidden">
    <!-- 主体 -->
    <video
      id="qrcode-scanner"
      class="h-full absolute left-1/2 -translate-x-1/2"
    ></video>
    <!-- 扫描框 -->
    <div class="scan-box h-400 w-310 rounded-20 absolute-center">
      <!-- 扫描框四个角 -->
      <div
        class="relative h-full w-full"
        :class="{
          'color-white': !qrcodeText,
          'color-blue': qrcodeText
        }"
      >
        <svg-icon
          class="absolute left-16 top-16 h-42 w-42"
          name="scan-top-left"
        />
        <svg-icon
          class="absolute right-16 top-16 h-42 w-42"
          name="scan-top-right"
        />
        <svg-icon
          class="absolute bottom-16 left-16 h-42 w-42"
          name="scan-bottom-left"
        />
        <svg-icon
          class="absolute bottom-16 right-16 h-42 w-42"
          name="scan-bottom-right"
        />
      </div>
      <!-- 扫描动画 -->
      <div
        v-if="!loading && !errorText && !qrcodeText"
        class="absolute top-0 h-full w-full overflow-hidden rounded-20"
      >
        <div class="scanning absolute inset-x-0 inset-y-0 z-2 h-126"></div>
      </div>
      <!-- loading加载 -->
      <div v-if="loading" class="absolute-center">加载中...</div>
      <!-- 异常信息 -->
      <div v-if="errorText" class="absolute-center">{{ errorText }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BrowserMultiFormatReader } from '@zxing/library'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{
  (e: 'scaned', value: string): void
}>()

const render = new BrowserMultiFormatReader()
const loading = ref(false) // Loading
const errorText = ref('') // 错误信息
const qrcodeText = ref('') // 扫描到的内容
const deviceId = ref('') // 使用的设备ID

onMounted(() => {
  openScan()
})

onBeforeUnmount(() => {
  render.reset()
})

function openScan() {
  loading.value = true
  // 初始化
  render
    .listVideoInputDevices()
    .then((videoInputDevices) => {
      if (videoInputDevices.length) {
        // 0 前置摄像头  1 后置摄像头
        // 默认获取第一个摄像头设备id
        deviceId.value = videoInputDevices[0]?.deviceId
        if (videoInputDevices.length > 1) {
          deviceId.value = videoInputDevices[1]?.deviceId
        }
        decodeFromInputVideo()
      } else {
        // 未检测到摄像头
        loading.value = false
        errorText.value = '未检测到摄像头'
      }
    })
    .catch((err) => {
      handleError(err)
    })
}

function decodeFromInputVideo() {
  render
    .decodeFromVideoDevice(deviceId.value, 'qrcode-scanner', (result) => {
      if (result) {
        const resultText = result.getText()
        render.stopContinuousDecode()
        qrcodeText.value = resultText
        emit('scaned', qrcodeText.value)
      }
      if (loading.value) loading.value = false
    })
    .catch((err) => {
      handleError(err)
    })
}

function handleError(err: any) {
  loading.value = false
  if (err.message === 'Permission denied') {
    errorText.value = '授权失败'
  } else {
    errorText.value = '初始化异常请重试'
  }
}

defineExpose({
  render
})
</script>

<style lang="less">
.scan-box {
  box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 5000px;
}
.scanning {
  background: linear-gradient(
    rgba(255, 255, 255, 0),
    80%,
    rgba(96, 165, 250, 0.8)
  );
  animation: move 2s linear infinite;
  -webkit-animation: move 2s linear infinite;
}

@keyframes move {
  0% {
    transform: translateY(-126px);
  }
  100% {
    transform: translateY(400px);
  }
}
</style>
