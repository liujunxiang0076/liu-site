import { themeConfig } from "./theme/config/themeConfig.mts";
import { existsSync } from "fs";
import path from "path";

/**
 * 获取并合并配置文件
 */
export const getThemeConfig = async () => {
  try {
    // 配置文件绝对路径
    const configPath = path.resolve(__dirname, "../.vitepress/theme/config/themeConfig.mts");
    // 检查文件是否存在
    if (existsSync(configPath)) {
      // 文件存在时进行动态导入
      // 直接使用已导入的themeConfig而不是重新导入
      console.log("User configuration file loaded successfully.");
      // 直接返回已导入的配置
      return themeConfig;
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
