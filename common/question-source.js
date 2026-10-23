/**
 * 前端面试鸭 · 题库数据源（云端镜像）
 *
 * 设计目标：**页面代码不用改写法**。
 * 原来 `import { qaOfCat } from '@/common/interview-data.js'` 的地方，
 * 换成 `import { qaOfCat } from '@/common/question-source.js'` 即可——
 * 函数名、参数、返回结构完全一致，只是数据来自后端而不是打包进包的 JS。
 *
 * 为什么用「镜像」而不是全异步：
 *   分类列表、上一题/下一题、分类题量都是 computed 里同步取的，
 *   改成 async 会把 5 个页面的模板全部重写，且翻页时会闪空白。
 *   真实项目里这类「只读、变化慢」的数据都是：
 *     启动读本地缓存（快、可离线） → 后台拉接口（新） → 版本号变了才替换。
 *   详情页（qa / knowledge）才是真正按需 await 的地方，那里只有一条数据。
 *
 * 数据分层：
 *   目录层（cat / title / short / hot / level）→ 镜像，本地缓存，同步可读
 *   详情层（points / detail / extend）        → 按需拉，只放内存
 */

import { api } from './api.js'

const KEY_CATALOG = 'duck:catalog'
const KEY_CATALOG_VERSION = 'duck:catalog-version'

/** 分类角标文案，后端不存这个字段，前端维护 */
export const levelText = {
	1: '简单',
	2: '中等',
	3: '困难'
}

const state = {
	/** 是否已从本地缓存或网络加载过 */
	loaded: false,
	/** 服务端题库版本号，用于判断缓存是否过期 */
	version: '',
	categories: [],
	questions: [],
	knowledge: [],
	/** 索引：id -> brief / cat -> brief[]，避免每次 filter 全表 */
	briefMap: {},
	byCat: {},
	knowMap: {},
	knowByCat: {},
	/** 详情缓存，只放内存：553 题的详情有几 MB，写 storage 会爆 */
	detailCache: {},
	knowDetailCache: {},
	/** 上次同步失败的原因，页面据此显示可读的排查提示 */
	error: ''
}

/**
 * 记录同步失败原因（由 bootstrap 在 catch 里调用）。
 * 题库为空时页面要把这句话直接展示出来，否则用户只看到一片空白。
 */
export function markCatalogError(reason) {
	state.error = String(reason || '') || '题库同步失败'
}

export function clearCatalogError() {
	state.error = ''
}

/** 上次同步失败的原因；成功过则为空串 */
export function getCatalogError() {
	return state.error
}

function rebuildIndex() {
	const briefMap = {}
	const byCat = {}
	state.questions.forEach((q) => {
		briefMap[q.id] = q
		if (!byCat[q.cat]) byCat[q.cat] = []
		byCat[q.cat].push(q)
	})

	const knowMap = {}
	const knowByCat = {}
	state.knowledge.forEach((k) => {
		knowMap[k.id] = k
		if (!knowByCat[k.cat]) knowByCat[k.cat] = []
		knowByCat[k.cat].push(k)
	})

	state.briefMap = briefMap
	state.byCat = byCat
	state.knowMap = knowMap
	state.knowByCat = knowByCat
}

function applyCatalog(data) {
	state.categories = (data.categories || []).slice()
	state.questions = (data.questions || []).slice()
	state.knowledge = (data.knowledge || []).slice()
	state.version = data.version || ''
	state.loaded = true
	rebuildIndex()
}

/** 从本地缓存同步恢复（模块加载时立即执行，保证首帧就有数据） */
function hydrate() {
	try {
		const cached = uni.getStorageSync(KEY_CATALOG)
		if (cached && cached.questions && cached.questions.length) {
			applyCatalog(cached)
			state.version = uni.getStorageSync(KEY_CATALOG_VERSION) || cached.version || ''
		}
	} catch (e) {
		// 缓存损坏就当没有，走网络
	}
}

hydrate()

function persist() {
	try {
		uni.setStorageSync(
			KEY_CATALOG,
			{
				version: state.version,
				categories: state.categories,
				questions: state.questions,
				knowledge: state.knowledge
			}
		)
		uni.setStorageSync(KEY_CATALOG_VERSION, state.version)
	} catch (e) {
		// 超出存储配额时静默忽略，下次启动再拉即可
		console.warn('[catalog] 缓存写入失败', e)
	}
}

/* ---------------- 同步加载 / 刷新 ---------------- */

export function isCatalogLoaded() {
	return state.questions.length > 0
}

export function getCatalogVersion() {
	return state.version
}

/**
 * 刷新题库镜像。
 *
 * @param {boolean} force true 时忽略版本号强制替换
 * @returns {Promise<boolean>} 数据是否发生变化
 */
export async function refreshCatalog(force) {
	const data = await api.mirror()

	const sameVersion = data.version && data.version === state.version
	const hasData = state.questions.length > 0
	if (!sameVersion || !hasData) {
		applyCatalog(data)
		persist()
	}
	// 只要接口通就清掉错误，哪怕版本没变
	state.error = ''
	return !(!force && sameVersion && hasData)
}

