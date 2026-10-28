<template>
	<view class="kart">
		<!-- 全部画在 canvas 上：小程序的 canvas 是原生组件，普通 view 盖不上去 -->
		<canvas
			:id="canvasId"
			:canvas-id="canvasId"
			type="2d"
			class="stage"
			@touchstart.stop="onTouchStart"
			@touchmove.stop="onTouchMove"
			@touchend.stop="onTouchEnd"
			@touchcancel.stop="onTouchEnd"
		></canvas>

		<!-- cover-view 才能压在小程序原生画布之上 -->
		<cover-view class="back-btn" :style="{ top: statusBar + 8 + 'px' }" @tap="goBack">←</cover-view>
	</view>
</template>

<script>
	import { navBack } from '@/common/nav.js'

	// 最快单圈（毫秒）存这里，列表页按 mm:ss.cc 显示
	const BEST_KEY = 'kart_best'
	const LAPS = 3

	// 赛道尺寸（世界坐标）
	const ROAD = 176 // 路面宽度
	const HALF = ROAD / 2
	const SHOULDER = 84 // 路肩草皮宽度，再往外是护栏
	const STEP = 9 // 中心线采样间距

	const TRACKS = [
		{
			name: '翠谷环道',
			grass: '#2f7d4f',
			grass2: '#2b7148',
			grass3: '#38905c',
			edge: '#1d5033',
			road: '#4c525a',
			road2: '#575e67',
			kerb1: '#e2574c',
			kerb2: '#f4f1e8',
			line: 'rgba(255,255,255,0.5)',
			pts: [
				{ x: 360, y: 1300 },
				{ x: 520, y: 1520 },
				{ x: 900, y: 1580 },
				{ x: 1300, y: 1560 },
				{ x: 1650, y: 1420 },
				{ x: 1840, y: 1150 },
				{ x: 1800, y: 860 },
				{ x: 1560, y: 760 },
				{ x: 1250, y: 830 },
				{ x: 980, y: 720 },
				{ x: 700, y: 760 },
				{ x: 450, y: 700 },
				{ x: 250, y: 900 },
				{ x: 240, y: 1120 }
			]
		},
		{
			name: '沙海环道',
			grass: '#cba96c',
			grass2: '#c3a063',
			grass3: '#d8b87c',
			edge: '#8d6f3f',
			road: '#5b5148',
			road2: '#665b50',
			kerb1: '#e2574c',
			kerb2: '#f7f0df',
			line: 'rgba(255,248,225,0.55)',
			pts: [
				{ x: 300, y: 900 },
				{ x: 320, y: 1200 },
				{ x: 580, y: 1420 },
				{ x: 950, y: 1450 },
				{ x: 1300, y: 1500 },
				{ x: 1700, y: 1420 },
				{ x: 1900, y: 1150 },
				{ x: 1880, y: 840 },
				{ x: 1650, y: 650 },
				{ x: 1300, y: 700 },
				{ x: 1050, y: 900 },
				{ x: 800, y: 1020 },
				{ x: 560, y: 900 }
			]
		},
		{
			name: '夜港环道',
			grass: '#1f3d4d',
			grass2: '#1b3644',
			grass3: '#264a5c',
			edge: '#0f2531',
			road: '#3b4149',
			road2: '#464d56',
			kerb1: '#38d6ff',
			kerb2: '#eef6ff',
			line: 'rgba(180,235,255,0.5)',
			pts: [
				{ x: 420, y: 1260 },
				{ x: 620, y: 1440 },
				{ x: 980, y: 1400 },
				{ x: 1220, y: 1180 },
				{ x: 1520, y: 1240 },
				{ x: 1780, y: 1050 },
				{ x: 1830, y: 760 },
				{ x: 1580, y: 640 },
				{ x: 1320, y: 720 },
				{ x: 1080, y: 620 },
				{ x: 800, y: 640 },
				{ x: 520, y: 780 },
				{ x: 300, y: 1000 }
			]
		}
	]

	// 车身配色：0 号是玩家
	const KART_COLORS = [
		{ body: '#ff5c5c', dark: '#b8363c', helm: '#ffe066' },
		{ body: '#4aa8ff', dark: '#1f6bb5', helm: '#ffffff' },
		{ body: '#ffc93c', dark: '#b98a12', helm: '#2b2f36' },
		{ body: '#8f7bff', dark: '#4c3fb8', helm: '#ffd9f0' }
	]

	function clamp(v, a, b) {
		return v < a ? a : v > b ? b : v
	}

	function rand(a, b) {
		return a + Math.random() * (b - a)
	}

	function wrapAngle(a) {
		while (a > Math.PI) a -= Math.PI * 2
		while (a < -Math.PI) a += Math.PI * 2
		return a
	}

	function fmtTime(ms) {
		if (!ms || ms < 0) return '--:--'
		const total = ms / 1000
		const m = Math.floor(total / 60)
		const s = total - m * 60
		const ss = s < 10 ? '0' + s.toFixed(2) : s.toFixed(2)
		return m + ':' + ss
	}

	export default {
		data() {
			return {
				canvasId: 'kartCanvas',
				statusBar: 0,
				state: 'ready' // ready / count / race / paused / finish
			}
		},
		created() {
			// 赛道、粒子、车辆全部挂在实例上，不进 data：
			// 每帧几百次读写走响应式 Proxy 会直接掉帧
			this.ctx = null
			this.legacy = false
			this.running = false
			this.lastTs = 0
			this.raf = null
			this.loopToken = 0

			this.W = 0
			this.H = 0
			this.sysW = 375
			this.sysH = 667
			this.dpr = 1
			this.u = 1
			this.zoom = 0.85

			this.MAX = 430 // 基础最高速（世界 px/s）
			this.trackIdx = 0
			this.track = TRACKS[0]
			this.path = null
			this.len = 1

			this.cam = { x: 900, y: 1100 }
			this.g = null
			this.input = { steer: 0 }
			this.drag = { on: false, id: null, x0: 0 }

			this.best = 0
		},
		onLoad() {
			this.readSystem()
			try {
				this.best = Number(uni.getStorageSync(BEST_KEY)) || 0
			} catch (e) {
				this.best = 0
			}
		},
		onReady() {
			this.initCanvas()
		},
		onHide() {
			if (this.state === 'race' || this.state === 'count') {
				this.pausedFrom = this.state
				this.state = 'paused'
			}
		},
		onUnload() {
			this.running = false
			this.loopToken += 1
		},
		methods: {
			goBack() {
				navBack('/pages/interview/mine/mine')
			},

			readSystem() {
				try {
					const info = uni.getSystemInfoSync()
					this.statusBar = info.statusBarHeight || 0
					this.sysW = info.windowWidth || 375
					this.sysH = info.windowHeight || 667
					this.dpr = Math.min(info.pixelRatio || 1, 2)
				} catch (e) {
					this.statusBar = 0
					this.sysW = 375
					this.sysH = 667
					this.dpr = 1
				}
			},

			/* ================= 画布（三端） ================= */
			initCanvas() {
				// #ifdef H5
				this.initByDom()
				// #endif
				// #ifndef H5
				this.initByQuery()
				// #endif
			},

			pickDomCanvas() {
				try {
					const host = document.getElementById(this.canvasId)
					if (host && String(host.tagName).toUpperCase() === 'CANVAS') return host
					if (host && host.querySelector) {
						const inner = host.querySelector('canvas')
						if (inner) return inner
					}
					return document.querySelector('uni-canvas canvas') || document.querySelector('canvas') || null
				} catch (e) {
					return null
				}
			},

			initByDom() {
				const el = this.pickDomCanvas()
				if (!el) {
					this.initLegacy()
					return
				}
				let w = 0
				let h = 0
				try {
					const parent = el.parentNode
					if (parent && parent.getBoundingClientRect) {
						const pr = parent.getBoundingClientRect()
						if (pr.width > 80 && pr.height > 200) {
							w = pr.width
							h = pr.height
						}
					}
					if (!w) {
						const rect = el.getBoundingClientRect()
						if (rect.width > 80 && rect.height > 200) {
							w = rect.width
							h = rect.height
						}
					}
				} catch (e) {
					w = 0
					h = 0
				}
				if (!w) {
					w = this.sysW
					h = this.sysH
				}
				this.bindCanvas(el, w, h)
			},

			initByQuery() {
				const query = uni.createSelectorQuery().in(this)
				query
					.select('#' + this.canvasId)
					.fields({ node: true, size: true })
					.exec((res) => {
						const info = res && res[0]
						if (!info || !info.node) {
							this.initLegacy()
							return
						}
						const node = info.node
						const canvas = typeof node.getContext === 'function' ? node : this.pickDomCanvas()
						if (!canvas) {
							this.initLegacy()
							return
						}
						this.bindCanvas(canvas, info.width || this.sysW, info.height || this.sysH)
					})
			},

			bindCanvas(canvas, w, h) {
				const dpr = this.dpr || 1
				let W = Math.round(w || 0)
				let H = Math.round(h || 0)
				if (!(W > 80) || !(H > 200)) {
					W = Math.round(this.sysW)
					H = Math.round(this.sysH)
				}
				this.W = W
				this.H = H
				try {
					if (canvas.style) {
						canvas.style.width = W + 'px'
						canvas.style.height = H + 'px'
					}
				} catch (e) {
					// 小程序 node 没有 style
				}
				try {
					canvas.width = Math.round(W * dpr)
					canvas.height = Math.round(H * dpr)
				} catch (e) {
					// 个别环境尺寸只读
				}
				let ctx = null
				try {
					ctx = canvas.getContext('2d')
				} catch (e) {
					ctx = null
				}
				if (!ctx) {
					this.initLegacy()
					return
				}
				if (ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
				else ctx.scale(dpr, dpr)
				this.ctx = ctx
				this.legacy = false
				this.layout()
				this.raf =
					typeof canvas.requestAnimationFrame === 'function'
						? canvas.requestAnimationFrame.bind(canvas)
						: this.globalRaf()
				this.startLoop()
			},

			initLegacy() {
				let ctx = null
				try {
					ctx = uni.createCanvasContext(this.canvasId, this)
				} catch (e) {
					ctx = null
				}
				if (!ctx) return
				this.ctx = ctx
				this.legacy = true
				this.W = this.sysW
				this.H = this.sysH
				this.layout()
				this.raf = (cb) => setTimeout(() => cb(Date.now()), 16)
				this.startLoop()
			},

			globalRaf() {
				if (typeof requestAnimationFrame === 'function') return (cb) => requestAnimationFrame(cb)
				return (cb) => setTimeout(() => cb(Date.now()), 16)
			},

			layout() {
				const W = this.W
				const H = this.H
				this.u = clamp(W / 375, 0.9, 1.15)
				// 视野宽度约 460 世界单位：路面占屏幕四成左右
				this.zoom = clamp(W / 460, 0.62, 1.05)
				this.nitroBtn = {
					x: W - 62 * this.u,
					y: H - 92 * this.u,
					r: 44 * this.u
				}
			},

			/* ================= 赛道 ================= */
			catmull(p0, p1, p2, p3, t) {
				const t2 = t * t
				const t3 = t2 * t
				const x =
					0.5 *
					(2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)
				const y =
					0.5 *
					(2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
				return { x, y }
			},

			buildPath(theme) {
				const ctrl = theme.pts
				const n = ctrl.length
				const SEG = 26
				const raw = []
				for (let i = 0; i < n; i++) {
					const p0 = ctrl[(i - 1 + n) % n]
					const p1 = ctrl[i]
					const p2 = ctrl[(i + 1) % n]
					const p3 = ctrl[(i + 2) % n]
					for (let j = 0; j < SEG; j++) raw.push(this.catmull(p0, p1, p2, p3, j / SEG))
				}

				// 等距重采样：每 STEP 世界单位一个点
				const pts = [{ x: raw[0].x, y: raw[0].y }]
				let acc = 0
				for (let i = 1; i <= raw.length; i++) {
					const a = raw[i - 1]
					const b = raw[i % raw.length]
					const dx = b.x - a.x
					const dy = b.y - a.y
					const seg = Math.sqrt(dx * dx + dy * dy)
					if (seg < 0.0001) continue
					let pos = 0
					while (acc + (seg - pos) >= STEP) {
						pos += STEP - acc
						acc = 0
						pts.push({ x: a.x + (dx * pos) / seg, y: a.y + (dy * pos) / seg })
					}
					acc += seg - pos
				}

				const m = pts.length
				let bx0 = 1e9
				let by0 = 1e9
				let bx1 = -1e9
				let by1 = -1e9
				for (let i = 0; i < m; i++) {
					const q = pts[i]
					const a = pts[(i - 1 + m) % m]
					const b = pts[(i + 1) % m]
					let tx = b.x - a.x
					let ty = b.y - a.y
					const l = Math.sqrt(tx * tx + ty * ty) || 1
					tx /= l
					ty /= l
					q.tx = tx
					q.ty = ty
					q.nx = -ty
					q.ny = tx
					q.s = i * STEP
					if (q.x < bx0) bx0 = q.x
					if (q.x > bx1) bx1 = q.x
					if (q.y < by0) by0 = q.y
					if (q.y > by1) by1 = q.y
				}

				this.path = { pts, box: { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 } }
				this.len = m * STEP
				return this.path
			},

			pointAt(s, lane) {
				const p = this.path.pts
				const m = p.length
				const total = this.len
				let t = s % total
				if (t < 0) t += total
				const f = t / STEP
				const i = Math.floor(f) % m
				const j = (i + 1) % m
				const k = f - Math.floor(f)
				const a = p[i]
				const b = p[j]
				const x = a.x + (b.x - a.x) * k
				const y = a.y + (b.y - a.y) * k
				let nx = a.nx + (b.nx - a.nx) * k
				let ny = a.ny + (b.ny - a.ny) * k
				const nl = Math.sqrt(nx * nx + ny * ny) || 1
				nx /= nl
				ny /= nl
				const off = lane || 0
				return { x: x + nx * off, y: y + ny * off, nx, ny, tx: a.tx, ty: a.ty }
			},

			curveAt(s) {
				const a = this.pointAt(s)
				const b = this.pointAt(s + 130)
				return Math.abs(wrapAngle(Math.atan2(b.ty, b.tx) - Math.atan2(a.ty, a.tx)))
			},

			nearest(k) {
				const p = this.path.pts
				const m = p.length
				let best = k.idx
				let bd = Infinity
				for (let d = -30; d <= 30; d++) {
					const i = (k.idx + d + m) % m
					const q = p[i]
					const dx = q.x - k.x
					const dy = q.y - k.y
					const dd = dx * dx + dy * dy
					if (dd < bd) {
						bd = dd
						best = i
					}
				}
				return best
			},

			/* ================= 一局 ================= */
			newRace() {
				const theme = TRACKS[this.trackIdx % TRACKS.length]
				this.track = theme
				this.buildPath(theme)

				this.layout()

				const g = {
					time: 0,
					countT: 3.0,
					raceT: 0,
					rocket: false,
					karts: [],
					pads: [],
					cans: [],
					parts: [],
					marks: [],
					msg: '',
					msgT: 0,
					shake: 0,
					flash: 0,
					finishT: 0,
					bestLap: 0,
					place: 1,
					total: LAPS
				}

				// 起跑格：玩家在最后一位，靠超车才有意思
				for (let i = 0; i < 4; i++) {
					const s = this.len - 70 - (3 - i) * 58
					const lane = i % 2 === 0 ? -40 : 40
					const pt = this.pointAt(s, lane)
					const k = {
						id: i,
						isPlayer: i === 0,
						x: pt.x,
						y: pt.y,
						dir: Math.atan2(pt.ty, pt.tx),
						speed: 0,
						steer: 0,
						idx: 0,
						s,
						sPrev: s,
						lap: 0,
						lapStart: 0,
						prog: s,
						place: 4 - i,
						offRoad: false,
						boostT: 0,
						nitro: i === 0 ? 0.6 : 0.5,
						cap: 1,
						base: i === 0 ? 1 : [0.95, 0.985, 1.01][i - 1],
						lane: lane * 0.7,
						skill: 1,
						aiBoostCd: rand(3, 7),
						markT: 0,
						finished: false,
						lapTimes: []
					}
					k.idx = Math.round((((k.s % this.len) + this.len) % this.len) / STEP) % this.path.pts.length
					g.karts.push(k)
				}

				// 氮气地贴：沿赛道分布，吃一次给 1.15 秒加速
				const padAt = [0.16, 0.38, 0.62, 0.84]
				for (let i = 0; i < padAt.length; i++) {
					const pt = this.pointAt(this.len * padAt[i], i % 2 ? 34 : -34)
					g.pads.push({
						x: pt.x,
						y: pt.y,
						a: Math.atan2(pt.ty, pt.tx) + Math.PI / 2,
						live: 0
					})
				}

				// 氮气罐：捡到 +0.34 槽
				const canAt = [0.08, 0.29, 0.5, 0.71, 0.9]
				for (let i = 0; i < canAt.length; i++) {
					const pt = this.pointAt(this.len * canAt[i], i % 2 ? -52 : 52)
					g.cans.push({ x: pt.x, y: pt.y, ph: Math.random() * 6.28, taken: 0 })
				}

				this.g = g
				const p0 = g.karts[0]
				this.cam.x = p0.x
				this.cam.y = p0.y
			},

			startRace() {
				this.state = 'count'
				this.g.countT = 3.0
				this.g.rocket = false
				this.input.steer = 0
				this.drag.on = false
			},

			resetRace() {
				this.trackIdx = (this.trackIdx + 1) % TRACKS.length
				this.newRace()
				this.layout()
				this.state = 'ready'
			},

			/* ================= 主循环 ================= */
			startLoop() {
				this.loopToken += 1
				const token = this.loopToken
				if (!this.g) this.newRace()
				this.running = true
				this.lastTs = 0
				const step = (ts) => {
					if (!this.running || token !== this.loopToken) return
					const now = typeof ts === 'number' ? ts : Date.now()
					if (!this.lastTs) this.lastTs = now
					let dt = (now - this.lastTs) / 1000
					this.lastTs = now
					if (dt > 0.05) dt = 0.05
					if (dt < 0) dt = 0
					this.tick(dt)
					this.render()
					if (this.legacy && this.ctx && this.ctx.draw) this.ctx.draw()
					if (this.running && token === this.loopToken) this.raf(step)
				}
				if (this.raf) this.raf(step)
			},

			tick(dt) {
				const g = this.g
				if (!g) return
				g.time += dt
				if (g.msgT > 0) g.msgT -= dt
				if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 26)
				if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 2)

				if (this.state === 'count') {
					g.countT -= dt
					if (g.countT <= 0) {
						this.state = 'race'
						g.raceT = 0
						g.countT = 0
						g.flash = 0.7
						if (g.rocket) {
							this.doBoost(g.karts[0], 1.4)
							this.say('火箭起步！')
						}
					}
				} else if (this.state === 'race') {
					g.raceT += dt
					this.stepRace(dt)
				} else if (this.state === 'finish') {
					g.finishT += dt
					// 结算后车还在慢慢滑，画面不会一下子定住
					for (let i = 0; i < g.karts.length; i++) {
						const k = g.karts[i]
						k.speed *= 1 - Math.min(1, dt * 1.6)
						this.stepMotion(k, dt)
					}
				}

				this.stepParts(dt)
				this.stepCam(dt)
			},

			stepCam(dt) {
				const g = this.g
				const p = g.karts[0]
				// 镜头往车头方向偏一点，看得见前面的弯
				const ahead = 70 + Math.min(90, p.speed * 0.18)
				const tx = p.x + Math.cos(p.dir) * ahead
				const ty = p.y + Math.sin(p.dir) * ahead
				const k = Math.min(1, dt * 7)
				this.cam.x += (tx - this.cam.x) * k
				this.cam.y += (ty - this.cam.y) * k
			},

			stepRace(dt) {
				const g = this.g
				for (let i = 0; i < g.karts.length; i++) {
					const k = g.karts[i]
					if (k.finished) {
						k.speed *= 1 - Math.min(1, dt * 2)
						this.stepMotion(k, dt)
						continue
					}
					if (k.isPlayer) {
						k.steer += (this.input.steer - k.steer) * Math.min(1, dt * 11)
					} else {
						this.aiThink(k, dt)
					}
					this.stepKart(k, dt)
				}

				// 车与车之间轻轻互推，不让人重叠在一起
				for (let i = 0; i < g.karts.length; i++) {
					for (let j = i + 1; j < g.karts.length; j++) {
						const a = g.karts[i]
						const b = g.karts[j]
						const dx = b.x - a.x
						const dy = b.y - a.y
						const d = Math.sqrt(dx * dx + dy * dy)
						if (d > 30 || d < 0.001) continue
						const push = (30 - d) * 0.5
						a.x -= (dx / d) * push
						a.y -= (dy / d) * push
						b.x += (dx / d) * push
						b.y += (dy / d) * push
						a.speed *= 0.98
					}
				}

				this.stepPads()
				this.stepCans(dt)
				this.rank()
			},

			aiThink(k, dt) {
				const g = this.g
				const player = g.karts[0]
				const gap = k.prog - player.prog
				let skill = k.base
				if (gap < -460) skill += 0.05
				else if (gap > 700) skill -= 0.035
				k.skill += (skill - k.skill) * Math.min(1, dt * 2)

				// 追一个前方目标点，带一点个人车道偏移，避免四台车走同一条线
				const lookAhead = 105 + k.speed * 0.24
				const target = this.pointAt(k.s + lookAhead, k.lane)
				const want = Math.atan2(target.y - k.y, target.x - k.x)
				const diff = wrapAngle(want - k.dir)
				k.steer = clamp(diff * 2.1, -1, 1)

				const curve = this.curveAt(k.s + 150)
				k.cap = clamp(1 - curve * 1.45, 0.5, 1) * k.skill

				// 直道上放氮气
				k.aiBoostCd -= dt
				if (k.aiBoostCd <= 0 && curve < 0.35 && k.nitro > 0.5) {
					k.nitro -= 0.3
					k.aiBoostCd = rand(5, 9)
					this.doBoost(k, rand(1.1, 1.5))
				}
				k.nitro = Math.min(1, k.nitro + dt * 0.04)
			},

			stepKart(k, dt) {
				const g = this.g
				if (k.boostT > 0) k.boostT -= dt
				const boosting = k.boostT > 0

				let cap = this.MAX * (k.isPlayer ? 1 : k.cap)
				if (k.offRoad) cap = Math.min(cap, this.MAX * 0.44)
				if (boosting) cap *= 1.55

				const rate = boosting ? 3.6 : k.offRoad ? 1.3 : 2.3
				k.speed += (cap - k.speed) * Math.min(1, dt * rate)

				const sp = clamp(k.speed / this.MAX, 0, 1)
				k.dir += k.steer * 2.7 * (0.3 + 0.7 * sp) * dt

				this.stepMotion(k, dt)

				// 与中心线的横向距离：超出去是草，再外面是护栏
				const idx = this.nearest(k)
				k.idx = idx
				const q = this.path.pts[idx]
				k.sPrev = k.s
				k.s = q.s
				const dx = k.x - q.x
				const dy = k.y - q.y
				const lat = dx * q.nx + dy * q.ny
				const lim = HALF + SHOULDER

				if (Math.abs(lat) > lim) {
					const over = Math.abs(lat) - lim
					k.x -= q.nx * over * Math.sign(lat)
					k.y -= q.ny * over * Math.sign(lat)
					k.speed *= 0.42
					g.shake = Math.max(g.shake, 6)
					this.spark(k.x, k.y, '#ffd166', 4)
					// 贴墙时把车头带向赛道方向，免得原地打转卡死
					const want = Math.atan2(q.ty, q.tx)
					k.dir = this.blendAngle(k.dir, want, 0.3)
					k.offRoad = true
				} else {
					k.offRoad = Math.abs(lat) > HALF - 8
				}

				// 草上冒土，硬拐留胎痕
				if (k.offRoad && k.speed > 60) {
					if (Math.random() < 0.5) this.dust(k.x - Math.cos(k.dir) * 16, k.y - Math.sin(k.dir) * 16)
				}
				if (!k.offRoad && Math.abs(k.steer) > 0.55 && k.speed > this.MAX * 0.7) {
					k.markT -= dt
					if (k.markT <= 0) {
						k.markT = 0.035
						const bx = Math.cos(k.dir)
						const by = Math.sin(k.dir)
						const px = -by
						const py = bx
						g.marks.push({ x: k.x - bx * 14 + px * 10, y: k.y - by * 14 + py * 10, a: k.dir, life: 3.4 })
						g.marks.push({ x: k.x - bx * 14 - px * 10, y: k.y - by * 14 - py * 10, a: k.dir, life: 3.4 })
						if (g.marks.length > 220) g.marks.splice(0, 40)
					}
				}

				// 圈数：只在越过起点线时 +1，倒着开不会误判
				if (k.sPrev > this.len * 0.72 && k.s < this.len * 0.28) {
					k.lap += 1
					if (k.isPlayer) {
						const lt = Math.round(g.raceT * 1000)
						k.lapTimes.push(lt)
						k.lapStart = g.raceT
						if (lt > 3000) {
							if (!g.bestLap || lt < g.bestLap) g.bestLap = lt
							if (!this.best || lt < this.best) {
								this.best = lt
								this.saveBest()
							}
						}
						if (k.lap >= LAPS) {
							this.finishRace()
							return
						}
						g.flash = 0.4
						this.say(k.lap === LAPS - 1 ? '最后一圈！' : '第 ' + (k.lap + 1) + ' 圈')
					}
				}
				k.prog = k.lap * this.len + k.s
			},

			stepMotion(k, dt) {
				k.x += Math.cos(k.dir) * k.speed * dt
				k.y += Math.sin(k.dir) * k.speed * dt
			},

			blendAngle(a, b, t) {
				return a + wrapAngle(b - a) * t
			},

			rank() {
				const g = this.g
				const list = g.karts.slice().sort((a, b) => b.prog - a.prog)
				for (let i = 0; i < list.length; i++) list[i].place = i + 1
				g.place = g.karts[0].place
			},

			finishRace() {
				const g = this.g
				g.karts[0].finished = true
				g.finishT = 0
				g.flash = 0.6
				this.state = 'finish'
			},

			saveBest() {
				try {
					uni.setStorageSync(BEST_KEY, this.best)
				} catch (e) {
					// 忽略
				}
			},

			/* ================= 氮气 / 道具 ================= */
			doBoost(k, dur) {
				k.boostT = Math.max(k.boostT, dur)
				if (k.isPlayer) {
					this.g.shake = Math.max(this.g.shake, 4)
					this.vibrate()
				}
			},

			fireNitro() {
				const g = this.g
				if (!g) return
				const k = g.karts[0]
				if (k.nitro < 0.3) {
					this.say('氮气不够')
					return
				}
				k.nitro -= 0.3
				this.doBoost(k, 1.5)
				for (let i = 0; i < 8; i++) this.spark(k.x, k.y, '#8ef0ff', 1)
			},

			stepPads() {
				const g = this.g
				const k = g.karts[0]
				for (let i = 0; i < g.pads.length; i++) {
					const p = g.pads[i]
					if (p.live > 0) continue
					const dx = k.x - p.x
					const dy = k.y - p.y
					if (dx * dx + dy * dy > 46 * 46) continue
					p.live = 1.4
					this.doBoost(k, 1.15)
					this.spark(k.x, k.y, '#ffd93d', 8)
				}
			},

			stepCans(dt) {
				const g = this.g
				const k = g.karts[0]
				for (let i = 0; i < g.cans.length; i++) {
					const c = g.cans[i]
					if (c.taken > 0) {
						c.taken -= dt
						continue
					}
					const dx = k.x - c.x
					const dy = k.y - c.y
					if (dx * dx + dy * dy > 34 * 34) continue
					c.taken = 7
					k.nitro = Math.min(1, k.nitro + 0.34)
					this.spark(c.x, c.y, '#4ad4ff', 6)
					if (k.nitro >= 1) this.say('氮气满了')
				}
			},

			/* ================= 特效 ================= */
			spark(x, y, color, n) {
				const g = this.g
				if (!g) return
				for (let i = 0; i < n; i++) {
					if (g.parts.length > 150) break
					const a = Math.random() * 6.2832
					const sp = rand(40, 170)
					g.parts.push({
						x,
						y,
						vx: Math.cos(a) * sp,
						vy: Math.sin(a) * sp,
						life: rand(0.24, 0.5),
						max: 0.5,
						r: rand(1.6, 3.4),
						color
					})
				}
			},

			dust(x, y) {
				const g = this.g
				if (!g || g.parts.length > 150) return
				g.parts.push({
					x,
					y,
					vx: rand(-30, 30),
					vy: rand(-30, 30),
					life: 0.5,
					max: 0.5,
					r: rand(3, 6),
					color: this.track.kerb2 === '#eef6ff' ? '#8fa4ad' : '#d9c69a'
				})
			},

			stepParts(dt) {
				const g = this.g
				if (!g) return
				for (let i = g.parts.length - 1; i >= 0; i--) {
					const p = g.parts[i]
					p.life -= dt
					if (p.life <= 0) {
						g.parts.splice(i, 1)
						continue
					}
					p.x += p.vx * dt
					p.y += p.vy * dt
					p.vx *= 1 - dt * 2.2
					p.vy *= 1 - dt * 2.2
				}
				for (let i = g.marks.length - 1; i >= 0; i--) {
					g.marks[i].life -= dt
					if (g.marks[i].life <= 0) g.marks.splice(i, 1)
				}
				for (let i = 0; i < g.pads.length; i++) {
					if (g.pads[i].live > 0) g.pads[i].live -= dt
				}
			},

			say(msg) {
				const g = this.g
				if (!g) return
				g.msg = msg
				g.msgT = 1.6
			},

			vibrate(ms) {
				try {
					uni.vibrateShort && uni.vibrateShort({ type: 'light' })
				} catch (e) {
					// 部分端不支持
				}
			},

			/* ================= 触摸 ================= */
			pointOf(t) {
				if (!t) return null
				const x = t.clientX != null ? t.clientX : t.pageX
				const y = t.clientY != null ? t.clientY : t.pageY
				if (x == null || y == null) return null
				return { x, y }
			},

			idOf(t) {
				return t && typeof t.identifier === 'number' ? t.identifier : 0
			},

			onTouchStart(e) {
				const g = this.g
				if (!g) return
				if (this.state === 'ready') {
					this.startRace()
					return
				}
				if (this.state === 'paused') {
					this.state = this.pausedFrom || 'race'
					this.lastTs = 0
					return
				}
				if (this.state === 'finish') {
					if (g.finishT > 0.8) this.resetRace()
					return
				}

				const list = (e && e.changedTouches) || (e && e.touches) || []
				const t = list[0]
				const pt = this.pointOf(t)
				if (!pt) return

				const b = this.nitroBtn
				const dx = pt.x - b.x
				const dy = pt.y - b.y
				if (dx * dx + dy * dy < b.r * b.r * 1.25) {
					if (this.state === 'count') {
						// 起步火箭：最后半秒点火
						if (g.countT < 0.55) {
							g.rocket = true
							this.say('火箭起步')
						}
					} else {
						this.fireNitro()
					}
					return
				}

				this.drag.on = true
				this.drag.id = this.idOf(t)
				this.drag.x0 = pt.x
			},

			onTouchMove(e) {
				if (!this.drag.on) return
				const list = (e && e.touches) || []
				for (let i = 0; i < list.length; i++) {
					if (this.idOf(list[i]) !== this.drag.id) continue
					const pt = this.pointOf(list[i])
					if (!pt) break
					const range = Math.max(48, this.W * 0.16)
					this.input.steer = clamp((pt.x - this.drag.x0) / range, -1, 1)
					break
				}
			},

			onTouchEnd(e) {
				if (!this.drag.on) return
				const list = (e && e.changedTouches) || (e && e.touches) || []
				let hit = list.length === 0
				for (let i = 0; i < list.length; i++) {
					if (this.idOf(list[i]) === this.drag.id) hit = true
				}
				if (!hit) return
				this.drag.on = false
				this.input.steer = 0
			},

			/* ================= 渲染 ================= */
			render() {
				const ctx = this.ctx
				if (!ctx) return
				const W = this.W
				const H = this.H
				const g = this.g
				if (!g) return
				const th = this.track

				ctx.save()
				// 世界坐标
				const z = this.zoom
				ctx.translate(W / 2, H / 2)
				if (g.shake > 0) {
					ctx.translate(Math.sin(g.time * 60) * g.shake, Math.cos(g.time * 51) * g.shake * 0.8)
				}
				ctx.scale(z, z)
				ctx.translate(-this.cam.x, -this.cam.y)

				this.drawGround(ctx)
				this.drawTrack(ctx)
				this.drawProps(ctx)
				this.drawMarks(ctx)
				this.drawKarts(ctx)
				this.drawParts(ctx)

				ctx.restore()

				// 速度感：屏幕边缘的速度线
				this.drawSpeedLines(ctx)

				this.drawHud(ctx)
				this.drawOverlay(ctx)

				if (g.flash > 0) {
					ctx.fillStyle = 'rgba(255,255,255,' + (g.flash * 0.35).toFixed(3) + ')'
					ctx.fillRect(0, 0, W, H)
				}
			},

			drawGround(ctx) {
				const th = this.track
				const z = this.zoom
				const W = this.W
				const H = this.H
				const hw = W / (2 * z) + 80
				const hh = H / (2 * z) + 80
				const x0 = this.cam.x - hw
				const y0 = this.cam.y - hh
				const x1 = this.cam.x + hw
				const y1 = this.cam.y + hh

				ctx.fillStyle = th.grass
				ctx.fillRect(x0, y0, x1 - x0, y1 - y0)

				// 草地纹理：格子哈希，滚动不闪
				const cs = 68
				const i0 = Math.floor(x0 / cs)
				const i1 = Math.ceil(x1 / cs)
				const j0 = Math.floor(y0 / cs)
				const j1 = Math.ceil(y1 / cs)
				for (let i = i0; i <= i1; i++) {
					for (let j = j0; j <= j1; j++) {
						const h = this.hash(i, j)
						if (h < 0.58) continue
						ctx.fillStyle = h > 0.86 ? th.grass3 : th.grass2
						ctx.fillRect(i * cs, j * cs, cs - 2, cs - 2)
					}
				}
			},

			hash(i, j) {
				const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
				return s - Math.floor(s)
			},

			trackRuns(margin) {
				const p = this.path.pts
				const m = p.length
				const hw = this.W / (2 * this.zoom) + margin
				const hh = this.H / (2 * this.zoom) + margin
				const cx = this.cam.x
				const cy = this.cam.y
				const runs = []
				let cur = null
				for (let i = 0; i < m; i++) {
					const q = p[i]
					const vis = Math.abs(q.x - cx) < hw && Math.abs(q.y - cy) < hh
					if (vis) {
						if (cur) cur.b = i
						else cur = { a: i, b: i }
					} else if (cur) {
						runs.push(cur)
						cur = null
					}
				}
				if (cur) runs.push(cur)
				// 首尾在屏幕里连成一段，避免起步线上出现接缝
				if (runs.length > 1) {
					const first = runs[0]
					const last = runs[runs.length - 1]
					if (first.a === 0 && last.b === m - 1) {
						runs[0] = { a: last.a, b: m + first.b }
						runs.pop()
					}
				}
				return runs
			},

			pathStroke(ctx, run) {
				const p = this.path.pts
				const m = p.length
				ctx.beginPath()
				for (let i = run.a; i <= run.b; i++) {
					const q = p[i % m]
					if (i === run.a) ctx.moveTo(q.x, q.y)
					else ctx.lineTo(q.x, q.y)
				}
				ctx.stroke()
			},

			drawTrack(ctx) {
				const th = this.track
				const p = this.path.pts
				const m = p.length
				const runs = this.trackRuns(240)
				if (!runs.length) return

				ctx.lineJoin = 'round'
				ctx.lineCap = 'round'

				// 路基
				ctx.strokeStyle = th.edge
				ctx.lineWidth = ROAD + 26
				for (let i = 0; i < runs.length; i++) this.pathStroke(ctx, runs[i])

				// 路面
				ctx.strokeStyle = th.road
				ctx.lineWidth = ROAD
				for (let i = 0; i < runs.length; i++) this.pathStroke(ctx, runs[i])

				// 中线虚线
				ctx.strokeStyle = th.line
				ctx.lineWidth = 5
				ctx.lineCap = 'butt'
				for (let r = 0; r < runs.length; r++) {
					const run = runs[r]
					ctx.beginPath()
					let pen = false
					for (let i = run.a; i <= run.b; i++) {
						const q = p[i % m]
						if (i % 12 < 6) {
							if (!pen) {
								ctx.moveTo(q.x, q.y)
								pen = true
							} else {
								ctx.lineTo(q.x, q.y)
							}
						} else {
							pen = false
						}
					}
					ctx.stroke()
				}

				// 路肩：白底 + 红块（夜港是青白）
				ctx.lineCap = 'round'
				for (let side = -1; side <= 1; side += 2) {
					ctx.strokeStyle = th.kerb2
					ctx.lineWidth = 7
					for (let r = 0; r < runs.length; r++) {
						const run = runs[r]
						ctx.beginPath()
						for (let i = run.a; i <= run.b; i++) {
							const q = p[i % m]
							const x = q.x + q.nx * (HALF + 7) * side
							const y = q.y + q.ny * (HALF + 7) * side
							if (i === run.a) ctx.moveTo(x, y)
							else ctx.lineTo(x, y)
						}
						ctx.stroke()
					}
					ctx.strokeStyle = th.kerb1
					ctx.lineWidth = 8
					for (let r = 0; r < runs.length; r++) {
						const run = runs[r]
						ctx.beginPath()
						let pen = false
						for (let i = run.a; i <= run.b; i++) {
							if (i % 6 >= 3) {
								pen = false
								continue
							}
							const q = p[i % m]
							const x = q.x + q.nx * (HALF + 7) * side
							const y = q.y + q.ny * (HALF + 7) * side
							if (!pen) {
								ctx.moveTo(x, y)
								pen = true
							} else {
								ctx.lineTo(x, y)
							}
						}
						ctx.stroke()
					}
				}

				// 起终点格子旗
				const st = this.pointAt(0)
				ctx.save()
				ctx.translate(st.x, st.y)
				ctx.rotate(Math.atan2(st.ty, st.tx) + Math.PI / 2)
				const cell = ROAD / 8
				for (let c = 0; c < 8; c++) {
					for (let r = 0; r < 2; r++) {
						ctx.fillStyle = (c + r) % 2 ? '#1d1f24' : '#f4f4ef'
						ctx.fillRect(-HALF + c * cell, r * 15 - 15, cell, 15)
					}
				}
				ctx.restore()
			},

			drawProps(ctx) {
				const g = this.g
				const th = this.track
				// 氮气地贴
				for (let i = 0; i < g.pads.length; i++) {
					const pad = g.pads[i]
					const on = pad.live > 0
					ctx.save()
					ctx.translate(pad.x, pad.y)
					ctx.rotate(pad.a)
					ctx.globalAlpha = on ? 0.4 : 0.9
					ctx.fillStyle = '#ffd93d'
					this.rrect(ctx, -24, -32, 48, 64, 8)
					ctx.fill()
					ctx.globalAlpha = on ? 0.3 : 0.85
					ctx.strokeStyle = '#fff8d6'
					ctx.lineWidth = 5
					ctx.lineJoin = 'miter'
					for (let c = 0; c < 2; c++) {
						ctx.beginPath()
						ctx.moveTo(-13, -12 + c * 20)
						ctx.lineTo(0, 2 + c * 20)
						ctx.lineTo(13, -12 + c * 20)
						ctx.stroke()
					}
					ctx.restore()
					ctx.globalAlpha = 1
				}

				// 氮气罐
				for (let i = 0; i < g.cans.length; i++) {
					const c = g.cans[i]
					if (c.taken > 0) continue
					const bob = Math.sin(g.time * 3 + c.ph) * 2.5
					ctx.fillStyle = 'rgba(74,212,255,0.22)'
					this.circle(ctx, c.x, c.y + bob, 18)
					ctx.fillStyle = '#39c7ff'
					this.rrect(ctx, c.x - 8, c.y - 12 + bob, 16, 24, 6)
					ctx.fill()
					ctx.fillStyle = '#d6f4ff'
					ctx.fillRect(c.x - 4, c.y - 8 + bob, 3, 12)
					ctx.fillStyle = '#0d6f9c'
					ctx.fillRect(c.x - 6, c.y + 8 + bob, 12, 4)
					ctx.fillStyle = th.kerb2
					ctx.fillRect(c.x - 3, c.y - 15 + bob, 6, 4)
				}

				// 夜港给路面加一点灯带
				if (th.grass2 === '#1b3644') {
					ctx.globalAlpha = 0.35
					ctx.fillStyle = '#7fe6ff'
					for (let i = 0; i < g.pads.length; i++) {
						this.circle(ctx, g.pads[i].x, g.pads[i].y, 26)
					}
					ctx.globalAlpha = 1
				}
			},

			drawMarks(ctx) {
				const g = this.g
				for (let i = 0; i < g.marks.length; i++) {
					const mk = g.marks[i]
					ctx.save()
					ctx.globalAlpha = Math.min(0.5, mk.life * 0.16)
					ctx.translate(mk.x, mk.y)
					ctx.rotate(mk.a)
					ctx.fillStyle = '#1e2228'
					ctx.fillRect(-2, -5, 4, 10)
					ctx.restore()
				}
				ctx.globalAlpha = 1
			},

			drawKarts(ctx) {
				const g = this.g
				const list = g.karts.slice().sort((a, b) => a.y - b.y)
				for (let i = 0; i < list.length; i++) this.drawKart(ctx, list[i])
			},

			drawKart(ctx, k) {
				const c = KART_COLORS[k.id % KART_COLORS.length]
				const boosting = k.boostT > 0
				ctx.save()
				ctx.translate(k.x, k.y)
				// 硬拐时车身比行进方向再偏一点，看着像在漂
				const slip = k.steer * 0.15 * clamp(k.speed / this.MAX, 0, 1)
				ctx.rotate(k.dir + Math.PI / 2 + slip)
				if (k.isPlayer) ctx.scale(1.08, 1.08)

				// 影子
				ctx.fillStyle = 'rgba(0,0,0,0.26)'
				ctx.beginPath()
				if (ctx.ellipse) ctx.ellipse(2, 4, 16, 22, 0, 0, 6.2832)
				else ctx.arc(2, 4, 18, 0, 6.2832)
				ctx.fill()

				// 尾焰
				if (boosting) {
					const l = 22 + Math.random() * 16
					ctx.fillStyle = 'rgba(120,240,255,0.75)'
					ctx.beginPath()
					ctx.moveTo(-7, 20)
					ctx.lineTo(0, 20 + l)
					ctx.lineTo(7, 20)
					ctx.closePath()
					ctx.fill()
					ctx.fillStyle = 'rgba(255,255,255,0.85)'
					ctx.beginPath()
					ctx.moveTo(-3, 20)
					ctx.lineTo(0, 20 + l * 0.5)
					ctx.lineTo(3, 20)
					ctx.closePath()
					ctx.fill()
				}

				// 轮胎
				ctx.fillStyle = '#211f24'
				this.rrect(ctx, -17, -16, 7, 13, 3)
				ctx.fill()
				this.rrect(ctx, 10, -16, 7, 13, 3)
				ctx.fill()
				this.rrect(ctx, -17, 4, 7, 14, 3)
				ctx.fill()
				this.rrect(ctx, 10, 4, 7, 14, 3)
				ctx.fill()

				// 车身
				ctx.fillStyle = c.body
				this.rrect(ctx, -10, -19, 20, 38, 8)
				ctx.fill()
				// 车头
				ctx.fillStyle = c.dark
				ctx.beginPath()
				ctx.moveTo(-9, -19)
				ctx.lineTo(0, -25)
				ctx.lineTo(9, -19)
				ctx.closePath()
				ctx.fill()
				// 座舱
				ctx.fillStyle = 'rgba(20,24,30,0.82)'
				this.rrect(ctx, -6.5, -4, 13, 14, 5)
				ctx.fill()
				// 头盔
				ctx.fillStyle = c.helm
				this.circle(ctx, 0, 1, 5.4)
				ctx.fillStyle = 'rgba(30,34,40,0.75)'
				ctx.fillRect(-4.5, -0.6, 9, 2.4)
				// 尾翼
				ctx.fillStyle = c.dark
				this.rrect(ctx, -11, 14, 22, 4, 2)
				ctx.fill()

				ctx.restore()

				// 玩家头顶的小三角，车挤在一起时也能认出自己
				if (k.isPlayer) {
					ctx.save()
					ctx.translate(k.x, k.y - 32)
					ctx.fillStyle = '#ffffff'
					ctx.beginPath()
					ctx.moveTo(0, -6)
					ctx.lineTo(5, 2)
					ctx.lineTo(-5, 2)
					ctx.closePath()
					ctx.fill()
					ctx.restore()
				}
			},

			drawParts(ctx) {
				const g = this.g
				for (let i = 0; i < g.parts.length; i++) {
					const p = g.parts[i]
					ctx.globalAlpha = clamp(p.life / p.max, 0, 1)
					ctx.fillStyle = p.color
					ctx.beginPath()
					ctx.arc(p.x, p.y, p.r, 0, 6.2832)
					ctx.fill()
				}
				ctx.globalAlpha = 1
			},

			drawSpeedLines(ctx) {
				const g = this.g
				const k = g.karts[0]
				if (k.boostT <= 0) return
				const W = this.W
				const H = this.H
				ctx.save()
				ctx.strokeStyle = 'rgba(255,255,255,0.5)'
				ctx.lineWidth = 2
				for (let i = 0; i < 10; i++) {
					const t = (g.time * 2.6 + i * 0.37) % 1
					const side = i % 2 ? 1 : -1
					const y = H * t
					const len = 40 + t * 90
					ctx.globalAlpha = 0.35 * (1 - t)
					ctx.beginPath()
					ctx.moveTo(W / 2 + side * (70 + t * 120), y - len / 2)
					ctx.lineTo(W / 2 + side * (70 + t * 120), y + len / 2)
					ctx.stroke()
				}
				ctx.restore()
			},

			/* ================= HUD ================= */
			drawHud(ctx) {
				const g = this.g
				const W = this.W
				const H = this.H
				const u = this.u
				const top = this.statusBar + 12

				// 左上：圈数 + 名次
				this.pill(ctx, 20 * u, top, 78 * u, 30 * u, '第 ' + Math.min(g.karts[0].lap + 1, LAPS) + '/' + LAPS + ' 圈')
				this.pill(ctx, 20 * u, top + 38 * u, 78 * u, 30 * u, '第 ' + g.place + ' 名', '#ffe066')

				// 中上：总时间
				this.text(ctx, fmtTime(g.raceT * 1000), W / 2, top + 16 * u, 20 * u, '#ffffff', 'center', 'bold')
				if (this.best) {
					this.text(ctx, '最快圈 ' + fmtTime(this.best), W / 2, top + 36 * u, 11 * u, 'rgba(255,255,255,0.7)', 'center')
				}

				this.drawMini(ctx)

				// 速度表
				const spd = Math.round(g.karts[0].speed * 0.52)
				const bx = 20 * u
				const by = H - 64 * u
				this.text(ctx, String(spd), bx, by, 34 * u, '#ffffff', 'left', 'bold')
				this.text(ctx, 'km/h', bx + this.measure(ctx, String(spd), 34 * u, 'bold') + 6 * u, by + 8 * u, 11 * u, 'rgba(255,255,255,0.7)')
				const barW = 118 * u
				ctx.fillStyle = 'rgba(0,0,0,0.35)'
				this.rrect(ctx, bx, by + 24 * u, barW, 7 * u, 4 * u)
				ctx.fill()
				const frac = clamp(g.karts[0].speed / (this.MAX * 1.55), 0, 1)
				ctx.fillStyle = frac > 0.72 ? '#ffd93d' : '#7df0b0'
				this.rrect(ctx, bx, by + 24 * u, Math.max(4, barW * frac), 7 * u, 4 * u)
				ctx.fill()

				// 氮气按钮
				this.drawNitro(ctx)

				// 提示语
				if (g.msgT > 0 && g.msg) {
					const a = Math.min(1, g.msgT * 2.4)
					ctx.globalAlpha = a
					const tw = this.measure(ctx, g.msg, 14 * u, 'bold') + 36 * u
					ctx.fillStyle = 'rgba(0,0,0,0.45)'
					this.rrect(ctx, W / 2 - tw / 2, H * 0.2, tw, 34 * u, 17 * u)
					ctx.fill()
					this.text(ctx, g.msg, W / 2, H * 0.2 + 18 * u, 14 * u, '#ffffff', 'center', 'bold')
					ctx.globalAlpha = 1
				}
			},

			drawNitro(ctx) {
				const g = this.g
				const b = this.nitroBtn
				const k = g.karts[0]
				const full = k.nitro >= 0.3
				ctx.save()
				ctx.fillStyle = 'rgba(0,0,0,0.42)'
				this.circle(ctx, b.x, b.y, b.r)
				// 槽位进度环
				ctx.strokeStyle = 'rgba(255,255,255,0.18)'
				ctx.lineWidth = 6
				ctx.beginPath()
				ctx.arc(b.x, b.y, b.r - 4, 0, 6.2832)
				ctx.stroke()
				ctx.strokeStyle = full ? '#4ad4ff' : 'rgba(74,212,255,0.45)'
				ctx.lineWidth = 6
				ctx.beginPath()
				ctx.arc(b.x, b.y, b.r - 4, -Math.PI / 2, -Math.PI / 2 + 6.2832 * k.nitro)
				ctx.stroke()
				this.text(ctx, '氮气', b.x, b.y - 4 * this.u, 15 * this.u, full ? '#ffffff' : 'rgba(255,255,255,0.6)', 'center', 'bold')
				this.text(ctx, Math.round(k.nitro * 100) + '%', b.x, b.y + 14 * this.u, 10 * this.u, 'rgba(255,255,255,0.7)', 'center')
				if (k.boostT > 0) {
					ctx.strokeStyle = 'rgba(120,240,255,0.9)'
					ctx.lineWidth = 3
					ctx.beginPath()
					ctx.arc(b.x, b.y, b.r + 4, 0, 6.2832)
					ctx.stroke()
				}
				ctx.restore()
			},

			drawMini(ctx) {
				const g = this.g
				const W = this.W
				const size = 76 * this.u
				const x = W - size - 14 * this.u
				const y = this.statusBar + 56 * this.u
				ctx.fillStyle = 'rgba(0,0,0,0.34)'
				this.rrect(ctx, x, y, size, size, 12 * this.u)
				ctx.fill()

				const box = this.path.box
				const pad = 9 * this.u
				const sc = Math.min((size - pad * 2) / box.w, (size - pad * 2) / box.h)
				const ox = x + size / 2 - (box.x + box.w / 2) * sc
				const oy = y + size / 2 - (box.y + box.h / 2) * sc
				const p = this.path.pts
				ctx.strokeStyle = 'rgba(255,255,255,0.45)'
				ctx.lineWidth = 2
				ctx.lineJoin = 'round'
				ctx.beginPath()
				for (let i = 0; i < p.length; i += 8) {
					const q = p[i]
					if (i === 0) ctx.moveTo(ox + q.x * sc, oy + q.y * sc)
					else ctx.lineTo(ox + q.x * sc, oy + q.y * sc)
				}
				ctx.closePath()
				ctx.stroke()

				for (let i = 0; i < g.karts.length; i++) {
					const k = g.karts[i]
					ctx.fillStyle = k.isPlayer ? '#ff5c5c' : '#ffffff'
					ctx.beginPath()
					ctx.arc(ox + k.x * sc, oy + k.y * sc, k.isPlayer ? 3.4 : 2.4, 0, 6.2832)
					ctx.fill()
				}
			},

			drawOverlay(ctx) {
				const g = this.g
				const W = this.W
				const H = this.H
				const u = this.u

				if (this.state === 'count') {
					const c = g.countT
					const n = Math.ceil(c)
					const frac = n - c // 0..1 当前这秒的进度
					const scale = 1 + (1 - frac) * 0.45
					ctx.save()
					ctx.globalAlpha = clamp(1 - frac * 0.5, 0.3, 1)
					ctx.translate(W / 2, H * 0.42)
					ctx.scale(scale, scale)
					this.text(ctx, String(clamp(n, 1, 3)), 0, 0, 92 * u, '#ffffff', 'center', 'bold')
					ctx.restore()
					if (g.rocket) this.text(ctx, '火箭起步就绪', W / 2, H * 0.42 + 78 * u, 14 * u, '#8ef0ff', 'center', 'bold')
					else this.text(ctx, '起步瞬间点氮气可火箭起步', W / 2, H * 0.42 + 78 * u, 12 * u, 'rgba(255,255,255,0.75)', 'center')
					return
				}

				if (this.state === 'ready') {
					ctx.fillStyle = 'rgba(8,14,20,0.62)'
					ctx.fillRect(0, 0, W, H)
					const cy = H * 0.36
					this.text(ctx, '极速卡丁', W / 2, cy, 40 * u, '#ffffff', 'center', 'bold')
					this.text(ctx, this.track.name, W / 2, cy + 42 * u, 15 * u, '#7df0b0', 'center', 'bold')
					this.text(ctx, '拖动屏幕转向，氮气键冲刺', W / 2, cy + 86 * u, 14 * u, 'rgba(255,255,255,0.85)', 'center')
					this.text(ctx, '3 圈定胜负 · 4 台车同场', W / 2, cy + 112 * u, 13 * u, 'rgba(255,255,255,0.62)', 'center')
					this.text(ctx, '点屏幕开始', W / 2, cy + 168 * u, 18 * u, '#ffe066', 'center', 'bold')
				}

				if (this.state === 'paused') {
					ctx.fillStyle = 'rgba(8,14,20,0.66)'
					ctx.fillRect(0, 0, W, H)
					this.text(ctx, '已暂停', W / 2, H * 0.42, 30 * u, '#ffffff', 'center', 'bold')
					this.text(ctx, '点屏幕继续', W / 2, H * 0.42 + 40 * u, 14 * u, 'rgba(255,255,255,0.75)', 'center')
				}

				if (this.state === 'finish') {
					const a = clamp(g.finishT * 2.2, 0, 1)
					ctx.globalAlpha = a
					ctx.fillStyle = 'rgba(8,14,20,0.7)'
					ctx.fillRect(0, 0, W, H)
					const w = Math.min(W - 64 * u, 320 * u)
					const h = 250 * u
					const x = (W - w) / 2
					const y = H * 0.5 - h / 2
					ctx.fillStyle = 'rgba(24,32,40,0.96)'
					this.rrect(ctx, x, y, w, h, 22 * u)
					ctx.fill()

					const place = g.karts[0].place
					this.text(ctx, place === 1 ? '冠军！' : '第 ' + place + ' 名', W / 2, y + 48 * u, 30 * u, place === 1 ? '#ffe066' : '#ffffff', 'center', 'bold')
					this.text(ctx, this.track.name + ' · ' + LAPS + ' 圈', W / 2, y + 78 * u, 12 * u, 'rgba(255,255,255,0.6)', 'center')
					this.text(ctx, '总时间 ' + fmtTime(g.raceT * 1000), W / 2, y + 118 * u, 17 * u, '#ffffff', 'center', 'bold')
					this.text(ctx, '最快单圈 ' + (g.bestLap ? fmtTime(g.bestLap) : '--'), W / 2, y + 146 * u, 15 * u, '#7df0b0', 'center')
					this.text(ctx, '点屏幕换条赛道再来一局', W / 2, y + 204 * u, 13 * u, 'rgba(255,255,255,0.7)', 'center')
					ctx.globalAlpha = 1
				}
			},

			/* ================= 绘制小工具 ================= */
			circle(ctx, x, y, r) {
				ctx.beginPath()
				ctx.arc(x, y, r, 0, 6.2832)
				ctx.fill()
			},

			rrect(ctx, x, y, w, h, r) {
				const rr = Math.min(r, w / 2, h / 2)
				ctx.beginPath()
				ctx.moveTo(x + rr, y)
				ctx.lineTo(x + w - rr, y)
				ctx.arcTo(x + w, y, x + w, y + rr, rr)
				ctx.lineTo(x + w, y + h - rr)
				ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr)
				ctx.lineTo(x + rr, y + h)
				ctx.arcTo(x, y + h, x, y + h - rr, rr)
				ctx.lineTo(x, y + rr)
				ctx.arcTo(x, y, x + rr, y, rr)
				ctx.closePath()
			},

			text(ctx, str, x, y, size, color, align, weight) {
				ctx.font = (weight || 'bold') + ' ' + Math.round(size) + 'px -apple-system, "PingFang SC", "Helvetica Neue", sans-serif'
				ctx.textAlign = align || 'left'
				ctx.textBaseline = 'middle'
				ctx.fillStyle = color || '#ffffff'
				ctx.fillText(str, x, y)
			},

			measure(ctx, str, size, weight) {
				try {
					ctx.font = (weight || 'bold') + ' ' + Math.round(size) + 'px -apple-system, "PingFang SC", "Helvetica Neue", sans-serif'
					const m = ctx.measureText ? ctx.measureText(str) : null
					return m && m.width ? m.width : str.length * size * 0.58
				} catch (e) {
					return str.length * size * 0.58
				}
			},

			pill(ctx, x, y, w, h, label, color) {
				ctx.fillStyle = 'rgba(0,0,0,0.4)'
				this.rrect(ctx, x, y, w, h, h / 2)
				ctx.fill()
				this.text(ctx, label, x + w / 2, y + h / 2 + 0.5, 13 * this.u, color || '#ffffff', 'center', 'bold')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.kart {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background-color: #10211a;
		touch-action: none;
	}

	.stage {
		position: absolute;
		left: 0;
		top: 0;
		width: 100% !important;
		height: 100% !important;
		display: block;
	}

	/* cover-view 才能压在小程序原生 canvas 之上 */
	.back-btn {
		position: absolute;
		left: 20rpx;
		width: 64rpx;
		height: 64rpx;
		line-height: 62rpx;
		text-align: center;
		font-size: 34rpx;
		color: #ffffff;
		background-color: rgba(0, 0, 0, 0.32);
		border-radius: 32rpx;
		z-index: 99;
	}
</style>
