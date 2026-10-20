/**
 * 题库 · React 补充（react-016 ~ react-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('react', [
	['016', 1, 92, 'JSX 最终会被编译成什么？', [
		'`React.createElement(...)` 或新的 jsx 运行时函数调用',
		'直接生成 HTML 字符串',
		'Web Component 定义',
		'`document.write` 调用'
	], ['A'], 'JSX 是 `React.createElement(type, props, ...children)` 的语法糖，新版自动运行时编译为 `jsx/jsxs`，不再需要手动 import React。\n\n它产出的是描述 UI 的普通对象（React 元素），不是 DOM。'],

	['017', 2, 84, '虚拟 DOM 的主要价值是？', [
		'用 JS 对象描述 UI，配合 diff 减少昂贵的 DOM 操作，并支持跨平台渲染',
		'比直接操作 DOM 一定更快',
		'替代 CSS 布局',
		'自动处理浏览器兼容'
	], ['A'], '虚拟 DOM 的核心收益是「声明式编程 + 批量最小化更新 + 平台无关（Web/RN/Canvas）」，而不是绝对性能。\n\n对单次精确的 DOM 修改，直接操作往往更快；虚拟 DOM 的优势在复杂状态变化时的可维护性。'],

	['018', 3, 84, 'Fiber 架构解决的核心问题是？', [
		'把渲染工作拆成可中断的小单元，让高优先级更新能打断低优先级渲染',
		'让组件体积更小',
		'替代虚拟 DOM',
		'自动做代码分割'
	], ['A'], '旧版 Stack Reconciler 递归不可中断，长任务会阻塞主线程导致掉帧；Fiber 用链表结构保存工作单元，可暂停、继续、丢弃，从而支持并发特性与时间切片。\n\n渲染阶段可中断，commit 阶段仍然同步执行。'],

	['019', 3, 88, '为什么 Hooks 不能在条件语句或循环中调用？', [
		'Hooks 按调用顺序存储在链表上，顺序变化会导致状态错位',
		'条件里调用会破坏闭包',
		'会导致内存泄漏',
		'只是代码规范，没有实际影响'
	], ['A'], 'React 不靠名字而靠「调用顺序」把每次渲染的 useState 对应到同一份状态。条件分支让某次渲染少调用一个 hook，后续 hook 就会读错状态。\n\n同理，自定义 Hook 必须以 use 开头，便于 lint 规则检查。'],

	['020', 2, 88, '关于 `setState` 的异步与批量更新，正确的是？', [
		'事件回调中的多次 setState 会被合并成一次渲染，不能立即读到新值',
		'每次 setState 都同步更新 DOM',
		'setState 后立刻读 state 一定拿到新值',
		'React 18 取消了批量更新'
	], ['A'], 'React 会把同一事件循环内的更新批处理，渲染后才更新 state 引用。需要基于旧值计算时用函数式更新 `setCount(c => c + 1)`。\n\nReact 18 起自动批处理扩展到 Promise、setTimeout 与原生事件回调。'],

	['021', 2, 86, '连续调用 `setCount(count + 1)` 三次，结果通常是？', [
		'只加 1',
		'加 3',
		'加 2',
		'报错'
	], ['A'], '三次读取到的都是同一轮渲染里的 count，等价于把同一个值写了三遍，最终只 +1。\n\n改成 `setCount(c => c + 1)` 三次即可 +3，因为函数式更新基于队列中的最新值。'],

	['022', 2, 82, '`useEffect` 返回的清理函数什么时候执行？', [
		'组件卸载时，以及下一次 effect 重新执行之前',
		'只在组件卸载时',
		'每次渲染后立即执行',
		'永不执行'
	], ['A'], 'React 在重新执行 effect 前先调用上一次的清理函数，保证订阅/定时器不会重复叠加；卸载时最后清理一次。\n\n依赖数组为空时只在卸载时清理。'],

	['023', 2, 84, '`useEffect` 不传依赖数组与传空数组的区别是？', [
		'不传：每次渲染后都执行；传 []：只在挂载后执行一次',
		'两者完全一样',
		'不传只在挂载时执行',
		'传 [] 会每次渲染执行'
	], ['A'], '省略依赖数组表示「每次渲染后都跑」，空数组表示「没有依赖，只跑一次」；依赖数组要如实填写，否则会读到过期的闭包变量。\n\neslint-plugin-react-hooks 的 exhaustive-deps 规则就是检查这一点。'],

	['024', 3, 78, '`useLayoutEffect` 与 `useEffect` 的差别是？', [
		'useLayoutEffect 在 DOM 变更后、浏览器绘制前同步执行，适合测量布局；useEffect 在绘制后异步执行',
		'useLayoutEffect 是异步的',
		'两者完全相同',
		'useEffect 会阻塞绘制'
	], ['A'], '需要读取 DOM 尺寸并同步修正样式（避免闪烁）时用 useLayoutEffect，但它会阻塞绘制，滥用会拖慢首屏；数据请求、订阅等副作用一律用 useEffect。\n\nSSR 环境没有 DOM，useLayoutEffect 会告警，可用 isomorphic 封装降级。'],

	['025', 2, 84, '`useMemo` 与 `useCallback` 分别缓存什么？', [
		'useMemo 缓存计算结果，useCallback 缓存函数引用',
		'两者都缓存函数',
		'useMemo 缓存组件',
		'useCallback 缓存 DOM 节点'
	], ['A'], '`useCallback(fn, deps)` 等价于 `useMemo(() => fn, deps)`。它们用于避免重复计算，或保持引用稳定以配合 React.memo 与 effect 依赖。\n\n不要给所有函数都套 useCallback，缓存本身也有比较开销。'],

	['026', 2, 80, '`React.memo` 的作用是？', [
		'浅比较 props，未变化时跳过该组件的重渲染',
		'缓存组件状态',
		'把组件变成纯函数',
		'自动做代码分割'
	], ['A'], 'memo 是浅比较的 HOC，props 引用不变就复用上次渲染结果；对象/函数 props 每次新建会导致失效，需要配合 useMemo/useCallback 或自定义比较函数。\n\n它不是「必然更快」的开关，要看组件渲染成本。'],

	['027', 2, 78, '`useRef` 与 `useState` 的关键区别是？', [
		'修改 ref.current 不会触发重渲染，且在整个生命周期内保持同一个引用',
		'两者完全等价',
		'useRef 只能存 DOM',
		'useState 不会触发渲染'
	], ['A'], 'ref 是「可变盒子」，适合存定时器 id、上一次的值、DOM 引用；state 变化才驱动视图更新。\n\n渲染期间不要读写 ref 作为数据源，会破坏可预测性。'],

	['028', 2, 72, '函数组件想把自己的 DOM 引用交给父组件，通常用？', [
		'`forwardRef` 转发 ref',
		'直接通过 props 传 ref',
		'用 context 传递',
		'用 useRef 导出'
	], ['A'], '`React.forwardRef((props, ref) => ...)` 把 ref 透传到内部 DOM 或子组件，是封装输入框、按钮等基础组件的标准做法。\n\nReact 19 起函数组件可直接把 ref 作为 props 接收。'],

	['029', 3, 68, '`useImperativeHandle` 的作用是？', [
		'自定义通过 ref 暴露给父组件的实例方法，而不是暴露整个 DOM',
		'强制刷新组件',
		'手动触发 effect',
		'声明 ref 的初始值'
	], ['A'], '配合 forwardRef 使用，`useImperativeHandle(ref, () => ({ focus, reset }))` 只暴露必要的能力，保持组件封装性。\n\n典型场景是富文本编辑器、表单校验这类需要命令式调用的组件。'],

	['030', 2, 76, 'Context 的典型性能问题是？', [
		'value 变化会让所有消费组件重渲染，需要拆分 context 或用 memo 优化',
		'Context 无法传递对象',
		'Context 只能用于主题',
		'Context 每次渲染都会丢失值'
	], ['A'], 'Provider 的 value 引用变化即触发全部消费者更新，所以应把 value 用 useMemo 稳定住，并按更新频率拆分多个 context。\n\n高频变化且范围大的状态更适合状态库的选择器订阅。'],

	['031', 2, 72, '什么场景更适合 `useReducer` 而不是多个 useState？', [
		'状态之间有关联、更新逻辑复杂或下一个状态依赖前一个状态',
		'只需要一个布尔值',
		'需要请求接口',
		'需要操作 DOM'
	], ['A'], '把状态转换收敛到 reducer 纯函数里，便于测试与追踪，还能配合 dispatch 下传给子组件而不用传多个 setter。\n\n简单独立状态用 useState 更直接。'],

	['032', 2, 78, '受控组件与非受控组件的区别是？', [
		'受控组件的值由 state 驱动；非受控组件由 DOM 自己维护，通过 ref 读取',
		'受控组件不能用表单',
		'非受控组件不能提交',
		'两者完全一样'
	], ['A'], '受控组件每次输入都触发 setState 再回写 value，便于实时校验与联动，但输入频繁时有一定开销；非受控用 defaultValue + ref，代码更少但难做实时控制。\n\n也可用 react-hook-form 这类库兼顾性能与校验。'],

	['033', 3, 82, '列表 key 使用数组下标可能引发什么？', [
		'插入/删除/排序时节点错位复用，导致输入框内容、动画状态错乱',
		'编译报错',
		'列表无法渲染',
		'只会影响性能，不会出错'
	], ['A'], '下标作为 key 时，「第 0 项」永远是同一个 key，React 会复用原组件实例，把旧状态（如输入框内容、选中态）套在新数据上。\n\n应使用业务唯一 id；纯静态、不重排的列表才可以用下标。'],

	['034', 2, 74, 'React 合成事件（SyntheticEvent）的设计目的是？', [
		'抹平浏览器差异，并通过事件委托统一挂载到根容器减少监听器',
		'让事件可以冒泡到 window',
		'提升 CSS 性能',
		'替代原生事件'
	], ['A'], 'React 在根容器上做事件委托，按需派发合成事件，屏蔽 IE 时代的兼容差异；事件池在 v17 后已移除，异步访问 event 不再失效。\n\n需要原生事件时用 `e.nativeEvent`。'],

	['035', 3, 72, '错误边界（Error Boundary）能捕获哪些错误？', [
		'渲染、生命周期与构造函数中的错误；不能捕获事件回调、异步与 SSR 中的错误',
		'所有 JS 错误',
		'只有网络请求错误',
		'只有语法错误'
	], ['A'], '错误边界是实现了 `componentDidCatch` 或 `getDerivedStateFromError` 的类组件（函数组件需借助库），它只处理渲染阶段的错误。\n\n事件处理和 Promise 异常需要 try/catch 或全局监听兜底。'],

	['036', 2, 74, '`React.lazy` 必须配合什么使用？', [
		'`<Suspense>` 提供加载中的 fallback',
		'`React.memo`',
		'`useEffect`',
		'`useReducer`'
	], ['A'], 'lazy 返回一个惰性组件，加载期间由最近的 Suspense 展示 fallback；路由级懒加载是最常见的拆包手段。\n\n服务端渲染场景需要可序列化的加载方案，lazy 在 SSR 中受限。'],

	['037', 2, 72, '`createPortal` 的作用是？', [
		'把子节点渲染到 DOM 树的另一位置，但 React 组件树关系不变',
		'创建新的 React 根节点',
		'实现代码分割',
		'处理路由跳转'
	], ['A'], '弹窗、Tooltip 常受父级 overflow/z-index 限制，Portal 把真实 DOM 挂到 body，事件冒泡仍沿 React 树传递，context 也能正常读取。\n\n注意点击外部关闭时要考虑 Portal 内的节点。'],

	['038', 3, 74, '开发环境下 StrictMode 会让组件渲染两次，目的是？', [
		'暴露副作用未清理、非纯渲染等潜在问题',
		'提升性能',
		'模拟并发渲染的 bug',
		'为了让状态初始化两次'
	], ['A'], 'React 18 的 StrictMode 会故意双调用渲染、effect 的挂载与卸载，帮你在开发阶段发现「effect 没有清理」「渲染中改状态」等问题，生产环境不会重复。\n\n如果出现重复请求，应检查 effect 是否有正确的清理与取消逻辑。'],

	['039', 3, 70, '`startTransition` 的适用场景是？', [
		'把非紧急更新标记为可打断的低优先级任务，保证输入等高优交互流畅',
		'发起网络请求',
		'替代 useState',
		'强制同步渲染'
	], ['A'], '搜索联想这类「输入要立刻响应、结果列表可以稍后更新」的场景，用 startTransition 包裹列表状态更新，避免长列表渲染卡住输入。\n\n紧急更新用 useTransition 的 isPending 展示过渡状态。'],

	['040', 2, 74, 'React 18 的自动批处理覆盖范围是？', [
		'所有场景，包括 Promise 回调、setTimeout 与原生事件',
		'只在 React 事件回调中',
		'只在类组件中',
		'不再批处理'
	], ['A'], 'React 18 之前只在 React 合成事件与生命周期内批处理，18 起改用 createRoot 后，异步回调里的多次 setState 也会合并成一次渲染。\n\n需要立即同步刷新可用 flushSync，但会破坏批处理、慎用。'],

	['041', 2, 78, '兄弟组件共享状态，最符合 React 思路的做法是？', [
		'把状态提升到共同父组件，通过 props 下发与回调修改',
		'用全局变量',
		'各自维护一份副本',
		'直接操作对方 DOM'
	], ['A'], '状态提升让数据源唯一，避免多份副本不同步；层级过深时再考虑 Context 或状态管理库。\n\n「单一数据源」是 React 状态设计的核心原则。'],

	['042', 2, 70, 'HOC、render props、自定义 Hook 的共同目标是？', [
		'复用组件逻辑',
		'提升渲染性能',
		'替代状态管理',
		'处理样式隔离'
	], ['A'], '三者都是逻辑复用的模式：HOC 包装组件、render props 通过函数传渲染逻辑、Hook 直接复用有状态的逻辑。\n\nHook 因没有额外组件层级与嵌套地狱，成为当前首选。'],

	['043', 2, 76, 'React 的 diff（reconciliation）默认采用什么策略？', [
		'同层比较，不同类型直接替换整棵子树，同类型则比较 props 递归子节点',
		'跨层级全局最优匹配',
		'按 key 排序后全量替换',
		'基于 DOM 快照对比'
	], ['A'], '通用树 diff 的复杂度是 O(n³)，React 用「同层比较 + type 不同即重建 + key 标识身份」把复杂度降到 O(n)。\n\n这也是为什么不要随意改变组件的父子层级或 type。'],

	['044', 2, 68, '为什么 `useCallback` 的依赖数组漏写会出问题？', [
		'回调捕获了旧渲染的变量，形成闭包陷阱',
		'会导致内存泄漏',
		'会让组件无法卸载',
		'依赖数组不影响结果'
	], ['A'], '每次渲染的函数都「快照」了当次的 props 与 state，依赖缺失时函数不会重建，读到的就是旧值。\n\n出现「定时器里读到的 state 永远不变」这类问题，基本都是闭包陷阱。'],

	['045', 3, 64, 'React Server Components 的核心特点是？', [
		'在服务端渲染且不向客户端发送组件 JS，可直接访问后端资源',
		'只能在浏览器运行',
		'替代所有客户端组件',
		'不需要打包'
	], ['A'], 'RSC 在服务端执行，产物是序列化的 UI 描述，不包含组件代码，因此能显著减小包体并直接读数据库；但它不能用 useState、useEffect 等客户端能力。\n\n需要交互的部分仍要标记为客户端组件。'],

	['046', 1, 76, '`props.children` 表示什么？', [
		'组件的开始与结束标签之间的内容',
		'组件的所有 props',
		'组件的 state',
		'组件的 DOM 节点'
	], ['A'], 'children 是特殊的 prop，用于内容分发（组合模式），可以让布局组件与内容解耦。\n\n需要多个插槽时可用具名 props 传 ReactNode，或传对象形式。'],

	['047', 2, 72, '类组件 `componentDidMount` 对应的 Hook 写法是？', [
		'`useEffect(() => {...}, [])`',
		'`useEffect(() => {...})`',
		'`useLayoutEffect(() => {...})`',
		'`useMemo(() => {...}, [])`'
	], ['A'], '空依赖数组的 useEffect 等价于挂载后执行一次；`componentWillUnmount` 对应 effect 返回的清理函数。\n\n三个生命周期（didMount/didUpdate/willUnmount）常常被合并进一个 effect 处理。'],

	['048', 2, 68, '排查 React 组件重复渲染，常用的工具是？', [
		'React DevTools Profiler 与 why-did-you-render',
		'console.log 组件体积',
		'Lighthouse 性能分数',
		'Chrome 的 Network 面板'
	], ['A'], 'Profiler 能记录每次渲染的耗时与触发原因；why-did-you-render 会打印「props 值相同但引用变了」这类无效渲染。\n\n先定位再优化，避免盲目加 memo。'],

	['049', 3, 64, '`dangerouslySetInnerHTML` 的主要风险是？', [
		'直接插入 HTML 字符串，可能引入 XSS',
		'会导致组件无法卸载',
		'破坏 React 的事件系统',
		'让样式失效'
	], ['A'], '它会跳过 React 的转义直接写入 innerHTML，用户可控内容必须先用 DOMPurify 等库净化。\n\n能不用就不用，富文本展示场景务必做白名单过滤。'],

	['050', 2, 70, 'React 中「状态不可变」更新的含义是？', [
		'不直接修改原对象/数组，而是创建新引用再 setState',
		'状态必须用 const 声明',
		'状态不能是对象',
		'状态只能修改一次'
	], ['A'], 'React 靠引用比较判断是否变化，原地 push/splice 会导致引用不变、视图不更新或 memo 失效。\n\n正确做法是展开运算符、map/filter 生成新数组，或使用 immer 简化深层更新。']
])
