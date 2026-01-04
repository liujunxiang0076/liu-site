import { defineStore } from "pinia";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      // 主题类别
      themeType: "auto",
      // 主题值
      themeValue: "light",
      // banner
      bannerType: "half",
      // 加载状态
      loadingStatus: true,
      // 滚动高度
      scrollData: {
        // 滚动高度
        height: 0,
        // 滚动百分比
        percentage: 0,
        // 滚动方向
        direction: "down",
      },
      // 页脚可见性
      footerIsShow: false,
      // 中控台显示
      controlShow: false,
      // 搜索框显示
      searchShow: true,
      // 个性化配置显示
      showSeetings: false,
      // 播放器数据
      playState: true,
      playerShow: true,
      playerCollapsed: true, // 播放器收起状态
      playerVolume: 0.7,
      playerData: {
        name: "未知曲目",
        artist: "未知艺术家",
      },
      // 移动端菜单显示
      mobileMenuShow: false,
      // 使用自定义右键菜单
      useRightMenu: false,
      // 背景模糊
      backgroundBlur: false,
      // 全站字体
      fontFamily: "hmos",
      // 全站字体大小
      fontSize: 16,
      // 信息显示位置
      infoPosition: "fixed",
      // 上次滚动位置
      lastScrollY: 0,
      // 站点背景
      backgroundType: "dynamic",
      backgroundUrl: "https://picsum.photos/1920/1080?random=1",
      // 文章密码验证状态
      articlePasswords: {}, // 存储已验证的文章密码 { articleId: { password: 'xxx', expireTime: timestamp } }
    };
  },
  // 计算
  getters: {},
  // 同步
  actions: {
    // 切换应用状态
    changeShowStatus(value, blur = true) {
      this[value] = !this[value];
      // 阻止滚动
      document.body.style.overflowY = this[value] ? "hidden" : "";
      // 全局模糊
      const globalApp = document.getElementById("app");
      this[value] && this.backgroundBlur && blur
        ? globalApp.classList.add("blur")
        : globalApp.classList.remove("blur");
    },
    // 更改字体大小
    changeFontSize(isAdd = false) {
      if (isAdd) {
        if (this.fontSize < 20) {
          this.fontSize++;
        }
      } else {
        if (this.fontSize > 14) {
          this.fontSize--;
        }
      }
      const htmlElement = document.documentElement;
      htmlElement.style.fontSize = this.fontSize + "px";
    },
    // 切换明暗模式
    changeThemeType() {
      // 禁止壁纸模式切换
      if (this.backgroundType === "image") {
        $message.warning("无法在壁纸模式下切换明暗模式", {
          duration: 1500,
        });
        return false;
      }
      this.themeType === "auto"
        ? (this.themeType = "dark")
        : this.themeType === "dark"
          ? (this.themeType = "light")
          : (this.themeType = "auto");
      // 弹窗提示
      if (typeof $message !== "undefined") {
        const text =
          this.themeType === "light"
            ? "浅色模式"
            : this.themeType === "dark"
              ? "深色模式"
              : "跟随系统";
        $message.info("当前主题为" + text, {
          duration: 1500,
        });
      }
    },

    /**
     * 验证文章密码
     * @param {string} articleId - 文章ID
     * @param {string} password - 输入的密码
     * @param {string} correctPassword - 正确的密码
     * @param {number} expireHours - 过期时间（小时）
     * @returns {boolean} - 验证是否成功
     */
    verifyArticlePassword(articleId, password, correctPassword, expireHours = 24) {
      // 确保密码都转换为字符串进行比较
      const inputPasswordStr = String(password).trim()
      const correctPasswordStr = String(correctPassword).trim()

      console.log('Store验证:', inputPasswordStr, '===', correctPasswordStr, '结果:', inputPasswordStr === correctPasswordStr)

      if (inputPasswordStr === correctPasswordStr) {
        const expireTime = Date.now() + expireHours * 60 * 60 * 1000;
        this.articlePasswords[articleId] = {
          password: inputPasswordStr,
          expireTime
        };
        return true;
      }
      return false;
    },

    /**
     * 检查文章密码是否已验证且未过期
     * @param {string} articleId - 文章ID
     * @returns {boolean} - 是否已验证
     */
    isArticlePasswordValid(articleId) {
      const passwordData = this.articlePasswords[articleId];
      if (!passwordData) return false;

      // 检查是否过期
      if (Date.now() > passwordData.expireTime) {
        // 删除过期的密码记录
        delete this.articlePasswords[articleId];
        return false;
      }

      return true;
    },

    /**
     * 清除文章密码验证状态
     * @param {string} articleId - 文章ID
     */
    clearArticlePassword(articleId) {
      if (this.articlePasswords[articleId]) {
        delete this.articlePasswords[articleId];
      }
    },

    /**
     * 清除所有过期的密码验证状态
     */
    clearExpiredPasswords() {
      const now = Date.now();
      Object.keys(this.articlePasswords).forEach(articleId => {
        if (this.articlePasswords[articleId].expireTime <= now) {
          delete this.articlePasswords[articleId];
        }
      });
    },
  },
  // 数据持久化
  persist: [
    {
      key: "siteData",
      paths: [
        "themeType",
        "bannerType",
        "useRightMenu",
        "playerShow",
        "playerVolume",
        "backgroundBlur",
        "backgroundType",
        "fontFamily",
        "fontSize",
        "infoPosition",
        "backgroundUrl",
        "articlePasswords",
      ],
    },
  ],
});
