/**
 * 前端面试鸭 · 启动引导
 *
 * 应用启动时做三件事，页面不需要关心任何网络细节：
 *   ① 游客登录（拿 token，后续接口才有身份）
 *   ② 同步题库镜像（有缓存时只做版本校验，秒回）
 *   ③ 同步用户数据（收藏 / 错题 / 记录 / 统计）
 *
 * 全程「后台进行 + 失败静默」：断网时用户照样能刷已缓存的题库，
 * 只是收藏和进度暂存本地队列，联网后自动补发。
 */

import { loginGuest, getToken, clearAuth, getUser, getBaseUrl } from './api.js'
import { refreshCatalog, isCatalogLoaded, markCatalogError } from './question-source.js'
import { syncUserData } from './user-store.js'

/** 同一个启动流程只跑一次，多次调用复用同一个 Promise */
let bootPromise = null
/** 数据是否已经至少同步成功过一次 */
let ready = false
/** 注册的回调，页面可以在数据就绪后再刷新一次视图 */
const listeners = []

export function isReady() {
	return ready
}

export function onReady(cb) {
	if (typeof cb !== 'function') return () => {}
	if (ready) {
		cb()
		return () => {}
	}
	listeners.push(cb)
	return () => {
		const i = listeners.indexOf(cb)
		if (i > -1) listeners.splice(i, 1)
	}
}

function emitReady() {
	ready = true
	const list = listeners.slice()
	listeners.length = 0
	list.forEach((cb) => {
		try {
			cb()
		} catch (e) {
			console.warn('[bootstrap] listener error', e)
		}
	})
}

/**
 * 把网络异常翻译成「用户照着做就能解决」的一句话。
 * 直接显示「网络不给力」没有意义——本地开发最常见的原因是后端没启动。
 */
function offlineReason(e) {
	if (e && e.status === 0) {
		return '连不上 ' + getBaseUrl() + '，请确认后端服务已启动'
	}
	return (e && e.message) || '题库同步失败'
}

/**
 * 完整启动流程。
 * @param {object} [options]
 * @param {boolean} [options.force] 强制重新拉题库（下拉刷新时用）
 */
export function bootstrap(options) {
	const force = options && options.force

	if (bootPromise && !force) return bootPromise

	const p = (async () => {
		// 1. 登录：已有 token 就复用，但要验证是否仍然有效
		if (!getToken()) {
			try {
				await loginGuest()
			} catch (e) {
				console.warn('[bootstrap] 登录失败，进入离线模式', e && e.message)
				markCatalogError(offlineReason(e))
				return false
			}
		}

		// 2. 题库镜像 + 用户数据并行拉，谁慢谁拖后腿，但互不阻塞
		const results = await Promise.all([
			refreshCatalog(force)
				.then(() => true)
				.catch((e) => {
					console.warn('[bootstrap] 题库同步失败，使用本地缓存', e && e.message)
					markCatalogError(offlineReason(e))
					return isCatalogLoaded()
				}),
			syncUserData({ silent: true }).then((ok) => {
				// token 失效（比如后端换了数据库）时重登一次
				if (!ok) {
					const cached = getUser()
					// 正式账号的 token 失效：不静默降级成游客。
					// 游客登录会换成一个空账号，用户会看到「进度全没了」，
					// 这里只清本地身份，由「我的」页引导重新登录。
					if (cached && cached.is_guest === false) {
						clearAuth()
						return false
					}
					clearAuth()
					return loginGuest()
						.then(() => syncUserData({ silent: true }))
						.catch(() => false)
				}
				return true
			})
		])

		const ok = results[0] || results[1]
		if (ok) emitReady()
		return ok
	})()

	// 失败（含「离线返回 false」）都允许下次重试，不要永久缓存失败结果，
	// 否则用户先断网打开、再联网时页面永远拿不到数据。
	// 用局部变量 p 判断，避免误清掉后续新发起的 bootPromise。
	bootPromise = p
	p.then((ok) => {
		if (!ok && bootPromise === p) bootPromise = null
	}).catch(() => {
		if (bootPromise === p) bootPromise = null
	})

	return p
}

/**
 * 页面里用它替代裸调用：确保启动流程已跑完，且用户数据是最新的。
 * 失败不抛错，页面照常展示（可能只有缓存数据）。
 */
export async function ensureReady() {
	if (ready) return true
	try {
		return await bootstrap()
	} catch (e) {
		return false
	}
}

/** 手动刷新（下拉刷新 / 从后台切回时用），题库和用户数据都更新 */
export async function refreshAll() {
	bootPromise = null
	ready = false
	return bootstrap({ force: false })
}
