---
title: CMS终于小有所成！
tags: [开发]
categories: [技术分享]
date: 2026-01-16
description: 
cover: https://imgbed.liujunxiang0076.site/file/1773190484473_image.png
---

## 先上截图

- 登录
![](https://imgbed.liujunxiang0076.site/file/1768550273617_image.png)

- 主体
![](https://imgbed.liujunxiang0076.site/file/1768550401341_679bce07de4771b5.png)

---

## 项目背景

为了打造一个最契合自己后台管理系统，从零开始，利用业余时间Vibe coding构建了这个项目

## 技术栈选型

为了保证系统的现代感与高性能，选择了目前主流的“黄金组合”：

* **前端框架**：Vue 3 + Vite 5 + TypeScript
* **UI 组件库**：Element Plus（配合 UnoCSS 进行样式微调）
* **状态管理**：Pinia
* **后端驱动**：FastApi
* **图标方案**：Element Plus Icons

---

**2026-03-11 更新**

ui界面调整美化

![](https://imgbed.liujunxiang0076.site/file/1773190484473_image.png)

![](https://imgbed.liujunxiang0076.site/file/1773190494731_image.png)

---
**2026-03-16 更新**

因为服务器资源不够，采用前后端独立部署，减轻服务器压力

### 前端
采用最熟悉vercel
![](https://imgbed.liujunxiang0076.site/file/1773637768946_image.png)

### 后端
部署在一台VPS，记录一下部署过程，以防后续忘记

拉取项目
```bash
git clone https://github.com/liujunxiang0076/liu-site-CMS.git
```

复制 `.env.example` 文件进行并修改
```text
GITHUB_TOKEN=your_token_here
REPO_NAME=your_github_id/liu-site
TG_IMG_API=your_tg_img_api_endpoint
SECRET_KEY=your_secure_random_string

# Optional: GitHub Configuration
# GITHUB_BRANCH=main

# Optional: Auth Configuration
# ADMIN_PASSWORD=your_initial_admin_password
# FORCE_RESET_PASSWORD=false

# Optional: Redis Configuration
# REDIS_HOST=localhost
# REDIS_PORT=6379

# Optional: CORS Configuration (comma-separated origins)
# ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

# Optional: Network Configuration
# HTTPS_PROXY=http://127.0.0.1:7890
# GITHUB_VERIFY_SSL=true

```


| Name | Remark |
| - | - |
| GITHUB_TOKEN | Personal access tokens (classic) |
| REPO_NAME | 仓库地址 |
| TG_IMG_API | 图床地址 |
| SECRET_KEY | 认证密钥 |


1.准备后端 Docker 镜像
既然在服务器上有了代码，我们可以手动构建一个专属于后端的镜像，这样 1Panel 就会把它当成一个“本地镜像”来管理。

在终端进入 backend 目录，执行以下命令构建镜像：

```Bash
cd /opt/1panel/docker/compose/liu-site-CMS/backend
# 构建一个名为 liu-backend-custom 的镜像
docker build -t liu-backend-custom .
构建成功后，在 1Panel 的“镜像”页面就能看到 liu-backend-custom 了。
```
2.在 1Panel 中创建单独的“编排”
现在我们要为后端创建一个干净的 docker-compose.yml，只包含后端服务及其依赖（如 Redis）：

在 /opt/1panel/docker/compose/ 下新建一个文件夹 my-backend。

在该目录下新建 docker-compose.yml，内容如下：

```YAML
services:
  backend:
    image: liu-backend-custom:latest
    container_name: my-cms-backend
    ports:
      - "8000:8000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - TZ=Asia/Shanghai
      # 如果有数据库密码等，在这里写
      # - DB_PASSWORD=xxxx
    depends_on:
      - redis
    restart: always
    networks:
      - cms-net

  redis:
    image: redis:alpine
    container_name: my-cms-redis
    restart: always
    networks:
      - cms-net

networks:
  cms-net:
    driver: bridge
```

3.部署
回到 1Panel **“容器”** -> **“编排”**。

点击 **“创建编排”**。

来源选择 **“路径选择”**，选中刚才创建的 `/opt/1panel/docker/compose/my-backend`。

保存即可。

![](https://imgbed.liujunxiang0076.site/file/1773638937037_image.png)

4.创建反代理

使用域名指向地址，配置完反向代理，对代理配置文件进行修改，是这个单独域名的配置，不是总配置


```text
location / {
    # 临时改为允许所有来源，排查是否是域名匹配问题
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    
    # 注意：如果开启了 Allow-Credentials 'true'，Origin 不能设置为 '*'，必须设置为具体域名
    # 如果后端不需要 Cookie/Session 认证，建议删掉下面这行
    # add_header 'Access-Control-Allow-Credentials' 'true' always;

    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    # 代理转发
    proxy_pass ####;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_http_version 1.1;
    
    add_header X-Cache $upstream_cache_status;
    proxy_ssl_server_name off;
    proxy_ssl_name $proxy_host;
    add_header Strict-Transport-Security "max-age=31536000";
}

```
以上配置因为浏览器的安全性，强制禁止 HTTPS 网页发起 HTTP 请求，会直接将其拦截
所以采用后端也使用 HTTPS


---