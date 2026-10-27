# 面试鸭后端（FastAPI）

前端 `前端面试鸭` 小程序的服务端：题库、搜索、收藏、错题、学习统计。

## 快速开始

```powershell
cd D:\code\front-mianshi\前端面试鸭\server

# 1) 安装依赖（首次）
.venv\Scripts\python.exe -m pip install -r requirements.txt

# 2) 启动（首次启动会自动建表 + 导入 553 道题）
.venv\Scripts\python.exe run.py
```

- API 文档：<http://127.0.0.1:8100/docs>
- 健康检查：<http://127.0.0.1:8100/health>

数据库是 SQLite（`server/data/app.db`），删掉文件重启即可重建。

## 目录结构

```
server/
├── app/
│   ├── main.py          create_app / lifespan / 异常处理 / 健康检查
│   ├── config.py        环境变量配置（pydantic-settings）
│   ├── obs.py           可观测性：结构化日志 / trace id / 指标
│   ├── db.py            engine / Session / get_db
│   ├── models.py        8 张表（内容 3 张 + 用户 5 张）
│   ├── schemas.py       请求响应模型（Pydantic）
│   ├── deps.py          token → 用户
│   ├── password.py      密码哈希（PBKDF2-HMAC-SHA256 + 随机盐，仅标准库）
│   ├── sms.py           手机验证码（落库 / 频控 / 一次性 / 错误次数上限）
│   ├── services.py      业务规则（统计口径、错题联动、打卡）
│   ├── seed.py          题库导入（幂等）
│   └── routers/
│       ├── auth.py      游客 / 账号密码 / 手机验证码 / 微信登录
│       ├── catalog.py   题库内容（只读）
│       └── practice.py  学习数据（需登录）
├── scripts/export-seed.mjs   从 common/ 导出题库 JSON
├── seed/                     questions / categories / knowledge
└── run.py
```

## 数据从哪来

题库存量在 `common/` 下（ES Module），后端用 Node 导出成 JSON 再入库：

```powershell
node --experimental-default-type=module scripts/export-seed.mjs
```

产出 `seed/questions.json`（553 题）、`categories.json`（11 类）、`knowledge.json`（66 条）。
**新增题目只要改前端 `common/bank/`，重跑一次导出，删掉 db 重启即可。**

## 接口一览

### 登录（公开）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/guest` | 游客登录，返回 token（联调首选） |
| POST | `/api/auth/login` | **账号密码登录 / 注册**，body `{account, password, nickname?}`；账号不存在即注册，密码错返回 400；请求头带游客 token 时会把游客数据合并过来 |
| POST | `/api/auth/phone/code` | 发送手机验证码，body `{phone}`；调试模式下响应里带 `debug_code` |
| POST | `/api/auth/phone` | 手机验证码登录，body `{phone, code, nickname?}` |
| POST | `/api/auth/wechat` | 微信登录，body `{code, nickname?, avatar?}`；请求头带游客 token 时会把游客数据合并过来 |
| GET | `/api/auth/me` | 当前用户（需 token），含 `is_guest` / `account` |
| PATCH | `/api/auth/me` | 修改昵称 / 头像，body `{nickname?, avatar?}` |

### 题库（公开，带 token 时返回个性化字段）

| 方法 | 路径 | 对应前端函数 |
|---|---|---|
| GET | `/api/home` | 首页聚合（daily + hot + categories + stats） |
| GET | `/api/categories` | `categories` + `countQa` |
| GET | `/api/questions?cat=&level=&page=&size=&sort=` | `qaOfCat` |
| GET | `/api/questions/{id}` | `findQa` + `indexOfQa`（prev/next） |
| GET | `/api/questions/daily` | `dailyQa` |
| GET | `/api/questions/hot?n=5` | `hotQa` |
| GET | `/api/questions/random?cat=&exclude=` | `randomQa` |
| GET | `/api/search?q=&cat=` | `searchQa` + `searchKnowledge` |
| GET | `/api/knowledge?cat=` | `knowledgeOfCat` |
| GET | `/api/knowledge/{id}` | `findKnowledge` |
| GET | `/api/catalog/mirror` | 题库镜像（分类 + 全部题目摘要 + 知识点摘要，约 110 KB） |

### 我的（全部需要 `Authorization: Bearer <token>`）

