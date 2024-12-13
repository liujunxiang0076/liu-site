---
title: vue3学习
tags: [笔记]
categories: [技术分享]
date: 2024-12-06
description: 这个一篇个人学习vue3的笔记
articleGPT: 这是一篇初始化文章，旨在告诉用户一些使用说明和须知。
cover: https://imgbed.liujunxiang0076.site/file/1733710364573_vue-logo_600x370.webp
references:
  - title: 
    url: 
---

## 配置

### 必要依赖

#### sass

```bash
pnpm add -D sass-embedded
```

#### vue-router

```bash
pnpm add vue-router
```





## 一、使用'@'别名指向路径

1. **安装`@types/node`**

`npm`：

```bash
npm install @types/node -D
```

`pnpm`：

```bash
pnpm add @types/node -D
```

`yarn`：

```bash
yarn add @types/node --dev
```

2. **配置`vite.config.js`**

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 配置 @ 指向 src 目录
    },
  },
});
```

使用：

```javascript
import MyComponent from '@/components/MyComponent.vue';
```
3. **配置`tsconfig.json`或`jsconfig.json`**

```javascript
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
    "@/*": ["src/*"]
    }
  }
}
```


## 二、插件

### ①.unplugin-vue-components

<u>官方文档</u>：[unplugin-vue-components | Unplugin](https://unplugin.unjs.io/showcase/unplugin-vue-components.html)

1. 安装
`npm`:

```bash
npm install unplugin-vue-components -D
```

`pnpm`:

```bash
pnpm add unplugin-vue-components -D
```

`yarn`:

```bash
yarn add unplugin-vue-components --dev
```

2. 配置
```javascript
import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
   
export default defineConfig({
  plugins: [
    Components({
      // 指定组件位置，默认是src/components
      dirs: ['src/components'],
      // 配置文件生成位置
      dts: 'src/components.d.ts'
    })
  ]
});
```

### ②.unplugin-auto-import

官方文档：[unplugin-auto-import | Unplugin](https://unplugin.unjs.io/showcase/unplugin-auto-import.html)

1. 安装
npm：

```bash
npm i -D unplugin-auto-import
```

pnpm：
```bash
pnpm i -D unplugin-auto-import
```

2. 配置
   在你的Vite配置文件（`vite.config.js`或`vite.config.ts`）中，导入并配置`unplugin-auto-import`插件。

```javascript
import AutoImport from 'unplugin-auto-import/vite';
   
export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        'vue', // 包含Vue的自动导入
        // 其他需要自动导入的库或框架
      ],
    //dts: true, // 如果使用TypeScript，设置为true以生成类型声明文件
    dts: 'src/auto-imports.d.ts'
    }),
  ],
});
```

   




## defineProps 父传子

- 父 ——App.vue
```vue
<template>
  <person :list="personList" />
</template>
  
<script lany="ts" setup name="App">
  import Person from './components/Person.vue'
  import {reactive} from 'vue'
  import {type Persons}from '@/types'
      
  let personList=reactive<Persons>([
    {id:'1',name:'zhangsan',age:1},
    {id:'2',name:'lisi',age:2},
  ])
      
</script>
```

  

- 子——Person.vue
```vue
<template>
  <ul>
    <li v-for='(item,index) in list' :key='item.id'>
      {{item.name}} —— {{item.age}}
    </li>
  </ul>
</template>
  
<script lang="ts" setup name="Person">
import {withDefaults}from 'vue'
import {type Persons} from '@/types'
      
  //只接受list
  //defineProps(['list'])
      
  //接收list + 限制类型
  //defineProps<{list:Persons}>()
      
  //接受list + 限制类型 + 限制必要性
  //defineProps<{list?:Persons}>()
      
  //接受list + 限制类型 + 限制必要性 + 指定默认值
  withDefaults(defineProps<{list?:Persons}>(),{
    list:()=>[{id:'99',name:'wangwu',age:'99'}]
  })
