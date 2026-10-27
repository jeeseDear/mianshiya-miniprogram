/**
 * 前端面试鸭 · 统一请求层
 *
 * 页面里不再直接写 uni.request，所有网络细节（baseURL、token、超时、
 * 重试、401 重登、错误归一）都收在这一层，业务代码只关心「拿数据」。
 *
 * 约定：
 *   1. 成功返回响应体本身（已解析的 JSON），失败抛 ApiError
 *   2. auth: true 的接口会自动带上 token，没 token 时先静默游客登录
 *   3. 网络错误自动重试（指数退避），业务错误（4xx）不重试
 */

// 带版本号：换过默认后缀就不用担心 storage 里残留旧的本地地址
const KEY_BASE = 'duck:api-base:v2'
const KEY_TOKEN = 'duck:token'
const KEY_USER = 'duck:user'

/**
 * 后端地址。
 *
 * 线上：https://zttzmy.top（腾讯云 175.27.137.170，Nginx :443 → uvicorn :8100）
 *   - 证书由 Let's Encrypt 签发，含 zttzmy.top / www.zttzmy.top 两个域名
 *   - 80 端口对域名一律 301 跳 HTTPS，IP 直连仍可用（方便排查）
 * 本地调试：把 USE_LOCAL 改成 true，走自己电脑上的 server/。
 *
 * 注意：微信正式版要求接口必须是 https + 已备案域名，这个配置已经满足；
 *      还需要在「微信公众平台 → 开发管理 → 服务器域名」把它加进 request 合法域名。
 */
const PROD_BASE = 'https://zttzmy.top'
const DEV_BASE = 'http://127.0.0.1:8100'
const USE_LOCAL = false
const DEFAULT_BASE = USE_LOCAL ? DEV_BASE : PROD_BASE

function safeGet(key, def) {
	try {
		const v = uni.getStorageSync(key)
		if (v === '' || v === null || typeof v === 'undefined') return def
		return v
	} catch (e) {
		return def
	}
}

function safeSet(key, val) {
	try {
		uni.setStorageSync(key, val)
	} catch (e) {
		// 存储失败不影响主流程
	}
}

let baseUrl = safeGet(KEY_BASE, DEFAULT_BASE) || DEFAULT_BASE

export function getBaseUrl() {
	return baseUrl
}

export function setBaseUrl(url) {
	baseUrl = String(url || '').replace(/\/+$/, '') || DEFAULT_BASE
	safeSet(KEY_BASE, baseUrl)
	return baseUrl
}

/* ---------------- token / 用户 ---------------- */

export function getToken() {
	return safeGet(KEY_TOKEN, '') || ''
}

export function setToken(token) {
	if (token) safeSet(KEY_TOKEN, token)
}

export function getUser() {
	return safeGet(KEY_USER, null) || null
}

export function setUser(user) {
	safeSet(KEY_USER, user || null)
}

/** 当前是否游客（没登录正式账号，或用户主动以游客身份体验） */
export function isGuest() {
	const u = getUser()
	return !u || u.is_guest !== false
}

export function clearAuth() {
	try {
		uni.removeStorageSync(KEY_TOKEN)
		uni.removeStorageSync(KEY_USER)
	} catch (e) {
		// ignore
	}
}

/* ---------------- 错误类型 ---------------- */

export class ApiError extends Error {
	constructor(message, status, detail) {
		super(message)
		this.name = 'ApiError'
		this.status = status || 0
		this.detail = detail
	}

	/** 网络层失败（没连上、超时），页面可以决定走离线缓存 */
	get isNetwork() {
		return this.status === 0
	}

	/** 未登录 / token 失效 */
	get isAuth() {
		return this.status === 401
	}
}

