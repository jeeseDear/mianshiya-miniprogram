/**
 * 前端面试鸭 · 用户学习数据（云端版）
 *
 * 替换 common/interview-store.js 的调用位置，函数名保持一致，
 * 区别只有两点：
 *   1. 写操作变成 async（收藏、答题、清空）
 *   2. 读操作仍是同步（读内存缓存），因为模板和 computed 里没法 await
 *
 * 三个关键设计：
 *   ① 乐观更新 —— 点收藏立刻变星，不等网络往返
 *   ② 失败回滚 —— 接口报错时把状态还原，避免「看起来收藏了其实没存」
 *   ③ 离线队列 —— 断网时的操作先落本地队列，下次联网自动重放，不丢数据
 */

import { api, getToken, clearAuth } from './api.js'

const KEY_PENDING = 'duck:pending-ops'

const state = {
	ready: false,
	/** { [questionId]: 1 | 0 }，与旧版本地结构一致 */
	records: {},
	favIds: [],
	wrongIds: [],
	today: 0,
	streak: 0
}

function pad(n) {
	return n < 10 ? '0' + n : '' + n
}

export function dateStr(d) {
	const t = d || new Date()
	return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate())
}

/* ---------------- 索引辅助 ---------------- */

function toRecordMap(list) {
	const map = {}
	;(list || []).forEach((r) => {
		map[r.question_id] = r.correct ? 1 : 0
	})
	return map
}

function toIdList(list) {
	return (list || []).map((x) => x.id)
}

function addId(list, id) {
	if (list.indexOf(id) === -1) list.unshift(id)
}

function removeId(list, id) {
	const i = list.indexOf(id)
	if (i > -1) list.splice(i, 1)
}

function snapshot() {
	return {
		records: Object.assign({}, state.records),
		favIds: state.favIds.slice(),
		wrongIds: state.wrongIds.slice(),
		today: state.today,
		streak: state.streak
	}
}

function restore(snap) {
	state.records = snap.records
	state.favIds = snap.favIds
	state.wrongIds = snap.wrongIds
	state.today = snap.today
	state.streak = snap.streak
}

/* ---------------- 离线队列 ---------------- */

function readPending() {
	try {
		const v = uni.getStorageSync(KEY_PENDING)
		return Array.isArray(v) ? v : []
	} catch (e) {
		return []
	}
}

function writePending(list) {
	try {
		if (list.length) uni.setStorageSync(KEY_PENDING, list)
		else uni.removeStorageSync(KEY_PENDING)
	} catch (e) {
		// ignore
	}
}

function enqueue(op) {
	const list = readPending()
	// 同一题的操作只保留最后一次，避免队列无限增长
	const filtered = list.filter((x) => !(x.id === op.id && x.type === op.type))
	filtered.push(op)
	writePending(filtered)
}

export function pendingCount() {
	return readPending().length
}

/** 把离线期间攒下的操作补发给服务端 */
export async function flushPending() {
	const list = readPending()
	if (!list.length) return 0

	const remain = []
	for (let i = 0; i < list.length; i++) {
		const op = list[i]
		try {
			if (op.type === 'record') await api.saveRecord(op.id, op.correct)
			else if (op.type === 'fav') {
				if (op.on) await api.addFavorite(op.id)
				else await api.removeFavorite(op.id)
			}
		} catch (e) {
			// 401 说明身份已失效，重放没有意义，直接丢弃
			if (!(e && e.status === 401)) remain.push(op)
		}
	}
	writePending(remain)
	return list.length - remain.length
}

/* ---------------- 同步 ---------------- */

/** 收藏/错题接口是分页的，这里一次拉全（当前量级远小于 100，循环只为正确性） */
async function fetchAll(fetcher, size) {
	const out = []
	let page = 1
	for (;;) {
		const batch = await fetcher(page, size || 100)
		out.push.apply(out, batch)
		if (batch.length < (size || 100)) break
		page += 1
		if (page > 50) break // 防御性上限
	}
	return out
}

/**
 * 从服务端同步用户数据（登录后、页面 onShow 时调用）。
 *
 * @param {object} [options]
 * @param {boolean} [options.silent] 失败时不抛错（离线场景用）
 * @returns {Promise<boolean>} 是否成功
 */
export async function syncUserData(options) {
	const silent = options && options.silent

	// 没有身份就拿不到「我的」数据，交给 bootstrap 先完成登录
	if (!getToken()) return false

	try {
		// 先把离线操作补发，再拉最新状态，避免刚补的数据被覆盖
		await flushPending()

		const [records, favorites, wrongs, stats] = await Promise.all([
			api.records(),
			fetchAll(api.favorites),
			fetchAll(api.wrongs),
			api.stats()
		])

		state.records = toRecordMap(records)
		state.favIds = toIdList(favorites)
		state.wrongIds = toIdList(wrongs)
		state.today = stats.today || 0
		state.streak = stats.streak || 0
		state.ready = true
		return true
	} catch (e) {
		if (e && e.status === 401) clearAuth()
		if (silent) return false
		throw e
	}
}

