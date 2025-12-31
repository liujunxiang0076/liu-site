/**
 * VitePress 主题配置文件
 * 包含站点基本信息、导航配置、功能配置等
 */

export const themeConfig = {
    /**
     * 站点基本信息配置
     */
    siteMeta: {
        // 站点标题
        title: 'Liu',
        // 站点描述
        description: 'Hello World',
        // 站点logo
        logo: '/images/logo/logo.webp',
        // 站点地址
        site: 'https://b.liujuxiang0076.site',
        // 站点语言
        lang: 'zh-CN',
        // 作者信息
        author: {
            name: 'liu',
            cover: '/images/logo/logo.webp',
            email: 'liujunxiang0076@foxmail.com',
            link: 'https://b.liujunxiang0076.site',
            // GitHub 地址
            github: 'https://github.com/liujunxiang0076',
        }
    },

    /**
     * 阅读时间配置
     */
    readingTime: {
        // 是否显示详细信息（字数统计等）
        showDetails: false,
        // 每分钟阅读字数
        wordsPerMinute: 300,
        // 每分钟阅读中文字数
        chineseWordsPerMinute: 500,
        // 每分钟阅读英文字数
        englishWordsPerMinute: 200,
        // 每张图片阅读时间（秒）
        imageSeconds: 12
    },

    // 备案信息
    icp: '',
    // 建站日期
    since: '2020-07-28',
    // 每页显示的文章数量
    postSize: 8,

    /**
     * 头部注入配置
     * 用于添加外部资源链接
     */
    inject: {
        header: [
            // favicon
            ['link', { rel: 'icon', href: '/favicon.ico' }],
            // RSS 订阅
            [
                "link",
                {
                    rel: "alternate",
                    type: "application/rss+xml",
                    title: "RSS",
                    href: "https://b.liujunxiang0076.site/rss.xml",
                },
            ],
            // CDN 预连接
            [
                "link",
                {
                    crossorigin: "",
                    rel: "preconnect",
                    href: "https://s1.hdslb.com",
                },
            ],
            [
                'link',
                {
                    crossorigin: '',
                    rel: 'preconnect',
                    href: 'https://mirrors.sustech.edu.cn'
                }
            ],
            // HarmonyOS 字体
            [
                'link',
                {
                    crossorigin: 'anonymous',
                    rel: 'stylesheet',
                    href: 'https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css'
                }
            ],
            // 文楷字体
            [
                'link',
                {
                    crossorigin: 'anonymous',
                    rel: 'stylesheet',
                    href: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.css'
                }
            ],
            // codesign图标字体
            [
                'link',
                {
                    crossorigin: 'anonymous',
                    rel: 'stylesheet',
                    href: 'https://cdn2.codesign.qq.com/icons/L6jgWq4YNB2G8jp/latest/iconfont.css'
                }
            ],
            // 代码字体
            ['link', { rel: 'preconnect', href: 'https://use.sevencdn.com' }],
            [
                'link',
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: ''
                }
            ],
            [
                'link',
                {
                    crossorigin: 'anonymous',
                    href: 'https://use.sevencdn.com/css2?family=Fira+Code:wght@300..700&display=swap',
                    rel: 'stylesheet'
                }
            ],
            // DocSearch 预连接
            [
                'link',
                {
                    href: 'https://X5EBEZB53I-dsn.algolia.net',
                    rel: 'preconnect',
                    crossorigin: ''
                }
            ]
        ],
    },

    /**
     * 导航栏菜单配置
     */
    nav: [
        {
            text: '文库',
            items: [
                { text: '文章列表', link: 'src/pages/archives', icon: 'article' },
                { text: '全部分类', link: 'src/pages/categories', icon: 'folder' },
                { text: '全部标签', link: 'src/pages/tags', icon: 'hashtag' }
            ]
        },
        {
            text: '专栏',
            items: [
                {
                    text: '技术分享',
                    link: 'src/pages/categories/技术分享',
                    icon: 'technical'
                },
                { text: '我的项目', link: 'src/pages/project', icon: 'code' },
                // { text: '效率工具', link: 'src/pages/tools', icon: 'tools' }
            ]
        },
        // {
        //     text: '友链',
        //     items: [
        //         { text: '友链鱼塘', link: 'src/pages/friends', icon: 'fish' },
        //         { text: '友情链接', link: 'src/pages/link', icon: 'people' }
        //     ]
        // },
        {
            text: '我的',
            items: [
                // { text: '畅所欲言', link: 'src/pages/message', icon: 'chat' },
                // { text: '致谢名单', link: 'src/pages/thanks', icon: 'reward' },
                { text: '关于本站', link: 'src/pages/about', icon: 'about' }
            ]
        }
    ],

    /**
     * 左侧导航菜单配置
     */
    navMore: [
        {
            name: '服务',
            list: [
                {
                    icon: 'https://imgbed.liujunxiang0076.site/file/1734072586316_image.svg',
                    name: '图床',
                    url: 'https://imgbed.liujunxiang0076.site/'
                },
                {
                    icon: 'https://imgbed.liujunxiang0076.site/file/1734072616643_email.svg',
                    name: '图床',
                    url: 'https://imgbed.liujunxiang0076.site/'
                },
            ]
        },
    ],

    /**
     * 文章封面配置
     */
    cover: {
        // 是否开启双栏布局
        twoColumns: false,
        // 封面显示配置
        showCover: {
            // 是否启用封面显示
            enable: true,
            // 封面布局方式: left | right | both
            coverLayout: 'both',
            // 默认封面图片（随机展示）
            defaultCover: [
                'https://imgbed.liujunxiang0076.site/file/1733709262232_wallpaper1733462866817.jpg',
                'https://imgbed.liujunxiang0076.site/file/1733709269864_wallpaper1733462836045.jpg',
                'https://imgbed.liujunxiang0076.site/file/1733709263706_wallpaper1733462431413.jpg'
            ]
        }
    },

    /**
     * 页脚配置
     */
    footer: {
        // 社交链接配置
        social: [],
        // 站点地图配置
        sitemap: []
    },

    /**
     * 评论系统配置
     */
    comment: {
        // 是否启用评论
        enable: true,
        // 评论系统类型：artalk / twikoo / waline
        type: 'waline',
        // Artalk 配置
        artalk: {
            site: '',
            server: ''
        },
        // Twikoo 配置
        twikoo: {
            // Twikoo 脚本地址
            js: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/twikoo/1.6.39/twikoo.all.min.js',
            // 环境 ID
            envId: '',
            // 环境地域
            region: 'ap-shanghai',
            // 语言设置
            lang: 'zh-CN'
        },
        // Waline 配置
        waline: {
            // Waline 服务端地址
            // serverURL: 'https://waline.liujunxiang0076.site/',
            serverURL: 'https://waline.020076.xyz/',
            // 评论数统计
            comment: true,
            // 页面访问量统计
            pageview: true,
            // 语言设置
            locale: {
                placeholder: '来都来了，不留下点什么吗？'
            },
            // 评论者信息
            // meta: ['nick'],
            // 设置必填项，默认匿名
            // requiredMeta: [],
            // 登录模式状态
            // login: 'disable',
            // 是否禁用版权
            noCopyright: true,
            // 是否禁用评论表情
            // reaction: true,
            // emoji
            // emoji: [
            //     '//unpkg.com/@waline/emojis@1.4.0/alus',
            //     '//unpkg.com/@waline/emojis@1.4.0/bilibili',
            //     '//unpkg.com/@waline/emojis@1.4.0/bmoji',
            //     '//unpkg.com/@waline/emojis@1.4.0/qq',
            //     '//unpkg.com/@waline/emojis@1.4.0/tieba',
            //     '//unpkg.com/@waline/emojis@1.4.0/tw-emoji',
            //     '//unpkg.com/@waline/emojis@1.4.0/weibo',
            //     '//unpkg.com/@waline/emojis@1.4.0/soul-emoji',
            // ],

            
        }
    },

    /**
     * 侧边栏配置
     */
    aside: {
        // 站点简介
        hello: {
            enable: true,
            text: '这里有关于<strong>开发</strong>相关的问题和看法，也会有一些<strong>奇技淫巧</strong>的分享，其中大部分内容会侧重于<strong>前端开发</strong>。希望你可以在这里找到对你有用的知识和教程。'
        },
        // 文章目录
        toc: {
            enable: true
        },
        // 天气组件
        weather: {
            enable: true,
            // 天气 API 类型
            type: 'qweather',
            // API 参数
            params: {
                // 位置 ID 或经纬度
                location: '',
                // 预报天数
                days: '3',
                // 是否为免费版
                isFree: true,
                // 单位：m(公制)/i(英制)
                unit: 'm',
                // 语言
                lang: 'zh'
            }
        },
        // 标签云
        tags: {
            enable: true
        },
        // 倒计时
        countDown: {
            enable: true,
            // 倒计时数据
            data: {
                name: '春节',
                date: '2025-01-29'
            }
        },
        // 站点数据
        siteData: {
            enable: true
        }
    },

    /**
     * 友链配置
     */
    friends: {
        // 友链朋友圈
        circleOfFriends: '',
        // 动态友链
        dynamicLink: {
            server: '',
            app_token: '',
            table_id: ''
        }
    },

    /**
     * 音乐播放器配置
     */
    music: {
        enable: true,
        // API 地址
        url: 'https://api.injahow.cn/meting/',
        // 播放列表 ID
        id: 9379831714,
        // 音乐服务商：netease / tencent / kugou
        server: 'netease',
        // 播放类型：playlist / album / song
        type: 'playlist'
    },

    /**
     * 搜索配置
     */
    search: {
        enable: false,
        // Algolia 配置
        appId: 'ZMYVMX7LVX',
        apiKey: 'a1ab67fb0a7f1887f5d62085acee0c7d'
    },

    /**
     * 打赏配置
     */
    rewardData: {
        enable: true,
        // 微信收款码
        wechat: 'https://imgbed.liujunxiang0076.site/file/1733733748214_wx_reward_qrcode.jpg',
        // 支付宝收款码
        alipay: 'https://imgbed.liujunxiang0076.site/file/1733733888467_zfb_reward_qrcode.jpg'
    },

    /**
     * 图片灯箱配置
     */
    fancybox: {
        enable: true,
        // 脚本地址
        js: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js',
        // 样式地址
        css: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css'
    },

    /**
     * 外链跳转配置
     */
    jumpRedirect: {
        enable: true,
        // 排除的类名
        exclude: ['cf-friends-link', 'upyun', 'icp', 'author', 'rss', 'cc', 'power', 'social-link', 'link-text', 'travellings', 'post-link', 'report', 'more-link', 'skills-item', 'right-menu-link', 'link-card']
    },

    /**
     * 站点统计配置
     */
    tongji: {
        '51la': ''
    },

    /**
     * 第三方服务配置
     */
    thirdParty: {
        // 和风天气
        qweather: {
            // API 密钥
            key: '9e31fc183b77456788d5260d97b288b7'
        },
        // 百度统计
        baiduTongji: {
            // 统计 ID
            id: ''
        },
        // CNZZ 统计
        cnzz: {
            // 统计 ID
            id: ''
        }
    },

    /**
     * 文章密码保护配置
     */
    articlePassword: {
        // 是否启用文章密码保护功能
        enable: true,
        // 默认密码（可选，如果文章没有设置密码则使用此密码）
        defaultPassword: '',
        // 密码有效期（小时）
        expireHours: 24,
        // 密码提示文本
        placeholder: '请输入文章访问密码',
        // 错误提示文本
        errorMessage: '密码错误，请重新输入',
        // 确认按钮文本
        confirmText: '确认',
        // 取消按钮文本
        cancelText: '取消'
    }
};
