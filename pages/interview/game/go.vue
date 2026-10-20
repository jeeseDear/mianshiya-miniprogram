<template>
	<view class="go">
		<!-- 渐变头部 -->
		<view class="duck-head go-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">围棋</text>
				<text class="nav-act" @tap="restart">重开</text>
			</view>
		</view>

		<!-- 状态卡 -->
		<view class="status-card">
			<view class="side">
				<view class="side-dot is-black"></view>
				<view class="side-meta">
					<text class="side-label">我方</text>
					<text class="side-cap">提 {{ capBlack }}</text>
				</view>
			</view>
			<view class="status-main">
				<text class="status-txt" :class="statusClass">{{ statusText }}</text>
				<text class="status-sub">{{ subText }}</text>
			</view>
			<view class="side is-right">
				<view class="side-meta is-right">
					<text class="side-label">电脑</text>
					<text class="side-cap">提 {{ capWhite }}</text>
				</view>
				<view class="side-dot is-white"></view>
			</view>
		</view>

		<!-- 棋盘 -->
		<view class="board-wrap">
			<view class="board">
				<view class="gl" v-for="n in 9" :key="'h' + n" :style="{ top: 36 + (n - 1) * 66 + 'rpx' }"></view>
				<view class="gv" v-for="n in 9" :key="'v' + n" :style="{ left: 36 + (n - 1) * 66 + 'rpx' }"></view>

				<view class="star" v-for="(s, i) in stars" :key="'s' + i" :style="s"></view>

				<view class="board-edge"></view>

				<view class="stone" v-for="p in stones" :key="p.idx" :class="p.color === 1 ? 'is-black' : 'is-white'" :style="stoneStyle(p)">
					<view class="stone-dot" v-if="lastIndex === p.idx" :class="p.color === 1 ? 'dot-light' : 'dot-dark'"></view>
				</view>

				<!-- 点击层 -->
				<view class="cells">
					<view class="cell" v-for="n in 81" :key="'c' + n" @tap="handleTap(n - 1)"></view>
				</view>
			</view>
		</view>

		<!-- 操作 -->
		<view class="actions">
			<view class="act ghost" :class="{ 'is-off': !canUndo }" hover-class="act-hover" @tap="undo">悔棋</view>
			<view class="act ghost" hover-class="act-hover" @tap="passTurn">停一手</view>
		</view>

		<text class="tip">9 路小棋盘 · 你执黑先行 · 双方连续停一手即终局数子（白贴 {{ komi }} 子）</text>

		<!-- 结算弹窗 -->
		<view class="result-mask" v-if="showResult" @tap="hideResult">
			<view class="result-card" @tap.stop>
				<view class="result-badge" :class="statusClass">
					<text class="result-badge-txt">{{ resultBadge }}</text>
				</view>
				<text class="result-title" :class="statusClass">{{ statusText }}</text>
				<text class="result-sub">{{ resultSub }}</text>
				<view class="score-row" v-if="resultInfo">
					<view class="score-item">
						<text class="score-num">{{ resultInfo.black }}</text>
						<text class="score-label">黑子</text>
					</view>
					<view class="score-line"></view>
					<view class="score-item">
						<text class="score-num">{{ resultInfo.whiteTotal }}</text>
						<text class="score-label">白子（含贴 {{ komi }}）</text>
					</view>
				</view>
				<view class="result-btns">
					<view class="rbtn ghost" hover-class="act-hover" @tap="hideResult">看看棋盘</view>
					<view class="rbtn primary" hover-class="act-hover" @tap="playAgain">再来一局</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { SIZE, BLACK, WHITE, KOMI, initBoard, tryMove, pickMove, score } from '@/common/go.js'

	export default {
		data() {
			return {
				statusBar: 0,
				komi: KOMI,
				board: initBoard(SIZE),
				turn: BLACK,
				ko: -1,
				lastIndex: -1,
				capBlack: 0,
				capWhite: 0,
				passes: 0,
				status: 'playing', // playing / win / lose / draw
				thinking: false,
				gen: 0,
				history: [],
				showResult: false,
				resultInfo: null,
				stars: [
					'left:164rpx;top:164rpx',
					'left:428rpx;top:164rpx',
					'left:296rpx;top:296rpx',
					'left:164rpx;top:428rpx',
					'left:428rpx;top:428rpx'
				]
			}
		},
		computed: {
			stones() {
				const out = []
				for (let i = 0; i < this.board.length; i++) {
					const v = this.board[i]
					if (!v) continue
					out.push({ idx: i, color: v, r: (i / SIZE) | 0, c: i % SIZE })
				}
				return out
			},
			canUndo() {
				if (this.thinking) return false
				for (let i = 0; i < this.history.length; i++) {
					if (this.history[i].turn === BLACK) return true
				}
				return false
			},
			statusText() {
				if (this.status === 'win') return '你赢了'
				if (this.status === 'lose') return '电脑赢了'
				if (this.status === 'draw') return '和棋'
				if (this.thinking) return '电脑思考中'
				return '轮到你落子'
			},
			subText() {
				if (this.status !== 'playing') return this.scoreLine
				if (this.thinking) return '稍等一下'
				if (this.lastIndex < 0) return '点交叉点落子，气尽被提'
				return this.passes > 0 ? '你刚停了一手' : '继续落子，围空多者胜'
			},
			statusClass() {
				return 'is-' + this.status
			},
			scoreLine() {
				if (!this.resultInfo) return ''
				return '黑 ' + this.resultInfo.black + ' 子 · 白 ' + this.resultInfo.whiteTotal + ' 子'
			},
			resultBadge() {
				if (this.status === 'win') return '胜'
				if (this.status === 'lose') return '负'
				return '和'
			},
			resultSub() {
				if (this.status === 'win') return '数子领先 ' + this.resultInfo.diff + ' 子'
				if (this.status === 'lose') return '差 ' + this.resultInfo.diff + ' 子，再来一局'
				return '双方持平'
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.reset()
		},
		methods: {
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({ url: '/pages/interview/mine/mine' })
					}
				})
			},
			stoneStyle(p) {
				return {
					left: 36 + p.c * 66 - 30 + 'rpx',
					top: 36 + p.r * 66 - 30 + 'rpx'
				}
			},
			reset() {
				this.gen += 1
				this.board = initBoard(SIZE)
				this.turn = BLACK
				this.ko = -1
				this.lastIndex = -1
				this.capBlack = 0
				this.capWhite = 0
				this.passes = 0
				this.status = 'playing'
				this.thinking = false
				this.history = []
				this.showResult = false
				this.resultInfo = null
			},
			restart() {
				this.reset()
			},
			hideResult() {
				this.showResult = false
			},
			playAgain() {
				this.showResult = false
				this.reset()
			},
			snapshot() {
				this.history.push({
					board: this.board.slice(),
					turn: this.turn,
					ko: this.ko,
					last: this.lastIndex,
					cb: this.capBlack,
					cw: this.capWhite,
					passes: this.passes
				})
			},
			place(mv, color, idx) {
				this.snapshot()
				this.board = mv.board
				this.ko = mv.ko
				this.lastIndex = idx
				if (color === BLACK) this.capBlack += mv.captured.length
				else this.capWhite += mv.captured.length
			},
			handleTap(idx) {
				if (this.status !== 'playing' || this.thinking || this.turn !== BLACK) return
				const mv = tryMove(this.board, SIZE, idx, BLACK, this.ko)
				if (!mv) {
					uni.showToast({ title: '这里不能落子', icon: 'none' })
					return
				}
				this.place(mv, BLACK, idx)
				this.passes = 0
				this.turn = WHITE
				this.aiTurn()
			},
			passTurn() {
				if (this.status !== 'playing' || this.thinking || this.turn !== BLACK) return
				this.snapshot()
				this.passes += 1
				this.ko = -1
				if (this.passes >= 2) {
					this.finish(score(this.board, SIZE, KOMI))
					return
				}
				this.turn = WHITE
				this.aiTurn()
			},
			aiTurn() {
				this.thinking = true
				const gen = this.gen
				setTimeout(() => {
					if (gen !== this.gen) return
					this.aiMove()
				}, 300)
			},
			aiMove() {
				if (this.status !== 'playing') {
					this.thinking = false
					return
				}
				// 人类刚停一手，电脑若已领先就跟着停，直接终局数子
				if (this.passes >= 1) {
					const sc = score(this.board, SIZE, KOMI)
					if (sc.whiteTotal >= sc.black) {
						this.thinking = false
						this.passes += 1
						this.finish(sc)
						return
					}
				}
				const idx = pickMove(this.board, SIZE, WHITE, this.ko)
				const mv = idx < 0 ? null : tryMove(this.board, SIZE, idx, WHITE, this.ko)
				if (!mv) {
					// 无棋可下 → 停一手
					this.thinking = false
					this.passes += 1
					this.turn = BLACK
					if (this.passes >= 2) this.finish(score(this.board, SIZE, KOMI))
					return
				}
				this.place(mv, WHITE, idx)
				this.thinking = false
				this.passes = 0
				this.turn = BLACK
			},
			finish(sc) {
				this.resultInfo = sc
				this.status = sc.result
				this.popResult()
			},
			popResult() {
				const gen = this.gen
				if (typeof uni.vibrateShort === 'function') {
					uni.vibrateShort({ type: 'medium', fail: () => {} })
				}
				setTimeout(() => {
					if (gen !== this.gen) return
					if (this.status === 'playing') return
					this.showResult = true
				}, 320)
			},
			undo() {
				if (!this.canUndo) return
				let snap = null
				while (this.history.length) {
					snap = this.history.pop()
					if (snap.turn === BLACK) break
				}
				if (!snap) return
				this.board = snap.board
				this.turn = snap.turn
				this.ko = snap.ko
				this.lastIndex = snap.last
				this.capBlack = snap.cb
				this.capWhite = snap.cw
				this.passes = snap.passes
				this.status = 'playing'
				this.thinking = false
				this.showResult = false
				this.resultInfo = null
			}
		}
	}