export function isReady() {
	return state.ready
}

/**
 * 清空内存里的用户数据（退出登录时用）。
 * 只清当前进程的缓存，不动服务端、也不动离线队列 —— 真正删数据请用 resetAll()。
 */
export function clearLocal() {
	state.ready = false
	state.records = {}
	state.favIds = []
	state.wrongIds = []
	state.today = 0
	state.streak = 0
}

/* ---------------- 同步读取（模板/计算属性用） ---------------- */

export function getRecords() {
	return state.records
}

export function isDone(id) {
	return Object.prototype.hasOwnProperty.call(state.records, id)
}

export function isRight(id) {
	return state.records[id] === 1
}

export function getFavorites() {
	return state.favIds
}

export function isFavorite(id) {
	return state.favIds.indexOf(id) > -1
}

export function getWrongs() {
	return state.wrongIds
}

export function getTodayCount() {
	return state.today
}

export function getStreak() {
	return state.streak
}

/**
 * 统计。口径与后端 services.get_stats 一致，
 * 但这里在本地算，写完立刻准确，不用等下一次同步。
 */
export function getStats(total) {
	const ids = Object.keys(state.records)
	let right = 0
	ids.forEach((k) => {
		if (state.records[k] === 1) right++
	})
	const done = ids.length
	const totalNum = total || 0

	return {
		done: done,
		right: right,
		wrong: state.wrongIds.length,
		favorite: state.favIds.length,
		rate: done ? Math.round((right / done) * 100) : 0,
		progress: totalNum ? Math.round((done / totalNum) * 100) : 0,
		streak: state.streak,
		today: state.today
	}
}

/* ---------------- 写操作（异步 + 乐观更新） ---------------- */

/**
 * 记录一次作答。
 * 规则与服务端一致：答对移出错题本，答错进错题本，首答才累加今日进度。
 *
 * @returns {Promise<{firstTime: boolean, favorited: boolean}>}
 */
export async function recordAnswer(id, correct) {
	const snap = snapshot()
	const firstTime = !Object.prototype.hasOwnProperty.call(state.records, id)

	// 1. 先改本地，UI 立即生效
	state.records[id] = correct ? 1 : 0
	if (correct) removeId(state.wrongIds, id)
	else addId(state.wrongIds, id)
	if (firstTime) state.today += 1

	// 2. 再上报
	try {
		const res = await api.saveRecord(id, correct)
		// 用服务端口校准今日进度与连续天数
		if (typeof res.today === 'number') state.today = res.today
		if (typeof res.streak === 'number') state.streak = res.streak
		return { firstTime: !!res.first_time, favorited: isFavorite(id) }
	} catch (e) {
		if (e && e.status === 401) {
			restore(snap)
			throw e
		}
		// 网络问题：保留本地结果，进队列等联网补发
		enqueue({ type: 'record', id: id, correct: !!correct })
		return { firstTime: firstTime, favorited: isFavorite(id), offline: true }
	}
}

/**
 * 切换收藏。
 * @returns {Promise<boolean>} 切换后的状态（true = 已收藏）
 */
export async function toggleFavorite(id) {
	const snap = snapshot()
	const on = !isFavorite(id)

	state.favIds = state.favIds.slice()
	if (on) addId(state.favIds, id)
	else removeId(state.favIds, id)

	try {
		if (on) await api.addFavorite(id)
		else await api.removeFavorite(id)
		return on
	} catch (e) {
		if (e && e.status === 401) {
			restore(snap)
			throw e
		}
		enqueue({ type: 'fav', id: id, on: on })
		return on
	}
}

/** 移出错题本 */
export async function removeWrong(id) {
	const snap = snapshot()
	state.wrongIds = state.wrongIds.slice()
	removeId(state.wrongIds, id)
	try {
		await api.removeWrong(id)
	} catch (e) {
		if (e && e.status === 401) {
			restore(snap)
			throw e
		}
	}
}

/**
 * 清空学习数据。
 * 对应后端 DELETE /api/me/progress，同时清掉本地离线队列。
 */
export async function resetAll() {
	const snap = snapshot()
	state.records = {}
	state.favIds = []
	state.wrongIds = []
	state.today = 0
	state.streak = 0
	writePending([])

	try {
		await api.resetProgress()
	} catch (e) {
		restore(snap)
		if (e && e.status === 401) clearAuth()
		throw e
	}
}
