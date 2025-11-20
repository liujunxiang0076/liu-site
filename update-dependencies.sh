#!/bin/bash

# liu-site 依赖更新脚本
# 使用方法: ./update-dependencies.sh [stage]
# stage: 1 (安全更新), 2 (中等风险), 3 (高风险), all (全部)

set -e

echo "🚀 liu-site 依赖更新脚本"
echo "=========================="

STAGE=${1:-"help"}

case $STAGE in
  "1"|"safe")
    echo "📦 第一阶段：安全更新 (补丁版本)"
    echo "更新依赖: cheerio, dayjs, fs-extra, prettier, pinia, vitepress, vue-eslint-parser"
    npm update cheerio dayjs fs-extra prettier pinia vitepress vue-eslint-parser
    echo "✅ 安全更新完成"
    ;;
    
  "2"|"medium")
    echo "⚡ 第二阶段：中等风险更新 (次版本)"
    echo "更新依赖: @waline/client, algoliasearch, esbuild, eslint plugins, instantsearch.js, pinia-plugin-persistedstate, sass, terser, undici, vue-instantsearch"
    npm update @waline/client algoliasearch esbuild eslint-plugin-import eslint-plugin-vue instantsearch.js pinia-plugin-persistedstate sass terser undici vue-instantsearch
    echo "✅ 中等风险更新完成"
    ;;
    
  "3"|"risky")
    echo "🔍 第三阶段：高风险更新 (主版本)"
    echo "⚠️  警告：这些更新可能包含 breaking changes，请先备份数据！"
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "更新 @types/node..."
      npm update @types/node
      
      echo "更新 markdown-it-mathjax3..."
      npm update markdown-it-mathjax3
      
      echo "更新 path-to-regexp..."
      npm update path-to-regexp
      
      echo "更新 unplugin-auto-import..."
      npm update unplugin-auto-import
      
      echo "更新 unplugin-vue-components..."
      npm update unplugin-vue-components
      
      echo "更新 vue..."
      npm update vue
      
      echo "更新 vercel..."
      npm update vercel
      
      echo "更新 vitepress-plugin-tabs..."
      npm update vitepress-plugin-tabs
      
      echo "✅ 高风险更新完成"
      echo "⚠️  请注意：以下手动更新需要特别注意："
      echo "   - eslint: 8.57.1 → 9.39.1 (需要配置迁移)"
      echo "   - @vite-pwa/vitepress: 0.5.4 → 1.0.1 (需要 PWA 测试)"
      echo "   - @vueuse/core: 13.2.0 → 14.0.0 (需要兼容性测试)"
      echo "   - feed: 4.2.2 → 5.1.0 (需要 RSS 测试)"
      echo "   - globby: 14.1.0 → 16.0.0 (需要文件匹配测试)"
      echo "   - vue-slider-component: 需要特殊处理"
    else
      echo "❌ 已取消高风险更新"
    fi
    ;;
    
  "all")
    echo "🔄 执行所有更新阶段"
    ./update-dependencies.sh 1
    ./update-dependencies.sh 2
    ./update-dependencies.sh 3
    ;;
    
  "check")
    echo "📊 检查当前依赖状态"
    npm outdated
    ;;
    
  "help"|*)
    echo "使用方法:"
    echo "  ./update-dependencies.sh 1     - 第一阶段：安全更新"
    echo "  ./update-dependencies.sh 2     - 第二阶段：中等风险更新"
    echo "  ./update-dependencies.sh 3     - 第三阶段：高风险更新"
    echo "  ./update-dependencies.sh all   - 执行所有更新"
    echo "  ./update-dependencies.sh check - 检查依赖状态"
    echo "  ./update-dependencies.sh help  - 显示帮助"
    ;;
esac

echo ""
echo "💡 提示："
echo "   - 更新前请确保代码已提交"
echo "   - 每个阶段更新后请测试功能"
echo "   - 查看详细报告: cat dependency-update-report.md"