| 方法 | 路径 | 对应前端函数 |
|---|---|---|
| POST | `/api/me/records` | `recordAnswer(id, correct)` |
| GET | `/api/me/records?cat=` | `getRecords` |
| GET | `/api/me/favorites` | `getFavorites` |
| POST | `/api/me/favorites/{id}` | `toggleFavorite`（加入） |
| DELETE | `/api/me/favorites/{id}` | `toggleFavorite`（取消） |
| GET | `/api/me/wrongs` | `getWrongs` |
| DELETE | `/api/me/wrongs/{id}` | `removeWrong` |
| GET | `/api/me/stats` | `getStats(total)` |
| DELETE | `/api/me/progress` | `resetAll` |
| GET | `/api/me/summary` | 我的页聚合 |

## 业务规则（和前端本地版一致）

1. **答对自动移出错题本，答错自动进错题本** —— 不额外调接口
2. **只有首次作答才累加「今日进度」** —— 重复刷同一题不会灌水
3. **连续天数不落库，按日期现算** —— 避免前端存 `{last, days}` 漏更新算错
4. **收藏/错题唯一约束** —— 重复收藏返回 201 幂等，不会产生脏数据
5. **游客数据合并** —— 登录成功后把游客的收藏/错题取并集、记录按游客覆盖、打卡同日相加，合并完删除游客账号

## 前端接入（已完成）

前端已经从「本地 JSON + localStorage」切换为「后端接口 + 本地缓存」，
页面模板一行没改，只换了数据层。四个新文件：

```
common/
├── api.js              请求层：baseURL / token / 超时 / 重试 / 401 重登 / 错误归一
├── bootstrap.js        启动引导：登录 → 题库镜像 → 用户数据（失败静默，可离线）
├── question-source.js  题库镜像：同步读 + 后台刷新 + 详情按需拉取
└── user-store.js       用户数据：乐观更新 / 失败回滚 / 离线队列
```

### 为什么不是「全部改成 await」

页面里 `qaOfCat(cat).length`、`prev/next`、分类题量都在 computed 里同步取，
改成 async 要重写模板，翻页还会闪空白。所以按数据特性分了两层：

| 数据 | 特性 | 策略 |
|---|---|---|
| 题库目录（题号/标题/分类/热度） | 只读、变化慢 | **镜像**：启动读缓存 → 后台拉 `/api/catalog/mirror` → 版本号变了才替换 |
| 题目详情（要点/详解/扩展） | 大、按需 | **异步**：打开详情页 `await`，只放内存不落盘 |
| 收藏 / 错题 / 记录 / 统计 | 读写频繁、要即时反馈 | **乐观更新**：先改本地再上报，失败回滚，断网进队列 |

这是小程序最常见的一层设计（stale-while-revalidate），好处是：**首屏 0 请求、断网可用、联网自动追平**。

### 页面改了哪些

| 文件 | 改动 |
|---|---|
| `App.vue` | onLaunch 调 `bootstrap()`，不阻塞首屏 |
| `pages/interview/index/index.vue` | onShow 后 `ensureReady()` + `syncUserData()` 刷新一次视图 |
| `pages/interview/qa/qa.vue` | **真正异步**：先用镜像摘要渲染标题，再 `await fetchQaDetail()` 拉解析；收藏/已读变 await |
| `pages/interview/knowledge/knowledge.vue` | 同上，`await fetchKnowledgeDetail()` |
| `pages/interview/bank/bank.vue` | onShow 同步云端已读状态与题库版本 |
| `pages/interview/collect/collect.vue` | 收藏/已读来自服务端；取消收藏 `await` |
| `pages/interview/search/search.vue` | 本地先出结果 → 后端全文搜索覆盖（含 260ms 防抖 + 请求序号防竞态） |
| `pages/interview/mine/mine.vue` | 统计走云端；清空数据同时删服务端记录 |

`common/interview-data.js`、`interview-store.js`、`knowledge.js` 已标记 `@deprecated`，
只留给 `legacy/` 下的旧页面引用，不再被任何线上页面 import。

### 跑起来要注意两件事

1. **后端地址**：`common/api.js` 里的 `DEFAULT_BASE` 默认 `http://127.0.0.1:8100`。
   真机预览要改成电脑局域网 IP，或运行时调 `setBaseUrl('http://192.168.x.x:8100')`。
2. **小程序域名校验**：微信开发者工具 → 详情 → 本地设置 → 勾选
   「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」。
   正式发布必须换成 HTTPS 域名并在微信后台配置 `request 合法域名`。

### 数据迁移说明

老版本用户本地有 `duck:favorites` / `duck:records`，切到云端后这些数据不会自动上传。
如果要兼容，在 `bootstrap()` 里加一段「首次登录时把本地数据 POST 上去再清空」即可，
现在为了保持逻辑简单没有做（用户量还小，重新收藏成本很低）。

