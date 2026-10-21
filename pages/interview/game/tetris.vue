<template>
	<view class="tetris">
		<!-- 渐变头部 -->
		<view class="duck-head tetris-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">俄罗斯方块</text>
				<text class="nav-act" @tap="restart">重开</text>
			</view>
		</view>

		<!-- 数据卡 -->
		<view class="hud">
			<view class="hud-item">
				<text class="hud-num">{{ score }}</text>
				<text class="hud-label">得分</text>
			</view>
			<view class="hud-line"></view>
			<view class="hud-item">
				<text class="hud-num">{{ level }}</text>
				<text class="hud-label">等级</text>
			</view>
			<view class="hud-line"></view>
			<view class="hud-item">
				<text class="hud-num">{{ lines }}</text>
				<text class="hud-label">消行</text>
			</view>
		</view>

		<!-- 棋盘 + 侧栏 -->
		<view class="stage">
			<view class="board">
				<view class="bcell" v-for="(v, i) in board" :key="'c' + i">
					<view class="blk" :class="v ? 'c' + v : 'is-empty'"></view>
				</view>

				<!-- 消行闪白 -->
				<view class="flash" v-for="r in flashRows" :key="'f' + r" :style="{ top: r * step + 'rpx' }"></view>

				<!-- 幽灵落点 -->
				<view class="blk abs ghost" v-for="(b, i) in ghostBlocks" :key="'g' + i" :style="blockStyle(b)"></view>

				<!-- 当前方块 -->
				<view
					class="blk abs solid"
					v-for="(b, i) in pieceBlocks"
					:key="'p' + i"
					:class="'c' + b.t"
					:style="blockStyle(b)"
				></view>

				<!-- 暂停遮罩 -->
				<view class="pause-mask" v-if="status === 'paused'" @tap="togglePause">
					<text class="pause-txt">已暂停</text>
					<text class="pause-sub">点击继续</text>
				</view>
			</view>

			<view class="side">
				<view class="side-card">
					<text class="side-label">下一个</text>
					<view class="preview">
						<view class="pcell" v-for="(v, i) in previewCells" :key="'v' + i">
							<view class="mini" :class="v ? 'c' + (nextType + 1) : ''"></view>
						</view>
					</view>
				</view>

				<view class="side-card">
					<text class="side-label">最高分</text>
					<text class="side-best">{{ best }}</text>
				</view>

				<view class="side-card is-tip">
					<text class="side-tip">每消 10 行升一级，下落会越来越快</text>
				</view>
			</view>
		</view>

		<!-- 操作 -->
		<view class="pad">
			<view class="pad-row">
				<view class="key" hover-class="key-hover" @tap="move(-1)">
					<text class="key-txt">←</text>
				</view>
				<view class="key" hover-class="key-hover" @tap="rotate">
					<text class="key-txt">↻</text>
				</view>
				<view class="key" hover-class="key-hover" @tap="move(1)">
					<text class="key-txt">→</text>
				</view>
			</view>
			<view class="pad-row">
				<view class="key wide" hover-class="key-hover" @tap="softDrop">
					<text class="key-txt sm">↓ 软降</text>
				</view>
				<view class="key wide" hover-class="key-hover" @tap="hardDrop">
					<text class="key-txt sm">⇩ 硬降</text>
				</view>
				<view class="key" hover-class="key-hover" @tap="togglePause">
					<text class="key-txt sm">{{ status === 'paused' ? '▶' : '❚❚' }}</text>
				</view>
			</view>
		</view>

		<text class="tip">左右移动、旋转调整姿态，填满一整行即可消除 · 堆到顶部就结束</text>

		<!-- 结算弹窗 -->
		<view class="result-mask" v-if="showResult" @tap="hideResult">
			<view class="result-card" @tap.stop>
				<view class="result-badge" :class="'lv' + starLevel">
					<text class="result-badge-txt">★</text>
				</view>
				<text class="result-title">游戏结束</text>
				<text class="result-sub">{{ resultSub }}</text>
				<view class="score-row">
					<view class="score-item">
						<text class="score-num">{{ score }}</text>
						<text class="score-label">总得分</text>
					</view>
					<view class="score-line"></view>
					<view class="score-item">
						<text class="score-num">{{ lines }}</text>
						<text class="score-label">消除行数</text>
					</view>
				</view>
				<view class="result-btns">
					<view class="rbtn ghost" hover-class="act-hover" @tap="goBack">返回</view>
					<view class="rbtn primary" hover-class="act-hover" @tap="playAgain">再来一局</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { menuSafeRight, navBack } from '@/common/nav.js'
	import {
		createBoard,
		newBag,
		makePiece,
		cellsOf,
		sizeOf,
		collides,
		tryMove,
		tryRotate,
		ghostOf,
		lock,
		clearLines,
		scoreOf,
		speedOf
	} from '@/common/tetris.js'

	const STEP = 50 // 一格 50rpx
	const BLOCK = 44 // 方块 44rpx，四周各留 3rpx 缝
	const PAD = 3
	const BEST_KEY = 'tetris_best'

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				step: STEP,
				board: createBoard(),
				piece: null,
				nextType: 0,
				bag: [],
				bagIdx: 0,
				score: 0,
				level: 1,
				lines: 0,
				best: 0,
				status: 'playing', // playing / paused / over
				flashRows: [],
				timer: null,
				gen: 0,
				showResult: false
			}
		},
		computed: {
			pieceBlocks() {
				if (!this.piece) return []
				const cells = cellsOf(this.piece.type, this.piece.rot)
				const t = this.piece.type + 1
				const out = []
				for (let i = 0; i < cells.length; i++) {
					out.push({
						r: this.piece.y + cells[i][0],
						c: this.piece.x + cells[i][1],
						t
					})
				}
				return out
			},
			ghostBlocks() {
				if (!this.piece || this.status === 'over') return []
				const g = ghostOf(this.board, this.piece)
				if (g.y === this.piece.y) return []
				const cells = cellsOf(g.type, g.rot)
				const out = []
				for (let i = 0; i < cells.length; i++) {
					out.push({
						r: g.y + cells[i][0],
						c: g.x + cells[i][1]
					})
				}
				return out
			},
			previewCells() {
				const size = sizeOf(this.nextType, 0)
				const cells = cellsOf(this.nextType, 0)
				const pad = Math.floor((4 - size) / 2)
				const grid = new Array(16).fill(0)
				for (let i = 0; i < cells.length; i++) {
					const r = cells[i][0] + pad
					const c = cells[i][1] + pad
					if (r >= 0 && r < 4 && c >= 0 && c < 4) grid[r * 4 + c] = 1
				}
				return grid
			},
			starLevel() {
				if (this.score >= 4000) return 3
				if (this.score >= 1500) return 2
				return 1
			},
			resultSub() {
				if (this.score >= 4000) return '这局撑得很久，堆叠控制不错'
				if (this.score >= 1500) return '节奏还可以，试试一次消四行'
				return '先把底部铺平，别留太深的洞'
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.menuRight = menuSafeRight()
			const saved = uni.getStorageSync(BEST_KEY)
			this.best = Number(saved) || 0
			this.reset()
		},
		onHide() {
			if (this.status === 'playing') this.status = 'paused'
		},
		onUnload() {
			this.gen += 1
			this.clearTimer()
		},
		methods: {
			goBack() {
				navBack('/pages/interview/mine/mine')
			},
			blockStyle(b) {
				return 'left:' + (b.c * STEP + PAD) + 'rpx;top:' + (b.r * STEP + PAD) + 'rpx;'
			},

			/* ---------- 计时器 ---------- */
			clearTimer() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
			},
			startTimer() {
				this.clearTimer()
				const ms = speedOf(this.level)
				this.timer = setInterval(() => {
					this.tick()
				}, ms)
			},
			tick() {
				if (this.status !== 'playing' || !this.piece) return
				const next = tryMove(this.board, this.piece, 0, 1)
				if (next) {
					this.piece = next
					return
				}
				this.lockNow()
			},

			/* ---------- 操作 ---------- */
			move(dir) {
				if (this.status !== 'playing' || !this.piece) return
				const next = tryMove(this.board, this.piece, dir, 0)
				if (next) this.piece = next
			},
			rotate() {
				if (this.status !== 'playing' || !this.piece) return
				const next = tryRotate(this.board, this.piece, 1)
				if (next) this.piece = next
			},
			softDrop() {
				if (this.status !== 'playing' || !this.piece) return
				const next = tryMove(this.board, this.piece, 0, 1)
				if (next) {
					this.piece = next
					this.score += 1
					this.refreshBest()
				} else {
					this.lockNow()
				}
			},
			hardDrop() {
				if (this.status !== 'playing' || !this.piece) return
				const g = ghostOf(this.board, this.piece)
				this.score += (g.y - this.piece.y) * 2
				this.piece = g
				this.lockNow()
			},
			togglePause() {
				if (this.status === 'playing') this.status = 'paused'
				else if (this.status === 'paused') this.status = 'playing'
			},

			/* ---------- 核心流程 ---------- */
			lockNow() {
				if (!this.piece) return
				const res = clearLines(lock(this.board, this.piece))
				this.board = res.board
				this.piece = null

				if (res.count) {
					this.lines += res.count
					this.score += scoreOf(res.count, this.level)
					// 闪白提示消掉的是哪几行
					const gen = this.gen
					this.flashRows = res.rows
					setTimeout(() => {
						if (gen === this.gen) this.flashRows = []
					}, 230)

					const lv = 1 + Math.floor(this.lines / 10)
					if (lv > this.level) {
						this.level = lv
						this.startTimer()
					}
				}

				this.refreshBest()
				this.spawn()
			},
			drawType() {
				if (this.bagIdx >= this.bag.length) {
					this.bag = newBag()
					this.bagIdx = 0
				}
				const t = this.bag[this.bagIdx]
				this.bagIdx += 1
				return t
			},
			spawn() {
				const type = this.nextType
				this.nextType = this.drawType()
				const p = makePiece(type)
				if (collides(this.board, p)) {
					this.piece = p
					this.gameOver()
					return
				}
				this.piece = p
			},
			refreshBest() {
				if (this.score > this.best) this.best = this.score
			},
			gameOver() {
				this.status = 'over'
				this.clearTimer()
				this.refreshBest()
				uni.setStorageSync(BEST_KEY, this.best)
				this.popResult()
			},
			popResult() {
				const gen = this.gen
				if (typeof uni.vibrateShort === 'function') {
					uni.vibrateShort({ type: 'medium', fail: () => {} })
				}
				setTimeout(() => {
					if (gen !== this.gen) return
					if (this.status !== 'over') return
					this.showResult = true
				}, 380)
			},
			hideResult() {
				this.showResult = false
			},
			reset() {
				this.gen += 1
				this.clearTimer()
				this.board = createBoard()
				this.piece = null
				this.bag = newBag()
				this.bagIdx = 0
				this.nextType = this.drawType()
				this.score = 0
				this.level = 1
				this.lines = 0
				this.status = 'playing'
				this.flashRows = []
				this.showResult = false
				this.spawn()
				this.startTimer()
			},
			restart() {
				this.reset()
			},
			playAgain() {
				this.showResult = false
				this.reset()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tetris {
		min-height: 100vh;
		background-color: $duck-bg;
		padding-bottom: 40rpx;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.tetris-head {
		padding-bottom: 80rpx;
	}

	.nav-row {
		height: 88rpx;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
	}

	.nav-back {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-back-hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 34rpx;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 1rpx;
	}

	.nav-act {
		width: 60rpx;
		text-align: right;
		font-size: 27rpx;
		color: rgba(255, 255, 255, 0.92);
	}

	/* ---------- 数据卡 ---------- */
	.hud {
		display: flex;
		align-items: center;
		margin: -56rpx 24rpx 0;
		padding: 22rpx 0;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
		position: relative;
		z-index: 2;
	}

	.hud-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hud-num {
		font-size: 40rpx;
		font-weight: 700;
		color: $duck-text;
		line-height: 1.1;
	}

	.hud-label {
		margin-top: 6rpx;
		font-size: 20rpx;
		color: $duck-text-muted;
	}

	.hud-line {
		width: 2rpx;
		height: 48rpx;
		background-color: #eef1ef;
	}

	/* ---------- 棋盘 ---------- */
	.stage {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		margin: 22rpx 24rpx 0;
	}

	.board {
		position: relative;
		width: 500rpx;
		height: 1000rpx;
		border-radius: 20rpx;
		background: linear-gradient(180deg, #1a2233 0%, #11192a 100%);
		padding: 0;
		overflow: hidden;
		flex-wrap: wrap;
		display: flex;
		box-shadow: 0 8rpx 24rpx rgba(17, 25, 42, 0.35), inset 0 0 0 2rpx rgba(255, 255, 255, 0.06);
	}

	.bcell {
		width: 50rpx;
		height: 50rpx;
		padding: 3rpx;
		box-sizing: border-box;
	}

	.blk {
		width: 100%;
		height: 100%;
		border-radius: 8rpx;
		box-sizing: border-box;
	}

	.blk.abs {
		position: absolute;
		width: 44rpx;
		height: 44rpx;
	}

	.blk.is-empty {
		background-color: rgba(255, 255, 255, 0.045);
		border-radius: 10rpx;
	}

	.blk.ghost {
		background-color: transparent;
		border: 3rpx dashed rgba(255, 255, 255, 0.24);
	}

	.blk.solid {
		box-shadow: inset 0 -5rpx 0 rgba(0, 0, 0, 0.22), inset 0 3rpx 0 rgba(255, 255, 255, 0.35);
	}

	.c1 {
		background: linear-gradient(160deg, #7ce9f7, #17a9d4);
	}

	.c2 {
		background: linear-gradient(160deg, #ffe08a, #f0a020);
	}

	.c3 {
		background: linear-gradient(160deg, #d8b4fe, #8b3fd9);
	}

	.c4 {
		background: linear-gradient(160deg, #9bf0b8, #14a05a);
	}

	.c5 {
		background: linear-gradient(160deg, #ffb0a8, #d93a2b);
	}

	.c6 {
		background: linear-gradient(160deg, #a6cbff, #2a63d4);
	}

	.c7 {
		background: linear-gradient(160deg, #ffc98a, #e2650d);
	}

	.flash {
		position: absolute;
		left: 0;
		right: 0;
		height: 50rpx;
		background-color: rgba(255, 255, 255, 0.86);
		box-shadow: 0 0 26rpx rgba(255, 255, 255, 0.9);
		animation: flash-out 0.23s ease forwards;
		pointer-events: none;
	}

	.pause-mask {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(9, 15, 26, 0.66);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.pause-txt {
		font-size: 36rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 4rpx;
	}

	.pause-sub {
		margin-top: 12rpx;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.6);
	}

	/* ---------- 侧栏 ---------- */
	.side {
		width: 132rpx;
		margin-left: 18rpx;
		display: flex;
		flex-direction: column;
	}

	.side-card {
		background-color: #ffffff;
		border-radius: 18rpx;
		padding: 16rpx 8rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4rpx 14rpx rgba(20, 32, 26, 0.06);
	}

	.side-card + .side-card {
		margin-top: 14rpx;
	}

	.side-label {
		font-size: 19rpx;
		color: $duck-text-muted;
	}

	.preview {
		width: 96rpx;
		height: 96rpx;
		margin-top: 10rpx;
		display: flex;
		flex-wrap: wrap;
		background-color: #f6f8f7;
		border-radius: 12rpx;
		padding: 0;
	}

	.pcell {
		width: 24rpx;
		height: 24rpx;
		padding: 2rpx;
		box-sizing: border-box;
	}

	.mini {
		width: 100%;
		height: 100%;
		border-radius: 4rpx;
	}

	.side-best {
		margin-top: 8rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.side-card.is-tip {
		padding: 16rpx 12rpx;
		background-color: #f2f6f4;
		box-shadow: none;
	}

	.side-tip {
		font-size: 18rpx;
		line-height: 1.6;
		color: #9aa8a2;
		text-align: center;
	}

	/* ---------- 操作 ---------- */
	.pad {
		margin: 24rpx 24rpx 0;
	}

	.pad-row {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pad-row + .pad-row {
		margin-top: 14rpx;
	}

	.key {
		width: 116rpx;
		height: 92rpx;
		margin: 0 8rpx;
		border-radius: 24rpx;
		background-color: #ffffff;
		border: 2rpx solid $duck-border;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.key.wide {
		flex: 1;
		width: auto;
	}

	.key-hover {
		background-color: #eef4f1;
		transform: scale(0.96);
	}

	.key-txt {
		font-size: 36rpx;
		font-weight: 600;
		color: $duck-text-sub;
		line-height: 1;
	}

	.key-txt.sm {
		font-size: 25rpx;
	}

	.tip {
		display: block;
		margin-top: 22rpx;
		text-align: center;
		font-size: 21rpx;
		color: #b3beb8;
		padding: 0 40rpx;
		line-height: 1.6;
	}

	/* ---------- 结算弹窗 ---------- */
	.result-mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(12, 26, 20, 0.46);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99;
		animation: mask-in 0.2s ease both;
	}

	.result-card {
		width: 580rpx;
		padding: 46rpx 36rpx 34rpx;
		background-color: #ffffff;
		border-radius: 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		animation: card-pop 0.42s cubic-bezier(0.18, 1.5, 0.42, 1) both;
	}

	.result-badge {
		width: 116rpx;
		height: 116rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 26rpx;
		animation: badge-pop 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) 0.1s both;
	}

	.result-badge.lv3 {
		background: linear-gradient(135deg, #56cf9b, #00b578);
		box-shadow: 0 10rpx 26rpx rgba(0, 181, 120, 0.32);
	}

	.result-badge.lv2 {
		background: linear-gradient(135deg, #ffd166, #f0a020);
		box-shadow: 0 10rpx 26rpx rgba(240, 160, 32, 0.3);
	}

	.result-badge.lv1 {
		background: linear-gradient(135deg, #cfd8d3, #9aa8a3);
	}

	.result-badge-txt {
		font-size: 56rpx;
		font-weight: 700;
		color: #ffffff;
		line-height: 1;
	}

	.result-title {
		font-size: 42rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.result-sub {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: $duck-text-muted;
		text-align: center;
	}

	.score-row {
		display: flex;
		align-items: center;
		width: 100%;
		margin-top: 26rpx;
		padding: 20rpx 0;
		background-color: #f7f9f8;
		border-radius: 20rpx;
	}

	.score-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.score-num {
		font-size: 36rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.score-label {
		margin-top: 4rpx;
		font-size: 19rpx;
		color: $duck-text-muted;
	}

	.score-line {
		width: 2rpx;
		height: 44rpx;
		background-color: #e8ecea;
	}

	.result-btns {
		display: flex;
		width: 100%;
		margin-top: 30rpx;
	}

	.rbtn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 999rpx;
		font-size: 27rpx;
		font-weight: 600;
	}

	.rbtn + .rbtn {
		margin-left: 18rpx;
	}

	.rbtn.ghost {
		background-color: #f4f6f5;
		color: $duck-text-sub;
	}

	.rbtn.primary {
		background: $duck-grad-btn;
		color: #ffffff;
		box-shadow: 0 8rpx 18rpx rgba(0, 181, 120, 0.22);
	}

	.act-hover {
		opacity: 0.86;
	}

	@keyframes flash-out {
		0% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}

	@keyframes mask-in {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes card-pop {
		0% {
			transform: scale(0.68);
			opacity: 0;
		}

		55% {
			transform: scale(1.06);
			opacity: 1;
		}

		78% {
			transform: scale(0.98);
		}

		100% {
			transform: scale(1);
		}
	}

	@keyframes badge-pop {
		0% {
			transform: scale(0.4);
			opacity: 0;
		}

		70% {
			transform: scale(1.12);
			opacity: 1;
		}

		100% {
			transform: scale(1);
		}
	}
</style>