</script>

<style lang="scss" scoped>
	.go {
		min-height: 100vh;
		background-color: $duck-bg;
		padding-bottom: 60rpx;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.go-head {
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

	/* ---------- 状态卡 ---------- */
	.status-card {
		display: flex;
		align-items: center;
		margin: -56rpx 24rpx 0;
		padding: 24rpx 22rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
		position: relative;
		z-index: 2;
	}

	.side {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.side-dot {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.side-dot.is-black {
		background: radial-gradient(circle at 34% 28%, #5c6266, #1c1f21 80%);
		border: 2rpx solid #101314;
	}

	.side-dot.is-white {
		background: radial-gradient(circle at 34% 28%, #ffffff, #e3ddd0 80%);
		border: 2rpx solid #cfc6b6;
	}

	.side-meta {
		display: flex;
		flex-direction: column;
		margin-left: 10rpx;
	}

	.side-meta.is-right {
		margin-left: 0;
		margin-right: 10rpx;
		align-items: flex-end;
	}

	.side-label {
		font-size: 23rpx;
		color: $duck-text-sub;
	}

	.side-cap {
		margin-top: 2rpx;
		font-size: 20rpx;
		color: $duck-text-muted;
	}

	.status-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	.status-txt {
		font-size: 30rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.status-txt.is-win {
		color: $duck-primary;
	}

	.status-txt.is-lose {
		color: $duck-danger;
	}

	.status-sub {
		margin-top: 6rpx;
		font-size: 20rpx;
		color: $duck-text-muted;
		text-align: center;
	}

	/* ---------- 棋盘 ---------- */
	.board-wrap {
		margin: 22rpx 24rpx 0;
		padding: 18rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 18rpx rgba(20, 32, 26, 0.06);
		display: flex;
		justify-content: center;
	}

	.board {
		position: relative;
		width: 600rpx;
		height: 600rpx;
		background: linear-gradient(160deg, #f2d7ad 0%, #e9c99c 100%);
		border-radius: 12rpx;
		overflow: hidden;
	}

	.gl {
		position: absolute;
		left: 36rpx;
		width: 530rpx;
		height: 2rpx;
		background-color: #b78e62;
	}

	.gv {
		position: absolute;
		top: 36rpx;
		width: 2rpx;
		height: 530rpx;
		background-color: #b78e62;
	}

	.star {
		position: absolute;
		width: 8rpx;
		height: 8rpx;
		border-radius: 50%;
		background-color: #8a6642;
		z-index: 2;
	}

	.board-edge {
		position: absolute;
		left: 33rpx;
		top: 33rpx;
		width: 536rpx;
		height: 536rpx;
		border: 2rpx solid #9a7550;
		border-radius: 6rpx;
		box-sizing: border-box;
	}

	.stone {
		position: absolute;
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
	}

	.stone.is-black {
		background: radial-gradient(circle at 34% 28%, #6a7175, #1c1f21 78%);
		box-shadow: 0 3rpx 7rpx rgba(30, 20, 10, 0.34);
	}

	.stone.is-white {
		background: radial-gradient(circle at 34% 28%, #ffffff, #e6e0d3 80%);
		border: 2rpx solid #d8d0bf;
		box-shadow: 0 3rpx 7rpx rgba(30, 20, 10, 0.22);
	}

	.stone-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
	}

	.stone-dot.dot-light {
		background-color: #ff6b6b;
	}

	.stone-dot.dot-dark {
		background-color: #c62828;
	}

	.cells {
		position: absolute;
		left: 3rpx;
		top: 3rpx;
		width: 594rpx;
		height: 594rpx;
		display: flex;
		flex-wrap: wrap;
		z-index: 5;
	}

	.cell {
		width: 11.1111%;
		height: 11.1111%;
	}

	/* ---------- 操作 ---------- */
	.actions {
		display: flex;
		margin: 26rpx 24rpx 0;
	}

	.act {
		flex: 1;
		height: 84rpx;
		line-height: 84rpx;
		text-align: center;
		border-radius: 999rpx;
		font-size: 28rpx;
		font-weight: 600;
	}

	.act + .act {
		margin-left: 20rpx;
	}

	.act.ghost {
		background-color: #ffffff;
		color: $duck-text-sub;
		border: 2rpx solid $duck-border;
		height: 80rpx;
		line-height: 76rpx;
	}

	.act-hover {
		opacity: 0.86;
	}

	.act.is-off {
		opacity: 0.45;
	}

	.tip {
		display: block;
		margin-top: 24rpx;
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

	.result-badge.is-win {
		background: linear-gradient(135deg, #56cf9b, #00b578);
		box-shadow: 0 10rpx 26rpx rgba(0, 181, 120, 0.32);
	}

	.result-badge.is-lose {
		background: linear-gradient(135deg, #ff9f9f, #ff4d4f);
		box-shadow: 0 10rpx 26rpx rgba(255, 77, 79, 0.28);
	}

	.result-badge.is-draw {
		background: linear-gradient(135deg, #c7d2cd, #9aa8a3);
	}

	.result-badge-txt {
		font-size: 56rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 2rpx;
	}

	.result-title {
		font-size: 42rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.result-title.is-win {
		color: $duck-primary-dark;
	}

	.result-title.is-lose {
		color: $duck-danger;
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
