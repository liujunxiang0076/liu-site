// 导出所有测试工具和生成器
export * from './generators'
export * from './helpers'
export * from './property-config'

// 重新导出常用的fast-check功能
export { default as fc } from 'fast-check'

// 重新导出vitest测试功能
export { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

// 重新导出Vue测试工具
export { mount, shallowMount } from '@vue/test-utils'

// 导出属性测试配置
export { propertyTestConfig } from '../setup'