function messageOf(res, fallback) {
	const d = res && res.data
	if (d && typeof d === 'object') {
		if (typeof d.detail === 'string') return d.detail
		if (Array.isArray(d.detail) && d.detail.length) {
			const first = d.detail[0]
			return (first.loc ? first.loc.join('.') + ': ' : '') + (first.msg || fallback)
		}
		if (typeof d.message === 'string') return d.message
	}
	return fallback || '请求失败'
}

function buildUrl(path, params) {
	const url = /^https?:\/\//i.test(path) ? path : baseUrl + path
	if (!params) return url
	const parts = []
	Object.keys(params).forEach((k) => {
		const v = params[k]
		if (v === undefined || v === null || v === '') return
		parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
	})
	if (!parts.length) return url
	return url + (url.indexOf('?') > -1 ? '&' : '?') + parts.join('&')
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function sendOnce(options) {
	const { method, url, data, timeout, auth } = options
	return new Promise((resolve, reject) => {
		const header = { 'Content-Type': 'application/json' }
		if (auth) {
			const token = getToken()
			if (token) header.Authorization = 'Bearer ' + token
		}
		uni.request({
			url,
			method,
			data,
			header,
			timeout,
			success: (res) => resolve(res),
			fail: (err) => reject(err)
		})
	})
}

/**
 * 发起请求。
 *
 * @param {object} options
 * @param {string} options.url        路径，如 '/api/home'
 * @param {string} [options.method]   GET / POST / DELETE ...
 * @param {object} [options.data]     请求体
 * @param {object} [options.params]   查询参数，自动拼接并编码
 * @param {boolean|'optional'} [options.auth]
 *        是否带登录态：true = 必须登录（没 token 先游客登录）；
 *        'optional' = 有 token 就带上、没有也不登录（登录接口自身用）
 * @param {number} [options.retry]    网络错误重试次数，默认 2
 * @param {number} [options.timeout]  超时毫秒，默认 12s
 */
export async function request(options) {
	const {
		url: path,
		method = 'GET',
		data,
		params,
		auth = false,
		retry = 2,
		timeout = 12000
	} = options || {}

	// 需要登录态的接口，没有 token 就先游客登录
	if (auth === true && !getToken()) {
		await loginGuest()
	}

	const url = buildUrl(path, params)
	let lastErr = null

	for (let attempt = 0; attempt <= retry; attempt++) {
		if (attempt > 0) await sleep(300 * Math.pow(2, attempt - 1))

		let res
		try {
			res = await sendOnce({ method, url, data, timeout, auth })
		} catch (err) {
			// 连接失败 / 超时：值得重试
			lastErr = new ApiError(
				'网络连接失败，请检查后端是否已启动（' + baseUrl + '）',
				0,
				err && err.errMsg
			)
			continue
		}

		const status = res.statusCode

		if (status >= 200 && status < 300) return res.data

		// token 失效：游客可以静默重建，正式账号必须让用户重新登录
		if (status === 401 && auth === true && !options.__retriedAuth) {
			const prev = getUser()
			const wasGuest = !prev || prev.is_guest !== false
			clearAuth()

			// 正式账号的 JWT 过期（默认 7 天）：绝不能悄悄换成游客身份，
			// 否则用户会以为收藏和进度全丢了。交给页面提示重新登录。
			if (!wasGuest) {
				throw new ApiError('登录已过期，请重新登录', 401, res.data)
			}

			try {
				await loginGuest()
			} catch (e) {
				throw new ApiError('登录失败', 401, e && e.message)
			}
			return request(Object.assign({}, options, { __retriedAuth: true, retry: 0 }))
		}

		// 4xx / 5xx 属于业务错误，重试没有意义
		throw new ApiError(messageOf(res, 'HTTP ' + status), status, res.data)
	}

	throw lastErr || new ApiError('请求失败', 0)
}

/* ---------------- 登录 ---------------- */

/** 登录成功后统一落盘：token + 用户信息 */
function saveAuth(res) {
	setToken(res.token)
	const user = {
		id: res.user_id,
		nickname: res.nickname,
		avatar: res.avatar || '',
		// 后端返回的是打码后的号码（138****8888），完整号码不下发
		phone: res.phone || '',
		account: res.account || '',
		// 后端没返回时按游客处理，避免把游客显示成「已登录」
		is_guest: res.is_guest !== false
	}
	setUser(user)
	return user
}

/** 游客登录（免配置，联调与体验用） */
export async function loginGuest() {
	const res = await request({
		url: '/api/auth/guest',
		method: 'POST',
		retry: 1
	})
	return saveAuth(res)
}

/**
 * 微信登录：wx.login 拿 code → 后端换 openid。
 *
 * 请求头会自动带上当前 token：如果当前是游客，后端会把游客的学习数据
 * 并到微信账号上，用户刷过的题不会因为登录而丢。
 *
 * 后端没配 WX_APPID 时返回 501，由调用方提示并提供「游客体验」入口。
 */
export async function loginWechat(profile) {
	const code = await new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			success: (r) => {
				if (r && r.code) resolve(r.code)
				else reject(new Error('未获取到登录 code'))
			},
			fail: reject
		})
	})
	const res = await request({
		url: '/api/auth/wechat',
		method: 'POST',
		data: {
			code,
			nickname: (profile && profile.nickname) || '面试鸭用户',
			avatar: (profile && profile.avatar) || ''
		},
		auth: 'optional',
		retry: 0
	})
	return saveAuth(res)
}

