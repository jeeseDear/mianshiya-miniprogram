/**
 * 题库 · 框架层：Vue / React / Node.js
 * 约定：纯数据，不引入任何运行时依赖
 */

export const categories = [
	{
		id: 'vue',
		name: 'Vue',
		short: 'Vue',
		icon: '💚',
		bg: '#e8f8ef',
		desc: '响应式原理、组合式 API、生命周期、组件通信与性能'
	},
	{
		id: 'react',
		name: 'React',
		short: 'React',
		icon: '⚛️',
		bg: '#e6f4fb',
		desc: 'Hooks、渲染机制、状态管理、并发特性与性能优化'
	},
	{
		id: 'node',
		name: 'Node.js',
		short: 'Node',
		icon: '🟩',
		bg: '#eaf7ea',
		desc: '事件循环、流与缓冲、进程模型、模块机制与服务端实践'
	}
]

export const questions = [
	/* --------------------------------- Vue --------------------------------- */
	{
		id: 'vue-001',
		cat: 'vue',
		type: 'single',
		level: 1,
		hot: 94,
		source: '面试鸭精选',
		title: 'Vue 3 中 ref 和 reactive 的核心区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'ref 通过 .value 访问，适用于任意类型；reactive 只能接收对象且直接访问属性' },
			{ key: 'B', text: 'ref 只能存基本类型' },
			{ key: 'C', text: 'reactive 支持解构后仍保持响应式' },
			{ key: 'D', text: '两者完全等价' }
		],
		answer: ['A'],
		analysis:
			'ref 内部用 RefImpl 包装，模板中自动解包，脚本里要写 `.value`，能存基本类型、对象、数组。reactive 用 Proxy 代理对象，直接访问属性，但只接受对象类型。\n\n关键陷阱：`const { name } = reactive(state)` 解构出来的是普通值，会丢失响应式；要么用 `toRefs` 转成 ref，要么直接用 ref 定义每个字段。'
	},
	{
		id: 'vue-002',
		cat: 'vue',
		type: 'single',
		level: 1,
		hot: 92,
		source: '面试鸭精选',
		title: 'computed 和 watch 的使用场景差异是？',
		code: '',
		options: [
			{ key: 'A', text: 'computed 适合派生新值且有缓存，watch 适合监听变化执行副作用' },
			{ key: 'B', text: 'computed 只能返回字符串' },
			{ key: 'C', text: 'watch 有缓存，computed 没有' },
			{ key: 'D', text: '两者可以互相完全替代' }
		],
		answer: ['A'],
		analysis:
			'computed 是「依赖变化才重新计算」的派生状态，结果会被缓存，多次访问不会重复执行，且不能有异步副作用。\n\nwatch 用于监听某个源的变化去做副作用：请求接口、操作 DOM、写本地存储。需要立即执行用 `immediate: true`，需要深度监听对象用 `deep: true`（开销较大，能监听具体字段就别用 deep）。'
	},
	{
		id: 'vue-003',
		cat: 'vue',
		type: 'single',
		level: 1,
		hot: 90,
		source: '面试鸭精选',
		title: 'v-if 和 v-show 应该怎么选？',
		code: '',
		options: [
			{ key: 'A', text: '频繁切换用 v-show，初始渲染开销敏感或条件很少变化用 v-if' },
			{ key: 'B', text: 'v-show 性能永远更好' },
			{ key: 'C', text: 'v-if 只是隐藏元素，DOM 仍然存在' },
			{ key: 'D', text: '两者生成的 DOM 完全一样' }
		],
		answer: ['A'],
		analysis:
			'v-if 是真正的条件渲染，不满足时不会创建 DOM（有编译和销毁成本）；v-show 只是切换 `display: none`，DOM 一直存在，切换成本低但初始渲染一定会执行。\n\n所以频繁切换（如 tab 内容）用 v-show，条件很少变化或需要懒加载（如权限区块）用 v-if。v-if 和 v-for 不要写在同一个元素上，v-if 优先级更高，会拿不到循环变量。'
	},
	{
		id: 'vue-004',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 88,
		source: '面试鸭精选',
		title: '列表渲染中 key 的作用是什么？',
		code: '',
		options: [
			{ key: 'A', text: '帮助 diff 算法识别节点身份，复用正确的 DOM' },
			{ key: 'B', text: '只是为了避免控制台警告' },
			{ key: 'C', text: '用作 DOM 的 id 属性' },
			{ key: 'D', text: '决定渲染顺序' }
		],
		answer: ['A'],
		analysis:
			'带 key 时，diff 会按 key 建立映射，准确判断哪些节点可以复用、移动、删除。用 index 作 key，在列表插入或排序时会让节点错位复用，导致输入框内容错乱、动画异常、组件状态串位。\n\nkey 必须是稳定且唯一的值，一般用数据 id。只有在纯静态、不会重排的列表里用 index 才勉强安全。'
	},
	{
		id: 'vue-005',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 84,
		source: '面试鸭精选',
		title: '父子组件首次渲染时，生命周期的执行顺序是？',
		code: '',
		options: [
			{ key: 'A', text: '父 beforeCreate → 父 created → 父 beforeMount → 子 beforeCreate → 子 mounted → 父 mounted' },
			{ key: 'B', text: '子 created → 父 created → 子 mounted → 父 mounted' },
			{ key: 'C', text: '父 mounted → 子 mounted' },
			{ key: 'D', text: '同时执行，顺序不确定' }
		],
		answer: ['A'],
		analysis:
			'创建阶段父先于子，挂载阶段子先于父。因为父组件模板编译后要先渲染子组件，子组件挂载完成后父组件才算挂载完成。\n\n所以父组件在 mounted 里可以拿到子组件实例和子组件渲染后的 DOM；反过来在子组件 mounted 里访问父组件的 DOM，父组件可能还没挂载完。'
	},
	{
		id: 'vue-006',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: 'provide / inject 最适合解决什么问题？',
		code: '',
		options: [
			{ key: 'A', text: '跨多层级传递数据，避免逐层 props 透传' },
			{ key: 'B', text: '父子组件双向绑定' },
			{ key: 'C', text: '替代全局状态管理' },
			{ key: 'D', text: '动态注册组件' }
		],
		answer: ['A'],
		analysis:
			'provide/inject 解决的是「深层嵌套组件拿祖先数据」的问题，典型场景是主题、国际化、表单上下文。\n\n它不是响应式的银弹：provide 一个普通对象时，后代拿到的是快照。要让注入值响应式，需要 provide 一个 ref/reactive，或者用 computed 包装。另外它不适合做全局状态，跨页面共享还是用 Pinia。'
	},
	{
		id: 'vue-007',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 82,
		source: '面试鸭精选',
		title: '`nextTick` 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '在 DOM 更新完成后执行回调' },
			{ key: 'B', text: '延迟 1 秒执行' },
			{ key: 'C', text: '强制立即更新 DOM' },
			{ key: 'D', text: '阻止组件重新渲染' }
		],
		answer: ['A'],
		analysis:
			'Vue 的 DOM 更新是异步批处理的：修改响应式数据后不会立刻更新 DOM，而是推到微任务队列里统一 patch。nextTick 就是在这次 patch 完成后执行回调，可以拿到最新的 DOM 尺寸和内容。\n\n典型场景：修改列表后滚动到底部、弹窗打开后测量高度、动态渲染后聚焦输入框。Vue 3 里也可以用 `await nextTick()`。'
	},
	{
		id: 'vue-008',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 86,
		source: '面试鸭精选',
		title: '自定义组件上写 `v-model` 默认等价于什么？',
		code: '',
		options: [
			{ key: 'A', text: ':modelValue 加 @update:modelValue' },
			{ key: 'B', text: ':value 加 @input' },
			{ key: 'C', text: ':model 加 @change' },
			{ key: 'D', text: '只在表单元素上有效' }
		],
		answer: ['A'],
		analysis:
			'Vue 3 中组件的 v-model 默认编译为 `:modelValue` 属性加 `@update:modelValue` 事件，子组件通过 `props.modelValue` 接收、`emit(\'update:modelValue\', val)` 回传。\n\nVue 2 用的是 value + input，这是两者的差异点。Vue 3 还支持多个 v-model：`v-model:title`、`v-model:visible`，对应 `update:title` / `update:visible`，写弹窗组件特别方便。'
	},
	{
		id: 'vue-009',
		cat: 'vue',
		type: 'single',
		level: 3,
		hot: 88,
		source: '面试鸭精选',
		title: 'Vue 3 响应式系统相比 Vue 2 的关键改进是？',
		code: '',
		options: [
			{ key: 'A', text: '用 Proxy 替代 Object.defineProperty，支持新增/删除属性和数组索引' },
			{ key: 'B', text: '改用了发布订阅模式' },
			{ key: 'C', text: '不再需要依赖收集' },
			{ key: 'D', text: '只支持对象，不支持数组' }
		],
		answer: ['A'],
		analysis:
			'Vue 2 用 Object.defineProperty 递归劫持已有属性，无法感知新增/删除属性（需要 $set）、无法拦截数组索引赋值和 length 修改。\n\nVue 3 用 Proxy 代理整个对象，get/set/deleteProperty/has 等操作都能拦截，天然支持新增删除和数组变动，并且是懒代理（访问到才递归），初始化性能更好。代价是 Proxy 不支持 IE。'
	},
	{
		id: 'vue-010',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: '`watch` 和 `watchEffect` 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'watch 需显式指定监听源且默认懒执行，watchEffect 自动收集依赖并立即执行' },
			{ key: 'B', text: 'watchEffect 不能停止' },
			{ key: 'C', text: 'watch 只能监听 ref' },
			{ key: 'D', text: '两者完全相同' }
		],
		answer: ['A'],
		analysis:
			'watch 明确写出要监听哪个源，能拿到新旧值，默认不立即执行（可用 immediate 打开）。\n\nwatchEffect 会先执行一次回调，执行过程中用到的响应式数据都会被自动收集为依赖，之后任一依赖变化就重新执行。写法简洁，但依赖关系不够直观，也无法直接拿到旧值。两者都返回停止函数，组件卸载时自动清理。'
	},
	{
		id: 'vue-011',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 76,
		source: '面试鸭精选',
		title: '`<keep-alive>` 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '缓存组件实例，切换时保留状态并避免重复渲染' },
			{ key: 'B', text: '保持长连接不断开' },
			{ key: 'C', text: '阻止组件卸载' },
			{ key: 'D', text: '把组件渲染到 body 上' }
		],
		answer: ['A'],
		analysis:
			'keep-alive 会把失活的组件实例缓存起来，再次进入时直接复用，表单内容、滚动位置、内部状态都能保留，同时省掉重新创建的开销。\n\n被缓存的组件会多出 activated / deactivated 两个生命周期，可以在 activated 里刷新数据。通过 include/exclude 按组件名精确控制缓存范围，否则缓存过多会占用内存。'
	},
	{
		id: 'vue-012',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 74,
		source: '面试鸭精选',
		title: '动态组件通过什么方式渲染？',
		code: '',
		options: [
			{ key: 'A', text: '<component :is="currentComp">' },
			{ key: 'B', text: '<slot name="currentComp">' },
			{ key: 'C', text: 'v-html 插入组件' },
			{ key: 'D', text: '只能用 v-if 切换' }
		],
		answer: ['A'],
		analysis:
			'`<component :is="xxx">` 会根据 is 的值渲染对应组件，xxx 可以是组件名、组件对象，或 defineAsyncComponent 返回的异步组件。\n\n配合 keep-alive 可以缓存切走的组件；不缓存时每次切换都会销毁重建，内部状态会丢失。Vue 3 中 is 传字符串时必须在当前作用域可解析。'
	},
	{
		id: 'vue-013',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 72,
		source: '面试鸭精选',
		title: '作用域插槽的典型用途是？',
		code: '',
		options: [
			{ key: 'A', text: '让父组件拿到子组件内部的数据来定制渲染内容' },
			{ key: 'B', text: '让子组件访问父组件的 data' },
			{ key: 'C', text: '替代 props 传值' },
			{ key: 'D', text: '定义全局组件' }
		],
		answer: ['A'],
		analysis:
			'子组件通过 `<slot :item="item" :index="i">` 把内部数据暴露出去，父组件用 `<template #default="{ item }">` 接收，从而在不侵入子组件的前提下自定义每一项的渲染。\n\n典型场景是表格、下拉选择、列表组件：组件负责数据和行为，展示交给使用方决定。这也是所谓「逻辑与视图分离」的组件设计方式。'
	},
	{
		id: 'vue-014',
		cat: 'vue',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: 'Pinia 相比 Vuex 的主要优势是？',
		code: '',
		options: [
			{ key: 'A', text: '去掉 mutation，支持更好的 TS 推导，模块扁平无需嵌套' },
			{ key: 'B', text: 'Pinia 不能做持久化' },
			{ key: 'C', text: 'Pinia 只能用于 Vue 2' },
			{ key: 'D', text: 'Pinia 必须配合 Vuex 使用' }
		],
		answer: ['A'],
		analysis:
			'Pinia 去掉了 Vuex 的 mutations，直接在 actions 里改 state；对 TypeScript 的类型推导更友好，不需要手动写复杂类型；每个 store 都是独立模块，扁平组织、按需引入，没有嵌套 modules 的命名空间问题。\n\nVuex 4 仍是官方维护，但新项目官方推荐 Pinia。'
	},
	{
		id: 'vue-015',
		cat: 'vue',
		type: 'multiple',
		level: 3,
		hot: 70,
		source: '面试鸭精选',
		title: '下面哪些做法有助于减少 Vue 组件的重复渲染？',
		code: '',
		options: [
			{ key: 'A', text: '把变化频繁的状态下沉到子组件，避免整棵组件树重渲染' },
			{ key: 'B', text: '长列表使用虚拟滚动' },
			{ key: 'C', text: '用 v-memo 缓存静态区块' },
			{ key: 'D', text: '给每个组件都加 keep-alive' }
		],
		answer: ['A', 'B', 'C'],
		analysis:
			'状态下沉能缩小响应式影响范围；虚拟滚动只渲染可视区域；v-memo 可以指定依赖，依赖不变时跳过该子树更新。\n\n给所有组件无条件加 keep-alive 只会增加内存占用，还会让组件状态难以重置，属于典型的过度优化。'
	},

	/* -------------------------------- React -------------------------------- */
	{
		id: 'react-001',
		cat: 'react',
		type: 'single',
		level: 1,
		hot: 92,
		source: '面试鸭精选',
		title: 'useEffect 的第二个参数传空数组 `[]` 表示什么？',
		code: '',
		options: [
			{ key: 'A', text: '每次渲染都执行' },
			{ key: 'B', text: '只在组件挂载后执行一次，卸载时执行清理函数' },
			{ key: 'C', text: '永不执行' },
			{ key: 'D', text: '只在组件更新时执行' }
		],
		answer: ['B'],
		analysis:
			'依赖数组为空表示没有依赖，effect 只在首次渲染后跑一次；返回的清理函数在组件卸载时执行。\n\n不传第二个参数则每次渲染后都执行；传了具体依赖则只在依赖变化时执行。注意严格模式下开发环境会故意执行两次，用来暴露清理不彻底的问题，生产环境不会。'
	},
	{
		id: 'react-002',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 88,
		source: '面试鸭精选',
		title: 'useMemo 和 useCallback 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'useMemo 缓存计算结果，useCallback 缓存函数本身' },
			{ key: 'B', text: '两者完全一样' },
			{ key: 'C', text: 'useCallback 缓存计算结果' },
			{ key: 'D', text: 'useMemo 只能缓存对象' }
		],
		answer: ['A'],
		analysis:
			'useMemo 接收工厂函数并缓存其返回值；useCallback 相当于 `useMemo(() => fn, deps)`，专门缓存函数引用。\n\n它们的价值在于配合 React.memo 或作为其他 hook 的依赖，避免子组件因引用变化而重渲染。本身也有开销，不要给每个函数都包一层。'
	},
	{
		id: 'react-003',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 86,
		source: '面试鸭精选',
		title: 'React 列表为什么必须给 key，且不建议用数组下标？',
		code: '',
		options: [
			{ key: 'A', text: 'key 帮助 diff 识别节点，用下标在插入删除时会导致状态错位' },
			{ key: 'B', text: 'key 会渲染成 DOM 属性' },
			{ key: 'C', text: '没有 key 组件就不会渲染' },
			{ key: 'D', text: 'key 用于排序' }
		],
		answer: ['A'],
		analysis:
			'diff 依据 key 判断节点是否可复用。用下标作 key，在头部插入一项时所有下标都往后移，React 会认为每个位置的内容都变了，导致 DOM 更新错位、非受控输入框内容串行、动画重复触发。\n\n稳定唯一的业务 id 才是正确选择。key 不会出现在 DOM 上，也只在同级兄弟节点之间比较。'
	},
	{
		id: 'react-004',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: '受控组件和非受控组件的区别是？',
		code: '',
		options: [
			{ key: 'A', text: '受控组件的值由 state 驱动，非受控由 DOM 自身维护、通过 ref 读取' },
			{ key: 'B', text: '受控组件性能一定更好' },
			{ key: 'C', text: '非受控组件不能提交表单' },
			{ key: 'D', text: '两者没有区别' }
		],
		answer: ['A'],
		analysis:
			'受控组件把 value 绑定到 state，每次输入都触发 onChange 更新 state，数据流单向可控，便于校验和联动，但输入频繁时渲染开销更大。\n\n非受控组件用 defaultValue 初始化，DOM 自己维护值，提交时通过 ref 或 FormData 读取，代码更轻量。文件上传只能是非受控（input type=file 的值不能受控设置）。'
	},
	{
		id: 'react-005',
		cat: 'react',
		type: 'single',
		level: 3,
		hot: 76,
		source: '面试鸭精选',
		title: 'React 合成事件（SyntheticEvent）的意义是？',
		code: '',
		options: [
			{ key: 'A', text: '抹平浏览器差异，并利用事件委托减少监听器数量' },
			{ key: 'B', text: '让事件变成异步' },
			{ key: 'C', text: '替代原生 addEventListener 的所有能力' },
			{ key: 'D', text: '提升网络请求速度' }
		],
		answer: ['A'],
		analysis:
			'React 自己实现了一套事件系统，把原生事件包装成 SyntheticEvent，统一了不同浏览器的行为差异。React 17 之前统一委托到 document，17 之后委托到根容器，更利于多版本共存和微前端。\n\n注意合成事件对象在早期版本会被复用（事件池），异步访问需要 `e.persist()`；React 17 起已移除事件池，可以直接异步访问。要拿原生事件用 `e.nativeEvent`。'
	},
	{
		id: 'react-006',
		cat: 'react',
		type: 'single',
		level: 3,
		hot: 84,
		source: '面试鸭精选',
		title: 'Fiber 架构主要解决了什么问题？',
		code: '',
		options: [
			{ key: 'A', text: '把不可中断的递归渲染拆成可中断、可恢复的任务单元，保证交互不卡顿' },
			{ key: 'B', text: '减少了代码体积' },
			{ key: 'C', text: '让 CSS 生效更快' },
			{ key: 'D', text: '替代了虚拟 DOM' }
		],
		answer: ['A'],
		analysis:
			'旧版 Stack Reconciler 是同步递归，一旦开始渲染就不可中断，大组件树会长时间占用主线程，造成掉帧。\n\nFiber 把渲染拆成一个个工作单元，用链表结构记录父子兄弟关系，可以在浏览器空闲时执行、被打断后恢复。这为并发特性（时间切片、优先级调度、Suspense）提供了基础。'
	},
	{
		id: 'react-007',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 82,
		source: '面试鸭精选',
		title: 'Hooks 只能在组件顶层调用，原因是？',
		code: '',
		options: [
			{ key: 'A', text: 'Hooks 按调用顺序存放在链表上，条件调用会导致顺序错乱' },
			{ key: 'B', text: '顶层调用性能更好' },
			{ key: 'C', text: '在循环里调用会报语法错误' },
			{ key: 'D', text: '这是历史遗留限制，没有实际原因' }
		],
		answer: ['A'],
		analysis:
			'React 内部为每个组件维护一条 hook 链表，靠调用顺序来匹配每次渲染的 state 和 effect。如果放在 if 或循环里，某次渲染少调用了，后面所有 hook 就会错位，拿到的 state 也就乱了。\n\n所以规则是：只在函数组件或自定义 hook 的顶层调用，不要在条件、循环、嵌套函数里调用。lint 插件会帮忙检查。'
	},
	{
		id: 'react-008',
		cat: 'react',
		type: 'single',
		level: 3,
		hot: 80,
		source: '面试鸭精选',
		title: '下面这段代码点击多次后，count 为什么一直显示旧值？',
		code: "function Timer() {\n  const [count, setCount] = useState(0)\n  useEffect(() => {\n    const id = setInterval(() => {\n      console.log(count)\n      setCount(count + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [])\n}",
		options: [
			{ key: 'A', text: '定时器被清除了' },
			{ key: 'B', text: '闭包捕获了首次渲染时的 count，永远是 0' },
			{ key: 'C', text: 'setCount 不会触发重渲染' },
			{ key: 'D', text: 'useState 初始化有误' }
		],
		answer: ['B'],
		analysis:
			'effect 的依赖是空数组，只在挂载时执行一次，回调里捕获的是那一次渲染的 count（0），之后不会重新绑定。\n\n修法有两种：① 用函数式更新 `setCount(c => c + 1)`，不依赖外部变量；② 把 count 加入依赖数组，每次变化重建定时器（但不是最优）。凡是依赖上一次状态的计算，都应该优先用函数式更新。'
	},
	{
		id: 'react-009',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 74,
		source: '面试鸭精选',
		title: 'React 18 中同一事件处理函数里的多次 setState 会怎样？',
		code: '',
		options: [
			{ key: 'A', text: '自动批处理，只触发一次重渲染' },
			{ key: 'B', text: '每次都触发一次重渲染' },
			{ key: 'C', text: '只有最后一次生效，前面的被丢弃' },
			{ key: 'D', text: '会报错' }
		],
		answer: ['A'],
		analysis:
			'React 18 引入自动批处理（automatic batching），不仅在事件处理函数里，在 setTimeout、Promise、原生事件回调中的多次 setState 也会合并成一次渲染。\n\n多次 setState 会依次入队，最终都生效（不会丢）。React 17 及以前只在 React 事件中批处理，异步回调里每次都会单独渲染。需要同步拿到最新 DOM 用 flushSync 强制刷新。'
	},
	{
		id: 'react-010',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 72,
		source: '面试鸭精选',
		title: 'Context 的典型问题是？',
		code: '',
		options: [
			{ key: 'A', text: 'Provider 的 value 变化会让所有消费组件重渲染，需要拆分或 memo' },
			{ key: 'B', text: 'Context 不能跨层级传递' },
			{ key: 'C', text: 'Context 只能存字符串' },
			{ key: 'D', text: 'Context 会污染全局作用域' }
		],
		answer: ['A'],
		analysis:
			'Context 本身没有选择器机制，value 一变，所有 useContext 的组件都会重新渲染，即使它们只关心其中一部分数据。\n\n优化思路：把 value 拆成多个 Provider、用 useMemo 稳定对象引用、把消费组件拆小，或改用支持选择器的状态库（如 zustand）。Context 更适合低频变化的主题、用户信息这类数据。'
	},
	{
		id: 'react-011',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 70,
		source: '面试鸭精选',
		title: 'React.memo 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '对 props 做浅比较，相同则跳过重渲染' },
			{ key: 'B', text: '缓存组件的 DOM 节点' },
			{ key: 'C', text: '把组件变成纯函数' },
			{ key: 'D', text: '让组件只在挂载时渲染' }
		],
		answer: ['A'],
		analysis:
			'React.memo 是高阶组件，包裹后每次父组件渲染时会浅比较新旧 props，相同则复用上次的渲染结果。\n\n浅比较对对象、数组、函数无效——父组件每次渲染都会创建新引用，memo 就会失效，所以要配合 useMemo/useCallback 稳定引用。默认比较不够时，可以传第二个参数自定义比较函数。'
	},
	{
		id: 'react-012',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 68,
		source: '面试鸭精选',
		title: '错误边界（Error Boundary）能捕获哪些错误？',
		code: '',
		options: [
			{ key: 'A', text: '子组件渲染、生命周期和构造函数中的错误' },
			{ key: 'B', text: '事件处理函数里的错误' },
			{ key: 'C', text: '异步代码里的错误' },
			{ key: 'D', text: '所有 JS 错误' }
		],
		answer: ['A'],
		analysis:
			'错误边界只能捕获子树在渲染、生命周期方法、constructor 中抛出的错误，用来展示降级 UI，避免整个应用白屏。\n\n事件处理函数、setTimeout、Promise 里的错误它捕获不到，需要 try/catch 或 window.onerror 兜底。目前只能用 class 组件实现（getDerivedStateFromError / componentDidCatch），没有对应的 hook。'
	},
	{
		id: 'react-013',
		cat: 'react',
		type: 'single',
		level: 3,
		hot: 66,
		source: '面试鸭精选',
		title: 'React 18 的并发渲染（Concurrent Rendering）指的是？',
		code: '',
		options: [
			{ key: 'A', text: '渲染可中断、可按优先级调度，高优先级更新（如输入）可插队' },
			{ key: 'B', text: '多个线程同时渲染 DOM' },
			{ key: 'C', text: '同时渲染多个页面' },
			{ key: 'D', text: '把所有更新合并成一次' }
		],
		answer: ['A'],
		analysis:
			'并发渲染不是多线程，而是基于 Fiber 把渲染工作切片，主线程有空闲才继续，遇到高优先级更新（用户输入）可以先中断当前渲染去处理。\n\n配套 API 包括 useTransition、useDeferredValue、startTransition，适合处理「输入框实时过滤大列表」这类场景，让输入保持流畅。'
	},
	{
		id: 'react-014',
		cat: 'react',
		type: 'single',
		level: 2,
		hot: 64,
		source: '面试鸭精选',
		title: '函数组件想把自己的 DOM 引用暴露给父组件，应该怎么做？',
		code: '',
		options: [
			{ key: 'A', text: '直接用 ref 属性即可' },
			{ key: 'B', text: '用 forwardRef 包裹组件，把 ref 转发到内部元素' },
			{ key: 'C', text: '把 ref 写进 props 里传下去' },
			{ key: 'D', text: '无法实现' }
		],
		answer: ['B'],
		analysis:
			'函数组件默认不能接收 ref（ref 不是普通 prop），必须用 forwardRef 包裹，参数第二个位置接收 ref 并挂到内部 DOM 上。\n\n如果只想暴露部分方法而不是整个 DOM，配合 useImperativeHandle 定义对外接口，比如只暴露 focus、scrollTo，避免父组件直接操作 DOM 结构。'
	},
	{
		id: 'react-015',
		cat: 'react',
		type: 'multiple',
		level: 2,
		hot: 62,
		source: '面试鸭精选',
		title: '哪些方式可以减少 React 应用的不必要重渲染？',
		code: '',
		options: [
			{ key: 'A', text: '用 React.memo 包裹纯展示组件' },
			{ key: 'B', text: '用 useCallback 稳定传给子组件的函数' },
			{ key: 'C', text: '把状态尽量放在最近使用它的组件里' },
			{ key: 'D', text: '给所有组件都加上 key' }
		],
		answer: ['A', 'B', 'C'],
		analysis:
			'memo 挡住 props 未变的渲染，useCallback/useMemo 保证引用稳定让 memo 生效，状态下沉缩小更新范围，这三条是最常规的优化手段。\n\nkey 只影响同级节点的复用与 diff，和减少重渲染无关。真正的性能问题应该先用 Profiler 定位，再针对性优化。'
	},

	/* -------------------------------- Node -------------------------------- */
	{
		id: 'node-001',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 88,
		source: '面试鸭精选',
		title: 'Node.js 事件循环中，`setTimeout` 与 `setImmediate` 的执行顺序？',
		code: '',
		options: [
			{ key: 'A', text: 'setTimeout 永远先执行' },
			{ key: 'B', text: '在主模块中顺序不确定，取决于进程启动耗时；在 I/O 回调中 setImmediate 通常先执行' },
			{ key: 'C', text: 'setImmediate 永远先执行' },
			{ key: 'D', text: '两者不会同时存在' }
		],
		answer: ['B'],
		analysis:
			'事件循环分为 timers、pending callbacks、poll、check、close callbacks 等阶段。setTimeout 在 timers 阶段执行，setImmediate 在 check 阶段执行。\n\n在主模块里，两者都要等第一次循环，如果进程启动耗时超过定时器的毫秒数，setTimeout 可能先执行，否则 setImmediate 先执行，所以顺序不确定。而在 I/O 回调内部，poll 阶段结束后紧接着进入 check 阶段，setImmediate 一定早于下一个 timers 阶段。'
	},
	{
		id: 'node-002',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 76,
		source: '面试鸭精选',
		title: 'Node.js 中 Buffer 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '处理二进制数据，是固定长度的字节数组' },
			{ key: 'B', text: '缓存 HTTP 响应' },
			{ key: 'C', text: '替代普通数组' },
			{ key: 'D', text: '存储 JSON 对象' }
		],
		answer: ['A'],
		analysis:
			'Buffer 是 Node 提供的二进制数据容器，底层是 V8 堆外内存，长度创建后不可变。文件读写、网络传输、加密、图片处理都会用到。\n\n`Buffer.alloc` 会初始化内存，`Buffer.allocUnsafe` 不初始化（更快，但可能包含旧数据，必须自己填充）。拼接用 `Buffer.concat`，转字符串用 `toString(\'utf8\')`。'
	},
	{
		id: 'node-003',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: '使用 Stream 处理大文件的核心优势是？',
		code: '',
		options: [
			{ key: 'A', text: '边读边处理，内存占用恒定，不会一次性把文件读进内存' },
			{ key: 'B', text: '代码更短' },
			{ key: 'C', text: '可以自动压缩文件' },
			{ key: 'D', text: '只能用于读，不能用于写' }
		],
		answer: ['A'],
		analysis:
			'`fs.readFile` 会把整个文件读入内存，几个 G 的文件直接 OOM。Stream 把数据切成小块（默认 64KB）逐块处理，内存占用基本恒定。\n\n四种流：Readable、Writable、Duplex（双工，如 TCP socket）、Transform（转换，如 gzip）。用 `pipe` 串联可以自动处理背压（backpressure），防止写入速度跟不上导致内存堆积。'
	},
	{
		id: 'node-004',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: 'CommonJS 和 ES Module 在 Node 中的关键差异是？',
		code: '',
		options: [
			{ key: 'A', text: 'CJS 是运行时同步加载、导出值的拷贝；ESM 是静态分析、导出的是引用且支持顶层 await' },
			{ key: 'B', text: '两者完全一致' },
			{ key: 'C', text: 'ESM 不支持按需加载' },
			{ key: 'D', text: 'CJS 只能在浏览器运行' }
		],
		answer: ['A'],
		analysis:
			'CJS 用 require/module.exports，运行时同步执行，模块被缓存，导出的是值的浅拷贝（重新赋值对方看不到）。ESM 用 import/export，编译期静态分析，支持 tree shaking，导出的是活引用，还支持顶层 await 和动态 import()。\n\nNode 中 .mjs 强制 ESM，.cjs 强制 CJS，.js 取决于最近的 package.json 的 type 字段。CJS 里可以 require 同步的 ESM，反向则不行。'
	},
	{
		id: 'node-005',
		cat: 'node',
		type: 'single',
		level: 3,
		hot: 72,
		source: '面试鸭精选',
		title: 'Node.js 的 cluster 模块主要解决什么问题？',
		code: '',
		options: [
			{ key: 'A', text: '利用多核 CPU，fork 多个进程共享同一端口以提升吞吐' },
			{ key: 'B', text: '实现多线程计算' },
			{ key: 'C', text: '做进程间数据库共享' },
			{ key: 'D', text: '压缩内存' }
		],
		answer: ['A'],
		analysis:
			'Node 单进程只能用一个 CPU 核。cluster 会 fork 出多个 worker 进程，由主进程监听端口并分发给 worker，实现多核利用和进程级别的容错。\n\n注意：进程之间内存不共享，session 之类的状态要放 Redis 等外部存储。CPU 密集型任务更适合 worker_threads（线程，可共享内存）而不是 cluster（进程）。'
	},
	{
		id: 'node-006',
		cat: 'node',
		type: 'single',
		level: 3,
		hot: 68,
		source: '面试鸭精选',
		title: 'Koa 的「洋葱模型」中间件相比 Express 的特点是？',
		code: '',
		options: [
			{ key: 'A', text: '基于 async/await，可以 await next() 后在响应阶段继续处理' },
			{ key: 'B', text: '不支持异步' },
			{ key: 'C', text: '中间件不能中断' },
			{ key: 'D', text: '必须手动调用 res.end' }
		],
		answer: ['A'],
		analysis:
			'Koa 中间件是 async 函数，`await next()` 会先执行后续中间件，返回后再继续执行当前中间件的后续代码，形成「请求进入 → 层层深入 → 层层返回」的洋葱结构。\n\n这让统一计时、日志、错误处理、响应包装变得非常自然。Express 的中间件是线性回调，next() 之后无法回到当前中间件继续处理。'
	},
	{
		id: 'node-007',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 66,
		source: '面试鸭精选',
		title: 'Node 中常用的进程间通信方式是？',
		code: '',
		options: [
			{ key: 'A', text: '基于管道（IPC channel）的 process.send / message 事件' },
			{ key: 'B', text: '直接共享变量' },
			{ key: 'C', text: '通过 DOM 事件' },
			{ key: 'D', text: '只能通过文件轮询' }
		],
		answer: ['A'],
		analysis:
			'fork 出来的子进程和父进程之间会自动建立 IPC 通道，父进程用 `child.send()` 发消息，子进程监听 `process.on(\'message\')`，反向同理。消息会被序列化成 JSON 传输。\n\n跨机器或跨语言的进程通信用 socket、消息队列（Redis、RabbitMQ、Kafka）。worker_threads 之间可以用 MessagePort，还能通过 SharedArrayBuffer 共享内存。'
	},
	{
		id: 'node-008',
		cat: 'node',
		type: 'single',
		level: 3,
		hot: 70,
		source: '面试鸭精选',
		title: '下面哪种情况最容易造成 Node 内存泄漏？',
		code: '',
		options: [
			{ key: 'A', text: '在全局数组里不断 push 数据且从不清理' },
			{ key: 'B', text: '使用 const 声明变量' },
			{ key: 'C', text: '频繁创建局部变量' },
			{ key: 'D', text: '使用 Buffer.alloc' }
		],
		answer: ['A'],
		analysis:
			'全局缓存、事件监听器未移除、定时器未 clear、闭包长时间持有大对象引用、Map/Set 只增不减，都是常见的泄漏来源。`process.on` 监听器重复注册也容易堆积。\n\n排查手段：`process.memoryUsage()` 观察堆增长，用 heapdump 或 Chrome DevTools 抓快照对比，定位持续增长的对象。'
	},
	{
		id: 'node-009',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 64,
		source: '面试鸭精选',
		title: 'JWT 相比传统 Session 的特点是？',
		code: '',
		options: [
			{ key: 'A', text: '签名后由客户端保存，服务端无状态校验，但无法主动失效' },
			{ key: 'B', text: 'JWT 内容加密不可读' },
			{ key: 'C', text: 'JWT 必须存在 Cookie 里' },
			{ key: 'D', text: 'JWT 可以自动刷新' }
		],
		answer: ['A'],
		analysis:
			'JWT 由 header.payload.signature 三段组成，payload 只是 Base64 编码，任何人都能解开看内容，所以不能存敏感信息。服务端验签即可，不需要存会话，天然适合分布式和跨域。\n\n代价是无法主动让某个 token 失效（除非维护黑名单或使用短过期 + refresh token）。存 localStorage 有 XSS 风险，存 Cookie 要配合 HttpOnly 和 SameSite。'
	},
	{
		id: 'node-010',
		cat: 'node',
		type: 'single',
		level: 1,
		hot: 60,
		source: '面试鸭精选',
		title: '`package-lock.json` 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '锁定依赖树的精确版本，保证不同环境安装结果一致' },
			{ key: 'B', text: '记录项目的脚本命令' },
			{ key: 'C', text: '加速网络下载' },
			{ key: 'D', text: '声明 Node 版本' }
		],
		answer: ['A'],
		analysis:
			'package.json 里的 ^1.2.3 只约束范围，实际装到哪个版本取决于当时仓库最新版。lock 文件记录了每个包的确切版本和下载地址，CI 和其他同事按它安装就能得到完全一致的依赖树。\n\nlock 文件必须提交到仓库，冲突时不要手改，重新 install 让工具生成。pnpm 对应 pnpm-lock.yaml，yarn 对应 yarn.lock。'
	},
	{
		id: 'node-011',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 58,
		source: '面试鸭精选',
		title: 'Node 里处理异步错误，下面哪种做法最不可靠？',
		code: '',
		options: [
			{ key: 'A', text: '用 try/catch 包住同步代码' },
			{ key: 'B', text: '用 Promise 的 catch 处理拒绝' },
			{ key: 'C', text: '依赖 uncaughtException 后继续运行进程' },
			{ key: 'D', text: '在 async 函数里用 try/catch 配合 await' }
		],
		answer: ['C'],
		analysis:
			'uncaughtException 触发时进程状态已经不可信，继续运行可能出现资源泄漏、数据不一致，正确做法是记录日志后优雅退出，由进程管理器（pm2、k8s）重启。\n\n注意 async 函数里如果不用 await，异常不会进入 try/catch；回调风格的 API 要用 `(err, data) => {}` 判断。'
	},
	{
		id: 'node-012',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 56,
		source: '面试鸭精选',
		title: '`worker_threads` 适合什么场景？',
		code: '',
		options: [
			{ key: 'A', text: 'CPU 密集型任务，如加解密、图像处理、大数据计算' },
			{ key: 'B', text: '大量 I/O 请求' },
			{ key: 'C', text: '渲染页面' },
			{ key: 'D', text: '管理数据库连接' }
		],
		answer: ['A'],
		analysis:
			'Node 是单线程处理 JS 的，CPU 密集任务会阻塞事件循环，导致其他请求全部卡住。worker_threads 可以在同一进程内开多个线程跑 JS，线程间可通过 MessagePort 通信、SharedArrayBuffer 共享内存。\n\nI/O 密集场景 Node 的异步模型本身就很高效，不需要 worker。'
	},
	{
		id: 'node-013',
		cat: 'node',
		type: 'single',
		level: 1,
		hot: 54,
		source: '面试鸭精选',
		title: '`process.env.NODE_ENV` 的常见用途是？',
		code: '',
		options: [
			{ key: 'A', text: '区分开发/生产环境，控制日志级别、错误提示、构建产物' },
			{ key: 'B', text: '设置端口号' },
			{ key: 'C', text: '开启 HTTPS' },
			{ key: 'D', text: '决定 Node 版本' }
		],
		answer: ['A'],
		analysis:
			'构建工具和框架都会读取它：production 下关掉开发警告、压缩代码、禁用 sourcemap、隐藏详细错误栈。\n\n要注意它是构建期或启动期注入的字符串，任何时候都是 string 类型，比较时写 `=== \'production\'`。前端项目里只有以特定前缀（如 VITE_、VUE_APP_）开头的变量才会被打包进客户端代码。'
	},
	{
		id: 'node-014',
		cat: 'node',
		type: 'single',
		level: 2,
		hot: 52,
		source: '面试鸭精选',
		title: 'Express 中间件中，调用 `next(err)` 与 `next()` 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'next(err) 会跳到错误处理中间件，next() 进入下一个普通中间件' },
			{ key: 'B', text: '两者完全一样' },
			{ key: 'C', text: 'next(err) 会直接结束响应' },
			{ key: 'D', text: 'next() 会重启服务' }
		],
		answer: ['A'],
		analysis:
			'Express 会跳过所有普通中间件，直接寻找签名为四个参数的错误处理中间件 `(err, req, res, next)`。\n\n如果不调用 next 也不返回响应，请求会一直挂起直到超时。异步中间件里的错误要记得 catch 后交给 next，否则 Express 4 捕获不到 Promise 拒绝（Express 5 才原生支持）。'
	},
	{
		id: 'node-015',
		cat: 'node',
		type: 'multiple',
		level: 2,
		hot: 50,
		source: '面试鸭精选',
		title: '下面哪些属于 Node.js 相对浏览器的差异？',
		code: '',
		options: [
			{ key: 'A', text: '没有 DOM 和 BOM，不能直接操作页面' },
			{ key: 'B', text: '可以直接读写文件系统' },
			{ key: 'C', text: '事件循环有明确的阶段划分（timers/poll/check 等）' },
			{ key: 'D', text: '不支持 Promise' }
		],
		answer: ['A', 'B', 'C'],
		analysis:
			'Node 没有浏览器环境对象，但提供了 fs、net、child_process 等系统能力；事件循环基于 libuv，分阶段调度，而浏览器基于 HTML 规范的任务队列与渲染时机。\n\nPromise、async/await 都是 ECMAScript 标准能力，Node 和浏览器都支持。'
	}
]
