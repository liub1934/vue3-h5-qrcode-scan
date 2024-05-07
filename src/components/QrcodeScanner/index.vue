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
      <!-- 切换摄像头 -->
      <button type="button" class="button" @click="changeVideoInputDevice">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-arrow-repeat"
          viewBox="0 0 16 16"
        >
          <path
            d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
          ></path>
          <path
            fill-rule="evenodd"
            d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BrowserMultiFormatReader } from '@zxing/library'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  videoListIndex: number
}>()
const emit = defineEmits<{
  (e: 'scaned', value: string): void
  (e: 'update:videoListIndex', value: number): void
}>()

const render = new BrowserMultiFormatReader()
const loading = ref(false) // Loading
const errorText = ref('') // 错误信息
const qrcodeText = ref('') // 扫描到的内容
const deviceId = ref('') // 使用的设备ID
const videoInputDeviceList = ref<MediaDeviceInfo[]>([]) // 设备列表

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
        videoInputDeviceList.value = videoInputDevices
        // 0 前置摄像头  1 后置摄像头
        deviceId.value = videoInputDevices[props.videoListIndex]?.deviceId
        if (!deviceId.value) {
          deviceId.value = videoInputDevices[0]?.deviceId
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

// 切换摄像头
const changeVideoInputDevice = () => {
  if (props.videoListIndex < videoInputDeviceList.value.length - 1) {
    emit('update:videoListIndex', props.videoListIndex + 1)
  } else {
    emit('update:videoListIndex', 0)
  }
  // 初始化
  openScan()
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

.button {
  position: fixed;
  right: 16px;
  bottom: 16px;
  color: white;
  background-color: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  border: none;
}

.button:hover {
  background-color: transparent;
}

.button svg {
  display: inline;
  width: 1.3rem;
  height: 1.3rem;
  margin: 1rem;
  color: white;
}

.button:focus svg {
  animation: rotate 0.5s forwards;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
