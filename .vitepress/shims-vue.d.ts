declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// VitePress specific types
declare module 'vitepress/client' {
  export * from 'vitepress'
}

// Global types for VitePress
declare global {
  const __VP_HASH_MAP__: Record<string, string>
  const __VP_LOCAL_SEARCH__: boolean
  const __ALGOLIA__: boolean
}