## 部署

```powershell
# 单机
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8100

# Nginx 反代（记得关缓冲，否则流式接口会攒包）
# proxy_pass http://127.0.0.1:8100;
# proxy_buffering off;
```

生产要改的：
- `CORS_ORIGINS` 写具体域名，别用 `*`
- 小程序要求 HTTPS 域名并在微信后台配置 `request 合法域名`
- SQLite 换 PostgreSQL：`DATABASE_URL=postgresql+psycopg://...`

## 可观测性

三件事都落在 `app/obs.py`，没有引入第三方依赖。

### 1. 结构化日志

每条日志一行 JSON，字段固定为 `ts / level / logger / msg`，加上本条事件的业务字段；
在请求里产生日志时自动带 `trace`。uvicorn 自己的日志也被收编成同样的格式。

```json
{"ts":"2026-10-27T11:08:52.782+08:00","level":"INFO","logger":"duck","msg":"http","trace":"rid-422-test","method":"POST","path":"/api/auth/login","status":422,"ms":1.8,"ip":"127.0.0.1","uid":null}
```

业务代码里埋点：

```python
from .obs import log_event

log_event("login_ok", uid=user.id, account=account)          # INFO
log_event("login_failed", level=logging.WARNING, account=account, reason="bad_password")
```

已经埋好的事件：`startup` / `shutdown` / `http` / `unhandled` / `bad_request` / `value_error`、
登录相关 `captcha_failed`、`login_ok`、`login_failed`、`register_ok`、`register_conflict`、
`guest_login`、`phone_login_ok`、`wechat_failed`，短信 `sms_debug_send`、`sms_verify_failed`，
迁移 `migrate_add_column`、`migrate_index_failed`。

日志级别由 `LOG_LEVEL` 控制（默认 INFO）。`/health`、`/metrics` 正常时只记 DEBUG，
被监控频繁探测也不会淹没业务日志；超过 `SLOW_REQUEST_MS`（默认 500）的请求升为 WARNING 并标 `slow=true`。

### 2. 请求追踪

```
客户端（可带 X-Request-ID）→ nginx（没带就用内置 $request_id 生成）→ FastAPI
                                                                   ↓
                                        响应头 X-Request-ID / X-Response-Time 原样返回
```

遇到 500/422 时响应体里会带 `trace_id`，用户截图发过来就能反查：

```bash
journalctl -u duck-api -o cat | grep '"trace": "rid-422-test"'
grep 'rid=rid-422-test' /var/log/nginx/duck-api.log
```

nginx 访问日志字段：`status / body_bytes_sent / rt（总耗时）/ urt（上游耗时）/ rid / urid / ua`。
`rt` 与 `urt` 差得大，说明时间花在 nginx 而不是应用；`urid` 为空说明请求没到应用。

### 3. 运行指标与健康检查

| 接口 | 用途 |
|---|---|
| `GET /health` | 深度检查：数据库连通性 + 延迟 + 题目数；库不通返回 503 `status=degraded` |
| `GET /health/live` | 存活检查，不查库，适合 systemd / 容器探针 |
| `GET /metrics` | Prometheus 文本格式 |

```
duck_http_requests_total{method="GET",path="/api/auth/captcha",status="200"} 12
duck_http_request_duration_seconds_sum{...} 0.031
duck_http_requests_in_flight 1
duck_uptime_seconds 3600
```

指标里的 `path` 用的是路由模板（`/api/questions/{qid}`），未匹配路由统一归到 `__unmatched__`，
不会因为扫描器随机路径把标签撑爆。

### 常用排查命令

```bash
# 最近 50 条，去掉 journald 前缀直接看 JSON
journalctl -u duck-api -o cat -n 50

# 只看错误
journalctl -u duck-api -o cat -p err -n 20

# 实时跟
journalctl -u duck-api -o cat -f

# 慢请求
journalctl -u duck-api -o cat | grep '"slow": true'

# 健康与指标
curl -s https://zttzmy.top/health | jq
curl -s http://127.0.0.1:8100/metrics

# nginx 侧：按 trace 找请求
grep 'rid=<trace>' /var/log/nginx/duck-api.log
```

## 下一步可做

- 题目列表接入 Redis 缓存（题库几乎不变，命中率极高）
- 搜索换 SQLite FTS5 或 Meilisearch（现在用 LIKE，553 题够用，上万题会慢）
- 每日打卡排行榜（`daily_stats` 已有基础数据）
- 管理端接口（增删改题，加一个 ADMIN token 即可）
