import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminValidation from '../../.vitepress/theme/components/Admin/AdminValidation.vue'

// Mock VitePress composables
vi.mock('vitepress', () => ({
  useData: () => ({
    theme: {
      value: {
        siteMeta: {
          title: 'Test Blog',
          site: 'https://test.example.com'
        },
        adminBackend: {
          enabled: true,
          url: 'http://localhost:3000',
          allowedOrigins: ['http://localhost:3000', 'https://api.test.com']
        }
      }
    }
  })
}))

describe('AdminValidation', () => {
  const mockValidationState = {
    isValidated: false,
    backendUrl: '',
    blogConfig: null,
    validationError: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders validation form correctly', () => {
    const wrapper = mount(AdminValidation, {
      props: {
        validationState: mockValidationState
      }
    })

    expect(wrapper.find('.validation-container').exists()).toBe(true)
    expect(wrapper.find('.validation-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('博客管理验证')
  })

  it('shows mode selection options', () => {
    const wrapper = mount(AdminValidation, {
      props: {
        validationState: mockValidationState
      }
    })

    const modeOptions = wrapper.findAll('.mode-option')
    expect(modeOptions).toHaveLength(2)
    expect(wrapper.text()).toContain('GitHub 直连模式')
    expect(wrapper.text()).toContain('后端服务模式')
  })

  it('displays allowed backend URLs when available', async () => {
    const wrapper = mount(AdminValidation, {
      props: {
        validationState: mockValidationState
      }
    })

    // Switch to backend mode
    const backendOption = wrapper.findAll('.mode-option')[1]
    await backendOption.trigger('click')
    
    // Wait for component to update
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('允许的后端地址')
    expect(wrapper.text()).toContain('http://localhost:3000')
    expect(wrapper.text()).toContain('https://api.test.com')
  })

  it('emits validate event when form is submitted', async () => {
    const wrapper = mount(AdminValidation, {
      props: {
        validationState: mockValidationState
      }
    })

    // Switch to backend mode and set URL
    const backendOption = wrapper.findAll('.mode-option')[1]
    await backendOption.trigger('click')

    const urlInput = wrapper.find('#backend-url')
    await urlInput.setValue('http://localhost:3000')

    const submitButton = wrapper.find('.btn-primary')
    await submitButton.trigger('click')

    expect(wrapper.emitted('validate')).toBeTruthy()
    expect(wrapper.emitted('validate')?.[0]).toEqual(['http://localhost:3000'])
  })

  it('validates URL format correctly', async () => {
    const wrapper = mount(AdminValidation, {
      props: {
        validationState: mockValidationState
      }
    })

    // Switch to backend mode
    const backendOption = wrapper.findAll('.mode-option')[1]
    await backendOption.trigger('click')

    // Test invalid URL
    const urlInput = wrapper.find('#backend-url')
    await urlInput.setValue('invalid-url')
    await urlInput.trigger('input')

    // Should show error message
    expect(wrapper.text()).toContain('请输入有效的URL地址')

    // Test valid URL
    await urlInput.setValue('https://api.example.com')
    await urlInput.trigger('input')

    // Error should be cleared
    expect(wrapper.text()).not.toContain('请输入有效的URL地址')
  })

  it('shows validation error when provided', () => {
    const errorState = {
      ...mockValidationState,
      validationError: 'Connection failed'
    }

    const wrapper = mount(AdminValidation, {
      props: {
        validationState: errorState
      }
    })

    expect(wrapper.text()).toContain('Connection failed')
    expect(wrapper.find('.error-section').exists()).toBe(true)
  })
})
