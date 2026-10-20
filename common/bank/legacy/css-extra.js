/**
 * 题库 · CSS 补充（css-016 ~ css-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('css', [
	['016', 1, 90, '`#nav .item` 与 `.nav .item.active` 哪个优先级更高？', [
		'`#nav .item`（含一个 id 选择器）',
		'`.nav .item.active`（三个类选择器）',
		'一样高',
		'无法比较，取决于书写顺序'
	], ['A'], '权重按 (id, class/属性/伪类, 标签/伪元素) 三元组比较，id 的权重高于任意数量的类。所以 (1,1,0) 大于 (0,3,0)。\n\n同级权重才比较书写顺序，后写的覆盖先写的；`!important` 会打破常规层叠顺序，应尽量避免。'],

	['017', 1, 84, '`::before` 伪元素不显示内容，最常见的原因是？', [
		'没有设置 content 属性',
		'没有设置 display',
		'伪元素必须配合 JS 使用',
		'没有设置 z-index'
	], ['A'], '`::before`/`::after` 必须声明 `content`（哪怕是空字符串 `content: ""`）才会生成盒子，否则整条规则不生效。\n\n它们默认是行内元素，做图形时常需 `display: block` 或 `inline-block` 并给宽高。'],

	['018', 2, 82, '`position: sticky` 不生效，最可能的原因是？', [
		'祖先元素设置了 overflow: hidden/auto/scroll，把滚动容器换掉了',
		'没有设置 z-index',
		'元素必须是 flex 子项',
		'sticky 只能在 body 上使用'
	], ['A'], 'sticky 的吸附参照是最近的滚动祖先，任何祖先出现 overflow 非 visible 都会让它以那个祖先为滚动容器，从而看起来「不粘」。\n\n此外还需要设置 top/bottom/left/right 中的至少一个，且父容器高度必须大于元素本身。'],

	['019', 2, 86, '`z-index` 在什么情况下会失效？', [
		'元素是 static 定位且不在 flex/grid 子项等会创建层叠上下文的位置',
		'元素没有设置背景色',
		'元素是块级元素',
		'元素设置了 margin'
	], ['A'], 'z-index 只对「定位元素（relative/absolute/fixed/sticky）」或 flex/grid 子项等生效，static 元素上写了也没用。\n\n另一个常见误区：子元素 z-index 再大也跳不出父级层叠上下文，父级层级低就会整体被压住。'],

	['020', 2, 88, '`flex: 1` 等价于？', [
		'`flex-grow: 1; flex-shrink: 1; flex-basis: 0%`',
		'`flex-grow: 1; flex-shrink: 0; flex-basis: auto`',
		'`width: 100%`',
		'`flex-grow: 0; flex-shrink: 1; flex-basis: auto`'
	], ['A'], '`flex: 1` 展开为 `1 1 0%`，基准为 0 后按比例分配剩余空间，所以各项宽度趋于均分。\n\n`flex: auto` 是 `1 1 auto`（以内容宽度为基准），`flex: none` 是 `0 0 auto`（不伸不缩）。'],

	['021', 2, 78, 'flex 子项同时设置了 `width` 和 `flex-basis`，谁优先？', [
		'`flex-basis` 优先（非 auto 时）',
		'`width` 优先',
		'两者相加',
		'由浏览器随机决定'
	], ['A'], '在 flex 布局主轴方向上，`flex-basis` 不为 auto 时作为初始主轴尺寸，会覆盖 width；只有 basis 为 auto 时才回退到 width。\n\n这也是为什么给 flex 子项设 width 有时「没反应」。'],

	['022', 2, 80, 'Grid 中的 `1fr` 表示？', [
		'剩余空间的一份',
		'固定 1 像素',
		'父容器的 1%',
		'内容的 1 倍'
	], ['A'], 'fr 是弹性系数，分配剩余空间（扣除固定尺寸与 gap 后）。`1fr 2fr` 表示后者占两份。\n\n`minmax(200px, 1fr)` 可避免内容过窄被压扁，`auto-fill` + `minmax` 能实现响应式卡片网格。'],

	['023', 2, 84, '关于外边距塌陷（margin collapse），正确的是？', [
		'相邻兄弟或父子（中间无 border/padding/内容）的垂直 margin 会合并，取较大值',
		'水平 margin 也会塌陷',
		'只有 flex 容器内会塌陷',
		'塌陷后取两者之和'
	], ['A'], '塌陷只发生在垂直方向、且仅在普通流的块级盒子之间；合并规则是取较大值（一正一负则相加）。\n\nBFC 容器、flex/grid 子项、float、绝对定位、overflow 非 visible 都能阻止父子塌陷。'],

	['024', 2, 82, '下列哪种方式能创建 BFC？', [
		'`display: flow-root`（或 overflow 非 visible、float、绝对定位等）',
		'`display: inline`',
		'`margin: 0 auto`',
		'`text-align: center`'
	], ['A'], '`display: flow-root` 是最干净的 BFC 创建方式，不带来副作用；overflow: hidden 也能创建但会裁剪溢出内容。\n\nBFC 能阻止 margin 塌陷、包住浮动子元素、避免被浮动元素覆盖。'],

	['025', 1, 84, '绝对定位元素水平垂直居中的常用写法是？', [
		'`left: 50%; top: 50%; transform: translate(-50%, -50%)`',
		'`margin: auto`',
		'`left: 50%; top: 50%` 即可',
		'`display: inline-block`'
	], ['A'], '先让左上角到容器中心，再用 translate 按自身宽高回退一半，因此不依赖元素尺寸。\n\n其他方案：`inset: 0; margin: auto`（需固定宽高）、flex/grid 的居中属性。'],

	['026', 3, 76, '移动端实现 1px 细边框（物理像素）的常用方案是？', [
		'伪元素设 `height: 1px` 加 `transform: scaleY(0.5)`',
		'直接写 `border: 0.5px`（所有机型都精确）',
		'用 `box-shadow` 模拟',
		'用 `outline` 模拟'
	], ['A'], '0.5px 在部分低端安卓机上会被渲染成 1px 或 0px，不稳定；用伪元素画 1px 再缩放 0.5 倍是兼容性最好的方案。\n\n也可用 `box-shadow: 0 0 0 0.5px` 或 `border-image`，但都有各自的限制。'],

	['027', 1, 80, '`rem` 相对于什么计算？', [
		'根元素（html）的 font-size',
		'父元素的 font-size',
		'浏览器默认 16px，不可更改',
		'视口宽度'
	], ['A'], 'rem = root em，始终以 html 的字号为基准，因此改 `html { font-size }` 就能整体缩放。\n\n`em` 才相对当前元素（或父元素）字号，嵌套时容易层层放大。'],

	['028', 2, 74, '移动端用 `height: 100vh` 做全屏时常见的问题是？', [
		'浏览器地址栏收起/展开会改变可视高度，导致内容被截断，建议改用 dvh 或 JS 计算',
		'vh 在 iOS 上不支持',
		'vh 会触发重排',
		'vh 不能与 flex 一起使用'
	], ['A'], '传统 vh 以「最大视口」为基准，地址栏出现时底部会被挡住。CSS 新增的 `svh/lvh/dvh` 分别对应最小、最大与动态视口高度，`100dvh` 能跟随工具栏变化。\n\n兜底方案是用 JS 监听 resize 写入 CSS 变量。'],

	['029', 2, 78, '下列哪个属性会创建新的层叠上下文？', [
		'`transform`、`filter`、`opacity` 小于 1、`will-change` 指定相关属性等',
		'`color`',
		'`margin`',
		'`font-weight`'
	], ['A'], '除了「定位 + z-index」之外，transform/filter/opacity/perspective/contain/isolation 等也会创建层叠上下文，导致子元素的 z-index 只在该上下文内比较。\n\n调试层级问题时先检查父级是否无意中创建了上下文。'],

	['030', 2, 80, '`transition` 与 `animation` 的区别是？', [
		'transition 需要状态变化触发、只能定义首尾两帧；animation 可自动播放、支持多关键帧与循环',
		'animation 不能做循环',
		'transition 支持 keyframes',
		'两者完全相同'
	], ['A'], 'transition 是「属性变化的补间」，必须由 hover、类名切换等触发，且只描述 from→to；animation 用 @keyframes 描述多阶段，可通过 animation-iteration-count 循环、direction 反向。\n\n性能上都优先动 transform/opacity，避免触发布局。'],

	['031', 3, 70, '关于 `will-change`，正确的用法是？', [
		'只在确实需要优化的动画元素上提前声明，动画结束后移除，滥用会占用大量内存',
		'给所有元素都加上可以提升性能',
		'它可以替代 transform',
		'它会让元素变成块级'
	], ['A'], 'will-change 提示浏览器提前提升图层，但每个图层都消耗显存，元素多了反而掉帧。\n\n最佳实践是「动画开始前加、结束后移除」，或干脆用 transform: translateZ(0) 这类等价手段。'],

	['032', 3, 72, '`:is()` 与 `:where()` 的差别是？', [
		'`:where()` 自身权重为 0，`:is()` 取参数中最高的权重',
		'两者权重相同',
		'`:is()` 权重为 0',
		'`:where()` 不能嵌套选择器'
	], ['A'], '两者都做「匹配任一」的简化书写，但 where 不参与权重计算，适合写基础样式与重置样式；is 会把参数里的最高权重带入。\n\n例如 `:where(.card) p` 权重只有 p 的 (0,0,1)，方便业务样式覆盖。'],

	['033', 2, 72, '在 flex 容器中使用 `gap` 的效果是？', [
		'在子项之间生成间距，不影响首尾外边距（现代浏览器已支持）',
		'只能用于 grid',
		'会替代 padding',
		'会让子项换行'
	], ['A'], 'flex 的 gap 在主流浏览器已全面支持，比给子项加 margin 再处理首尾更干净。\n\n多行 flex 时 `row-gap` 与 `column-gap` 可分别设置，注意老版本 Safari 需要前缀或降级方案。'],

	['034', 2, 74, '`aspect-ratio: 16 / 9` 的作用是？', [
		'让元素保持固定宽高比，宽度变化时高度自动跟随',
		'设置背景图比例',
		'设置字体缩放比例',
		'设置网格列比例'
	], ['A'], 'aspect-ratio 让盒子按比例计算缺失的那一边，配合 `width: 100%` 即可做自适应视频/图片容器。\n\n替代了过去的 padding-top 百分比 hack，且不会被内容撑破（可配合 object-fit）。'],

	['035', 2, 78, '`object-fit: cover` 与 `contain` 的区别是？', [
		'cover 填满容器并裁剪溢出部分，contain 完整显示图片可能留白',
		'两者效果相同',
		'cover 会拉伸变形',
		'contain 会裁剪图片'
	], ['A'], 'cover 保持比例铺满，超出部分裁掉，适合头像与卡片封面；contain 保持比例完整显示，可能出现留白，适合查看完整图像。\n\n两者都需要给 img 明确的宽高，否则无从计算。'],

	['036', 3, 70, '`backdrop-filter: blur(10px)` 生效的前提是？', [
		'元素自身背景必须是半透明或透明的，否则看不到背后的模糊效果',
		'必须配合 position: fixed',
		'必须设置 z-index',
		'必须有 border-radius'
	], ['A'], 'backdrop-filter 模糊的是元素「背后」的区域，若自身背景完全不透明就会把模糊结果盖住，所以通常配合 `background: rgba(255,255,255,.6)`。\n\n常用于毛玻璃导航栏、弹窗蒙层。'],

	['037', 2, 70, '`clip-path: circle(50%)` 的效果是？', [
		'把元素裁剪成圆形，未命中区域不显示也不响应点击',
		'给元素加圆形边框',
		'把元素缩放成一半',
		'设置圆形阴影'
	], ['A'], 'clip-path 按几何形状裁剪渲染区域，支持 circle、ellipse、polygon、path 等，可做异形卡片与动画过渡。\n\n相比 border-radius，clip-path 能裁出不规则形状，但裁剪区域外的部分不接收事件。'],

	['038', 2, 76, 'CSS 变量 `color: var(--brand, #00b578)` 中的第二个参数是？', [
		'兜底值，变量未定义时使用',
		'第二个变量名',
		'透明度',
		'权重大小'
	], ['A'], 'var() 支持兜底值，`--brand` 未定义或值非法时退回 `#00b578`，避免整条声明失效。\n\n注意变量本身不参与类型校验，非法值会在使用处导致属性被丢弃。'],

	['039', 2, 66, '`@supports (display: grid) { ... }` 的作用是？', [
		'特性检测，仅在浏览器支持该声明时应用内部样式',
		'定义网格列',
		'引入外部样式表',
		'声明浏览器前缀'
	], ['A'], '@supports 做 CSS 层面的特性检测，可实现渐进增强/优雅降级，比 UA 嗅探更可靠。\n\n常配合 `not` 使用：`@supports not (gap: 1rem)` 写降级分支。'],

	['040', 3, 68, '`@layer` 层叠层的优先级规则是？', [
		'未分层的样式优先于任何分层样式，分层之间按声明顺序后者优先',
		'分层样式总是优先',
		'按选择器权重决定，与分层无关',
		'按文件大小决定'
	], ['A'], '@layer 让作者可以显式管理层叠顺序：先声明的层优先级更低，未分层的常规样式优先级最高（便于业务覆盖基础库）。\n\n层内的选择器权重仍然生效，只是在层之间先比较层顺序。'],

	['041', 3, 66, '使用 `@container` 做容器查询，父元素需要先设置什么？', [
		'`container-type: inline-size`（或 size）',
		'`position: relative`',
		'`overflow: hidden`',
		'`display: flex`'
	], ['A'], '容器查询以最近的「容器上下文」为参照，父元素必须声明 container-type（inline-size 按宽度查询，size 需要确定高度）。\n\n它让组件根据自身可用宽度自适应，比媒体查询更适合组件化场景。'],

	['042', 2, 66, '`margin-inline-start` 属于什么类型的属性？', [
		'逻辑属性，会根据书写方向自动映射到 left/right',
		'盒模型属性',
		'网格属性',
		'动画属性'
	], ['A'], '逻辑属性用 inline/block 描述方向，ltr 下 inline-start 是左，rtl 下自动变成右，适合国际化布局。\n\n同类还有 padding-block-end、inset-inline 等。'],

	['043', 2, 74, '`font-size: clamp(14px, 2.5vw, 20px)` 的含义是？', [
		'在 14px 到 20px 之间取值，优先使用 2.5vw',
		'固定 2.5vw',
		'取三者最大值',
		'取三者平均值'
	], ['A'], 'clamp(最小值, 首选值, 最大值) 把首选值夹在区间内，可实现无需媒体查询的流式字号，避免小屏字太小、大屏字太大。\n\n等价写法是 `max(14px, min(2.5vw, 20px))`。'],

	['044', 2, 68, '自定义字体加载时，`font-display: swap` 的作用是？', [
		'先用系统字体立即显示文本，字体加载完成后再替换，避免文字长时间不可见',
		'禁止加载字体',
		'强制阻塞渲染直到字体就绪',
		'只加载首屏字符'
	], ['A'], '默认行为（auto/block）可能导致 FOIT——文字空白等待字体；swap 先渲染后备字体（FOUT），保证内容可见性。\n\n对品牌字体可配合 preload 减少切换闪烁。'],

	['045', 2, 72, '清除浮动最常用的 clearfix 写法是？', [
		'父元素 `::after { content: ""; display: block; clear: both }`',
		'给父元素加 `overflow: visible`',
		'给子元素加 `float: none`',
		'给父元素加 `text-align: left`'
	], ['A'], '利用伪元素在父元素末尾生成一个块级盒子并 clear: both，把父容器高度撑起来。\n\n现代方案更推荐父元素 `display: flow-root` 创建 BFC，或用 flex/grid 布局从根本上避免浮动。'],

	['046', 1, 68, '伪元素 `::after` 默认的 display 值是？', [
		'inline',
		'block',
		'inline-block',
		'flex'
	], ['A'], '伪元素生成的是行内盒子，所以设置宽高前通常要改成 block 或 inline-block。\n\n另外必须写 content，否则不生成盒子。'],

	['047', 2, 70, '移动端点击有 300ms 延迟，主要解决办法是？', [
		'设置 viewport 的 `width=device-width`，或使用 `touch-action: manipulation`',
		'给按钮加 `cursor: pointer`',
		'使用 `mousedown` 替代 click',
		'给元素加 `user-select: none`'
	], ['A'], '300ms 源于早期的双击缩放判定。声明 `width=device-width` 的响应式视口（现代浏览器已默认取消延迟）+ `touch-action: manipulation` 可彻底消除。\n\n注意 touch-action 只影响触摸手势，不影响桌面端。'],

	['048', 2, 74, '`:nth-child(2)` 与 `:nth-of-type(2)` 的区别是？', [
		'nth-child 按父元素下所有子元素的顺序计数，nth-of-type 只在同标签类型中计数',
		'两者完全等价',
		'nth-of-type 支持奇数偶数，nth-child 不支持',
		'nth-child 只匹配第一个子元素'
	], ['A'], '若父元素里混有 p、span，`:nth-child(2)` 命中的是第二个子元素（可能是 span），而 `p:nth-of-type(2)` 命中第二个 p。\n\n做「每行最后一个卡片」这类布局时，注意容器里是否有其他干扰节点。'],

	['049', 2, 66, '`a[href^="https"]` 匹配的是？', [
		'href 以 https 开头的链接',
		'href 包含 https 的链接',
		'href 以 https 结尾的链接',
		'href 等于 https 的链接'
	], ['A'], '属性选择器支持 `^=` 前缀、`$=` 后缀、`*=` 包含、`~=` 单词、`|=` 连字符前缀。\n\n它常用于给外链加图标、区分文件类型下载链接。'],

	['050', 2, 64, '实现「跟随系统深色模式」的媒体查询是？', [
		'`@media (prefers-color-scheme: dark)`',
		'`@media (prefers-reduced-motion)`',
		'`@media (orientation: dark)`',
		'`@media (color: dark)`'
	], ['A'], 'prefers-color-scheme 读取系统主题偏好，配合 CSS 变量做主题切换最省事。\n\nprefers-reduced-motion 用于尊重「减少动效」的无障碍设置，两者经常一起使用。']
])
