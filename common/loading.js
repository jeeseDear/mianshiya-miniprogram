/**
 * 统一的 loading 封装
 *
 * 为什么不用裸的 uni.showLoading：
 * 1. 它必须严格成对调用，多调一次 hideLoading 会把后面的 toast 一起关掉；
 * 2. 本地数据是同步的，任务瞬间完成，loading 会一闪而过（看起来像闪屏）；
 * 3. 多个入口同时触发时，先结束的那个会把还在跑的 loading 关掉。
 *
 * 这里用「计数 + 最短展示时长」解决上面三个问题。
 */

let count = 0
let startAt = 0
let hideTimer = null

/** 关闭 loading，页面已切走时 fail 也不影响业务 */
function safeHide() {
	try {
		uni.hideLoading()
	} catch (e) {
		/* ignore */
	}
}

/**
 * 显示 loading
 * @param {string} title 文案（建议 4 个字以内，小程序会截断过长文案）
 * @param {boolean} mask 是否显示透明蒙层阻挡点击（页面切换场景建议 false，不然连续点 tab 会被挡住）
 */
export function showLoading(title = '加载中', mask = true) {
	if (hideTimer) {
		clearTimeout(hideTimer)
		hideTimer = null
	}
	if (count === 0) {
		startAt = Date.now()
		uni.showLoading({ title, mask })
	}
	count += 1
}

/**
 * 关闭 loading
 * @param {number} minDuration 最短展示时长，避免同步任务闪一下
 */
export function hideLoading(minDuration = 300) {
	if (count === 0) return
	count -= 1
	if (count > 0) return

	const rest = minDuration - (Date.now() - startAt)
	if (rest > 0) {
		if (hideTimer) clearTimeout(hideTimer)
		hideTimer = setTimeout(() => {
			hideTimer = null
			safeHide()
		}, rest)
	} else {
		safeHide()
	}
}

/** 等待一段时间，让 loading 有机会被用户看见 */
export function sleep(ms = 300) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 包一层：执行任务期间显示 loading，结束后按最短时长关闭
 * @param {string} title 文案
 * @param {Function} task 同步或异步任务
 * @param {number} minDuration 最短展示时长
 */
export async function withLoading(title, task, minDuration = 320) {
	showLoading(title)
	try {
		return await task()
	} finally {
		hideLoading(minDuration)
	}
}

/* ------------------------------------------------------------------
 * 页面切换 loading
 *
 * 两处触发：
 * 1. tabBar 点击 —— 原生 tabBar 没有拦截 API，只能在目标页 onShow 里开，
 *    点当前 tab 不会触发 onShow，天然不会闪
 * 2. navigateTo / redirectTo / switchTab / reLaunch —— 用 addInterceptor 统一拦截
 *
 * 页面在 onShow（tab 页）/ onReady（子页）里调 hidePageLoading 请求关闭，
 * 真正消失由 hideLoading 的最短展示时长决定，所以「秒开」的页面也能看见 loading。
 * ------------------------------------------------------------------ */

const PAGE_MIN_DURATION = 420
const PAGE_FALLBACK = 1500

let pageTimer = null
let pageVisible = false

/**
 * 显示页面切换 loading
 * @param {string} title 文案
 */
export function showPageLoading(title = '加载中') {
	if (pageTimer) {
		clearTimeout(pageTimer)
		pageTimer = null
	}
	// 同一次切换只真正 show 一次，避免拦截器和 onShow 各加一次计数
	if (!pageVisible) {
		pageVisible = true
		showLoading(title, false)
	}
	// 兜底：目标页没回调（页面报错、路由被拦）时不让遮罩一直挂着
	pageTimer = setTimeout(() => {
		pageTimer = null
		hidePageLoading()
	}, PAGE_FALLBACK)
}

/** 目标页已展示，请求关闭页面切换 loading */
export function hidePageLoading() {
	if (!pageVisible) return
	pageVisible = false
	if (pageTimer) {
		clearTimeout(pageTimer)
		pageTimer = null
	}
	hideLoading(PAGE_MIN_DURATION)
}

/**
 * 注册路由拦截，跳转瞬间就展示 loading
 * 在 App.vue 的 onLaunch 里调用一次即可
 */
export function installNavLoading() {
	if (typeof uni === 'undefined' || typeof uni.addInterceptor !== 'function') return
	const apis = ['navigateTo', 'redirectTo', 'switchTab', 'reLaunch']
	apis.forEach((api) => {
		uni.addInterceptor(api, {
			invoke() {
				showPageLoading()
			},
			fail() {
				// 跳转失败（页面不存在、栈满）要立刻收掉遮罩
				hidePageLoading()
			}
		})
	})
}
