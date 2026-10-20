/**
 * 前端面试鸭 · 本地数据层
 * 全部使用 uni.getStorageSync，H5 / 小程序通用
 */

const KEY_FAV = 'duck:favorites'
const KEY_WRONG = 'duck:wrongs'
const KEY_RECORD = 'duck:records'
const KEY_DAILY = 'duck:daily'
const KEY_STREAK = 'duck:streak'

function read(key, def) {
	try {
		const v = uni.getStorageSync(key)
		if (v === '' || v === null || typeof v === 'undefined') return def
		return v
	} catch (e) {
		return def
	}
}

function write(key, val) {
	try {
		uni.setStorageSync(key, val)
	} catch (e) {
		console.warn('storage write failed', key)
	}
}

function pad(n) {
	return n < 10 ? '0' + n : '' + n
}

export function dateStr(d) {
	const t = d || new Date()
	return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate())
}

function yesterdayStr() {
	const t = new Date()
	t.setDate(t.getDate() - 1)
	return dateStr(t)
}

/* ---------------- 收藏 ---------------- */
export function getFavorites() {
	const v = read(KEY_FAV, [])
	return Array.isArray(v) ? v : []
}

export function isFavorite(id) {
	return getFavorites().indexOf(id) > -1
}

export function toggleFavorite(id) {
	const list = getFavorites()
	const idx = list.indexOf(id)
	if (idx > -1) {
		list.splice(idx, 1)
	} else {
		list.unshift(id)
	}
	write(KEY_FAV, list)
	return idx === -1
}

/* ---------------- 错题 ---------------- */
export function getWrongs() {
	const v = read(KEY_WRONG, [])
	return Array.isArray(v) ? v : []
}

export function addWrong(id) {
	const list = getWrongs()
	if (list.indexOf(id) === -1) {
		list.unshift(id)
		write(KEY_WRONG, list)
	}
}

export function removeWrong(id) {
	const list = getWrongs().filter((x) => x !== id)
	write(KEY_WRONG, list)
}

/* ---------------- 已读记录 ---------------- */
// { [qid]: 1 }，问答没有对错，记 1 表示已读
export function getRecords() {
	const v = read(KEY_RECORD, {})
	return v && typeof v === 'object' ? v : {}
}

export function isDone(id) {
	const r = getRecords()
	return Object.prototype.hasOwnProperty.call(r, id)
}

export function isRight(id) {
	const r = getRecords()
	return r[id] === 1
}

/**
 * 记录一次阅读，同时维护每日进度与连续打卡
 */
export function recordAnswer(id, correct) {
	const records = getRecords()
	const first = !Object.prototype.hasOwnProperty.call(records, id)
	records[id] = correct ? 1 : 0
	write(KEY_RECORD, records)

	if (correct) {
		removeWrong(id)
	} else {
		addWrong(id)
	}

	if (first) bumpDaily()
	return records
}

function bumpDaily() {
	const today = dateStr()
	const daily = read(KEY_DAILY, { date: today, count: 0 })
	if (!daily || daily.date !== today) {
		write(KEY_DAILY, { date: today, count: 1 })
	} else {
		write(KEY_DAILY, { date: today, count: (daily.count || 0) + 1 })
	}

	const streak = read(KEY_STREAK, { last: '', days: 0 })
	if (!streak || !streak.last) {
		write(KEY_STREAK, { last: today, days: 1 })
	} else if (streak.last === today) {
		// 当天已打卡，不变
	} else if (streak.last === yesterdayStr()) {
		write(KEY_STREAK, { last: today, days: (streak.days || 0) + 1 })
	} else {
		write(KEY_STREAK, { last: today, days: 1 })
	}
}

export function getTodayCount() {
	const daily = read(KEY_DAILY, { date: dateStr(), count: 0 })
	if (!daily || daily.date !== dateStr()) return 0
	return daily.count || 0
}

export function getStreak() {
	const s = read(KEY_STREAK, { last: '', days: 0 })
	if (!s || !s.last) return 0
	if (s.last === dateStr() || s.last === yesterdayStr()) return s.days || 0
	return 0
}

export function getStats(total) {
	const records = getRecords()
	const ids = Object.keys(records)
	let right = 0
	ids.forEach((k) => {
		if (records[k] === 1) right++
	})
	const done = ids.length
	return {
		done: done,
		right: right,
		wrong: getWrongs().length,
		favorite: getFavorites().length,
		rate: done ? Math.round((right / done) * 100) : 0,
		progress: total ? Math.round((done / total) * 100) : 0,
		streak: getStreak(),
		today: getTodayCount()
	}
}

export function resetAll() {
	;[KEY_FAV, KEY_WRONG, KEY_RECORD, KEY_DAILY, KEY_STREAK].forEach((k) => {
		try {
			uni.removeStorageSync(k)
		} catch (e) {
			// ignore
		}
	})
}