</script>
```

  

## 生命周期

> 想象一下，我们正在制作和播放一部电影。这部电影的制作和播放过程，其实就很像 Vue 3 中组件的生命周期。

**编写剧本（setup）**： 在电影开拍之前，编剧需要写好剧本，决定故事的情节和角色的对话。这就像是 Vue 3 中的 `setup` 函数，在这里，你会定义你的组件需要的数据（就像故事情节）和方法（就像角色的行动）。

```javascript
// 这就像编剧在编写剧本
const protagonist = 'Vue Hero';
const antagonist = 'Bug Monster';

function introduceCharacter(character) {
  console.log(`${character} makes an appearance!`);
}
```

**搭建场景（onBeforeMount）**： 剧本写好后，工作人员开始搭建拍摄场景，准备摄影机和灯光，但摄像机还没开始滚动。这就像是 `onBeforeMount` 钩子，Vue 正在准备把你的组件放到屏幕上，但观众还没看到它。

```javascript
console.log('场景搭建完毕，摄影机和灯光准备就绪');
```

**开拍（onMounted）**： 一切准备就绪，导演喊“开拍”，演员开始表演。这就像是 `onMounted` 钩子，你的组件现在已经完全显示在观众的屏幕上了。

```javascript
console.log('摄像机开始滚动，电影正在拍摄');
```

**电影杀青（onUnmounted）**： 电影拍摄完成后，场景需要被拆除，道具和设备需要被清理。这就像是 `onUnmounted` 钩子，当组件不再显示时，Vue 会做一些清理工作，比如取消不再需要的订阅或者清除定时器。

```javascript
console.log('电影拍摄结束，场景正在拆除');
```



### 1.创建

- `setup()`：这是组合式 API 中的新生命周期函数，它在组件实例创建之前被调用，用于初始化响应式数据和方法。在`setup()`中无法访问`this`，因为它在组件实例初始化之前执行。

```javascript
import { ref, onBeforeMount } from 'vue';

export default {
  //setup() 是组合式 API 的入口，在组件实例创建之前执行。它是响应式数据和方法初始化的地方。
  setup() {
    const count = ref(0);

    // 在这里可以访问 count，但不能使用 this
    console.log(count.value); // 0

    // 定义一个方法，用于增加计数
    function increment() {
      count.value++;
    }

    // 将需要在模板中使用的响应式数据和方法返回
    return {
      count,
      increment
    };
  }
};
```



### 2.挂载

- `onBeforeMount()`：在组件挂载之前调用，此时模板已经编译成渲染函数，但尚未挂载到DOM。

```javascript
import { onBeforeMount } from 'vue';

export default {
  setup() {
    //在组件挂载之前调用，此时组件模板已经渲染，但还没有插入 DOM。
    onBeforeMount(() => {
      console.log('组件即将挂载到 DOM');
    });

    // ...
  }
};
```

  

- `onMounted()`：在组件挂载之后调用，此时组件已经渲染到DOM中，可以执行DOM相关的操作。

```javascript
import { onMounted } from 'vue';

export default {
  setup() {
    //在组件挂载之后调用，此时组件已经插入 DOM。
    onMounted(() => {
      console.log('组件已经挂载到 DOM');
    });

    // ...
  }
};
```

  

### 3.更新

- `onBeforeUpdate()`：在组件即将因为响应式数据变化而重新渲染前调用，可以访问当前的DOM状态。

```javascript
import { onBeforeUpdate } from 'vue';
  
export default {
  setup() {
    //在组件更新之前调用，此时响应式数据已经变化，但组件还没有重新渲染。
    onBeforeUpdate(() => {
      console.log('组件数据即将更新');
    });
  
    // ...
  }
};
```

  

- `onUpdated()`：在组件因为响应式数据变化而重新渲染后调用，可以执行更新后的副作用操作。

```javascript
import { onUpdated } from 'vue';
  
