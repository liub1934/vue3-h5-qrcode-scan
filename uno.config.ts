import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno'
import presetRemToPx from '@unocss/preset-rem-to-px'

export default defineConfig({
  presets: [
    presetUno(),
    presetRemToPx({
      baseFontSize: 4
    })
  ],
  shortcuts: {
    // 虚线
    'dash-line': 'border-t border-dashed border-color-gray',
    // 下边框
    'solid-line':
      'border-b border-solid border-color-#333333 border-opacity-10',
    // Flex垂直居中
    'flex-center': 'flex items-center justify-center',
    // Absolute垂直居中
    'absolute-center':
      'absolute! top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'
  }
})
