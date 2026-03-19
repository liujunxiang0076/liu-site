import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import markdownItAttrs from "markdown-it-attrs";
import container from "markdown-it-container";

const isPdfHref = (href = "") => {
  const normalizedHref = href.split("#")[0].split("?")[0].toLowerCase();
  return normalizedHref.endsWith(".pdf");
};

const escapeAttr = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const getAttr = (token, name) => token.attrs?.find(([attr]) => attr === name)?.[1] || "";

const getLinkText = (children = []) =>
  children
    .map((child) => child.content || "")
    .join("")
    .trim();

const createPdfPreviewPlugin = (md) => {
  md.core.ruler.after("inline", "pdf-preview", (state) => {
    const nextTokens = [];

    for (let i = 0; i < state.tokens.length; i += 1) {
      const current = state.tokens[i];
      const inlineToken = state.tokens[i + 1];
      const closeToken = state.tokens[i + 2];

      const isStandaloneParagraph =
        current?.type === "paragraph_open" &&
        inlineToken?.type === "inline" &&
        closeToken?.type === "paragraph_close";

      if (!isStandaloneParagraph) {
        nextTokens.push(current);
        continue;
      }

      const children = inlineToken.children || [];
      const visibleChildren = children.filter((child) => {
        if (child.type === "softbreak" || child.type === "hardbreak") return false;
        if (child.type === "text" && !child.content.trim()) return false;
        return true;
      });

      const isSinglePdfLink =
        visibleChildren.length >= 3 &&
        visibleChildren[0].type === "link_open" &&
        visibleChildren[visibleChildren.length - 1].type === "link_close";

      if (!isSinglePdfLink) {
        nextTokens.push(current);
        continue;
      }

      const href = getAttr(visibleChildren[0], "href");

      if (!isPdfHref(href)) {
        nextTokens.push(current);
        continue;
      }

      const innerChildren = visibleChildren.slice(1, -1);
      const title = getLinkText(innerChildren) || href.split("/").pop() || "PDF 文档";
      const htmlToken = new state.Token("html_block", "", 0);
      htmlToken.content = `<PdfPreview src="${escapeAttr(href)}" title="${escapeAttr(title)}" />\n`;
      nextTokens.push(htmlToken);
      i += 2;
    }

    state.tokens = nextTokens;
  });
};

// markdown-it
const markdownConfig = (md, themeConfig) => {
  // 插件
  md.use(markdownItAttrs);
  md.use(tabsMarkdownPlugin);
  createPdfPreviewPlugin(md);
  
  // 增强代码块，添加复制按钮和行号
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const lang = token.info.trim();
    
    // 生成原始代码块HTML
    const rawCode = fence(...args);
    
    // 使用我们的增强代码块组件包装
    return `<CodeBlock lang="${lang}">${rawCode}</CodeBlock>`;
  };
  
  // timeline
  md.use(container, "timeline", {
    validate: (params) => params.trim().match(/^timeline\s+(.*)$/),
    render: (tokens, idx) => {
      const m = tokens[idx].info.trim().match(/^timeline\s+(.*)$/);
      if (tokens[idx].nesting === 1) {
        return `<div class="timeline">
                    <span class="timeline-title">${md.utils.escapeHtml(m[1])}</span>
                    <div class="timeline-content">`;
      } else {
        return "</div></div>\n";
      }
    },
  });
  // radio
  md.use(container, "radio", {
    render: (tokens, idx, _options, env) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("radio".length).trim();
      if (token.nesting === 1) {
        const isChecked = md.renderInline(check, {
          references: env.references,
        });
        return `<div class="radio">
          <div class="radio-point ${isChecked}" />`;
      } else {
        return "</div>";
      }
    },
  });
  // button
  md.use(container, "button", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("button".length).trim();
      if (token.nesting === 1) {
        return `<button class="button ${check}">`;
      } else {
        return "</button>";
      }
    },
  });
  // card
  md.use(container, "card", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="card">`;
      } else {
        return "</div>";
      }
    },
  });
  // 表格
  md.renderer.rules.table_open = () => {
    return '<div class="table-container"><table>';
  };
  md.renderer.rules.table_close = () => {
    return "</table></div>";
  };
  // 图片 - 使用懒加载组件
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const src = token.attrs[token.attrIndex("src")][1];
    const alt = token.content;
    
    if (!themeConfig.fancybox.enable) {
      return `<LazyLoader src="${src}" alt="${alt}"></LazyLoader>`;
    }
    
    return `<a class="img-fancybox" href="${src}" data-fancybox="gallery" data-caption="${alt}">
              <LazyLoader src="${src}" alt="${alt}"></LazyLoader>
              <span class="post-img-tip">${alt}</span>
            </a>`;
  };
};

export default markdownConfig;