export default {
  setup() {
    //在组件更新之后调用，此时组件已经重新渲染。
    onUpdated(() => {
      console.log('组件数据已经更新');
    });
  
    // ...
  }
};
```

  

### 4.卸载

- `onBeforeUnmount()`：在组件即将被卸载前调用，可以执行清理操作，如取消事件监听器、清除定时器等。

```javascript
import { onBeforeUnmount } from 'vue';
  
  export default {
    setup() {
    //在组件卸载之前调用，此时组件还在页面上，但即将被移除。
      onBeforeUnmount(() => {
        console.log('组件即将被卸载');
      });
  
    // ...
  }
};
```

  

- `onUnmounted()`：在组件已卸载后调用，此时组件的所有指令都已解绑，所有事件监听器都已被移除，所有的子实例也都被销毁。

```javascript
import { onUnmounted } from 'vue';

export default {
  setup() {
    //在组件卸载之后调用，此时组件已经从页面上移除。
    onUnmounted(() => {
      console.log('组件已经被卸载');
    });

    // ...
  }
};
```

vue2与vue3的生命周期区别

|     Vue 2     |       Vue 3       |                             备注                             |
| :-----------: | :---------------: | :----------------------------------------------------------: |
| beforeCreate  |       setup       | Vue 3 中的 `setup` 函数相当于 Vue 2 的 `beforeCreate` 和 `created` 钩子的组合。 |
|    created    |       setup       |       在 `setup` 函数中进行响应式数据和方法的初始化。        |
|  beforeMount  |   onBeforeMount   |                      钩子名称有所变化。                      |
|    mounted    |     onMounted     |                      钩子名称有所变化。                      |
| beforeUpdate  |  onBeforeUpdate   |                      钩子名称有所变化。                      |
|    updated    |     onUpdated     |                      钩子名称有所变化。                      |
| beforeDestroy |  onBeforeUnmount  |                      钩子名称有所变化。                      |
|   destroyed   |    onUnmounted    |                      钩子名称有所变化。                      |
|       -       |    onActivated    |         Vue 3 新增，用于 `<keep-alive>` 缓存的组件。         |
|       -       |   onDeactivated   |         Vue 3 新增，用于 `<keep-alive>` 缓存的组件。         |
|       -       |  onErrorCaptured  |                  Vue 3 新增，用于错误边界。                  |
|       -       |  onRenderTracked  |                  Vue 3 新增，用于性能分析。                  |
|       -       | onRenderTriggered |                  Vue 3 新增，用于性能分析。                  |

## 路由

1. 安装`vue-router`
`pnpm`：

```bash
pnpm add vue-router
```

   其他方式安装

2. 创建路由和路由配置
   创建一个路由配置文件，通常是 `router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  // 其他路由...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

3. 在 Vue 应用中使用路由
   在你的 Vue 应用的入口文件（通常是 `main.js` 或 `main.ts`）中，导入并使用路由：

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);

app.mount('#app');
```

4. 在组件中使用路由
   **使用 `<router-link>` 创建导航链接**
   在 Vue 组件的模板中，使用 `<router-link>` 来创建导航链接：

```vue
<template>
  <div>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
</template>
```

   **使用 `useRouter` 和 `useRoute`**
   在 Vue 组件中，你可以使用 `useRouter` 和 `useRoute` 来访问路由实例和当前路由：
```javascript
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    // 使用 router 进行导航
    function goBack() {
      router.back();
    }

    // 访问当前路由信息
    console.log(route.params);

    return {
      goBack,
    };
  },
};
```

5. 路由守卫
   `vue-router` 允许你定义路由守卫，这些守卫可以在路由变化之前或之后执行逻辑：

```javascript
router.beforeEach((to, from, next) => {
  // 检查用户是否登录
  if (to.name !== 'Login' && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});
```

6. 懒加载路由
   为了优化性能，你可以使用动态导入来懒加载路由对应的组件：

```javascript
const routes = [
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
  // 其他路由...
];
```