/* ---------------- 分类 ---------------- */

export function getCategories() {
	return state.categories
}

export function getCategory(id) {
	return state.categories.find((c) => c.id === id) || null
}

/* ---------------- 题目（同步读） ---------------- */

export function allQuestions() {
	return state.questions
}

export function countQa(cat) {
	if (!cat) return state.questions.length
	return (state.byCat[cat] || []).length
}

export function qaOfCat(cat) {
	return state.byCat[cat] || []
}

export function findQa(id) {
	return state.briefMap[id] || null
}

export function indexOfQa(id, cat) {
	const list = cat ? qaOfCat(cat) : state.questions
	return list.findIndex((q) => q.id === id)
}

/**
 * 每日一题：日期做种子，同一天固定一题。
 * 优先用服务端结果（refresh 后写入），离线时本地按同样算法算。
 */
let dailyCache = { day: '', item: null }

export function dailyQa() {
	if (!state.questions.length) return null
	const d = new Date()
	const day = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
	if (dailyCache.day === day && dailyCache.item) return dailyCache.item

	const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
	const item = state.questions[seed % state.questions.length]
	dailyCache = { day, item }
	return item
}

/** 后台校准每日一题（服务端用题目总数取模，分页顺序可能与本地不同） */
export async function syncDailyQuestion() {
	try {
		const item = await api.daily()
		const d = new Date()
		dailyCache = {
			day: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
			item
		}
		return item
	} catch (e) {
		return dailyQa()
	}
}

export function hotQa(n) {
	return state.questions
		.slice()
		.sort((a, b) => (b.hot || 0) - (a.hot || 0))
		.slice(0, n || 5)
}

export function randomQa(cat, excludeId) {
	const pool = cat ? qaOfCat(cat) : state.questions
	if (!pool.length) return null
	const candidates =
		pool.length > 1 && excludeId ? pool.filter((q) => q.id !== excludeId) : pool
	return candidates[Math.floor(Math.random() * candidates.length)] || pool[0]
}

/** 本地搜索：只搜题干和一句话回答，命中快、可离线；全文结果由后端补 */
export function searchQaLocal(keyword, limit) {
	const kw = String(keyword || '')
		.trim()
		.toLowerCase()
	if (!kw) return []
	const out = []
	for (let i = 0; i < state.questions.length; i++) {
		const q = state.questions[i]
		const hay = (q.title + ' ' + (q.short || '')).toLowerCase()
		if (hay.indexOf(kw) > -1) {
			out.push(q)
			if (out.length >= (limit || 20)) break
		}
	}
	return out
}

/* ---------------- 题目详情（异步按需） ---------------- */

export function getCachedDetail(id) {
	return state.detailCache[id] || null
}

/**
 * 拉题目详情（含数据点/详细答案/上下题）。
 * 命中内存缓存直接返回，页面「上一题/下一题」来回切不会重复请求。
 */
export async function fetchQaDetail(id, options) {
	const cacheFirst = !options || options.cache !== false
	if (cacheFirst && state.detailCache[id]) return state.detailCache[id]

	const item = await api.question(id)
	state.detailCache[id] = item
	return item
}

/* ---------------- 知识点 ---------------- */

export function getKnowledgeList() {
	return state.knowledge
}

export function knowledgeOfCat(cat) {
	return state.knowByCat[cat] || []
}

export function findKnowledge(id) {
	return state.knowMap[id] || null
}

export function countKnowledge(cat) {
	if (!cat) return state.knowledge.length
	return (state.knowByCat[cat] || []).length
}

export function searchKnowledgeLocal(keyword, limit) {
	const kw = String(keyword || '')
		.trim()
		.toLowerCase()
	if (!kw) return []
	const out = []
	for (let i = 0; i < state.knowledge.length; i++) {
		const k = state.knowledge[i]
		if (((k.title || '') + ' ' + (k.summary || '')).toLowerCase().indexOf(kw) > -1) {
			out.push(k)
			if (out.length >= (limit || 20)) break
		}
	}
	return out
}

export function getCachedKnowledge(id) {
	return state.knowDetailCache[id] || null
}

export async function fetchKnowledgeDetail(id) {
	if (state.knowDetailCache[id]) return state.knowDetailCache[id]
	const item = await api.knowledgeOne(id)
	state.knowDetailCache[id] = item
	return item
}

/** 清空镜像缓存（「清空学习数据」时用不到，调试时方便） */
export function clearCatalogCache() {
	state.questions = []
	state.knowledge = []
	state.categories = []
	state.briefMap = {}
	state.byCat = {}
	state.knowMap = {}
	state.knowByCat = {}
	state.detailCache = {}
	state.knowDetailCache = {}
	state.loaded = false
	state.version = ''
	try {
		uni.removeStorageSync(KEY_CATALOG)
		uni.removeStorageSync(KEY_CATALOG_VERSION)
	} catch (e) {
		// ignore
	}
}
