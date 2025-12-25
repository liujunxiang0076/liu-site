import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // 属性基础测试配置
    testTimeout: 15000, // 15秒超时，适合属性测试
    hookTimeout: 15000,
    // 并发配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    },
    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.property.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    // 全局变量
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './.vitepress/theme'),
      '~': path.resolve(__dirname, './'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
})
