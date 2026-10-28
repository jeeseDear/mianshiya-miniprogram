<template>
	<view class="adv">
		<!-- 全部画在 canvas 上：小程序 canvas 是原生组件，普通 view 盖不上去 -->
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

	const BEST_KEY = 'adv_best'
	// 单帧特效上限，防止连续爆开时粒子把帧率拖垮
	const MAX_FX = 120

	// 物理参数（都在代码里乘 s 做屏幕缩放）
	const GRAV = 2000
	const JUMP_V = -830
	const RUN = 258
	const BOARD_MUL = 1.55
	const BOARD_TIME = 14

	// 三套配色循环：白天草原 → 黄昏海岸 → 夜晚丛林
	const THEMES = [
		{
			name: '绿野',
			sky: ['#7fd2ff', '#ddf4ff'],
			hill: '#6fbf89',
			hill2: '#4f9f70',
			grass: '#5fc45f',
			grassDark: '#389a45',
			soil: '#c08a53',
			soilDark: '#9a6839',
			cloud: 'rgba(255,255,255,0.92)',
			plat: '#d9a05f',
			platTop: '#f2c795',
			stars: false
		},
		{
			name: '落日',
			sky: ['#ff9d5c', '#ffe0b0'],
			hill: '#96794f',
			hill2: '#6f5a3a',
			grass: '#cfa45a',
			grassDark: '#9a753a',
			soil: '#a9734a',
			soilDark: '#7c5130',
			cloud: 'rgba(255,236,214,0.9)',
			plat: '#bd8551',
			platTop: '#e3b57e',
			stars: false
		},
		{
			name: '夜色',
			sky: ['#152450', '#31497a'],
			hill: '#2f4463',
			hill2: '#1f2e47',
			grass: '#3f8a80',
			grassDark: '#276059',
			soil: '#463a52',
			soilDark: '#2c2438',
			cloud: 'rgba(198,218,255,0.34)',
			plat: '#6b5674',
			platTop: '#937aa6',
			stars: true
		}
	]

	function clamp(v, a, b) {
		return v < a ? a : v > b ? b : v
	}

	export default {
		data() {
			return {
				canvasId: 'advCanvas',
				statusBar: 0,
				state: 'ready' // ready / playing / paused / over / clear
			}
		},
		created() {
			// 世界、粒子都挂在实例上而不进 data：
			// 每帧上百个数字走响应式 Proxy，小程序会明显掉帧
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
			this.s = 1
			this.groundY = 0

			this.g = null
			this.level = 1
			this.best = 0
			this.overT = 0
			this.clearT = 0

			this.press = { left: false, right: false, jump: false }
			this.jumpEdge = false
			this.btns = null
			this.pauseRect = null

			this.skyGrad = null
			this.starList = null
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
			if (this.state === 'playing') this.state = 'paused'
			this.press = { left: false, right: false, jump: false }
		},
		onUnload() {
			this.running = false
			this.loopToken += 1
			this.saveBest()
		},
		methods: {
			goBack() {
				this.saveBest()
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

			saveBest() {
				if (!this.g) return
				if (this.g.score > this.best) this.best = this.g.score
				try {
					uni.setStorageSync(BEST_KEY, this.best)
				} catch (e) {
					// 存储满了就算了，不影响玩
				}
			},

			/* ================= 画布 ================= */
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
				// 内层 canvas 可能还是 300x150 默认值，尺寸不对就用窗口兜底
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
				this.skyGrad = null
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
				this.skyGrad = null
				this.layout()
				this.raf = (cb) => setTimeout(() => cb(Date.now()), 16)
				this.startLoop()
			},

			globalRaf() {
				if (typeof requestAnimationFrame === 'function') return (cb) => requestAnimationFrame(cb)
				return (cb) => setTimeout(() => cb(Date.now()), 16)
			},

			/* ================= 尺寸与按键布局 ================= */
			layout() {
				const W = this.W
				const H = this.H
				// 以 400x780 为基准缩放，越宽的屏角色越大
				let s = Math.min(W / 400, H / 780)
				s = clamp(s, 0.78, 1.32)
				this.s = s
				this.groundY = Math.round(H - 96 * s)

				const r = 32 * s
				const jr = 40 * s
				// 留出 36*s 给底部 home 条，别让按键贴边
				const baseY = H - 36 * s - r
				this.btns = {
					left: { cx: 20 * s + r, cy: baseY, r },
					right: { cx: 20 * s + r * 3 + 14 * s, cy: baseY, r },
					jump: { cx: W - 20 * s - jr, cy: H - 36 * s - jr, r: jr }
				}
			},

			/* ================= 主循环 ================= */
			startLoop() {
				this.loopToken += 1
				const token = this.loopToken
				if (!this.g) this.newGame(1, 0, 3)
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
				if (this.state === 'playing') {
					this.stepPlayer(dt)
					this.stepFoes(dt)
					this.collide()
					this.stepCam(dt)
				} else if (this.state === 'clear') {
					this.clearT += dt
					if (this.clearT > 2) this.nextLevel()
				} else if (this.state === 'over') {
					this.overT += dt
				}
				this.stepFx(dt)
				if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 46)
				if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 2.4)
				if (g.player.board > 0) g.player.board = Math.max(0, g.player.board - dt)
			},

			/* ================= 关卡生成 ================= */
			newGame(level, score, hp) {
				this.level = level || 1
				this.g = this.buildLevel(this.level)
				this.g.score = score || 0
				this.g.hp = hp || 3
				this.state = 'ready'
				this.overT = 0
				this.clearT = 0
				this.press = { left: false, right: false, jump: false }
				this.jumpEdge = false
			},

			buildLevel(level) {
				const s = this.s
				const gy = this.groundY
				const th = THEMES[(level - 1) % THEMES.length]

				const segs = []
				const plats = []
				const foes = []
				const items = []

				// 开局一大段平地，先熟悉操作
				segs.push({ x: -700, w: 1600 })
				let cursor = 900

				const hard = Math.min(level, 6)
				// 一关 6~11 段，跑完大约 25~45 秒
				const steps = 5 + hard

				for (let i = 0; i < steps; i++) {
					// 坑：最宽约 150*s，滞空能跨约 210*s，留足余量
					const gap = (62 + Math.random() * 42 + hard * 6) * s
					cursor += gap
					const w = (400 + Math.random() * 360) * s

					// 坑上偶尔有块踏脚石，避免长坑只靠一次跳跃
					if (gap > 96 * s && hard > 1 && Math.random() < 0.45) {
						plats.push({
							x: cursor - gap * 0.5 - 34 * s,
							y: gy - 92 * s,
							w: 68 * s,
							kind: 'stone'
						})
					}

					segs.push({ x: cursor, w })

					// 浮台 + 台上的水果
					const pcnt = Math.random() < 0.7 ? 1 : 2
					for (let k = 0; k < pcnt; k++) {
						const pw = (80 + Math.random() * 46) * s
						const px = cursor + w * (0.18 + Math.random() * 0.6)
						const py = gy - (96 + Math.random() * 32) * s
						plats.push({ x: px, y: py, w: pw, kind: 'wood' })
						const fc = Math.random() < 0.55 ? 2 : 1
						for (let c = 0; c < fc; c++) {
							items.push({
								x: px + pw * (fc === 1 ? 0.5 : 0.28 + c * 0.44) - 10 * s,
								y: py - 30 * s,
								w: 20 * s,
								h: 20 * s,
								type: 'fruit',
								kind: Math.random() < 0.5 ? 'melon' : 'berry',
								taken: false,
								t: Math.random() * 5
							})
						}
					}

					// 地面小怪
					foes.push(this.makeFoe('slime', cursor + 96 * s, gy, cursor + 34 * s, cursor + w - 34 * s))
					if (hard > 2 && Math.random() < 0.55) {
						foes.push(this.makeFoe('slime', cursor + w - 116 * s, gy, cursor + 34 * s, cursor + w - 34 * s))
					}
					// 空中飞怪
					if (i > 0 && Math.random() < 0.5) {
						foes.push(
							this.makeFoe(
								'bat',
								cursor + w * 0.55,
								gy - (170 + Math.random() * 46) * s,
								cursor + 30 * s,
								cursor + w - 30 * s
							)
						)
					}

					// 地面道具：滑板最香，其次蛋，偶尔来颗回血的心
					const roll = Math.random()
					if (roll < 0.3) {
						items.push(this.makeGroundItem(cursor + w * 0.5, gy, 'board'))
					} else if (roll < 0.62) {
						items.push(this.makeGroundItem(cursor + w * 0.64, gy, 'egg'))
					} else if (roll < 0.74) {
						items.push(this.makeGroundItem(cursor + w * 0.56, gy, 'heart'))
					}

					cursor += w
				}

				// 终点前的安全平地
				const goalX = cursor + 430 * s
				segs.push({ x: cursor, w: 1200 * s })

				const pw = 30 * s
				const ph = 46 * s

				const stars = []
				for (let i = 0; i < 46; i++) {
					stars.push({
						x: Math.random() * this.W * 2,
						y: Math.random() * this.H * 0.62,
						r: (0.8 + Math.random() * 1.6) * s,
						a: 0.35 + Math.random() * 0.6
					})
				}

				return {
					theme: th,
					time: 0,
					score: 0,
					hp: 3,
					segs,
					plats,
					foes,
					items,
					fx: [],
					stars,
					camX: 0,
					shake: 0,
					flash: 0,
					goalX,
					goalTop: gy - 200 * s,
					goalHit: false,
					player: {
						x: 160,
						y: gy - ph,
						w: pw,
						h: ph,
						vx: 0,
						vy: 0,
						face: 1,
						onGround: true,
						animT: 0,
						inv: 1.2,
						board: 0,
						safeX: 160
					}
				}
			},

			makeFoe(type, x, y, minX, maxX) {
				const s = this.s
				if (type === 'bat') {
					const w = 34 * s
					const h = 24 * s
					return {
						type,
						x: x - w / 2,
						y,
						baseY: y,
						w,
						h,
						vx: (Math.random() < 0.5 ? -1 : 1) * 62 * s,
						minX,
						maxX,
						dying: 0,
						t: Math.random() * 6
					}
				}
				const w = 34 * s
				const h = 28 * s
				return {
					type: 'slime',
					x: x - w / 2,
					y: y - h,
					baseY: y - h,
					w,
					h,
					vx: (Math.random() < 0.5 ? -1 : 1) * (52 + Math.random() * 26) * s,
					minX,
					maxX,
					dying: 0,
					t: Math.random() * 4
				}
			},

			makeGroundItem(x, y, type) {
				const s = this.s
				const w = 24 * s
				const h = 24 * s
				return { x: x - w / 2, y: y - h - 4 * s, w, h, type, taken: false, t: Math.random() * 4 }
			},

			/* ================= 玩家 ================= */
			stepPlayer(dt) {
				const g = this.g
				const p = g.player
				const s = this.s
				const gy = this.groundY

				const speed = RUN * s * (p.board > 0 ? BOARD_MUL : 1)
				let dir = 0
				if (this.press.left) dir -= 1
				if (this.press.right) dir += 1
				if (dir !== 0) p.face = dir

				const target = dir * speed
				const acc = (p.onGround ? 2400 : 1500) * s
				if (p.vx < target) p.vx = Math.min(target, p.vx + acc * dt)
				else if (p.vx > target) p.vx = Math.max(target, p.vx - acc * dt)

				// 起跳
				if (this.jumpEdge && p.onGround) {
					p.vy = JUMP_V * s
					p.onGround = false
					this.dust(p.x + p.w / 2, gy, 5)
				}
				this.jumpEdge = false

				// 松手早收：轻点小跳、按住跳更高
				let gr = GRAV * s
				if (!this.press.jump && p.vy < 0) gr *= 1.9
				p.vy += gr * dt
				if (p.vy > 1500 * s) p.vy = 1500 * s

				// 水平
				p.x += p.vx * dt
				if (p.x < 0) {
					p.x = 0
					p.vx = 0
				}

				// 垂直
				const prevBottom = p.y + p.h
				p.y += p.vy * dt
				const bottom = p.y + p.h
				const wasGround = p.onGround
				p.onGround = false

				// 地面段
				for (let i = 0; i < g.segs.length; i++) {
					const sg = g.segs[i]
					if (p.x + p.w < sg.x || p.x > sg.x + sg.w) continue
					if (p.vy >= 0 && bottom >= gy && prevBottom <= gy + 12 * s) {
						p.y = gy - p.h
						p.vy = 0
						p.onGround = true
						break
					}
				}

				// 浮台（只从上往下踩，单向平台）
				if (!p.onGround && p.vy >= 0) {
					for (let i = 0; i < g.plats.length; i++) {
						const pl = g.plats[i]
						if (p.x + p.w < pl.x || p.x > pl.x + pl.w) continue
						if (prevBottom <= pl.y + 6 * s && bottom >= pl.y) {
							p.y = pl.y - p.h
							p.vy = 0
							p.onGround = true
							break
						}
					}
				}

				if (p.onGround) {
					const moveRatio = Math.abs(p.vx) / (RUN * s)
					// 站着不动就不摆腿，避免原地踏步
					p.animT += dt * moveRatio * 11
					if (this.onSolid(p.x + p.w / 2)) p.safeX = p.x
					if (!wasGround) this.dust(p.x + p.w / 2, p.y + p.h, 4)
				}

				if (p.inv > 0) p.inv -= dt

				// 掉进坑里
				if (p.y > gy + 150 * s) this.loseLife()
			},

			onSolid(x) {
				const g = this.g
				const s = this.s
				for (let i = 0; i < g.segs.length; i++) {
					const sg = g.segs[i]
					if (x > sg.x + 34 * s && x < sg.x + sg.w - 34 * s) return true
				}
				return false
			},

			stepFoes(dt) {
				const g = this.g
				const s = this.s
				for (let i = 0; i < g.foes.length; i++) {
					const f = g.foes[i]
					if (f.dying > 0) {
						f.dying -= dt
						continue
					}
					f.t += dt
					f.x += f.vx * dt
					if (f.x < f.minX) {
						f.x = f.minX
						f.vx = Math.abs(f.vx)
					} else if (f.x + f.w > f.maxX) {
						f.x = f.maxX - f.w
						f.vx = -Math.abs(f.vx)
					}
					if (f.type === 'bat') {
						f.y = f.baseY + Math.sin(f.t * 2.4) * 15 * s
					}
				}
			},

			stepCam(dt) {
				const g = this.g
				const p = g.player
				const W = this.W
				const maxX = g.goalX + 460 * this.s - W
				const want = clamp(p.x - W * 0.36, 0, Math.max(0, maxX))
				g.camX += (want - g.camX) * Math.min(1, dt * 11)
				if (g.camX < 0) g.camX = 0
			},

			/* ================= 碰撞 ================= */
			hit(a, b, pad) {
				const r = pad || 0
				return (
					a.x < b.x + b.w - r &&
					a.x + a.w > b.x + r &&
					a.y < b.y + b.h - r &&
					a.y + a.h > b.y + r
				)
			},

			collide() {
				const g = this.g
				const p = g.player
				const s = this.s

				// 触到旗杆就过关
				if (!g.goalHit && p.x + p.w > g.goalX - 12 * s && p.x < g.goalX + 26 * s) {
					g.goalHit = true
					this.winLevel()
					return
				}

				for (let i = 0; i < g.items.length; i++) {
					const it = g.items[i]
					if (it.taken) continue
					// 负 pad 等于把玩家的判定盒放大，吃道具宽松一点手感更好
					if (this.hit(p, it, -5 * s)) {
						it.taken = true
						this.pickItem(it)
					}
				}

				for (let i = 0; i < g.foes.length; i++) {
					const f = g.foes[i]
					if (f.dying > 0) continue
					if (!this.hit(p, f, 4 * s)) continue

					const stomp = p.vy > 0 && p.y + p.h - f.y < f.h * 0.8
					const crash = p.board > 0

					if (stomp || crash) {
						f.dying = 0.3
						const gain = f.type === 'bat' ? 160 : 100
						g.score += gain
						this.burst(f.x + f.w / 2, f.y + f.h / 2, f.type === 'bat' ? '#b388ff' : '#7ddb5a', 9)
						this.popText(f.x + f.w / 2, f.y, '+' + gain)
						if (stomp) p.vy = -560 * s
						if (crash) g.shake = 7
					} else if (p.inv <= 0) {
						this.hurt()
					}
				}
			},

			pickItem(it) {
				const g = this.g
				const p = g.player
				const s = this.s
				const cxp = it.x + it.w / 2

				if (it.type === 'fruit') {
					g.score += 100
					this.popText(cxp, it.y, '+100')
					this.burst(cxp, it.y + it.h / 2, '#ffd166', 6)
				} else if (it.type === 'egg') {
					g.score += 300
					this.popText(cxp, it.y, '+300')
					this.burst(cxp, it.y + it.h / 2, '#9ad1ff', 8)
				} else if (it.type === 'board') {
					p.board = Math.min(24, p.board + BOARD_TIME)
					p.inv = Math.max(p.inv, 0.7)
					this.popText(cxp, it.y, '滑板!')
					this.burst(cxp, it.y + it.h / 2, '#ffb04d', 10)
					g.flash = Math.max(g.flash, 0.22)
				} else if (it.type === 'heart') {
					if (g.hp < 5) g.hp += 1
					g.score += 200
					this.popText(cxp, it.y, '+1')
					this.burst(cxp, it.y + it.h / 2, '#ff5d6c', 8)
				}
				if (g.score > this.best) this.best = g.score
			},

			hurt() {
				const g = this.g
				const p = g.player
				if (p.inv > 0) return
				g.hp -= 1
				g.shake = 15
				g.flash = 0.5
				p.inv = 1.6
				p.vy = -400 * this.s
				p.onGround = false
				p.board = 0
				this.burst(p.x + p.w / 2, p.y + p.h / 2, '#ff6b6b', 12)
				if (g.hp <= 0) this.gameOver()
			},

			loseLife() {
				const g = this.g
				const p = g.player
				g.hp -= 1
				g.shake = 16
				g.flash = 0.45
				if (g.hp <= 0) {
					this.gameOver()
					return
				}
				// 回到最后一个站稳的位置
				p.x = Math.max(40, p.safeX)
				p.y = this.groundY - p.h
				p.vx = 0
				p.vy = 0
				p.onGround = true
				p.inv = 2
				p.board = 0
				g.camX = clamp(p.x - this.W * 0.36, 0, Math.max(0, g.goalX + 460 * this.s - this.W))
				this.burst(p.x + p.w / 2, p.y + p.h / 2, '#ffd166', 10)
			},

			winLevel() {
				if (this.state !== 'playing') return
				const g = this.g
				g.score += 500 + g.hp * 200
				g.flash = 0.3
				this.clearT = 0
				this.state = 'clear'
				this.saveBest()
			},

			nextLevel() {
				const g = this.g
				const score = g.score
				const hp = g.hp
				const lv = this.level + 1
				this.newGame(lv, score, hp)
				this.state = 'playing'
				this.g.player.inv = 1
			},

			gameOver() {
				if (this.state === 'over') return
				this.state = 'over'
				this.overT = 0
				this.g.shake = 18
				this.saveBest()
			},

			startPlay() {
				if (this.state !== 'ready') return
				this.state = 'playing'
				this.jumpEdge = false
				this.press = { left: false, right: false, jump: false }
				this.g.player.inv = 0.9
			},

			restart() {
				this.newGame(1, 0, 3)
				this.state = 'playing'
				this.g.player.inv = 1
			},

			/* ================= 特效 ================= */
			burst(x, y, color, n) {
				const g = this.g
				if (!g) return
				const s = this.s
				const cnt = Math.min(n, MAX_FX - g.fx.length)
				for (let i = 0; i < cnt; i++) {
					const a = Math.random() * Math.PI * 2
					const sp = (60 + Math.random() * 190) * s
					g.fx.push({
						kind: 'dot',
						x,
						y,
						vx: Math.cos(a) * sp,
						vy: Math.sin(a) * sp - 60 * s,
						r: (1.6 + Math.random() * 2.4) * s,
						color,
						life: 0.35 + Math.random() * 0.3,
						max: 0.65
					})
				}
			},

			dust(x, y, n) {
				const g = this.g
				if (!g) return
				const s = this.s
				for (let i = 0; i < n; i++) {
					if (g.fx.length >= MAX_FX) return
					g.fx.push({
						kind: 'dot',
						x: x + (Math.random() - 0.5) * 14 * s,
						y,
						vx: (Math.random() - 0.5) * 70 * s,
						vy: -Math.random() * 70 * s,
						r: (1.4 + Math.random() * 2) * s,
						color: 'rgba(255,255,255,0.82)',
						life: 0.24 + Math.random() * 0.2,
						max: 0.44
					})
				}
			},

			popText(x, y, str) {
				const g = this.g
				if (!g) return
				g.fx.push({
					kind: 'text',
					x,
					y,
					str,
					life: 0.85,
					max: 0.85,
					color: '#ffe066'
				})
			},

			stepFx(dt) {
				const g = this.g
				const fx = g.fx
				const s = this.s
				for (let i = fx.length - 1; i >= 0; i--) {
					const f = fx[i]
					f.life -= dt
					if (f.life <= 0) {
						fx.splice(i, 1)
						continue
					}
					if (f.kind === 'text') {
						f.y -= 44 * s * dt
						continue
					}
					f.vy += 900 * s * dt
					f.x += f.vx * dt
					f.y += f.vy * dt
				}
			},

			/* ================= 绘制 ================= */
			circle(ctx, cx, cy, r) {
				ctx.beginPath()
				ctx.arc(cx, cy, r, 0, 6.2832)
				ctx.fill()
			},

			ellipse(ctx, cx, cy, rx, ry) {
				ctx.beginPath()
				ctx.save()
				ctx.translate(cx, cy)
				ctx.scale(1, ry / rx)
				ctx.arc(0, 0, rx, 0, 6.2832)
				ctx.restore()
				ctx.fill()
			},

			roundRect(ctx, x, y, w, h, r) {
				const rr = Math.min(r, w / 2, h / 2)
				ctx.beginPath()
				ctx.moveTo(x + rr, y)
				ctx.lineTo(x + w - rr, y)
				ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
				ctx.lineTo(x + w, y + h - rr)
				ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
				ctx.lineTo(x + rr, y + h)
				ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
				ctx.lineTo(x, y + rr)
				ctx.quadraticCurveTo(x, y, x + rr, y)
				ctx.closePath()
				ctx.fill()
			},

			text(ctx, str, x, y, size, color, align, weight) {
				ctx.fillStyle = color
				ctx.textAlign = align || 'left'
				ctx.textBaseline = 'middle'
				try {
					ctx.font = (weight || 'normal') + ' ' + Math.round(size) + 'px sans-serif'
				} catch (e) {
					// 老接口没有 font，忽略
				}
				ctx.fillText(str, x, y)
			},

			drawHeart(ctx, cx, cy, r, color, alpha) {
				ctx.save()
				ctx.globalAlpha = alpha == null ? 1 : alpha
				ctx.fillStyle = color || '#ff5d6c'
				ctx.beginPath()
				ctx.arc(cx - r * 0.46, cy - r * 0.32, r * 0.56, 0, 6.2832)
				ctx.fill()
				ctx.beginPath()
				ctx.arc(cx + r * 0.46, cy - r * 0.32, r * 0.56, 0, 6.2832)
				ctx.fill()
				ctx.beginPath()
				ctx.moveTo(cx - r * 1.02, cy - r * 0.1)
				ctx.lineTo(cx + r * 1.02, cy - r * 0.1)
				ctx.lineTo(cx, cy + r * 1.05)
				ctx.closePath()
				ctx.fill()
				ctx.restore()
			},

			render() {
				const ctx = this.ctx
				if (!ctx || !this.g) return
				const g = this.g
				const W = this.W
				const H = this.H
				const cx = g.camX

				let shx = 0
				let shy = 0
				if (g.shake > 0) {
					shx = (Math.random() - 0.5) * g.shake
					shy = (Math.random() - 0.5) * g.shake
				}

				ctx.save()
				ctx.translate(shx, shy)
				this.drawSky(ctx, W, H, g)
				this.drawFar(ctx, W, H, g)
				this.drawGround(ctx, W, H, g)
				this.drawPlats(ctx, g)
				this.drawGoal(ctx, g)
				this.drawItems(ctx, g)
				this.drawFoes(ctx, g)
				this.drawPlayer(ctx, g)
				this.drawFx(ctx, g)
				ctx.restore()

				this.drawHud(ctx, W, H, g)

				if (g.flash > 0) {
					ctx.fillStyle = 'rgba(255,255,255,' + (g.flash * 0.5).toFixed(3) + ')'
					ctx.fillRect(0, 0, W, H)
				}

				if (this.state === 'ready') this.drawReady(ctx, W, H, g)
				else if (this.state === 'paused') this.drawPaused(ctx, W, H)
				else if (this.state === 'over') this.drawOver(ctx, W, H, g)
				else if (this.state === 'clear') this.drawClear(ctx, W, H, g)
			},

			drawSky(ctx, W, H, g) {
				const th = g.theme
				if (!this.skyGrad) {
					const gr = ctx.createLinearGradient(0, 0, 0, H)
					gr.addColorStop(0, th.sky[0])
					gr.addColorStop(1, th.sky[1])
					this.skyGrad = gr
				}
				ctx.fillStyle = this.skyGrad
				ctx.fillRect(0, 0, W, H)

				if (th.stars && g.stars) {
					for (let i = 0; i < g.stars.length; i++) {
						const st = g.stars[i]
						const tw = 0.65 + Math.sin(g.time * 2 + i) * 0.35
						ctx.fillStyle = 'rgba(255,255,255,' + (st.a * tw).toFixed(3) + ')'
						this.circle(ctx, st.x % W, st.y, st.r)
					}
					// 月亮（画实心圆 + 环形山，别用「挖洞」法，渐变天空下会露出色差）
					const mx = W - 62 * this.s
					const my = this.statusBar + 96 * this.s
					ctx.fillStyle = 'rgba(255,250,220,0.94)'
					this.circle(ctx, mx, my, 19 * this.s)
					ctx.fillStyle = 'rgba(226,220,190,0.55)'
					this.circle(ctx, mx - 5 * this.s, my - 4 * this.s, 4.6 * this.s)
					this.circle(ctx, mx + 6 * this.s, my + 5 * this.s, 3.2 * this.s)
				}
			},

			drawFar(ctx, W, H, g) {
				const s = this.s
				const th = g.theme
				const gy = this.groundY
				const cx = g.camX

				// 云：只按屏宽循环，不受关卡长度影响
				ctx.fillStyle = th.cloud
				for (let i = 0; i < 4; i++) {
					const span = W + 300
					let bx = (i * 210 - cx * 0.16) % span
					if (bx < 0) bx += span
					const by = this.statusBar + 54 * s + (i % 3) * 46 * s
					this.circle(ctx, bx, by, 20 * s)
					this.circle(ctx, bx + 24 * s, by + 3 * s, 15 * s)
					this.circle(ctx, bx - 22 * s, by + 4 * s, 13 * s)
					this.roundRect(ctx, bx - 34 * s, by + 2 * s, 68 * s, 15 * s, 7 * s)
				}

				// 远山
				ctx.fillStyle = th.hill
				const farStep = 420 * s
				let off1 = -(cx * 0.22) % farStep
				for (let i = -1; i < Math.ceil(W / farStep) + 2; i++) {
					const bx = off1 + i * farStep
					ctx.beginPath()
					ctx.moveTo(bx - 20 * s, gy)
					ctx.quadraticCurveTo(bx + 120 * s, gy - 196 * s, bx + 290 * s, gy)
					ctx.closePath()
					ctx.fill()
				}

				// 近山
				ctx.fillStyle = th.hill2
				const nearStep = 300 * s
				let off2 = -(cx * 0.4) % nearStep
				for (let i = -1; i < Math.ceil(W / nearStep) + 2; i++) {
					const bx = off2 + i * nearStep
					ctx.beginPath()
					ctx.moveTo(bx - 16 * s, gy)
					ctx.quadraticCurveTo(bx + 84 * s, gy - 132 * s, bx + 206 * s, gy)
					ctx.closePath()
					ctx.fill()
				}
			},

			drawGround(ctx, W, H, g) {
				const s = this.s
				const th = g.theme
				const gy = this.groundY
				const gh = H - gy
				const cx = g.camX

				for (let i = 0; i < g.segs.length; i++) {
					const sg = g.segs[i]
					const x = sg.x - cx
					if (x + sg.w < -24 || x > W + 24) continue

					// 土壤 + 暗部
					ctx.fillStyle = th.soil
					ctx.fillRect(x, gy, sg.w, gh)
					ctx.fillStyle = th.soilDark
					ctx.fillRect(x, gy + 18 * s, sg.w, gh)

					// 草皮
					ctx.fillStyle = th.grass
					ctx.fillRect(x, gy - 6 * s, sg.w, 16 * s)
					ctx.fillStyle = th.grassDark
					ctx.fillRect(x, gy + 8 * s, sg.w, 5 * s)

					// 草叶
					ctx.fillStyle = th.grass
					const leafStep = 26 * s
					let lx = Math.floor(sg.x / leafStep) * leafStep
					for (; lx < sg.x + sg.w; lx += leafStep) {
						const px = lx - cx
						if (px < -leafStep || px > W) continue
						ctx.beginPath()
						ctx.moveTo(px, gy - 5 * s)
						ctx.lineTo(px + 5 * s, gy - 13 * s)
						ctx.lineTo(px + 10 * s, gy - 5 * s)
						ctx.closePath()
						ctx.fill()
					}

					// 砖纹
					ctx.fillStyle = 'rgba(0,0,0,0.075)'
					const brickStep = 36 * s
					let bx = Math.floor(sg.x / brickStep) * brickStep
					for (; bx < sg.x + sg.w; bx += brickStep) {
						const px = bx - cx
						if (px < -brickStep || px > W) continue
						ctx.fillRect(px, gy + 44 * s, brickStep - 3 * s, 7 * s)
						ctx.fillRect(px, gy + 74 * s, brickStep - 3 * s, 7 * s)
					}
				}
			},

			drawPlats(ctx, g) {
				const s = this.s
				const th = g.theme
				const cx = g.camX
				for (let i = 0; i < g.plats.length; i++) {
					const pl = g.plats[i]
					const x = pl.x - cx
					if (x + pl.w < -24 || x > this.W + 24) continue
					const hgt = (pl.kind === 'stone' ? 15 : 18) * s

					ctx.fillStyle = 'rgba(0,0,0,0.13)'
					ctx.fillRect(x + 2 * s, pl.y + hgt - 2 * s, pl.w, 4 * s)

					ctx.fillStyle = th.plat
					this.roundRect(ctx, x, pl.y, pl.w, hgt, 4 * s)
					ctx.fillStyle = th.platTop
					this.roundRect(ctx, x, pl.y, pl.w, 5 * s, 3 * s)

					// 木纹 / 石缝
					ctx.fillStyle = 'rgba(0,0,0,0.09)'
					if (pl.kind === 'wood') {
						ctx.fillRect(x + pl.w * 0.32, pl.y + 6 * s, 2 * s, hgt - 9 * s)
						ctx.fillRect(x + pl.w * 0.68, pl.y + 6 * s, 2 * s, hgt - 9 * s)
					} else {
						ctx.fillRect(x + 4 * s, pl.y + hgt * 0.55, pl.w - 8 * s, 2 * s)
					}
				}
			},

			drawGoal(ctx, g) {
				const s = this.s
				const x = g.goalX - g.camX
				if (x < -70 || x > this.W + 70) return
				const top = g.goalTop
				const base = this.groundY

				ctx.fillStyle = '#ececf4'
				ctx.fillRect(x - 2 * s, top, 4 * s, base - top)
				ctx.fillStyle = 'rgba(0,0,0,0.12)'
				ctx.fillRect(x + 1 * s, top, 1.6 * s, base - top)

				ctx.fillStyle = '#ffd166'
				this.circle(ctx, x, top - 4 * s, 5 * s)

				const wob = Math.sin(g.time * 4) * 3 * s
				ctx.fillStyle = '#ff5d6c'
				ctx.beginPath()
				ctx.moveTo(x + 2 * s, top + 8 * s)
				ctx.lineTo(x + 36 * s + wob, top + 19 * s)
				ctx.lineTo(x + 2 * s, top + 31 * s)
				ctx.closePath()
				ctx.fill()

				ctx.fillStyle = '#b9b9c9'
				ctx.fillRect(x - 13 * s, base - 9 * s, 26 * s, 9 * s)
			},

			drawItems(ctx, g) {
				const s = this.s
				const cx = g.camX
				for (let i = 0; i < g.items.length; i++) {
					const it = g.items[i]
					if (it.taken) continue
					const x = it.x - cx
					if (x + it.w < -30 || x > this.W + 30) continue
					const bob = Math.sin(g.time * 3 + it.t) * 2.2 * s
					const cxp = x + it.w / 2
					const cyp = it.y + it.h / 2 + bob
					const r = it.w * 0.5

					if (it.type === 'fruit') {
						ctx.fillStyle = it.kind === 'melon' ? '#4ec96a' : '#ff5d6c'
						this.circle(ctx, cxp, cyp, r)
						ctx.fillStyle = 'rgba(255,255,255,0.5)'
						this.circle(ctx, cxp - r * 0.3, cyp - r * 0.34, r * 0.26)
						ctx.fillStyle = '#3a8f4a'
						ctx.fillRect(cxp - 1 * s, cyp - r - 5 * s, 2 * s, 4 * s)
					} else if (it.type === 'egg') {
						ctx.fillStyle = '#fff6e0'
						this.ellipse(ctx, cxp, cyp, it.w * 0.36, it.h * 0.5)
						ctx.fillStyle = 'rgba(120,180,255,0.55)'
						this.circle(ctx, cxp - r * 0.24, cyp - r * 0.2, r * 0.16)
						this.circle(ctx, cxp + r * 0.22, cyp + r * 0.22, r * 0.13)
					} else if (it.type === 'board') {
						ctx.fillStyle = '#ffb04d'
						this.roundRect(ctx, cxp - it.w * 0.5, cyp - 3 * s, it.w, 6 * s, 3 * s)
						ctx.fillStyle = '#3a3a48'
						this.circle(ctx, cxp - it.w * 0.24, cyp + 5 * s, 2.8 * s)
						this.circle(ctx, cxp + it.w * 0.24, cyp + 5 * s, 2.8 * s)
					} else {
						this.drawHeart(ctx, cxp, cyp, r * 0.8)
					}
				}
			},

			drawFoes(ctx, g) {
				const s = this.s
				const cx = g.camX
				for (let i = 0; i < g.foes.length; i++) {
					const f = g.foes[i]
					const x = f.x - cx
					if (x + f.w < -40 || x > this.W + 40) continue

					let alpha = 1
					let squash = 1
					if (f.dying > 0) {
						const k = 1 - f.dying / 0.3
						alpha = Math.max(0, 1 - k * 0.95)
						squash = 1 + k * 0.5
					}

					ctx.save()
					ctx.globalAlpha = alpha

					if (f.type === 'bat') {
						const flap = Math.sin(f.t * 16)
						ctx.fillStyle = '#9a7ddb'
						// 翅膀
						ctx.beginPath()
						ctx.moveTo(x + f.w * 0.5, f.y + f.h * 0.5)
						ctx.lineTo(x - 4 * s, f.y - flap * 6 * s)
						ctx.lineTo(x + 2 * s, f.y + f.h * 0.6)
						ctx.closePath()
						ctx.fill()
						ctx.beginPath()
						ctx.moveTo(x + f.w * 0.5, f.y + f.h * 0.5)
						ctx.lineTo(x + f.w + 4 * s, f.y - flap * 6 * s)
						ctx.lineTo(x + f.w - 2 * s, f.y + f.h * 0.6)
						ctx.closePath()
						ctx.fill()
						// 身体
						ctx.fillStyle = '#6f52b0'
						this.ellipse(ctx, x + f.w * 0.5, f.y + f.h * 0.52, f.w * 0.24, f.h * 0.36)
						// 眼睛
						ctx.fillStyle = '#ffe066'
						this.circle(ctx, x + f.w * 0.42, f.y + f.h * 0.44, 1.8 * s)
						this.circle(ctx, x + f.w * 0.6, f.y + f.h * 0.44, 1.8 * s)
					} else {
						ctx.save()
						ctx.translate(x + f.w / 2, f.y + f.h)
						// 被踩扁：横向拉开、纵向压低
						ctx.scale(squash, 1 / squash)
						// 身体
						ctx.fillStyle = '#6ecf52'
						ctx.beginPath()
						ctx.moveTo(-f.w * 0.5, 0)
						ctx.quadraticCurveTo(-f.w * 0.5, -f.h, 0, -f.h)
						ctx.quadraticCurveTo(f.w * 0.5, -f.h, f.w * 0.5, 0)
						ctx.closePath()
						ctx.fill()
						// 肚皮
						ctx.fillStyle = '#a8e88c'
						this.ellipse(ctx, 0, -f.h * 0.32, f.w * 0.28, f.h * 0.24)
						// 眼睛
						ctx.fillStyle = '#ffffff'
						this.circle(ctx, -f.w * 0.16, -f.h * 0.66, 3.2 * s)
						this.circle(ctx, f.w * 0.16, -f.h * 0.66, 3.2 * s)
						ctx.fillStyle = '#2c3a20'
						this.circle(ctx, -f.w * 0.16 + Math.sign(f.vx) * 0.8 * s, -f.h * 0.66, 1.6 * s)
						this.circle(ctx, f.w * 0.16 + Math.sign(f.vx) * 0.8 * s, -f.h * 0.66, 1.6 * s)
						// 脚
						ctx.fillStyle = '#4a9c36'
						ctx.fillRect(-f.w * 0.36, -3 * s, f.w * 0.28, 3 * s)
						ctx.fillRect(f.w * 0.08, -3 * s, f.w * 0.28, 3 * s)
						ctx.restore()
					}
					ctx.restore()
				}
			},

			drawPlayer(ctx, g) {
				const p = g.player
				const s = this.s
				const x = p.x - g.camX
				const y = p.y + p.h

				if (p.inv > 0 && Math.floor(g.time * 18) % 2 === 0) return

				if (p.onGround) {
					ctx.fillStyle = 'rgba(0,0,0,0.16)'
					this.ellipse(ctx, x + p.w / 2, y + 2 * s, p.w * 0.44, 3.4 * s)
				}

				ctx.save()
				ctx.translate(x + p.w / 2, y)
				if (p.face < 0) ctx.scale(-1, 1)

				const S = s
				const air = !p.onGround
				// 站着不动时腿并拢，别原地踏步
				const moving = Math.abs(p.vx) > 12 * S
				const run = air || !moving ? 0 : Math.sin(p.animT * 2.2)
				const sw = run * 4 * S

				// 滑板
				if (p.board > 0) {
					const wob = Math.sin(g.time * 14) * 1.2 * S
					ctx.save()
					ctx.translate(0, wob)
					ctx.fillStyle = '#ffb04d'
					this.roundRect(ctx, -16 * S, -8 * S, 32 * S, 6 * S, 3 * S)
					ctx.fillStyle = '#3a3a48'
					this.circle(ctx, -10 * S, -1.5 * S, 2.6 * S)
					this.circle(ctx, 10 * S, -1.5 * S, 2.6 * S)
					ctx.restore()
				}

				// 腿
				ctx.fillStyle = '#3a5fa8'
				if (air) {
					ctx.fillRect(-8 * S, -14 * S, 7 * S, 11 * S)
					ctx.fillRect(2 * S, -12 * S, 7 * S, 9 * S)
				} else {
					ctx.fillRect(-8 * S + sw, -14 * S, 7 * S, 14 * S)
					ctx.fillRect(1 * S - sw, -14 * S, 7 * S, 14 * S)
				}
				// 鞋
				ctx.fillStyle = '#6b4423'
				if (air) {
					ctx.fillRect(-9 * S, -4 * S, 9 * S, 4 * S)
					ctx.fillRect(1 * S, -4 * S, 9 * S, 4 * S)
				} else {
					ctx.fillRect(-10 * S + sw, -4 * S, 9 * S, 4 * S)
					ctx.fillRect(1 * S - sw, -4 * S, 9 * S, 4 * S)
				}

				// 上衣
				ctx.fillStyle = '#ff6a4d'
				this.roundRect(ctx, -9 * S, -30 * S, 18 * S, 18 * S, 6 * S)
				// 背带
				ctx.fillStyle = '#2f4f8f'
				ctx.fillRect(-6 * S, -30 * S, 3.6 * S, 10 * S)
				ctx.fillRect(2.4 * S, -30 * S, 3.6 * S, 10 * S)

				// 手臂
				ctx.fillStyle = '#ffd7a8'
				const armSw = air ? -5 : run * 5
				ctx.fillRect(5.5 * S, -28 * S + armSw * S * 0.5, 4.6 * S, 10 * S)

				// 头
				ctx.fillStyle = '#ffd7a8'
				this.circle(ctx, 0, -37 * S, 8 * S)
				// 帽子
				ctx.fillStyle = '#2fa84f'
				ctx.beginPath()
				ctx.arc(0, -40 * S, 8.4 * S, Math.PI, Math.PI * 2)
				ctx.fill()
				ctx.fillRect(-11 * S, -41 * S, 22 * S, 3 * S)
				// 眼睛
				ctx.fillStyle = '#3a2a1a'
				ctx.fillRect(3 * S, -38.6 * S, 2.2 * S, 2.2 * S)

				ctx.restore()
			},

			drawFx(ctx, g) {
				const fx = g.fx
				const cx = g.camX
				for (let i = 0; i < fx.length; i++) {
					const f = fx[i]
					const k = f.life / f.max
					if (f.kind === 'text') {
						ctx.save()
						ctx.globalAlpha = Math.min(1, k * 1.6)
						this.text(ctx, f.str, f.x - cx, f.y, 15 * this.s, f.color, 'center', 'bold')
						ctx.restore()
						continue
					}
					ctx.save()
					ctx.globalAlpha = Math.max(0, k)
					ctx.fillStyle = f.color
					this.circle(ctx, f.x - cx, f.y, f.r * (0.4 + k * 0.6))
					ctx.restore()
				}
			},

			drawHud(ctx, W, H, g) {
				const s = this.s
				const top = this.statusBar + 10
				const p = g.player

				// 分数居中
				this.text(ctx, String(g.score), W / 2, top + 22 * s, 28 * s, '#ffffff', 'center', 'bold')
				this.text(ctx, '第 ' + this.level + ' 关 · ' + g.theme.name, W / 2, top + 44 * s, 12 * s, 'rgba(255,255,255,0.88)', 'center')

				// 暂停键贴在返回键右侧（右上会被小程序胶囊占用）
				const pr = 16 * s
				const pcx = 46 + 20 * s + pr
				const pcy = this.statusBar + 8 + 16
				this.pauseRect = { x: pcx - pr, y: pcy - pr, w: pr * 2, h: pr * 2 }
				ctx.fillStyle = 'rgba(0,0,0,0.22)'
				this.circle(ctx, pcx, pcy, pr)
				ctx.fillStyle = '#ffffff'
				ctx.fillRect(pcx - 4.6 * s, pcy - 5.4 * s, 3.2 * s, 10.8 * s)
				ctx.fillRect(pcx + 1.4 * s, pcy - 5.4 * s, 3.2 * s, 10.8 * s)

				// 生命（放在返回键正下方，避开左上角）
				const hy = this.statusBar + 8 + 32 + 18 * s
				for (let i = 0; i < Math.max(0, Math.min(g.hp, 5)); i++) {
					this.drawHeart(ctx, 26 * s + i * 21 * s, hy, 7.6 * s, '#ff5d6c', 1)
				}

				// 滑板计时
				if (p.board > 0) {
					const bw = 92 * s
					const bx = W / 2 - bw / 2
					const by = top + 54 * s
					ctx.fillStyle = 'rgba(0,0,0,0.24)'
					this.roundRect(ctx, bx, by, bw, 7 * s, 3.5 * s)
					ctx.fillStyle = '#ffb04d'
					this.roundRect(ctx, bx, by, bw * Math.min(1, p.board / BOARD_TIME), 7 * s, 3.5 * s)
				}

				// 虚拟按键
				this.padBtn(ctx, this.btns.left, 'left', this.press.left)
				this.padBtn(ctx, this.btns.right, 'right', this.press.right)
				this.padBtn(ctx, this.btns.jump, 'jump', this.press.jump)
			},

			padBtn(ctx, btn, kind, on) {
				ctx.fillStyle = on ? 'rgba(255,255,255,0.44)' : 'rgba(255,255,255,0.2)'
				this.circle(ctx, btn.cx, btn.cy, btn.r)
				ctx.strokeStyle = 'rgba(255,255,255,0.55)'
				ctx.lineWidth = 2
				ctx.beginPath()
				ctx.arc(btn.cx, btn.cy, btn.r, 0, 6.2832)
				ctx.stroke()

				const fg = on ? '#1f6b3a' : 'rgba(255,255,255,0.94)'
				if (kind === 'jump') {
					this.text(ctx, '跳', btn.cx, btn.cy + 1, btn.r * 0.8, fg, 'center', 'bold')
				} else {
					const d = kind === 'left' ? -1 : 1
					const c = btn.r * 0.42
					ctx.fillStyle = fg
					ctx.beginPath()
					ctx.moveTo(btn.cx + d * c, btn.cy)
					ctx.lineTo(btn.cx - d * c * 0.72, btn.cy - c)
					ctx.lineTo(btn.cx - d * c * 0.72, btn.cy + c)
					ctx.closePath()
					ctx.fill()
				}
			},

			/* ================= 状态页 ================= */
			panel(ctx, W, H, hgt, title, sub) {
				const s = this.s
				ctx.fillStyle = 'rgba(8,16,26,0.62)'
				ctx.fillRect(0, 0, W, H)
				const pw = Math.min(W - 64, 300)
				const px = (W - pw) / 2
				const py = H / 2 - hgt / 2
				ctx.fillStyle = 'rgba(255,255,255,0.97)'
				this.roundRect(ctx, px, py, pw, hgt, 20)
				this.text(ctx, title, W / 2, py + 40 * s, 24 * s, '#1f2d28', 'center', 'bold')
				if (sub) this.text(ctx, sub, W / 2, py + 68 * s, 13 * s, '#7c8a85', 'center')
				return { px, py, pw }
			},

			drawReady(ctx, W, H, g) {
				const s = this.s
				const p = this.panel(ctx, W, H, 236 * s, '冒险岛 3', '拖住左右键跑，点「跳」越过坑洞')
				const cy = p.py + 104 * s
				// 三行玩法提示
				const tips = ['踩小怪的头把它压扁，撞侧面会掉命', '吃水果加分，捡到滑板能一路撞过去', '跑到旗杆就算过关，越往后越难']
				for (let i = 0; i < tips.length; i++) {
					this.text(ctx, tips[i], W / 2, cy + i * 22 * s, 12 * s, '#5c6b66', 'center')
				}
				this.text(ctx, '最高分 ' + this.best, W / 2, p.py + 178 * s, 12 * s, '#9aa8a3', 'center')
				const a = 0.6 + Math.sin(g.time * 4) * 0.4
				ctx.save()
				ctx.globalAlpha = a
				this.text(ctx, '点击屏幕开始', W / 2, p.py + 208 * s, 15 * s, '#00b578', 'center', 'bold')
				ctx.restore()
			},

			drawPaused(ctx, W, H) {
				const s = this.s
				this.panel(ctx, W, H, 150 * s, '暂停', '点一下屏幕继续')
				this.text(ctx, '第 ' + this.level + ' 关 · 得分 ' + this.g.score, W / 2, H / 2 + 32 * s, 13 * s, '#7c8a85', 'center')
			},

			drawOver(ctx, W, H, g) {
				const s = this.s
				const p = this.panel(ctx, W, H, 226 * s, '旅程结束', '再来一次？')
				this.text(ctx, String(g.score), W / 2, p.py + 104 * s, 36 * s, '#ff6a4d', 'center', 'bold')
				this.text(ctx, '本局得分', W / 2, p.py + 130 * s, 12 * s, '#9aa8a3', 'center')
				this.text(ctx, '最高分 ' + this.best, W / 2, p.py + 158 * s, 13 * s, '#5c6b66', 'center')
				if (this.overT > 0.8) {
					const a = 0.6 + Math.sin(g.time * 4) * 0.4
					ctx.save()
					ctx.globalAlpha = a
					this.text(ctx, '点击重新开始', W / 2, p.py + 198 * s, 15 * s, '#00b578', 'center', 'bold')
					ctx.restore()
				}
			},

			drawClear(ctx, W, H, g) {
				const s = this.s
				const p = this.panel(ctx, W, H, 200 * s, '过关！', '第 ' + this.level + ' 关完成')
				this.text(ctx, '+' + (500 + g.hp * 200), W / 2, p.py + 104 * s, 26 * s, '#00b578', 'center', 'bold')
				this.text(ctx, '生命奖励 ' + g.hp + ' × 200', W / 2, p.py + 130 * s, 12 * s, '#9aa8a3', 'center')
				this.text(ctx, '正在前往第 ' + (this.level + 1) + ' 关…', W / 2, p.py + 168 * s, 13 * s, '#5c6b66', 'center')
			},

			/* ================= 触摸 ================= */
			pointOf(t) {
				if (!t) return null
				let x = typeof t.clientX === 'number' ? t.clientX : t.x
				let y = typeof t.clientY === 'number' ? t.clientY : t.y
				if (typeof x !== 'number' || typeof y !== 'number') return null
				return { x, y }
			},

			inBtn(pt, btn) {
				if (!btn) return false
				const dx = pt.x - btn.cx
				const dy = pt.y - btn.cy
				return dx * dx + dy * dy < btn.r * btn.r * 1.6
			},

			inRect(pt, rect) {
				if (!rect) return false
				return pt.x >= rect.x - 4 && pt.x <= rect.x + rect.w + 4 && pt.y >= rect.y - 4 && pt.y <= rect.y + rect.h + 4
			},

			track(e) {
				const list = (e && e.touches) || []
				const next = { left: false, right: false, jump: false }
				const b = this.btns
				for (let i = 0; i < list.length; i++) {
					const pt = this.pointOf(list[i])
					if (!pt) continue
					if (!next.left && this.inBtn(pt, b.left)) next.left = true
					else if (!next.right && this.inBtn(pt, b.right)) next.right = true
					if (!next.jump && this.inBtn(pt, b.jump)) next.jump = true
				}
				if (next.jump && !this.press.jump) this.jumpEdge = true
				this.press = next
			},

			onTouchStart(e) {
				if (this.state === 'ready') {
					this.startPlay()
					return
				}
				if (this.state === 'over') {
					if (this.overT > 0.8) this.restart()
					return
				}
				if (this.state === 'paused') {
					this.state = 'playing'
					this.lastTs = 0
					this.press = { left: false, right: false, jump: false }
					return
				}
				if (this.state === 'clear') return

				const pt = this.pointOf(e.touches && e.touches[0])
				if (pt && this.inRect(pt, this.pauseRect)) {
					this.state = 'paused'
					this.press = { left: false, right: false, jump: false }
					return
				}
				this.track(e)
			},

			onTouchMove(e) {
				if (this.state !== 'playing') return
				this.track(e)
			},

			onTouchEnd(e) {
				if (this.state !== 'playing') return
				this.track(e)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.adv {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background-color: #0b1220;
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
		background-color: rgba(255, 255, 255, 0.14);
		border-radius: 32rpx;
	}
</style>
