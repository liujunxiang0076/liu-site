import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generators, testHelpers, propertyTestConfig } from './utils'

describe('Test Framework Configuration Verification', () => {
  it('should have fast-check properly configured', () => {
    expect(fc).toBeDefined()
    expect(typeof fc.assert).toBe('function')
    expect(typeof fc.property).toBe('function')
  })

  it('should have property test config available', () => {
    expect(propertyTestConfig).toBeDefined()
    expect(propertyTestConfig.numRuns).toBe(100)
    expect(propertyTestConfig.timeout).toBe(10000)
  })

  it('should have generators working', () => {
    const urlGen = generators.url()
    const blogConfigGen = generators.blogConfig()
    
    expect(urlGen).toBeDefined()
    expect(blogConfigGen).toBeDefined()
    
    // Test that generators produce valid data
    fc.assert(
      fc.property(urlGen, (url) => {
        expect(typeof url).toBe('string')
        expect(url.length).toBeGreaterThan(0)
      }),
      { numRuns: 10 }
    )
  })

  it('should have test helpers available', () => {
    expect(testHelpers).toBeDefined()
    expect(typeof testHelpers.createMockResponse).toBe('function')
    expect(typeof testHelpers.createMockBlogConfig).toBe('function')
    
    // Test mock creation
    const mockConfig = testHelpers.createMockBlogConfig()
    expect(mockConfig.siteMeta).toBeDefined()
    expect(mockConfig.siteMeta.title).toBe('Test Blog')
  })

  it('should have mocked browser APIs available', () => {
    expect(global.fetch).toBeDefined()
    expect(window.localStorage).toBeDefined()
    expect(window.indexedDB).toBeDefined()
    expect(global.ResizeObserver).toBeDefined()
    expect(global.IntersectionObserver).toBeDefined()
  })

  it('should support property-based testing with custom config', () => {
    let testRuns = 0
    
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (num) => {
          testRuns++
          expect(num).toBeGreaterThan(0)
          expect(num).toBeLessThanOrEqual(100)
        }
      ),
      { numRuns: 20 }
    )
    
    expect(testRuns).toBe(20)
  })
})