/**
 * 账号密码登录。账号不存在**不会**自动注册，注册走 register()。
 *
 * 请求头会带上当前 token：如果当前是游客账号，后端会把游客的收藏、
 * 错题、阅读记录和打卡并到这个正式账号上，刷过的题不会丢。
 *
 * captchaId / captchaCode 来自 fetchCaptcha()：验证码一次性，
 * 登录失败后必须重新取一张，不能拿旧的 id 重试。
 */
export async function loginPassword({ account, password, captchaId, captchaCode }) {
	const res = await request({
		url: '/api/auth/login',
		method: 'POST',
		data: {
			account,
			password,
			captcha_id: captchaId || '',
			captcha_code: captchaCode || ''
		},
		auth: 'optional',
		retry: 0
	})
	return saveAuth(res)
}

/**
 * 注册新账号，成功后直接就是登录态（后端返回 JWT），不用再登一次。
 *
 * 账号已存在时后端返回 409，前端提示「该账号已被注册」并切到登录页签。
 * 同样会带上当前游客 token，把游客期间的数据并过来。
 */
export async function register({ account, password, nickname, captchaId, captchaCode }) {
	const res = await request({
		url: '/api/auth/register',
		method: 'POST',
		data: {
			account,
			password,
			nickname: nickname || '',
			captcha_id: captchaId || '',
			captcha_code: captchaCode || ''
		},
		auth: 'optional',
		retry: 0
	})
	return saveAuth(res)
}

/**
 * 取一张图形验证码。
 * 返回 { captcha_id, image, ttl }，image 是 data:image/png;base64 直接给 image 组件用。
 * 答案在服务端，前端拿不到字符，只能靠人眼看图输入。
 */
export async function fetchCaptcha() {
	return request({ url: '/api/auth/captcha', retry: 1, timeout: 8000 })
}

/** 拉取当前登录用户，校准本地缓存的昵称 / 头像 / 游客标记 */
export async function fetchMe() {
	const res = await request({ url: '/api/auth/me', auth: true })
	const user = {
		id: res.id,
		nickname: res.nickname,
		avatar: res.avatar || '',
		phone: res.phone || '',
		account: res.account || '',
		is_guest: !!res.is_guest
	}
	setUser(user)
	return user
}

