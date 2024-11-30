import { themeConfig } from "./theme/config/themeConfig.mjs";
import { existsSync } from "fs";
import path from "path";

/**
 * 获取并合并配置文件
 */
export const getThemeConfig = async () => {
  try {
    // 配置文件绝对路径
    const configPath = path.resolve(__dirname, "../themeConfig.mjs");
    if (existsSync(configPath)) {
      // 文件存在时进行动态导入
      const userConfig = await import("../.vitepress/config.mts");
      return Object.assign(themeConfig, userConfig?.themeConfig || {});
    } else {
      // 文件不存在时返回默认配置
      console.warn(
        "User configuration file not found, using default themeConfig."
      );
      return themeConfig;
    }
  } catch (error) {
    console.error("An error occurred while loading the configuration:", error);
    return themeConfig;
  }
};
