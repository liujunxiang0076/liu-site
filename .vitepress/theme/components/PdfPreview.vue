<template>
  <section class="pdf-preview s-card">
    <div class="pdf-header">
      <div class="pdf-copy">
        <span class="pdf-badge">PDF</span>
        <div class="pdf-meta">
          <h3 class="pdf-title">{{ titleText }}</h3>
          <p class="pdf-subtitle">{{ fileName }}</p>
        </div>
      </div>
      <div class="pdf-actions">
        <a :href="src" target="_blank" rel="noreferrer" class="pdf-action">打开原文</a>
        <a :href="src" download class="pdf-action ghost">下载</a>
      </div>
    </div>

    <div class="pdf-stage">
      <iframe
        class="pdf-frame"
        :src="previewSrc"
        :title="titleText"
        loading="lazy"
      />
    </div>

    <p class="pdf-tip">若预览受浏览器或源站限制，可使用“打开原文”查看。</p>
  </section>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
});

const fileName = computed(() => {
  const rawName = props.src.split("/").pop()?.split("?")[0] || "PDF 文档";
  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
});

const titleText = computed(() => props.title?.trim() || fileName.value);

const previewSrc = computed(() => (props.src.includes("#") ? props.src : `${props.src}#view=FitH`));
</script>

<style lang="scss" scoped>
.pdf-preview {
  margin: 1.25rem 0;
  padding: 1rem;
  cursor: default;

  .pdf-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
  }

  .pdf-copy {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    min-width: 0;
  }

  .pdf-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 28px;
    padding: 0 0.7rem;
    border-radius: 999px;
    background: var(--main-color-bg);
    color: var(--main-color);
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .pdf-meta {
    min-width: 0;
  }

  .pdf-title {
    margin: 0;
    font-size: 1.02rem;
    line-height: 1.4;
    color: var(--main-font-color);
    word-break: break-word;
  }

  .pdf-subtitle {
    margin: 0.28rem 0 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--main-font-second-color);
    word-break: break-all;
  }

  .pdf-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.55rem;
  }

  .pdf-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 0.85rem;
    border-radius: 999px;
    border: 1px solid transparent;
    background: var(--main-color);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;

    &.ghost {
      border-color: var(--main-card-border);
      background: var(--main-card-background);
      color: var(--main-font-color);
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px -10px rgba(var(--main-color-rgb), 0.55);
    }
  }

  .pdf-stage {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid var(--main-card-border);
    background: var(--main-card-second-background);
  }

  .pdf-frame {
    display: block;
    width: 100%;
    height: 720px;
    border: 0;
    background: #fff;
  }

  .pdf-tip {
    margin: 0.7rem 0 0;
    font-size: 0.78rem;
    line-height: 1.6;
    color: var(--main-font-second-color);
  }

  @media (max-width: 1024px) {
    .pdf-frame {
      height: 560px;
    }
  }

  @media (max-width: 768px) {
    padding: 0.9rem;

    .pdf-header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.8rem;
    }

    .pdf-copy {
      gap: 0.7rem;
    }

    .pdf-actions {
      justify-content: flex-start;
    }

    .pdf-action {
      min-height: 32px;
      padding: 0 0.8rem;
      font-size: 0.78rem;
    }

    .pdf-frame {
      height: 360px;
    }
  }
}
</style>