/** 修改昵称 / 头像 */
export async function updateProfile(profile) {
	const res = await request({
		url: '/api/auth/me',
		method: 'PATCH',
		data: profile,
		auth: true,
		retry: 0
	})
	const user = {
		id: res.id,
		nickname: res.nickname,
		avatar: res.avatar || '',
		phone: res.phone || '',
		account: res.account || '',
		is_guest: !!res.is_guest
	}
	setUser(user)
	return user
}

/**
 * 退出登录：清掉本地身份，再换一个游客身份。
 * 服务端数据不删，下次用同一个账号登录还能找回来。
 */
export async function logout() {
	clearAuth()
	try {
		return await loginGuest()
	} catch (e) {
		// 断网时也能退出，只是暂时没有 token
		return null
	}
}

/* ---------------- 业务接口 ---------------- */

/* ---------------- 流式接口 ---------------- */

/** 跨块解码 UTF-8：一个中文字可能被切在两个 chunk 之间，必须带 stream 标记 */
function makeChunkDecoder() {
	if (typeof TextDecoder === 'undefined') {
		// 基础库低于 2.16 没有 TextDecoder，这条路只保证不崩，中文可能断字
		return function (buf) {
			const bytes = new Uint8Array(buf)
			let out = ''
			for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i])
			return out
		}
	}
	const decoder = new TextDecoder('utf-8')
	return function (buf) {
		return decoder.decode(buf, { stream: true })
	}
}

function streamError(err) {
	const msg = (err && (err.errMsg || err.message)) || ''
	if (msg.indexOf('timeout') > -1 || msg.indexOf('超时') > -1) return '生成超时，请重试'
	return '网络连接失败，请检查网络后重试'
}

/**
 * AI 解析（流式）。
 *
 * 各端接收方式不同，在这里统一抹平：
 *   - H5 / Android APK（WebView）：fetch + ReadableStream 逐块读
 *   - 微信小程序：uni.request 的 enableChunked + onChunkReceived
 *
 * handlers: { onChunk(增量文本), onDone(), onError(消息) }
 * 返回 abort 函数，页面卸载时调用可立刻断开，别让请求在后台空跑。
 *
 * 这里没有用 SSE —— 后端返回的是带 @@XXX@@ 标记的纯文本，前端按行切
 * 就够了，省掉一层 event 格式解析。
 */
export function aiExplainStream(id, handlers) {
	const opts = handlers || {}
	const token = getToken()
	const header = token ? { Authorization: 'Bearer ' + token } : {}
	const url = baseUrl + '/api/questions/' + encodeURIComponent(id) + '/ai/stream'
	let aborted = false

	const emit = (text) => {
		if (!aborted && text) opts.onChunk && opts.onChunk(text)
	}
	const finish = () => {
		if (!aborted) opts.onDone && opts.onDone()
	}
	const fail = (msg) => {
		if (!aborted) opts.onError && opts.onError(msg)
	}

	// #ifdef MP-WEIXIN
	const decode = makeChunkDecoder()
	let received = false
	const task = uni.request({
		url,
		method: 'GET',
		header,
		enableChunked: true,
		responseType: 'arraybuffer',
		timeout: 180000,
		success: (res) => {
			// 基础库过低时不会触发分块回调，用完整响应兜一次
			if (!received && res && res.data) {
				received = true
				emit(decode(res.data))
			}
			finish()
		},
		fail: (err) => fail(streamError(err))
	})
	if (task && typeof task.onChunkReceived === 'function') {
		task.onChunkReceived((res) => {
			received = true
			emit(decode(res.data))
		})
	}
	return function () {
		aborted = true
		try {
			task.abort()
		} catch (e) {
			/* 已结束 */
		}
	}
	// #endif

	// #ifndef MP-WEIXIN
	const decode = makeChunkDecoder()
	const controller = typeof AbortController !== 'undefined' ? new AbortController() : null

	;(async function () {
		let res
		try {
			res = await fetch(url, {
				method: 'GET',
				headers: Object.assign({ Accept: 'text/plain' }, header),
				signal: controller ? controller.signal : undefined
			})
		} catch (err) {
			if (aborted || (err && err.name === 'AbortError')) return
			return fail(streamError(err))
		}

		if (!res.ok) {
			let detail = ''
			try {
				detail = (await res.text()).slice(0, 200)
			} catch (e) {
				/* ignore */
			}
			return fail(detail || 'HTTP ' + res.status)
		}

		// 老 WebView 不支持流式读取：退化成一次性拿全，功能不受影响
		if (!res.body || typeof res.body.getReader !== 'function') {
			try {
				emit(await res.text())
				finish()
			} catch (err) {
				fail(streamError(err))
			}
			return
		}

		const reader = res.body.getReader()
		try {
			for (;;) {
				const chunk = await reader.read()
				if (chunk.done) break
				if (aborted) {
					try {
						reader.cancel()
					} catch (e) {
						/* ignore */
					}
					return
				}
				emit(decode(chunk.value))
			}
			finish()
		} catch (err) {
			if (aborted) return
			fail(streamError(err))
		}
	})()

	return function () {
		aborted = true
		if (controller) {
			try {
				controller.abort()
			} catch (e) {
				/* ignore */
			}
		}
	}
	// #endif
}

