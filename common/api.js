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
 * 默认走线上服务器（腾讯云 175.27.137.170，Nginx :80 → uvicorn :8100）。
 * 需要连自己电脑上的后端时，把 USE_LOCAL 改成 true 即可，不用改别的地方。
 *
 * 注意：线上是 http + IP，微信要求「正式版」接口必须是 https + 已备案域名，
 *      所以现在只能在开发者工具 / 真机预览里勾「不校验合法域名」时用。
 */
const PROD_BASE = 'http://175.27.137.170'
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

		// token 失效：清掉后重登一次再重放，只做一次，避免死循环
		if (status === 401 && auth === true && !options.__retriedAuth) {
			clearAuth()
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
 * 账号密码登录（账号不存在时后端按这个密码直接注册）。
 *
 * 请求头会带上当前 token：如果当前是游客账号，后端会把游客的收藏、
 * 错题、阅读记录和打卡并到这个正式账号上，刷过的题不会丢。
 *
 * captchaId / captchaCode 来自 fetchCaptcha()：验证码一次性，
 * 登录失败后必须重新取一张，不能拿旧的 id 重试。
 */
export async function loginPassword({ account, password, nickname, captchaId, captchaCode }) {
	const res = await request({
		url: '/api/auth/login',
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

export const api = {
	// 题库（只读）
	home: () => request({ url: '/api/home', auth: !!getToken() }),
	categories: () => request({ url: '/api/categories', auth: !!getToken() }),
	mirror: () => request({ url: '/api/catalog/mirror', auth: !!getToken() }),
	questions: (params) => request({ url: '/api/questions', params }),
	question: (id) => request({ url: '/api/questions/' + id, auth: !!getToken() }),
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
