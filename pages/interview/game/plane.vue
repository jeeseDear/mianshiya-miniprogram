<template>
	<view class="plane">
		<!-- 全部游戏内容（含 HUD、开始/暂停/结算界面）都画在这块画布上。
		     小程序的 canvas 是原生组件，普通 view 盖不上去，所以不再用 DOM 做界面。 -->
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

		<!-- 返回按钮必须能被点，用 cover-view 才能压在小程序原生画布上 -->
		<cover-view class="back-btn" :style="{ top: statusBar + 8 + 'px' }" @tap="goBack">←</cover-view>
	</view>
</template>

<script>
	import { navBack } from '@/common/nav.js'

	const BEST_KEY = 'plane_best'
	// 粒子数量上限，避免大型敌机连爆时把帧率拖垮
	const MAX_PARTS = 160

	// 三种敌机：侦察机 / 战斗机 / 轰炸机
	const FOE = [
		{ hp: 1, r: 14, speed: 118, score: 10, color: '#ffb066', edge: '#ff8a3d', drop: 0.05 },
		{ hp: 4, r: 21, speed: 82, score: 35, color: '#ff7a93', edge: '#f5486e', drop: 0.22 },
		{ hp: 14, r: 31, speed: 50, score: 120, color: '#c07bff', edge: '#8a3dff', drop: 0.62 }
	]

	// 道具：火力 / 护盾 / 炸弹
	const ITEM_COLOR = { power: '#5ef0c0', shield: '#66c8ff', bomb: '#ffd166' }

	function rr(ctx, x, y, w, h, r) {
		const rad = Math.min(r, w / 2, h / 2)
		ctx.beginPath()
		ctx.moveTo(x + rad, y)
		ctx.lineTo(x + w - rad, y)
		ctx.arcTo(x + w, y, x + w, y + rad, rad)
		ctx.lineTo(x + w, y + h - rad)
		ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad)
		ctx.lineTo(x + rad, y + h)
		ctx.arcTo(x, y + h, x, y + h - rad, rad)
		ctx.lineTo(x, y + rad)
		ctx.arcTo(x, y, x + rad, y, rad)
		ctx.closePath()
	}

	// 两圆碰撞
	function hit(a, b) {
		const dx = a.x - b.x
		const dy = a.y - b.y
		const s = a.r + b.r
		return dx * dx + dy * dy <= s * s
	}

	function clamp(v, a, b) {
		return v < a ? a : v > b ? b : v
	}

	export default {
		data() {
			return {
				canvasId: 'planeCanvas',
				statusBar: 0,
				state: 'ready' // ready / playing / paused / over
			}
		},
		created() {
			// 游戏世界挂在实例上而不是 data：每帧要改上百个数字，
			// 一旦进了响应式系统，小程序端会被 Proxy 拖到明显掉帧。
			this.g = null
			this.ctx = null
			this.legacy = false
			this.running = false
			this.lastTs = 0
			this.bg = null
			this.W = 0
			this.H = 0
			this.u = 1
			this.speedK = 1
			this.dpr = 1
			this.sysW = 375
			this.sysH = 667
			this.raf = null
			this.loopToken = 0
			this.best = 0
			this.prevBest = 0
			this.overT = 0
			this.ui = {}
			this.drag = { on: false, dx: 0, dy: 0 }
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

			/* ---------------- 画布 ---------------- */
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

			// H5 / APK 套壳：canvas 是普通 DOM，尺寸取父容器（外层 uni-canvas 才是铺满的那个）
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

			// 小程序：type="2d" 的 canvas 要拿到真实 node 才能用 rAF
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
				// 尺寸拿歪了（比如内层 canvas 还是 300x150 默认值）就用窗口尺寸兜底，
				// 否则坐标全在小格子里，飞机和敌机都会跑到画面外。
				if (!(W > 80) || !(H > 200)) {
					W = Math.round(this.sysW)
					H = Math.round(this.sysH)
				}
				this.W = W
				this.H = H
				this.u = Math.min(1.2, Math.max(0.85, W / 375))
				this.speedK = clamp(H / 720, 0.8, 1.35)

				// H5 端内层 canvas 吃不到类名上的 100%，这里按像素钉死
				try {
					if (canvas.style) {
						canvas.style.width = W + 'px'
						canvas.style.height = H + 'px'
					}
				} catch (e) {
					// 小程序 node 没有 style，忽略
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
				// 之后一律按逻辑像素写坐标，缩放交给这里
				if (ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
				else ctx.scale(dpr, dpr)
				this.ctx = ctx
				this.legacy = false
				this.bg = null
				this.raf =
					typeof canvas.requestAnimationFrame === 'function'
						? canvas.requestAnimationFrame.bind(canvas)
						: this.globalRaf()
				this.startLoop()
			},

			// 拿不到 node 时的老接口兜底（App 端等）
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
				this.u = Math.min(1.2, Math.max(0.85, this.W / 375))
				this.speedK = clamp(this.H / 720, 0.8, 1.35)
				this.bg = null
				this.raf = (cb) => setTimeout(() => cb(Date.now()), 16)
				this.startLoop()
			},

			globalRaf() {
				if (typeof requestAnimationFrame === 'function') return (cb) => requestAnimationFrame(cb)
				return (cb) => setTimeout(() => cb(Date.now()), 16)
			},

			/* ---------------- 主循环 ---------------- */
			startLoop() {
				this.loopToken += 1
				const token = this.loopToken
				if (!this.g) this.g = this.newWorld()
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

			/* ---------------- 世界 ---------------- */
			newWorld() {
				const W = this.W || this.sysW
				const H = this.H || this.sysH
				const stars = []
				for (let i = 0; i < 70; i++) {
					const z = Math.random() // 0 近 1 远
					stars.push({
						x: Math.random() * W,
						y: Math.random() * H,
						z,
						r: 0.6 + (1 - z) * 1.5,
						v: (24 + (1 - z) * 92) * this.speedK
					})
				}
				return {
					stars,
					player: this.newPlayer(),
					hp: 3,
					bombs: 1,
					bullets: [],
					foes: [],
					ebullets: [],
					items: [],
					parts: [],
					rings: [],
					texts: [],
					time: 0,
					level: 1,
					spawnT: 0.4,
					score: 0,
					kills: 0,
					shake: 0,
					flash: 0,
					respawnT: 0
				}
			},

			newPlayer() {
				const u = this.u
				const x = this.W / 2
				const y = this.H - 120 * u
				return {
					x,
					y,
					tx: x,
					ty: y,
					r: 13 * u,
					cool: 0,
					invuln: 1.6,
					power: 1,
					shield: 0,
					dead: false
				}
			},

			tick(dt) {
				const g = this.g
				if (!g) return
				this.stepStars(dt)
				if (this.state === 'playing') this.stepPlay(dt)
				else if (this.state === 'over') this.overT += dt
				this.stepFx(dt)
				if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 34)
				if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 2.6)
			},

			stepStars(dt) {
				const g = this.g
				const boost = this.state === 'playing' ? 1 + Math.min(g.time, 120) / 90 : 1
				for (let i = 0; i < g.stars.length; i++) {
					const s = g.stars[i]
					s.y += s.v * boost * dt
					if (s.y > this.H + 4) {
						s.y = -4
						s.x = Math.random() * this.W
					}
				}
			},

			stepPlay(dt) {
				const g = this.g
				g.time += dt
				g.level = 1 + Math.floor(g.time / 20)

				const p = g.player
				if (p.dead) {
					g.respawnT -= dt
					if (g.respawnT <= 0) this.respawn()
					return
				}

				// 跟手：往目标点插值，比硬贴手指顺滑
				const k = Math.min(1, dt * 22)
				p.x += (p.tx - p.x) * k
				p.y += (p.ty - p.y) * k

				if (p.invuln > 0) p.invuln -= dt
				if (p.shield > 0) p.shield -= dt

				p.cool -= dt
				if (p.cool <= 0) {
					this.fire()
					p.cool = p.power >= 3 ? 0.1 : p.power === 2 ? 0.115 : 0.135
				}

				this.stepBullets(dt)
				this.stepSpawn(dt)
				this.stepFoes(dt)
				this.stepItems(dt)
				this.collide()
			},

			stepBullets(dt) {
				const g = this.g
				for (let i = g.bullets.length - 1; i >= 0; i--) {
					const b = g.bullets[i]
					b.x += b.vx * dt
					b.y += b.vy * dt
					if (b.y < -24 || b.x < -24 || b.x > this.W + 24) g.bullets.splice(i, 1)
				}
			},

			stepSpawn(dt) {
				const g = this.g
				g.spawnT -= dt
				if (g.spawnT > 0) return
				const interval = Math.max(0.32, 1.02 - g.level * 0.075)
				g.spawnT = interval * (0.78 + Math.random() * 0.44)

				const roll = Math.random()
				const bigChance = g.level >= 3 ? Math.min(0.16, 0.09 + (g.level - 3) * 0.02) : 0
				const midChance = 0.16 + Math.min(0.26, (g.level - 1) * 0.06)
				let type = 0
				if (roll < bigChance) type = 2
				else if (roll < bigChance + midChance) type = 1
				this.spawnFoe(type)
			},

			spawnFoe(type, y) {
				const g = this.g
				const cfg = FOE[type]
				const u = this.u
				const r = cfg.r * u
				const x = r + 10 + Math.random() * Math.max(1, this.W - r * 2 - 20)
				g.foes.push({
					type,
					x,
					baseX: x,
					y: typeof y === 'number' ? y : -r - 12,
					r,
					hp: cfg.hp,
					maxHp: cfg.hp,
					vy: cfg.speed * this.speedK * (1 + (g.level - 1) * 0.06) * u,
					vx: type === 0 ? (Math.random() - 0.5) * 46 * u : 0,
					phase: Math.random() * Math.PI * 2,
					shootT: type === 2 ? 1.4 : 0,
					hitT: 0
				})
			},

			stepFoes(dt) {
				const g = this.g
				for (let i = g.foes.length - 1; i >= 0; i--) {
					const f = g.foes[i]
					f.y += f.vy * dt
					if (f.hitT > 0) f.hitT -= dt
					if (f.type === 1) {
						f.phase += dt * 1.9
						f.x = f.baseX + Math.sin(f.phase) * 26 * this.u
					} else if (f.type === 2) {
						f.phase += dt * 1.1
						f.x = f.baseX + Math.sin(f.phase) * 34 * this.u
						f.shootT -= dt
						if (f.shootT <= 0) {
							f.shootT = 1.7
							this.foeFire(f)
						}
					} else {
						f.x += f.vx * dt
					}
					if (f.y > this.H + f.r + 20 || f.x < -f.r * 3 || f.x > this.W + f.r * 3) {
						g.foes.splice(i, 1)
					}
				}

				for (let i = g.ebullets.length - 1; i >= 0; i--) {
					const b = g.ebullets[i]
					b.x += b.vx * dt
					b.y += b.vy * dt
					if (b.y > this.H + 26 || b.y < -26 || b.x < -26 || b.x > this.W + 26) g.ebullets.splice(i, 1)
				}
			},

			foeFire(f) {
				const g = this.g
				const p = g.player
				if (p.dead) return
				const dx = p.x - f.x
				const dy = p.y - f.y
				const len = Math.sqrt(dx * dx + dy * dy) || 1
				const sp = 210 * this.speedK
				// 三发扇形，中间一发瞄准
				for (let i = -1; i <= 1; i++) {
					const a = Math.atan2(dy, dx) + i * 0.22
					g.ebullets.push({
						x: f.x,
						y: f.y + f.r * 0.8,
						vx: Math.cos(a) * sp,
						vy: Math.sin(a) * sp,
						r: 4.4 * this.u
					})
				}
			},

			stepItems(dt) {
				const g = this.g
				for (let i = g.items.length - 1; i >= 0; i--) {
					const it = g.items[i]
					it.t += dt
					it.y += it.vy * dt
					it.x += Math.sin(it.t * 3.4) * 12 * dt
					if (it.y > this.H + 26) g.items.splice(i, 1)
				}
			},

			stepFx(dt) {
				const g = this.g
				for (let i = g.parts.length - 1; i >= 0; i--) {
					const p = g.parts[i]
					p.life -= dt
					if (p.life <= 0) {
						g.parts.splice(i, 1)
						continue
					}
					p.x += p.vx * dt
					p.y += p.vy * dt
					p.vx *= 0.955
					p.vy *= 0.955
				}
				for (let i = g.rings.length - 1; i >= 0; i--) {
					const r = g.rings[i]
					r.t += dt
					if (r.t >= r.life) {
						g.rings.splice(i, 1)
						continue
					}
					r.r = 2 + (r.max - 2) * (r.t / r.life)
				}
				for (let i = g.texts.length - 1; i >= 0; i--) {
					const t = g.texts[i]
					t.t += dt
					t.y -= 42 * dt
					if (t.t >= t.life) g.texts.splice(i, 1)
				}
			},

			/* ---------------- 开火 ---------------- */
			fire() {
				const g = this.g
				const p = g.player
				const u = this.u
				const sp = 720 * this.speedK
				if (p.power <= 1) {
					g.bullets.push({ x: p.x, y: p.y - 20 * u, vx: 0, vy: -sp, r: 3.4 * u, dmg: 1 })
				} else if (p.power === 2) {
					g.bullets.push({ x: p.x - 8 * u, y: p.y - 15 * u, vx: 0, vy: -sp, r: 3.2 * u, dmg: 1 })
					g.bullets.push({ x: p.x + 8 * u, y: p.y - 15 * u, vx: 0, vy: -sp, r: 3.2 * u, dmg: 1 })
				} else {
					g.bullets.push({ x: p.x, y: p.y - 22 * u, vx: 0, vy: -sp - 80, r: 3.8 * u, dmg: 2 })
					g.bullets.push({ x: p.x - 11 * u, y: p.y - 10 * u, vx: -110, vy: -sp + 70, r: 3 * u, dmg: 1 })
					g.bullets.push({ x: p.x + 11 * u, y: p.y - 10 * u, vx: 110, vy: -sp + 70, r: 3 * u, dmg: 1 })
				}
			},

			useBomb() {
				const g = this.g
				if (this.state !== 'playing' || g.bombs <= 0 || g.player.dead) return
				g.bombs -= 1
				g.flash = 1
				g.shake = 16
				for (let i = g.foes.length - 1; i >= 0; i--) {
					const f = g.foes[i]
					f.hp -= 8
					if (f.hp <= 0) {
						g.foes.splice(i, 1)
						this.killFoe(f, false)
					}
				}
				g.ebullets.length = 0
				this.boom(this.W / 2, this.H * 0.5, '#ffffff', 26, 2.2)
				if (typeof uni.vibrateShort === 'function') uni.vibrateShort({ type: 'heavy', fail: () => {} })
			},

			/* ---------------- 碰撞 ---------------- */
			collide() {
				const g = this.g
				const p = g.player
				if (p.dead) return

				for (let i = g.bullets.length - 1; i >= 0; i--) {
					const b = g.bullets[i]
					let used = false
					for (let j = g.foes.length - 1; j >= 0; j--) {
						const f = g.foes[j]
						if (!hit(b, f)) continue
						f.hp -= b.dmg
						f.hitT = 0.08
						this.boom(b.x, b.y, '#d6fff5', 3, 0.4)
						used = true
						if (f.hp <= 0) {
							g.foes.splice(j, 1)
							this.killFoe(f, true)
						}
						break
					}
					if (used) g.bullets.splice(i, 1)
				}

				for (let j = g.foes.length - 1; j >= 0; j--) {
					const f = g.foes[j]
					if (!hit(f, p)) continue
					g.foes.splice(j, 1)
					this.boom(f.x, f.y, FOE[f.type].color, 16, 1.2)
					this.damagePlayer()
					if (this.state !== 'playing' || p.dead) return
				}

				for (let i = g.ebullets.length - 1; i >= 0; i--) {
					const b = g.ebullets[i]
					if (!hit(b, p)) continue
					g.ebullets.splice(i, 1)
					this.damagePlayer()
					if (this.state !== 'playing' || p.dead) return
				}

				for (let i = g.items.length - 1; i >= 0; i--) {
					const it = g.items[i]
					if (!hit(it, p)) continue
					g.items.splice(i, 1)
					this.takeItem(it.type)
				}
			},

			takeItem(type) {
				const g = this.g
				const p = g.player
				if (type === 'power') {
					p.power = Math.min(3, p.power + 1)
					p.cool = 0
					this.addText(p.x, p.y - 34 * this.u, '火力 ' + p.power, '#5ef0c0')
				} else if (type === 'shield') {
					p.shield = 6
					this.addText(p.x, p.y - 34 * this.u, '护盾 6s', '#66c8ff')
				} else {
					g.bombs = Math.min(3, g.bombs + 1)
					this.addText(p.x, p.y - 34 * this.u, '炸弹 +1', '#ffd166')
				}
				this.ring(p.x, p.y, ITEM_COLOR[type], 44)
				if (typeof uni.vibrateShort === 'function') uni.vibrateShort({ type: 'light', fail: () => {} })
			},

			killFoe(f, drop) {
				const g = this.g
				const cfg = FOE[f.type]
				g.score += cfg.score
				g.kills += 1
				this.addText(f.x, f.y, '+' + cfg.score, '#ffe9a8')
				this.boom(f.x, f.y, cfg.color, f.type === 2 ? 28 : 12, f.type === 2 ? 1.9 : 0.95)
				if (f.type === 2) g.shake = 10
				if (typeof uni.vibrateShort === 'function') uni.vibrateShort({ type: 'light', fail: () => {} })

				if (drop && Math.random() < cfg.drop) {
					const roll = Math.random()
					const type = roll < 0.58 ? 'power' : roll < 0.85 ? 'shield' : 'bomb'
					g.items.push({ type, x: f.x, y: f.y, r: 12 * this.u, vy: 95 * this.speedK, t: 0 })
				}
			},

			damagePlayer() {
				const g = this.g
				const p = g.player
				if (p.dead || p.invuln > 0) return
				if (p.shield > 0) {
					p.shield = 0
					p.invuln = 0.8
					this.ring(p.x, p.y, '#66c8ff', 60)
					this.addText(p.x, p.y - 32 * this.u, '护盾挡下', '#66c8ff')
					if (typeof uni.vibrateShort === 'function') uni.vibrateShort({ type: 'medium', fail: () => {} })
					return
				}
				g.hp -= 1
				p.power = Math.max(1, p.power - 1)
				p.dead = true
				g.respawnT = 1.1
				g.shake = 15
				g.flash = 0.55
				this.boom(p.x, p.y, '#9de8ff', 30, 1.7)
				if (typeof uni.vibrateShort === 'function') uni.vibrateShort({ type: 'heavy', fail: () => {} })

				if (g.hp <= 0) {
					g.hp = 0
					this.gameOver()
				}
			},

			respawn() {
				const g = this.g
				if (g.hp <= 0) return
				const p = g.player
				p.dead = false
				p.x = this.W / 2
				p.y = this.H - 120 * this.u
				p.tx = p.x
				p.ty = p.y
				p.invuln = 2.4
				this.drag.on = false
				this.ring(p.x, p.y, '#8ff5dd', 70)
			},

			gameOver() {
				this.state = 'over'
				this.overT = 0
				if (this.g.score > this.best) this.best = this.g.score
				this.saveBest()
			},

			saveBest() {
				const best = Number(this.best) || 0
				if (best <= 0) return
				try {
					uni.setStorageSync(BEST_KEY, best)
				} catch (e) {
					// 存储失败不影响游戏
				}
			},

			/* ---------------- 特效 ---------------- */
			boom(x, y, color, n, scale) {
				const g = this.g
				if (!g) return
				for (let i = 0; i < n; i++) {
					if (g.parts.length >= MAX_PARTS) break
					const a = Math.random() * Math.PI * 2
					const sp = (46 + Math.random() * 200) * scale * this.speedK
					g.parts.push({
						x,
						y,
						vx: Math.cos(a) * sp,
						vy: Math.sin(a) * sp,
						life: 0.26 + Math.random() * 0.42,
						max: 0.68,
						r: (1.2 + Math.random() * 2.2) * scale * this.u,
						color
					})
				}
				this.ring(x, y, color, 28 * scale * this.u)
			},

			ring(x, y, color, max) {
				const g = this.g
				if (!g) return
				g.rings.push({ x, y, r: 2, max, t: 0, life: 0.34, color })
			},

			addText(x, y, txt, color) {
				const g = this.g
				if (!g) return
				g.texts.push({ x, y, txt, color, t: 0, life: 0.85 })
			},

			/* ---------------- 绘制 ---------------- */
			render() {
				const ctx = this.ctx
				const g = this.g
				if (!ctx || !g) return
				const W = this.W
				const H = this.H

				ctx.save()
				if (g.shake > 0.4) {
					const s = g.shake * 0.5
					ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s)
				}
				this.drawBg(ctx, W, H)
				this.drawStars(ctx, g)
				this.drawRings(ctx, g)
				this.drawItems(ctx, g)
				this.drawEBullets(ctx, g)
				this.drawBullets(ctx, g)
				this.drawFoes(ctx, g)
				if (!g.player.dead) this.drawShip(ctx, g.player)
				this.drawParts(ctx, g)
				this.drawTexts(ctx, g)
				ctx.restore()

				if (g.flash > 0) {
					ctx.fillStyle = 'rgba(255, 255, 255, ' + (g.flash * 0.6).toFixed(2) + ')'
					ctx.fillRect(0, 0, W, H)
				}

				// HUD 和各种界面不受抖动影响
				if (this.state !== 'ready') this.drawHud(ctx, g)
				if (this.state === 'ready') this.drawReady(ctx)
				else if (this.state === 'paused') this.drawPaused(ctx)
				else if (this.state === 'over') this.drawOver(ctx, g)
			},

			drawBg(ctx, W, H) {
				if (!this.bg) {
					const grad = ctx.createLinearGradient(0, 0, W * 0.4, H)
					grad.addColorStop(0, '#0b1430')
					grad.addColorStop(0.52, '#070d1f')
					grad.addColorStop(1, '#03050e')
					this.bg = grad
				}
				ctx.fillStyle = this.bg
				ctx.fillRect(0, 0, W, H)
			},

			drawStars(ctx, g) {
				ctx.fillStyle = '#d6e9ff'
				for (let i = 0; i < g.stars.length; i++) {
					const s = g.stars[i]
					ctx.globalAlpha = 0.14 + (1 - s.z) * 0.62
					ctx.fillRect(s.x, s.y, s.r, s.r * (2.6 + (1 - s.z) * 3))
				}
				ctx.globalAlpha = 1
			},

			drawRings(ctx, g) {
				for (let i = 0; i < g.rings.length; i++) {
					const r = g.rings[i]
					const k = 1 - r.t / r.life
					ctx.globalAlpha = k * 0.7
					ctx.strokeStyle = r.color
					ctx.lineWidth = 2 * k + 0.6
					ctx.beginPath()
					ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
					ctx.stroke()
				}
				ctx.globalAlpha = 1
			},

			drawBullets(ctx, g) {
				for (let i = 0; i < g.bullets.length; i++) {
					const b = g.bullets[i]
					ctx.globalAlpha = 0.22
					ctx.fillStyle = '#8affe0'
					ctx.beginPath()
					ctx.arc(b.x, b.y, b.r * 2.3, 0, Math.PI * 2)
					ctx.fill()
					ctx.globalAlpha = 1
					ctx.fillStyle = '#d8fff7'
					rr(ctx, b.x - b.r * 0.62, b.y - b.r * 2.2, b.r * 1.24, b.r * 3.6, b.r * 0.62)
					ctx.fill()
				}
				ctx.globalAlpha = 1
			},

			drawEBullets(ctx, g) {
				for (let i = 0; i < g.ebullets.length; i++) {
					const b = g.ebullets[i]
					ctx.globalAlpha = 0.24
					ctx.fillStyle = '#ff7a95'
					ctx.beginPath()
					ctx.arc(b.x, b.y, b.r * 2.5, 0, Math.PI * 2)
					ctx.fill()
					ctx.globalAlpha = 1
					ctx.beginPath()
					ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
					ctx.fill()
				}
				ctx.globalAlpha = 1
			},

			drawItems(ctx, g) {
				const u = this.u
				for (let i = 0; i < g.items.length; i++) {
					const it = g.items[i]
					const color = ITEM_COLOR[it.type] || '#ffffff'
					const pulse = 1 + Math.sin(it.t * 8) * 0.1
					const r = it.r * pulse

					ctx.globalAlpha = 0.26
					ctx.fillStyle = color
					ctx.beginPath()
					ctx.arc(it.x, it.y, r * 1.9, 0, Math.PI * 2)
					ctx.fill()
					ctx.globalAlpha = 1

					ctx.beginPath()
					ctx.arc(it.x, it.y, r, 0, Math.PI * 2)
					ctx.fillStyle = 'rgba(10, 17, 34, 0.94)'
					ctx.fill()
					ctx.strokeStyle = color
					ctx.lineWidth = 2 * u
					ctx.stroke()

					// 图标：P 火力 / S 护盾 / B 炸弹
					ctx.fillStyle = color
					ctx.textAlign = 'center'
					ctx.textBaseline = 'middle'
					ctx.font = 'bold ' + Math.round(13 * u) + 'px sans-serif'
					const label = it.type === 'power' ? 'P' : it.type === 'shield' ? 'S' : 'B'
					ctx.fillText(label, it.x, it.y + 1)
				}
			},

			drawFoes(ctx, g) {
				const u = this.u
				for (let i = 0; i < g.foes.length; i++) {
					const f = g.foes[i]
					const cfg = FOE[f.type]
					const x = f.x
					const y = f.y
					const r = f.r

					ctx.globalAlpha = 0.18
					ctx.fillStyle = cfg.color
					ctx.beginPath()
					ctx.arc(x, y, r * 1.4, 0, Math.PI * 2)
					ctx.fill()
					ctx.globalAlpha = 1

					ctx.beginPath()
					if (f.type === 0) {
						ctx.moveTo(x, y + r)
						ctx.lineTo(x + r * 0.95, y - r * 0.5)
						ctx.lineTo(x + r * 0.3, y - r * 0.26)
						ctx.lineTo(x - r * 0.3, y - r * 0.26)
						ctx.lineTo(x - r * 0.95, y - r * 0.5)
					} else if (f.type === 1) {
						ctx.moveTo(x, y + r)
						ctx.lineTo(x + r * 0.55, y + r * 0.44)
						ctx.lineTo(x + r, y - r * 0.08)
						ctx.lineTo(x + r * 0.52, y - r * 0.26)
						ctx.lineTo(x + r * 0.24, y - r * 0.52)
						ctx.lineTo(x - r * 0.24, y - r * 0.52)
						ctx.lineTo(x - r * 0.52, y - r * 0.26)
						ctx.lineTo(x - r, y - r * 0.08)
						ctx.lineTo(x - r * 0.55, y + r * 0.44)
					} else {
						ctx.moveTo(x, y + r)
						ctx.lineTo(x + r * 0.48, y + r * 0.66)
						ctx.lineTo(x + r, y + r * 0.2)
						ctx.lineTo(x + r * 0.82, y - r * 0.34)
						ctx.lineTo(x + r * 0.34, y - r * 0.52)
						ctx.lineTo(x - r * 0.34, y - r * 0.52)
						ctx.lineTo(x - r * 0.82, y - r * 0.34)
						ctx.lineTo(x - r, y + r * 0.2)
						ctx.lineTo(x - r * 0.48, y + r * 0.66)
					}
					ctx.closePath()
					ctx.fillStyle = f.hitT > 0 ? '#ffffff' : cfg.color
					ctx.fill()
					ctx.strokeStyle = cfg.edge
					ctx.lineWidth = 1.4 * u
					ctx.stroke()

					// 座舱
					ctx.beginPath()
					ctx.arc(x, y + r * 0.12, r * 0.27, 0, Math.PI * 2)
					ctx.fillStyle = 'rgba(10, 16, 32, 0.78)'
					ctx.fill()

					// 大型机血条
					if (f.maxHp > 3) {
						const w = r * 1.9
						const hh = 3 * u
						const left = x - w / 2
						const top = y - r - 11 * u
						ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
						rr(ctx, left, top, w, hh, hh / 2)
						ctx.fill()
						ctx.fillStyle = cfg.color
						rr(ctx, left, top, Math.max(0, w * (f.hp / f.maxHp)), hh, hh / 2)
						ctx.fill()
					}
				}
			},

			drawShip(ctx, p) {
				const u = this.u
				const x = p.x
				const y = p.y
				const blink = p.invuln > 0 && Math.floor(p.invuln * 14) % 2 === 0
				ctx.globalAlpha = blink ? 0.38 : 1

				// 尾焰
				const flame = (13 + Math.random() * 9) * u
				ctx.beginPath()
				ctx.moveTo(x - 5 * u, y + 11 * u)
				ctx.lineTo(x + 5 * u, y + 11 * u)
				ctx.lineTo(x, y + 11 * u + flame)
				ctx.closePath()
				ctx.fillStyle = 'rgba(96, 226, 255, 0.7)'
				ctx.fill()

				// 护盾环
				if (p.shield > 0) {
					const a = 0.35 + Math.sin(Date.now() / 160) * 0.12
					ctx.strokeStyle = 'rgba(102, 200, 255, ' + a.toFixed(2) + ')'
					ctx.lineWidth = 2.4 * u
					ctx.beginPath()
					ctx.arc(x, y, 26 * u, 0, Math.PI * 2)
					ctx.stroke()
				}

				// 机身
				ctx.beginPath()
				ctx.moveTo(x, y - 20 * u)
				ctx.lineTo(x + 7 * u, y - 4 * u)
				ctx.lineTo(x + 18 * u, y + 9 * u)
				ctx.lineTo(x + 7 * u, y + 6 * u)
				ctx.lineTo(x + 4.5 * u, y + 13 * u)
				ctx.lineTo(x - 4.5 * u, y + 13 * u)
				ctx.lineTo(x - 7 * u, y + 6 * u)
				ctx.lineTo(x - 18 * u, y + 9 * u)
				ctx.lineTo(x - 7 * u, y - 4 * u)
				ctx.closePath()
				ctx.fillStyle = '#eafffb'
				ctx.fill()
				ctx.strokeStyle = 'rgba(78, 240, 208, 0.95)'
				ctx.lineWidth = 1.4 * u
				ctx.stroke()

				// 座舱
				ctx.beginPath()
				ctx.arc(x, y - 3 * u, 3.6 * u, 0, Math.PI * 2)
				ctx.fillStyle = '#20d7ff'
				ctx.fill()

				// 火力升级后加翼炮
				if (p.power >= 2) {
					ctx.fillStyle = '#58f0c8'
					ctx.fillRect(x - 18 * u, y + 2 * u, 3.4 * u, 6 * u)
					ctx.fillRect(x + 14.6 * u, y + 2 * u, 3.4 * u, 6 * u)
				}
				ctx.globalAlpha = 1
			},

			drawParts(ctx, g) {
				for (let i = 0; i < g.parts.length; i++) {
					const p = g.parts[i]
					const k = p.life / p.max
					ctx.globalAlpha = k > 1 ? 1 : k
					ctx.fillStyle = p.color
					ctx.beginPath()
					ctx.arc(p.x, p.y, Math.max(0.6, p.r * k), 0, Math.PI * 2)
					ctx.fill()
				}
				ctx.globalAlpha = 1
			},

			drawTexts(ctx, g) {
				const u = this.u
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				for (let i = 0; i < g.texts.length; i++) {
					const t = g.texts[i]
					const k = 1 - t.t / t.life
					ctx.globalAlpha = Math.min(1, k * 1.6)
					ctx.fillStyle = t.color
					ctx.font = 'bold ' + Math.round(15 * u) + 'px sans-serif'
					ctx.fillText(t.txt, t.x, t.y)
				}
				ctx.globalAlpha = 1
			},

			/* ---------------- HUD ---------------- */
			drawHud(ctx, g) {
				const W = this.W
				const u = this.u
				const top = this.statusBar + 10
				const cx = W / 2

				// 分数
				ctx.textAlign = 'center'
				ctx.textBaseline = 'top'
				ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
				ctx.font = 'bold ' + Math.round(32 * u) + 'px sans-serif'
				ctx.fillText(String(g.score), cx, top)

				ctx.fillStyle = 'rgba(178, 202, 220, 0.62)'
				ctx.font = Math.round(12 * u) + 'px sans-serif'
				ctx.fillText('最高 ' + this.best, cx, top + 38 * u)

				// 暂停按钮：紧贴左上返回键右侧（右上被小程序胶囊占了）
				const px = 58 * u
				const py = top
				this.ui.pause = { x: px - 8 * u, y: py - 6 * u, w: 40 * u, h: 40 * u }
				ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
				if (this.state === 'paused') {
					ctx.beginPath()
					ctx.moveTo(px + 2 * u, py)
					ctx.lineTo(px + 2 * u, py + 26 * u)
					ctx.lineTo(px + 20 * u, py + 13 * u)
					ctx.closePath()
					ctx.fill()
				} else {
					rr(ctx, px, py, 6 * u, 26 * u, 3 * u)
					ctx.fill()
					rr(ctx, px + 12 * u, py, 6 * u, 26 * u, 3 * u)
					ctx.fill()
				}

				// 生命（离底部留足余量，避开 iPhone 的 home 横条）
				const lifeY = this.H - 46 * u
				for (let i = 0; i < 3; i++) {
					const lx = 24 * u + i * 22 * u
					ctx.beginPath()
					ctx.arc(lx, lifeY, 6.5 * u, 0, Math.PI * 2)
					if (i < g.hp) {
						ctx.fillStyle = '#38f5c2'
						ctx.fill()
						ctx.globalAlpha = 0.35
						ctx.beginPath()
						ctx.arc(lx, lifeY, 11 * u, 0, Math.PI * 2)
						ctx.fill()
						ctx.globalAlpha = 1
					} else {
						ctx.fillStyle = 'rgba(255, 255, 255, 0.13)'
						ctx.fill()
					}
				}

				// 炸弹按钮（右下）
				const bx = W - 44 * u
				const by = this.H - 50 * u
				this.ui.bomb = { x: bx - 26 * u, y: by - 26 * u, w: 52 * u, h: 52 * u, r: 30 * u, cx: bx, cy: by }
				ctx.beginPath()
				ctx.arc(bx, by, 22 * u, 0, Math.PI * 2)
				ctx.fillStyle = g.bombs > 0 ? 'rgba(255, 209, 102, 0.18)' : 'rgba(255, 255, 255, 0.06)'
				ctx.fill()
				ctx.strokeStyle = g.bombs > 0 ? 'rgba(255, 209, 102, 0.65)' : 'rgba(255, 255, 255, 0.14)'
				ctx.lineWidth = 1.6 * u
				ctx.stroke()

				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				ctx.fillStyle = g.bombs > 0 ? '#ffd166' : 'rgba(255, 255, 255, 0.24)'
				ctx.font = 'bold ' + Math.round(15 * u) + 'px sans-serif'
				ctx.fillText(String(g.bombs), bx, by + 1)

				// 火力等级
				ctx.textAlign = 'right'
				ctx.fillStyle = 'rgba(94, 240, 192, 0.8)'
				ctx.font = Math.round(12 * u) + 'px sans-serif'
				ctx.fillText('火力 Lv.' + g.player.power, W - 22 * u, this.H - 86 * u)
			},

			/* ---------------- 开始页 ---------------- */
			drawReady(ctx) {
				const W = this.W
				const H = this.H
				const u = this.u
				const cx = W / 2

				ctx.fillStyle = 'rgba(3, 6, 14, 0.82)'
				ctx.fillRect(0, 0, W, H)

				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'

				// 标题
				ctx.fillStyle = '#ffffff'
				ctx.font = 'bold ' + Math.round(40 * u) + 'px sans-serif'
				ctx.fillText('飞机大战', cx, H * 0.24)

				ctx.fillStyle = 'rgba(150, 240, 216, 0.85)'
				ctx.font = Math.round(13 * u) + 'px sans-serif'
				ctx.fillText('拖动屏幕操控战机 · 子弹自动连发', cx, H * 0.24 + 34 * u)

				// 玩法说明
				const rules = ['击落敌机得分，别撞上它们', '吃掉 P 升火力 / S 开护盾 / B 加炸弹', '三命，被打中掉一条，火力会降一级']
				ctx.font = Math.round(13 * u) + 'px sans-serif'
				ctx.textAlign = 'left'
				const boxW = Math.min(W - 56 * u, 320 * u)
				const boxX = cx - boxW / 2
				const boxY = H * 0.42
				const boxH = 26 * u + rules.length * 26 * u
				ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
				rr(ctx, boxX, boxY, boxW, boxH, 14 * u)
				ctx.fill()

				for (let i = 0; i < rules.length; i++) {
					const ry = boxY + 24 * u + i * 26 * u
					ctx.fillStyle = '#38f5c2'
					ctx.beginPath()
					ctx.arc(boxX + 18 * u, ry, 3 * u, 0, Math.PI * 2)
					ctx.fill()
					ctx.fillStyle = 'rgba(206, 226, 238, 0.78)'
					ctx.fillText(rules[i], boxX + 30 * u, ry)
				}

				// 开始提示（呼吸闪烁）
				const alpha = 0.55 + Math.sin(Date.now() / 420) * 0.4
				ctx.textAlign = 'center'
				ctx.globalAlpha = alpha
				ctx.fillStyle = '#ffd166'
				ctx.font = 'bold ' + Math.round(18 * u) + 'px sans-serif'
				ctx.fillText('点击任意处开始', cx, H * 0.72)
				ctx.globalAlpha = 1

				if (this.best > 0) {
					ctx.fillStyle = 'rgba(160, 186, 204, 0.5)'
					ctx.font = Math.round(12 * u) + 'px sans-serif'
					ctx.fillText('历史最高 ' + this.best + ' 分', cx, H * 0.72 + 30 * u)
				}
			},

			drawPaused(ctx) {
				const W = this.W
				const H = this.H
				const u = this.u
				ctx.fillStyle = 'rgba(3, 6, 14, 0.62)'
				ctx.fillRect(0, 0, W, H)
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				ctx.fillStyle = '#ffffff'
				ctx.font = 'bold ' + Math.round(26 * u) + 'px sans-serif'
				ctx.fillText('已暂停', W / 2, H * 0.46)
				ctx.fillStyle = 'rgba(190, 214, 228, 0.66)'
				ctx.font = Math.round(13 * u) + 'px sans-serif'
				ctx.fillText('点击继续', W / 2, H * 0.46 + 32 * u)
			},

			/* ---------------- 结算页 ---------------- */
			drawOver(ctx, g) {
				const W = this.W
				const H = this.H
				const u = this.u
				const cx = W / 2
				const newBest = g.score > 0 && g.score > (this.prevBest || 0)

				ctx.fillStyle = 'rgba(3, 6, 14, 0.86)'
				ctx.fillRect(0, 0, W, H)

				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				ctx.fillStyle = newBest ? '#ffd166' : '#ffffff'
				ctx.font = 'bold ' + Math.round(24 * u) + 'px sans-serif'
				ctx.fillText(newBest ? '新纪录' : '游戏结束', cx, H * 0.3)

				ctx.fillStyle = '#ffffff'
				ctx.font = 'bold ' + Math.round(58 * u) + 'px sans-serif'
				ctx.fillText(String(g.score), cx, H * 0.38)

				ctx.fillStyle = 'rgba(180, 204, 220, 0.6)'
				ctx.font = Math.round(12 * u) + 'px sans-serif'
				ctx.fillText('本局得分', cx, H * 0.38 + 40 * u)

				ctx.fillStyle = 'rgba(206, 226, 238, 0.8)'
				ctx.font = Math.round(13 * u) + 'px sans-serif'
				ctx.fillText('击落 ' + g.kills + ' 架 · 最高 ' + this.best + ' 分', cx, H * 0.48)

				// 冷却 0.8 秒再允许点击，避免死亡瞬间误触重开
				const ready = this.overT > 0.8
				if (ready) {
					const alpha = 0.55 + Math.sin(Date.now() / 420) * 0.4
					ctx.globalAlpha = alpha
					ctx.fillStyle = '#5ef0c0'
					ctx.font = 'bold ' + Math.round(17 * u) + 'px sans-serif'
					ctx.fillText('点击任意处再来一局', cx, H * 0.62)
					ctx.globalAlpha = 1
				}

				// 返回按钮（画在左下角，和顶部 cover-view 并存）
				const bw = 92 * u
				const bh = 34 * u
				const bx = cx - bw / 2
				const by = H * 0.66
				this.ui.back = { x: bx, y: by, w: bw, h: bh }
				ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
				rr(ctx, bx, by, bw, bh, bh / 2)
				ctx.fill()
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
				ctx.lineWidth = 1.2 * u
				ctx.stroke()
				ctx.fillStyle = 'rgba(232, 244, 250, 0.85)'
				ctx.font = Math.round(13 * u) + 'px sans-serif'
				ctx.fillText('返回题库', cx, by + bh / 2)
			},

			/* ---------------- 触摸 ---------------- */
			pickPoint(e) {
				const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || {}
				let x
				let y
				if (typeof t.x === 'number' && typeof t.y === 'number') {
					// 小程序 canvas 直接给相对画布的坐标
					x = t.x
					y = t.y
				} else {
					x = typeof t.clientX === 'number' ? t.clientX : 0
					y = typeof t.clientY === 'number' ? t.clientY : 0
					try {
						const host = document.getElementById(this.canvasId)
						const el = host && String(host.tagName).toUpperCase() === 'CANVAS' ? host : this.pickDomCanvas()
						if (el && el.getBoundingClientRect) {
							const rect = el.getBoundingClientRect()
							x -= rect.left
							y -= rect.top
						}
					} catch (err) {
						// 小程序里没有 document，坐标本来就是相对画布的
					}
				}
				return { x, y }
			},

			inRect(pt, r) {
				return r && pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h
			},

			onTouchStart(e) {
				if (!this.g || !this.ctx) return
				const pt = this.pickPoint(e)

				if (this.state === 'ready') {
					this.startGame()
					// 手指已经按在屏幕上，直接接管拖动
					this.beginDrag(pt)
					return
				}
				if (this.state === 'paused') {
					this.state = 'playing'
					this.beginDrag(pt)
					return
				}
				if (this.state === 'over') {
					if (this.overT < 0.8) return
					// 先判返回按钮，再判"任意处重开"
					const back = this.ui.back
					if (back && pt.x >= back.x && pt.x <= back.x + back.w && pt.y >= back.y && pt.y <= back.y + back.h) {
						this.goBack()
						return
					}
					this.startGame()
					this.beginDrag(pt)
					return
				}

				// 进行中：暂停键
				if (this.inRect(pt, this.ui.pause)) {
					this.state = 'paused'
					this.drag.on = false
					return
				}
				// 炸弹键
				const bomb = this.ui.bomb
				if (bomb && pt.x > bomb.x && pt.x < bomb.x + bomb.w && pt.y > bomb.y && pt.y < bomb.y + bomb.h) {
					this.useBomb()
					return
				}
				this.beginDrag(pt)
			},

			beginDrag(pt) {
				const p = this.g && this.g.player
				if (!p || p.dead) return
				this.drag.on = true
				// 记录手指与机身的偏移，拖动时飞机不会钻到手指底下
				this.drag.dx = p.x - pt.x
				this.drag.dy = p.y - pt.y
				this.applyDrag(pt)
			},

			applyDrag(pt) {
				const g = this.g
				if (!g) return
				const p = g.player
				const u = this.u
				const minX = 22 * u
				const maxX = this.W - 22 * u
				const minY = this.statusBar + 66 * u
				const maxY = this.H - 30 * u
				p.tx = clamp(pt.x + this.drag.dx, minX, maxX)
				p.ty = clamp(pt.y + this.drag.dy, minY, maxY)
			},

			onTouchMove(e) {
				if (!this.drag.on || this.state !== 'playing' || !this.g) return
				this.applyDrag(this.pickPoint(e))
			},

			onTouchEnd() {
				this.drag.on = false
			},

			/* ---------------- 流程 ---------------- */
			startGame() {
				this.prevBest = this.best
				this.overT = 0
				this.drag.on = false
				this.g = this.newWorld()
				this.state = 'playing'
				// 开局先给两架，一架直接放在视野里，免得开局空等
				this.spawnFoe(0, this.H * 0.16)
				this.spawnFoe(0)
				if (!this.running) this.startLoop()
			},

			togglePause() {
				if (this.state === 'playing') this.state = 'paused'
				else if (this.state === 'paused') this.state = 'playing'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.plane {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background-color: #03050d;
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
		z-index: 99;
	}
</style>