export const api = {
	// 题库（只读）
	home: () => request({ url: '/api/home', auth: !!getToken() }),
	categories: () => request({ url: '/api/categories', auth: !!getToken() }),
	mirror: () => request({ url: '/api/catalog/mirror', auth: !!getToken() }),
	questions: (params) => request({ url: '/api/questions', params }),
	question: (id) => request({ url: '/api/questions/' + id, auth: !!getToken() }),
	// AI 解析：首次生成要等模型（5~20 秒），超时放大到 60 秒；
	// retry 必须为 0 —— 失败重试会让模型调用翻倍，白花钱。
	aiExplain: (id) =>
		request({
			url: '/api/questions/' + id + '/ai',
			auth: !!getToken(),
			timeout: 60000,
			retry: 0
		}),
	daily: () => request({ url: '/api/questions/daily' }),
	hot: (n) => request({ url: '/api/questions/hot', params: { n: n || 5 } }),
	random: (cat, exclude) =>
		request({ url: '/api/questions/random', params: { cat, exclude } }),
	search: (keyword, cat, limit) =>
		request({ url: '/api/search', params: { q: keyword, cat, limit: limit || 20 } }),
	knowledge: (cat) => request({ url: '/api/knowledge', params: { cat, with_points: true } }),
	knowledgeOne: (id) => request({ url: '/api/knowledge/' + id }),

	// 我的（需要登录）
	summary: () => request({ url: '/api/me/summary', auth: true }),
	stats: () => request({ url: '/api/me/stats', auth: true }),
	records: (cat) => request({ url: '/api/me/records', params: { cat }, auth: true }),
	saveRecord: (questionId, correct) =>
		request({
			url: '/api/me/records',
			method: 'POST',
			data: { question_id: questionId, correct: !!correct },
			auth: true,
			retry: 0
		}),
	favorites: (page, size) =>
		request({ url: '/api/me/favorites', params: { page: page || 1, size: size || 100 }, auth: true }),
	addFavorite: (id) =>
		request({ url: '/api/me/favorites/' + id, method: 'POST', auth: true, retry: 0 }),
	removeFavorite: (id) =>
		request({ url: '/api/me/favorites/' + id, method: 'DELETE', auth: true, retry: 0 }),
	wrongs: (page, size) =>
		request({ url: '/api/me/wrongs', params: { page: page || 1, size: size || 100 }, auth: true }),
	removeWrong: (id) =>
		request({ url: '/api/me/wrongs/' + id, method: 'DELETE', auth: true, retry: 0 }),
	resetProgress: () =>
		request({ url: '/api/me/progress', method: 'DELETE', auth: true, retry: 0 })
}

export default api
