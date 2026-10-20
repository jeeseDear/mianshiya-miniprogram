/**
 * 题库 · HTML 补充（html-016 ~ html-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('html', [
	['016', 1, 84, '`<!DOCTYPE html>` 的作用是？', [
		'告诉浏览器用标准模式解析文档，避免进入怪异模式',
		'声明页面编码',
		'引入 HTML5 的 JS 库',
		'定义页面语言'
	], ['A'], 'DOCTYPE 必须写在文档最前面，浏览器据此选择标准模式（standards mode）；缺失或写错会进入 quirks mode，盒模型、行高等渲染规则都会偏差。\n\nHTML5 的写法极简，只需 `<!DOCTYPE html>`。'],

	['017', 1, 82, '移动端常用的 viewport 配置是？', [
		'`<meta name="viewport" content="width=device-width, initial-scale=1">`',
		'`<meta name="viewport" content="width=750">`',
		'`<meta charset="viewport">`',
		'`<meta name="screen" content="mobile">`'
	], ['A'], '`width=device-width` 让布局视口等于设备宽度，`initial-scale=1` 设置初始缩放，是响应式页面的标准配置。\n\n固定 `width=750` 是老式等比缩放方案，会破坏可访问性（用户无法正常缩放）。'],

	['018', 2, 88, '`<script defer>` 与 `<script async>` 的区别是？', [
		'defer 延迟到文档解析完成后按顺序执行；async 下载完立即执行，顺序不确定',
		'async 会阻塞解析，defer 不会',
		'两者都会阻塞解析',
		'defer 只能用于外链 CSS'
	], ['A'], '两者都会异步下载、不阻塞 HTML 解析；区别在执行时机：defer 在 DOMContentLoaded 前按文档顺序执行，适合有依赖关系的脚本；async 下载完就执行，适合统计、广告等独立脚本。\n\n普通 `<script>` 则会阻塞解析。'],

	['019', 2, 80, '`rel="preload"` 与 `rel="prefetch"` 的区别是？', [
		'preload 提前加载当前页面马上要用的高优先级资源；prefetch 预取未来导航可能用到的低优先级资源',
		'两者完全一样',
		'prefetch 会阻塞渲染',
		'preload 只能用于图片'
	], ['A'], 'preload 用于当前页关键资源（字体、首屏图、核心 CSS/JS），需配合 `as` 指定类型；prefetch 是空闲时预取下一跳资源，放入缓存备用。\n\n滥用 preload 会抢占带宽，反而拖慢首屏。'],

	['020', 2, 78, '`<img srcset="a.jpg 1x, b.jpg 2x">` 的作用是？', [
		'让浏览器按设备像素比选择合适清晰度的图片',
		'设置图片轮播',
		'设置图片懒加载',
		'设置图片备用地址'
	], ['A'], 'srcset 让浏览器根据 DPR、视口宽度选择最合适的候选图，避免在高分屏上模糊或在低分屏上浪费流量。\n\n配合 `sizes` 可声明不同视口下的显示宽度，浏览器据此计算需要的资源。'],

	['021', 2, 76, '想为同一张图提供 WebP 与 JPG 两种格式并按浏览器能力选择，应该用？', [
		'`<picture>` + `<source type="image/webp">` + `<img>`',
		'只写 `<img src="a.webp">`',
		'用 CSS background 切换',
		'用 JS 判断 UA 后换 src'
	], ['A'], 'picture 里的 source 按顺序匹配，浏览器不支持某个 type 就跳过，最后回退到 img（img 是必需的，也承载 alt 与可访问性）。\n\nJS 判断 UA 既不可靠也不利于首屏。'],

	['022', 2, 82, '`<label for="agree">` 中 for 的作用是？', [
		'关联表单控件，点击文字即可聚焦/切换对应控件',
		'设置标签宽度',
		'声明标签的编号',
		'引入外部文件'
	], ['A'], 'for 的值等于控件的 id，点击 label 就会把焦点或点击传递给控件，显著提升移动端与无障碍体验。\n\n另一种写法是把控件直接嵌套在 label 内部，此时 for 可省略。'],

	['023', 2, 74, '`<input type="email">` 的主要作用是？', [
		'移动端弹出带 @ 的键盘，并在表单提交时做基本格式校验',
		'自动补全邮箱地址',
		'把输入内容加密',
		'验证邮箱是否真实存在'
	], ['A'], '语义化 type 会改变键盘布局与内置校验，但校验很宽松（只查基本格式），不能替代服务端校验，也无法验证邮箱真实性。\n\n配合 `required`、`pattern` 可增强，或用 `novalidate` 关闭原生提示改自定义校验。'],

	['024', 2, 68, '表单加 `novalidate` 属性的效果是？', [
		'关闭浏览器原生校验提示，交给 JS 自定义校验',
		'禁止提交表单',
		'清除所有输入值',
		'把表单设为只读'
	], ['A'], 'novalidate 让提交时跳过浏览器内置校验气泡，便于统一 UI 风格的错误提示；校验逻辑需自己实现（如调用 checkValidity 逐项判断）。\n\n按钮上的 formnovalidate 只对单次提交生效。'],

	['025', 2, 68, '`<datalist>` 的作用是？', [
		'为输入框提供可选建议列表，用户仍可自由输入',
		'创建下拉选择框（不可输入）',
		'存储本地数据',
		'定义表格列'
	], ['A'], 'datalist 通过 input 的 list 属性关联，提供自动补全建议但允许任意值，区别于 select 的强制选择。\n\n各浏览器样式差异较大，定制化要求高时通常自己实现。'],

	['026', 1, 70, '`<details>` 与 `<summary>` 组合的作用是？', [
		'实现原生可折叠面板，summary 是标题，展开内容为其余子元素',
		'实现弹窗',
		'实现选项卡',
		'实现进度条'
	], ['A'], '这是原生折叠组件，点击 summary 切换 open 状态，无需 JS，且自带可访问性语义。\n\n可监听 toggle 事件，用 `details[open]` 定制样式。'],

	['027', 2, 72, '`<dialog>` 的 `showModal()` 与 `show()` 的区别是？', [
		'showModal 打开模态框，带 ::backdrop 遮罩并锁定焦点与背景交互；show 只是非模态显示',
		'两者完全一样',
		'show 会全屏显示',
		'showModal 只能打开一次'
	], ['A'], 'showModal 会进入「顶层」并形成模态，按 Esc 可关闭（可 preventDefault 阻止），背景元素不可交互；show 则像普通定位元素。\n\n关闭用 `close(value)`，关掉时触发 close 事件并可读 returnValue。'],

	['028', 2, 72, '`<template>` 标签的特点是？', [
		'内容不会被渲染或执行，只作为可复用的片段供 JS 克隆使用',
		'内容会直接渲染但隐藏',
		'只能存放文本',
		'必须配合 iframe 使用'
	], ['A'], 'template 内部是惰性文档片段，图片不会加载、脚本不会执行，通过 `content.cloneNode(true)` 取用。\n\n它是 Web Components 的标准搭档，性能优于字符串拼接 innerHTML。'],

	['029', 3, 76, 'Shadow DOM 的主要价值是？', [
		'样式与结构封装，内部样式不外泄、外部选择器也不易穿透',
		'提升渲染速度',
		'替代 iframe 加载页面',
		'实现服务端渲染'
	], ['A'], 'Shadow DOM 提供 DOM 与样式的作用域隔离，是 Web Components 封装的基础；对外通过 slot 分发内容，通过 CSS 自定义属性或 ::part 有限穿透。\n\n注意它并不隔离 JS 全局作用域。'],

	['030', 2, 80, 'canvas 与 svg 的核心差别是？', [
		'canvas 是位图逐像素绘制，适合大量图形与像素操作；svg 是矢量 DOM，可被 CSS/JS 单独操作且缩放不失真',
		'svg 不能做动画',
		'canvas 是矢量图',
		'两者完全等价'
	], ['A'], 'canvas 绘制完即「忘记」图形，交互要靠坐标命中测试，适合游戏、图表大数据量场景；svg 每个图形都是 DOM 节点，天然支持事件、CSS 与无障碍，适合图标、流程图。\n\n图表库常提供两种渲染器就是基于这个取舍。'],

	['031', 3, 78, '`<iframe sandbox>` 的作用是？', [
		'对嵌入内容施加限制（禁止脚本、表单、同源访问等），需显式开启相应权限',
		'让 iframe 全屏显示',
		'自动调整 iframe 高度',
		'禁止 iframe 加载跨域资源'
	], ['A'], 'sandbox 默认禁用脚本、表单提交、弹窗、同源访问等，通过 `allow-scripts`、`allow-same-origin` 等逐项放开。\n\n注意同时加 allow-scripts 与 allow-same-origin 会让沙箱基本失效，需谨慎评估。'],

	['032', 1, 74, '读取 `data-user-id` 属性值的正确方式是？', [
		'`el.dataset.userId`',
		'`el.data.userId`',
		'`el.attribute.userId`',
		'`el.get("data-user-id")`'
	], ['A'], 'data-* 通过 dataset 访问，连字符命名会转成驼峰（data-user-id → userId）。\n\n写入用 `el.dataset.userId = "1"`，也可以用 `getAttribute("data-user-id")`，后者保留原始命名。'],

	['033', 2, 80, 'localStorage、sessionStorage、cookie 的区别是？', [
		'前两者容量约 5MB 且不发往服务器，localStorage 长期有效、sessionStorage 关闭标签页即清；cookie 约 4KB 且随请求自动携带',
		'三者完全一样',
		'cookie 容量最大',
		'sessionStorage 会随每次请求发送'
	], ['A'], '存储型 API 只在客户端，适合缓存与偏好设置；cookie 会随同源请求自动发送，因此适合会话标识，但要注意体积与安全属性。\n\nIndexedDB 则适合大容量结构化数据。'],

	['034', 3, 76, 'Cookie 的 `HttpOnly` 属性作用是？', [
		'禁止 JS 通过 document.cookie 读取，降低 XSS 窃取风险',
		'只在 HTTPS 下发送',
		'禁止跨域发送',
		'设置过期时间'
	], ['A'], 'HttpOnly 只对脚本读取做限制，请求仍会携带；Secure 管 HTTPS、SameSite 管跨站携带、Max-Age/Expires 管有效期。\n\n会话 token 应同时设置 HttpOnly + Secure + SameSite。'],

	['035', 2, 70, '表格中 `<thead>`、`<tbody>`、`<tfoot>` 的意义是？', [
		'划分表头、主体、表尾结构，便于样式控制、无障碍朗读与打印分页',
		'仅用于设置背景色',
		'可以替代 table 标签',
		'必须三个同时出现'
	], ['A'], '语义分组让屏幕阅读器能正确关联表头与单元格，也让长表格打印时表头可重复（thead 默认重复）。\n\n数据表格还应配合 `<th scope="col">` 与 caption。'],

	['036', 2, 72, '`<article>` 与 `<section>` 的使用区别是？', [
		'article 表示可独立分发的内容单元（如文章、评论）；section 表示文档中的主题分区',
		'两者完全等价',
		'section 只能用于导航',
		'article 必须包含标题才合法'
	], ['A'], '判断标准是「这块内容单独拿出去是否仍然成立」，成立用 article；只是想分组一段主题内容用 section，且 section 通常应带标题。\n\n纯样式分组用 div 即可，不必强行语义化。'],

	['037', 2, 74, '`tabindex="-1"` 的效果是？', [
		'元素可被 JS 聚焦，但不进入 Tab 键的默认顺序',
		'元素不可聚焦',
		'元素排到 Tab 顺序最前',
		'元素自动获得焦点'
	], ['A'], 'tabindex=0 表示按文档顺序进入 Tab 序列；-1 表示只能通过脚本或点击聚焦（弹窗把焦点移入容器时常用）；大于 0 会打乱自然顺序，不推荐。\n\n配合 `:focus-visible` 保留键盘可见焦点样式。'],

	['038', 3, 72, '`aria-label` 的适用场景是？', [
		'元素没有可见文本时，为可访问名称提供说明，如纯图标按钮',
		'给所有元素加提示文字',
		'设置元素宽度',
		'定义表单校验规则'
	], ['A'], 'aria-label 会覆盖元素的可访问名称，图标按钮应写 `aria-label="搜索"`。\n\n若已有可见文本，应使用 aria-labelledby 或直接依赖文本，避免两套文案不一致。'],

	['039', 1, 64, '`<html lang="zh-CN">` 的作用是？', [
		'声明页面语言，影响屏幕阅读器发音、断词换行与翻译提示',
		'设置字符编码',
		'设置时区',
		'声明文档版本'
	], ['A'], 'lang 帮助辅助技术与搜索引擎识别语言，也影响 CSS 的 `:lang()` 与断词规则。\n\n字符编码由 `<meta charset="utf-8">` 负责，两者不要混淆。'],

	['040', 1, 78, '关于图片的 alt 属性，正确的做法是？', [
		'有意义的图片写简洁描述，纯装饰图片写空 alt 让屏幕阅读器跳过',
		'所有图片都写 alt="图片"',
		'alt 可以完全省略',
		'alt 用于设置图片标题样式'
	], ['A'], 'alt 是图片的替代文本，图像加载失败或读屏时使用；装饰性图片应写 `alt=""`（不要省略，省略会被朗读文件名）。\n\n复杂图表还需补充文字说明或 aria-describedby。'],

	['041', 2, 66, 'PWA 中 `manifest.json` 的作用是？', [
		'声明应用名称、图标、启动方式、主题色等，使网页可被安装到桌面',
		'缓存静态资源',
		'定义路由',
		'压缩图片'
	], ['A'], 'manifest 提供安装所需元数据（name、icons、start_url、display），真正的离线能力由 Service Worker 提供。\n\n两者配合才能达到可安装 + 可离线的 PWA 体验。'],

	['042', 2, 68, '`<link rel="preconnect" href="https://cdn.example.com">` 的作用是？', [
		'提前与目标域建立 TCP/TLS 连接，减少后续请求的握手耗时',
		'预加载具体资源文件',
		'设置跨域策略',
		'预渲染整个页面'
	], ['A'], 'preconnect 只做连接预热（DNS + TCP + TLS），适合确定会用到的第三方域；dns-prefetch 更轻量只解析 DNS，prerender 则提前渲染整页。\n\n对域名数量要做控制，过多反而浪费资源。'],

	['043', 2, 70, '`<video preload="metadata">` 的含义是？', [
		'只预加载时长、尺寸等元数据，不下载完整视频',
		'预加载全部视频内容',
		'不加载任何数据',
		'自动播放视频'
	], ['A'], 'preload 可选 none / metadata / auto，metadata 能在展示首帧和时长信息的同时节省流量。\n\n自动播放还需要 muted + playsinline 才能在现代浏览器生效。'],

	['044', 2, 66, '`<fieldset>` + `<legend>` 的组合用于？', [
		'把一组相关表单控件分组，并用 legend 提供组标题',
		'实现表格布局',
		'设置输入框占位符',
		'创建折叠面板'
	], ['A'], '语义分组有助于读屏用户理解「这一组是收货信息」这类上下文，禁用 fieldset 还能一次性禁用组内控件。\n\n注意 fieldset 默认样式较丑，通常需要重置 border 与 padding。'],

	['045', 2, 64, '`<progress>` 与 `<meter>` 的区别是？', [
		'progress 表示任务完成进度，meter 表示已知范围内的标量测量值（如磁盘占用）',
		'两者完全一样',
		'meter 用于上传进度',
		'progress 只能用于视频'
	], ['A'], 'progress 用于「还没完成的任务」（可 indeterminate），meter 用于「已经确定的量」并支持 low/high/optimum 语义着色。\n\n都需要提供文本兜底内容以兼容旧环境。'],

	['046', 2, 66, '给登录表单加 `autocomplete="username"` 和 `current-password"` 的收益是？', [
		'让浏览器与密码管理器正确识别字段，实现自动填充',
		'提升输入框性能',
		'强制校验密码强度',
		'禁止复制粘贴'
	], ['A'], '正确的 autocomplete 语义让浏览器知道该填什么，显著提升登录转化；注册场景用 new-password，验证码用 one-time-code。\n\n错误使用会污染自动填充结果。'],

	['047', 3, 62, 'iframe 的 `srcdoc` 属性用于？', [
		'直接在属性里写入 HTML 字符串作为 iframe 内容',
		'设置 iframe 的源站白名单',
		'设置 iframe 的滚动行为',
		'定义 iframe 的加载优先级'
	], ['A'], 'srcdoc 覆盖 src，用内联 HTML 渲染，常用于沙箱预览、富文本隔离渲染。\n\n注意仍需处理转义与 sandbox 权限，避免注入风险。'],

	['048', 2, 74, '`history.pushState()` 的特点是？', [
		'修改地址栏并写入历史记录，但不触发页面刷新，也不触发 popstate',
		'会刷新页面',
		'会触发 popstate 事件',
		'只能修改 hash'
	], ['A'], 'pushState/replaceState 只更新会话历史与 URL，路由需要自己根据 state 渲染；前进后退时才触发 popstate。\n\n这也是 SPA 路由的基础，需配合服务端 fallback 避免刷新 404。'],

	['049', 3, 64, '自定义元素 `customElements.define("my-card", MyCard)` 时，标签名的要求是？', [
		'必须包含连字符，且不能是保留标签名',
		'必须全大写',
		'必须以 x- 开头',
		'可以是任意单词'
	], ['A'], '规范要求自定义元素名必须含连字符（kebab-case），以区分未来原生标签；同时不能是已被占用的名字。\n\n元素类通常继承 HTMLElement 并实现 connectedCallback 等生命周期。'],

	['050', 2, 76, '为什么把 `<script>` 放在 `</body>` 前或使用 defer？', [
		'避免脚本下载与执行阻塞 HTML 解析，减少首屏白屏',
		'为了让脚本更早执行',
		'为了避免跨域问题',
		'为了减少 HTTP 请求数'
	], ['A'], '解析器遇到普通 script 会停下等待下载执行，若脚本依赖的 DOM 尚未解析完还可能报错。放到末尾或加 defer 既避免阻塞又能保证 DOM 就绪。\n\n现代工程通常用 module 脚本，默认就是 defer 行为。']
])
