# 🦆 前端面试鸭

绿色风格的前端面试小程序，基于 **uni-app + Vue 3** 开发，一套代码可发布到微信小程序、H5 与 App。

全站内容是**问答详解**：每道题不给选项，直接给「一句话回答 → 回答重点 → 详细答案 → 扩展追问」，适合面试前快速过一遍。共 **11 个分类、553 道问答**，题目清单与解析参考自 [面试鸭](https://www.mianshiya.com) 各技术方向的题库；另有 66 条「基础知识点」卡片作为阅读补充。学习数据（已读、收藏、打卡）存服务端，账号登录后换设备可同步；不登录也能以游客身份刷题。

---

## 设计规范

版式参考支付宝：**主色大渐变头部 → 金刚区宫格 → 白卡信息流**。主色仍是绿色，金刚区用多彩渐变块区分功能。

### 色板

| 用途 | 变量 | 色值 |
| --- | --- | --- |
| 主色 | `$duck-primary` | `#00B578` |
| 主色按下 | `$duck-primary-press` | `#00A26B` |
| 主色深（浅绿底文字） | `$duck-primary-dark` | `#00875A` |
| 浅绿底（标签/选中） | `$duck-primary-soft` | `#E8F9F2` |
| 头部渐变 | `$duck-grad` | `#3AD598 → #00B578 → #009E6B`（135deg） |
| 深色面（代码块） | `$duck-ink` | `#0E2A20` |
| 页面底色 | `$duck-bg` | `#F3F5F4` |
| 卡片 | `$duck-card` | `#FFFFFF` |
| 分割线 | `$duck-line` | `#F1F1F1` |
| 主文字 | `$duck-text` | `#1A1A1A` |
| 次要文字 | `$duck-text-sub` | `#666666` |
| 弱化文字 | `$duck-text-muted` | `#999999` |
| 提醒（困难题） | `$duck-warn` | `#FF8F1F` |
| 错误 | `$duck-danger` | `#FF4D4F` |

所有变量定义在 `uni.scss`，页面 `<style lang="scss">` 中可直接使用。

### 版式规则

- **渐变头部通栏**：`.duck-head` 统一提供 135° 主色渐变、底部 40rpx 大圆角、两团白色光斑；状态栏高度在页面内用 `statusBar` 撑开
- **头部内必有一个搜索胶囊**：白底 `999rpx` 圆角 + 右侧绿色「搜索」按钮（首页 / 搜索页）
- **金刚区上浮**：白卡 `.duck-grid` 用负 `margin-top` 压住头部下沿，4 列 × 2 行，图标为白色线性 PNG + 彩色渐变底块
- **白卡信息流**：卡片 `24rpx` 圆角 + `0 4rpx 18rpx rgba(20,32,26,.04)` 淡投影，卡片左右 24rpx 边距，卡片之间 20rpx
- **区块标题**：`32rpx` 加粗标题 + 右侧「更多 ›」，`.duck-sec-head` 统一
- **数字优先**：统计数字 46–62rpx 加粗、`tabular-nums`，单位用小一号灰字
- **图标**：金刚区与 tabBar 为 PIL 生成的 PNG（`static/icons/`、`static/tabbar/`），方向箭头/放大镜/小叉用纯 CSS 绘制

---

## 页面结构

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `pages/interview/index/index` | 渐变头部 + 搜索胶囊、8 格金刚区、今日阅读进度卡、每日一题、分类列表、高频榜 |
| 题库 | `pages/interview/bank/bank` | 渐变头部 + 问答/知识点分段、随机一题/搜索按钮、上浮分类阅读进度卡、胶囊分类切换、问答列表（已读标记） |
| 问答详解 | `pages/interview/qa/qa` | 渐变导航（返回 + 收藏 + 分类）、标题卡 + 一句话回答、回答重点、详细答案分段、代码示例、扩展追问、上一题/下一题、底部「随机看一题」 |
| 知识点 | `pages/interview/knowledge/knowledge` | 渐变导航、标题卡、核心要点、代码示例、易错提醒、下一篇、底部「看本分类问答」 |
| 我的题单 | `pages/interview/collect/collect` | 渐变头部、上浮绿底分段器（收藏夹 / 已读记录）、逐条取消收藏、继续阅读 |
| 我的 | `pages/interview/mine/mine` | 渐变头部 + 头像等级、上浮三项统计卡、阅读进度、功能宫格、更多设置 |
| 搜索 | `pages/interview/search/search` | 渐变头部内搜索框、热门关键词、按分类直达、同时检索问答与知识点 |
| 登录 | `pages/interview/login/login` | 极简白底：账号 + 密码（密码可见切换）、账号不存在时自动注册、游客进入、协议勾选；登录时把游客期间的收藏 / 错题 / 记录 / 打卡**合并到账号**，入口在「我的」头像区与右上「登录」胶囊 |
| 五子棋 | `pages/interview/game/game` | 放松用小游戏：15×15 棋盘、人机对局（我执黑先行）、悔棋、重开、胜负高亮，胜/负/平有弹出式结算卡（缩放回弹动画 + 轻震动），入口在「我的 → 放松一下」 |
| 象棋 | `pages/interview/game/chess` | 放松用小游戏：10×9 标准棋盘（楚河汉界、九宫斜线）、人机对局（我执红先行）、点选高亮可走点、吃将即胜 / 无棋可走判负、悔棋回退两步、被将军提示，结算卡与五子棋同款回弹动画，入口在「我的 → 放松一下」 |
| 围棋 | `pages/interview/game/go` | 放松用小游戏：9 路棋盘（五个星位）、人机对局（我执黑先行）、实现气 / 提子 / 禁入点 / 单劫、停一手、悔棋、双方连续停一手即终局数子（中国规则，白贴 3.75 子），结算卡展示黑白子数，入口在「我的 → 放松一下」 |
| 消消乐 | `pages/interview/game/match` | 放松用小游戏：8×8 六色三消、点两个相邻方块交换（不成三连会自动换回并抖动）、三连以上消除 + 下落补位 + 连锁连击加分、死局自动洗牌、25 步用尽按得分评三星，入口在「我的 → 放松一下」 |
| 俄罗斯方块 | `pages/interview/game/tetris` | 放松用小游戏：10×20 标准盘、7 种方块 7-bag 随机、左右移动 / 顺时针旋转（带墙踢）/ 软降 / 硬降 / 暂停、幽灵落点预览、消行闪白 + 一次消 4 行高分、每 10 行升级加速、堆到顶部结算（最高分本地保存），入口在「我的 → 放松一下」 |

tabBar 四项：首页 / 题库 / 题单 / 我的。

---

## 体积优化（主包 2MB 限制）

示例工程（hello-uniapp）遗留的 164 个演示页已从 `pages.json` **注销**，页面文件仍保留在磁盘上（可随时恢复），
因此它们依赖的 46 个 `uni_modules` 组件和演示静态资源不再参与编译；`wxcomponents/`（vant 按钮示例）已整块移出项目，
备份在 `backup/wxcomponents-vant-20261020`。

当前主包内容（7 页）：

| 内容 | 说明 |
| --- | --- |
| `pages/interview/*` 8 页 | 4 个 tabBar 页 + 搜索 / 知识点 / 问答详解 / 登录（仅这 8 页会出现在小程序端 `app.json` 的 `pages` 里） |
| `common/bank/*` | 11 个分类 553 道问答数据，约 1.0 MB，是当前最大项 |
| `common/knowledge.js`、`interview-store.js`、`interview-data.js` | 知识点、本地存储、查询层 |
| `static/` 20 个文件 | 仅保留被引用的 tabBar 图标、金刚区图标、`customicons` 字体 |

小游戏（五子棋 / 象棋 / 围棋 / 消消乐 / 俄罗斯方块）已整体放进分包：

```json
"subPackages": [
  { "root": "pages/interview/game", "pages": ["game", "chess", "go", "match", "tetris"] }
]
```

条件编译页（不进小程序包）：`pages/about/about` 仅 H5 / App，`pages/error/404` 仅 H5，
升级弹窗仅 App；`platforms/app-plus/*` 6 页为 App 平台能力示例，已统一包在 `// #ifdef APP-PLUS` 内。

要点与坑：

- **分包只对「纯自绘页面」有效**：这几个小游戏全部用 `view` + CSS 实现，没有引用任何 `uni_modules` 组件，
  所以挪进分包能实打实减掉主包体积。反过来说，**`uni_modules` 组件会统一输出到主包**，
  即使只有分包页面在用——想让带 uni-ui 组件的页面进分包瘦身是无效的。
- **条件编译的页面必须整段处理，不能拆**：`pages.json` 里 `// #ifdef` / `// #endif` 是按行配对的，
  页面和它外层的条件注释被分开后，小程序端预处理会把 `#ifdef` 到 `#endif` 之间的内容整段删掉（连 `subPackages` 一起）。
- 主包页面不能落在分包 root 目录下，否则微信端会报「主包页面位于分包目录」。
- 尾部条件块的写法：最后一个无条件页面不加逗号，其后的条件块一律写成 `// #ifdef X` + 以逗号开头的 `,{ ... }`，
  这样任意平台删掉条件块后 JSON 依然合法。
- 开发构建（运行到小程序）**不做压缩混淆**，微信统计的「source size」就是这些未压缩文件的总和，
  约为发行版的 1.5 倍；正式上传建议走「发行 → 小程序-微信」，开发构建只在本地调试用。
- `manifest.json` 的 `mp-weixin.uniStatistics.enable` 已关掉，少一份统计上报代码，也避免多余的运行时开销。
- 恢复示例页：把 `backup/pages.json.with-demos.bak` 覆盖回 `pages.json`，并从 `backup/static-unused/` 把资源还原到 `static/`。

---

## 目录结构

```
common/
  interview-data.js     题库聚合与查询（分类、按类取问答、每日一题、搜索、随机、高频）
  knowledge.js          基础知识点（66 条，按分类组织，含要点 / 代码 / 易错提醒）
  interview-store.js    本地数据层（收藏、已读记录、每日打卡、连续天数、统计）
  interview.css         全局基础类（卡片、按钮、标签、空态）
  loading.js            统一的 loading 封装（计数、最短展示时长、成对关闭、页面切换 loading）
  nav.js                自定义导航栏工具（胶囊按钮右侧安全区、无历史时的返回兜底）
  xiangqi.js            象棋引擎（棋盘/走法生成/将军判定/局面评估/迭代加深搜索，纯逻辑无 UI）
  go.js                 围棋引擎（9 路盘的气 / 提子 / 禁入点 / 单劫 / 数子 / 启发式选点，纯逻辑无 UI）
  match3.js             消消乐引擎（8×8 盘面生成 / 三连检测 / 交换 / 下落补位 / 死局判定与洗牌，纯逻辑无 UI）
  tetris.js             俄罗斯方块引擎（7 种方块旋转表 / 碰撞 / 墙踢 / 幽灵落点 / 消行 / 计分与速度曲线，纯逻辑无 UI）
  bank/
    index.js            汇总 11 个分类的 qaQuestions
    qa/                 各分类问答数据（js / ts / css / html / vue / react / node / browser / build / algo）
    python.js           Python 问答（001 ~ 093）
    legacy/             已下线的选择题数据（lang / framework / base / algo / *-extra / helper），仅作备份
legacy/
  quiz.vue              已下线的答题页（选择题时代），仅作备份
pages/interview/
  index/index.vue       首页
  bank/bank.vue         题库
  collect/collect.vue   我的题单
  mine/mine.vue         我的
  search/search.vue     搜索
  knowledge/knowledge.vue 知识点详情
  qa/qa.vue             问答详解详情
  login/login.vue       登录（账号密码 / 游客进入）
  game/game.vue         五子棋（放松小游戏）
  game/chess.vue        象棋（放松小游戏）
  game/go.vue           围棋（放松小游戏）
  game/match.vue        消消乐（放松小游戏）
  game/tetris.vue       俄罗斯方块（放松小游戏）
static/tabbar/          tabBar 图标（未选中灰线性 / 选中绿实心，81×81）
uni.scss                绿色主题变量
```

---

## 运行

> **前端默认连线上服务器，不需要在本地起后端。**
> 页面上的分类、题目、收藏、登录全部走 `http://175.27.137.170`（Nginx :80 → uvicorn :8100）。
> 服务器没响应时首页会显示「题库加载失败 + 重新加载」，登录会提示「连不上服务器」。

### 第一步：启动后端

Windows 下直接双击 `server/start.bat`（自动切目录、检查虚拟环境、没有 `.env` 时从模板复制一份）。

命令行方式：

```bash
cd server
.venv/Scripts/python.exe run.py
```

首次使用（虚拟环境还没建）时：

```bash
cd server
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe run.py
```

启动成功后：

| 地址 | 用途 |
| --- | --- |
| `http://127.0.0.1:8100/api/catalog/mirror` | 题库镜像，能看到 JSON 就说明通了 |
| `http://127.0.0.1:8100/docs` | Swagger 接口文档，可以直接点着测 |

服务是前台进程，**关掉窗口就停了**；下次打开项目要重新启动。

### 第二步：HBuilderX（推荐）

1. 用 HBuilderX 打开本项目目录
2. 运行 → 运行到小程序模拟器 → 微信开发者工具
3. 首次运行需在微信开发者工具中填写自己的 AppID（或使用测试号）

运行到浏览器：运行 → 运行到浏览器 → Chrome，可直接预览 H5 版本。

### 接口地址怎么改

前端默认连线上服务器 `http://175.27.137.170`（`common/api.js` 里的 `PROD_BASE`）。
想在本地调后端时，把同一文件里的 `USE_LOCAL` 改成 `true`，就会切到 `http://127.0.0.1:8100`。

- **小程序开发者工具**：线上是 `http` + IP，需在「详情 → 本地设置」勾选「不校验合法域名」，否则请求会被拦
- **真机预览**：同样要勾「不校验合法域名」（或在手机端打开开发调试）
- **正式版**：微信要求接口必须是 `https://` 且域名已备案，需要在后台「开发管理 → 服务器域名」里配置；配好后把 `PROD_BASE` 改成该 https 域名即可

### 微信小程序注意事项

- `manifest.json` 中 `mp-weixin.appid` 已配置为 `wxda609248d3ffa608`
- tabBar 图标已按 81×81 输出，符合小程序体积要求
- 四个 tab 页使用 `navigationStyle: custom`，已按 `statusBarHeight` 预留状态栏高度
- 已移除示例工程遗留的 `scope.userLocation` 声明，小程序后台无需再申请定位权限

---

## 后端与登录

题库、收藏、错题、打卡都存在服务端（FastAPI + SQLite）：线上 `http://175.27.137.170`，本地开发用 `server/` 里那一份。

```bash
cd server
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe run.py        # 首次启动自动建表并导入 553 道题
```

### 三种身份

| 身份 | 怎么来 | 说明 |
| --- | --- | --- |
| 游客 | 首次启动自动调 `/api/auth/guest`；退出登录后也会换一个新游客 | 不用任何配置就能刷题，数据存在这个游客账号上 |
| 账号用户 | 登录页「账号 + 密码」 | 账号不存在时自动注册（首次填的密码即密码）；换设备用同一账号登录还是同一个账号 |
| 未登录 | 只在正式账号 token 失效（如后端换库）时出现 | 不自动降级成游客，避免「进度全丢」的错觉；「我的」页显示「未登录」，点「登录」重新验证 |

### 账号密码怎么存

`POST /api/auth/login` 一个接口同时承担登录与注册：

- 账号不存在 → 用这次提交的密码直接注册，省掉「先注册再登录」两步
- 账号已存在 → 校验密码，密码错直接拒绝，**不会覆盖原密码**
- 账号统一转小写入库，避免 `Alice` 和 `alice` 变成两个账号
- 账号规则 3-20 位字母 / 数字 / 下划线（用手机号当账号也可以），密码 6-32 位

密码用 `server/app/password.py` 里的 PBKDF2-HMAC-SHA256 + 每条独立随机盐，迭代 20 万次，
存成 `pbkdf2_sha256$迭代次数$盐$摘要`，**明文不落库**。校验用 `secrets.compare_digest`
常数时间比较，避免通过响应时间侧信道逐字节猜密码。只依赖标准库，不用装 passlib / bcrypt。

> 后端仍保留 `/api/auth/phone`、`/api/auth/phone/code` 与 `sms.py`（验证码落库、60 秒频控、
> 一次性使用、连错 5 次作废）。哪天要换成短信登录，前端接上这两个接口即可，不用改后端。

### 游客数据会合并到正式账号

这是登录功能里最容易踩的坑：用户游客身份刷了 50 题，一登录变成空账号。

后端 `POST /api/auth/login` 会读请求头里的 token，如果那是游客，就把它的：

- 收藏 / 错题 —— 与正式账号取**并集**，重复的丢掉多余那条
- 答题记录 —— 按题去重，游客的覆盖旧值（更近的一次作答）
- 每日打卡 —— 同一天**相加**，保证「今日进度」不归零

合并完把游客账号删掉（SQLite 默认不启用外键级联，所以代码里显式清了残留行）。

### 前端四个文件的分工

```
common/
├── api.js              请求层：baseURL / token / 重试 / 401 重登 / 游客·账号登录 / 登出 / 改昵称
├── bootstrap.js        启动：游客登录 → 题库镜像 → 用户数据（失败静默，可离线）
├── question-source.js  题库镜像：同步读 + 后台刷新 + 详情按需拉取
└── user-store.js       用户数据：乐观更新 / 失败回滚 / 离线队列
```

退出登录 = 清本地身份 + 换一个新游客，**服务端数据不删**，下次用同一个账号登录还能找回。
另外 token 失效（比如后端换了数据库）时，bootstrap 不会把正式账号悄悄降级成游客，而是清掉本地身份交给「我的」页提示重新登录 —— 否则用户会以为进度全丢了。

---

## 数据说明

### 题目来源与题量

| 分类 | id | 题数 | 取材题库（面试鸭） |
| --- | --- | --- | --- |
| JavaScript | `js` | 50 | 前端 JavaScript 基础 / 进阶 / ES6 |
| TypeScript | `ts` | 43 | 前端 TypeScript |
| CSS | `css` | 50 | 前端 CSS |
| HTML | `html` | 17 | 前端 HTML（原库仅 18 题，去重后 17 条） |
| Vue | `vue` | 50 | Vue 基础 / Vue 进阶 / Vue3 |
| React | `react` | 50 | React 基础 / React 进阶 |
| Node.js | `node` | 50 | Node.js |
| 浏览器与网络 | `browser` | 50 | 前端代码分析 / 前端场景 |
| 工程化 | `build` | 50 | 前端工程化 / Webpack |
| 算法与数据结构 | `algo` | 50 | 大厂算法真题 / 前端手写代码 |
| Python | `py` | 93 | Python 面试题库 |

合计 **553 道问答**。各分类按题库浏览量取高频题，去重后不足的按原库剩余题目补齐；HTML 与 TypeScript 受原库题量限制，收录了全部可用题目。

> 题目清单（题干、难度、热度）对应该站题库；一句话回答、回答重点、详细答案与扩展追问按本项目的问答结构重新整理，不是原站答案的完整照搬。

### 问答数据结构

每个分类文件（`common/bank/qa/*.js`、`common/bank/python.js`）导出 `qaQuestions` 数组：

```js
{
  id: 'js-001',                 // 全局唯一：分类-序号
  cat: 'js',                    // 必须是 categories 中的 id
  level: 2,                     // 1 简单 2 中等 3 困难
  hot: 99,                      // 热度（按原站浏览量映射到 60~99）
  source: '面试鸭 · JavaScript 基础',
  title: '题目',
  short: '一句话回答，列表与标题卡展示',
  points: ['回答重点 1', '回答重点 2'],            // 口述时的骨架，2~4 条
  detail: [{ h: '小标题', p: '展开的一段话' }],     // 详细答案分段
  extend: ['扩展追问 1', '扩展追问 2'],            // 面试官可能继续问的点
  code: ''                                       // 可选代码示例
}
```

### 查询方法

`common/interview-data.js` 对外提供：

| 方法 | 用途 |
| --- | --- |
| `qaOfCat(cat)` | 取某分类下的全部问答 |
| `findQa(id)` | 按 id 查询，详情页使用 |
| `countQa(cat)` | 分类题量（不传 cat 返回总数） |
| `searchQa(keyword)` | 搜索题干、一句话回答、重点、详细答案与追问 |
| `randomQa(cat, excludeId)` | 随机一条，可限定分类并排除当前题 |
| `dailyQa()` | 每日一题，用日期做种子，同一天始终同一条 |
| `hotQa(n)` | 按热度取前 n 条 |

### 基础知识点

与问答分开维护的阅读型数据，放在 `common/knowledge.js`，共 **66 条**，11 个分类各 6 条：

```js
{
  id: 'js-closure',
  cat: 'js',
  title: '闭包',
  summary: '一句话总结',
  points: ['核心要点 1', '核心要点 2'],
  code: '可选，代码示例，深色代码块展示',
  tips: ['易错提醒 / 面试追问']
}
```

导出方法：`knowledgeOfCat(cat)` / `findKnowledge(id)` / `countKnowledge(cat)` / `searchKnowledge(keyword)`。

题库页的「问答 / 知识点」分段通过 `duck:bank-mode` 这个 Storage 值传递（首页「知识点」入口写入后 `switchTab`），页面内切换则直接改 `mode`。

### 阅读进度与打卡

打开任意一条问答即记为**已读**（`qa.vue` 的 `onLoad` 调 `recordAnswer(id, true)`）：

- 题库页分类卡显示「已读 X / N + 进度条」，列表项左侧编号变绿并标「已读」
- 首页「今日已读」按当天打开条数累计，达到 5 条视为完成每日目标
- 「我的」页展示累计阅读、已读进度、连续天数
- 「我的题单 → 已读记录」按最近打开顺序倒序列出

### 新增问答

1. 在 `common/bank/qa/` 下对应分类文件里追加一条对象，`id` 保持 `分类-序号` 递增；
2. `cat` 必须是 `common/interview-data.js` 的 `categories` 中的 id；
3. 新增分类时，在该文件建 `分类.js`，并在 `common/bank/index.js` 里补一行 import、在 `qaOrder` 与 `categories` 中各加一项。

本地存储 key：

| key | 内容 |
| --- | --- |
| `duck:favorites` | 收藏问答 id 数组 |
| `duck:records` | `{ [id]: 1 }`，已读的问答 id（值固定为 1） |
| `duck:daily` | 当日已读条数，用于今日目标 |
| `duck:streak` | 连续打卡天数 |
| `duck:bank-cat` | 首页点分类时暂存目标分类，题库页 `onShow` 读取 |
| `duck:bank-mode` | 首页「知识点」入口暂存分段模式（`know`），题库页 `onShow` 读取 |
| `duck:collect-tab` | 我的题单默认分段（`fav` / `read`） |

---

## 二次开发

- **换主题色**：只改 `uni.scss` 里的 `$duck-primary` 系列变量，页面样式全部引用变量
- **加分类**：在 `categories` 中追加一项（id / name / short / icon / bg / desc），其中 `short` 会渲染成首页的字母色块、题库页的胶囊标签
- **换数据源**：各分类问答集中在 `common/bank/qa/`，只要导出同结构的 `qaQuestions`，页面无需改动

---

## License

项目代码：MIT

题目清单与解析参考自 [面试鸭](https://www.mianshiya.com)，版权归原站及题目作者所有，本项目仅用于个人学习与面试准备。Python 分类题目清单对应[面试鸭 Python 面试题库](https://www.mianshiya.com/bank/1810643768400019458)。历史版本中的 JavaScript 选择题来自 [lydiahallie/javascript-questions](https://github.com/lydiahallie/javascript-questions)（MIT），声明保留在 [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md)。
