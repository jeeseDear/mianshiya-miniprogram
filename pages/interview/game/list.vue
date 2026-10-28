<template>
	<view class="games">
		<!-- 渐变头部 -->
		<view class="duck-head games-head">
			<view :style="{ height: statusBar + 'px' }"></view>
			<view class="nav-row" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">小游戏</text>
			</view>

			<text class="head-sub-white">刷题累了来一局，成绩只存在本机</text>
		</view>

		<scroll-view class="content" scroll-y :show-scrollbar="false">
			<view class="duck-sec-head">
				<text class="duck-sec-title">休闲</text>
				<text class="sec-count">{{ casual.length }} 款</text>
			</view>

			<view class="duck-panel panel">
				<view
					class="duck-row menu-row"
					v-for="g in casual"
					:key="g.id"
					hover-class="duck-row-hover"
					@tap="open(g)"
				>
					<view class="menu-tile" :class="g.tile">
						<block v-if="g.id === 'tetris'">
							<view class="tt-b t1"></view>
							<view class="tt-b t2"></view>
							<view class="tt-b t3"></view>
							<view class="tt-b t4"></view>
						</block>
						<block v-else-if="g.id === 'plane'">
							<view class="pt-wing"></view>
							<view class="pt-tail"></view>
							<view class="pt-body"></view>
						</block>
						<block v-else-if="g.id === 'bubble'">
							<view class="bb-dot b1"></view>
							<view class="bb-dot b2"></view>
							<view class="bb-dot b3"></view>
							<view class="bb-dot b4"></view>
						</block>
						<block v-else-if="g.id === 'adventure'">
							<view class="av-sun"></view>
							<view class="av-island"></view>
							<view class="av-hero"></view>
							<view class="av-cap"></view>
						</block>
						<block v-else-if="g.id === 'kart'">
							<view class="kt-flame"></view>
							<view class="kt-wheel w1"></view>
							<view class="kt-wheel w2"></view>
							<view class="kt-wheel w3"></view>
							<view class="kt-wheel w4"></view>
							<view class="kt-body"></view>
							<view class="kt-helm"></view>
						</block>
						<block v-else>
							<view class="mt-dot d1"></view>
							<view class="mt-dot d2"></view>
							<view class="mt-dot d3"></view>
							<view class="mt-dot d4"></view>
						</block>
					</view>
					<view class="menu-main">
						<text class="menu-title">{{ g.name }}</text>
						<text class="menu-desc">{{ g.desc }}</text>
					</view>
					<text class="best" v-if="g.best">{{ g.fmt === 'lap' ? '最快 ' + lapText(g.best) : '最高 ' + g.best }}</text>
					<view class="duck-ic-arrow"></view>
				</view>
			</view>

			<view class="duck-sec-head">
				<text class="duck-sec-title">对弈</text>
				<text class="sec-count">{{ board.length }} 款</text>
			</view>

			<view class="duck-panel panel">
				<view
					class="duck-row menu-row"
					v-for="g in board"
					:key="g.id"
					hover-class="duck-row-hover"
					@tap="open(g)"
				>
					<view class="menu-tile" :class="g.tile">
						<block v-if="g.id === 'game'">
							<image class="game-icon" src="/static/icons/ic-game.png" mode="aspectFit" />
						</block>
						<block v-else-if="g.id === 'chess'">
							<view class="chess-pc">
								<text class="chess-pc-txt">象</text>
							</view>
						</block>
						<block v-else>
							<view class="go-pc is-b"></view>
							<view class="go-pc is-w"></view>
						</block>
					</view>
					<view class="menu-main">
						<text class="menu-title">{{ g.name }}</text>
						<text class="menu-desc">{{ g.desc }}</text>
					</view>
					<view class="duck-ic-arrow"></view>
				</view>
			</view>

			<text class="foot-tip">成绩与进度都保存在本机，换设备不会同步</text>
			<view class="bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { navBack, menuSafeRight } from '@/common/nav.js'

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				casual: [
					{
						id: 'tetris',
						name: '俄罗斯方块',
						desc: '整行消除，越堆越快',
						tile: 'tetris-tile',
						path: '/pages/interview/game/tetris',
						key: 'tetris_best',
						best: 0
					},
					{
						id: 'plane',
						name: '飞机大战',
						desc: '全屏射击，拖动战机躲弹幕',
						tile: 'plane-tile',
						path: '/pages/interview/game/plane',
						key: 'plane_best',
						best: 0
					},
					{
						id: 'bubble',
						name: '泡泡龙',
						desc: '三颗同色连一起，打穿天花板',
						tile: 'bubble-tile',
						path: '/pages/interview/game/bubble',
						key: 'bubble_best',
						best: 0
					},
					{
						id: 'adventure',
						name: '冒险岛 3',
						desc: '横版闯关，踩怪吃果冲旗杆',
						tile: 'adventure-tile',
						path: '/pages/interview/game/adventure',
						key: 'adv_best',
						best: 0
					},
					{
						id: 'kart',
						name: '极速卡丁',
						desc: '漂移过弯，氮气冲刺跑三圈',
						tile: 'kart-tile',
						path: '/pages/interview/game/kart',
						key: 'kart_best',
						fmt: 'lap',
						best: 0
					},
					{
						id: 'match',
						name: '消消乐',
						desc: '三消连锁，25 步刷高分',
						tile: 'match-tile',
						path: '/pages/interview/game/match',
						best: 0
					}
				],
				board: [
					{
						id: 'game',
						name: '五子棋',
						desc: '和电脑对局，五子连珠即胜',
						tile: 'game-tile',
						path: '/pages/interview/game/game'
					},
					{
						id: 'chess',
						name: '中国象棋',
						desc: '楚河汉界，执红人机对弈',
						tile: 'chess-tile',
						path: '/pages/interview/game/chess'
					},
					{
						id: 'go',
						name: '围棋',
						desc: '9 路小棋盘，围空多者胜',
						tile: 'go-tile',
						path: '/pages/interview/game/go'
					}
				]
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
		},
		onShow() {
			// 从游戏里退回来时刷新一下最高分
			this.refreshBest()
		},
		methods: {
			goBack() {
				navBack('/pages/interview/mine/mine')
			},
			refreshBest() {
				const read = (g) => {
					if (!g.key) return
					try {
						g.best = Number(uni.getStorageSync(g.key)) || 0
					} catch (e) {
						g.best = 0
					}
				}
				this.casual.forEach(read)
				this.board.forEach(read)
			},
			open(g) {
				uni.navigateTo({ url: g.path })
			},
			// 卡丁车存的是最快单圈毫秒数，显示成 1:05.32
			lapText(ms) {
				if (!ms) return '--'
				const total = ms / 1000
				const m = Math.floor(total / 60)
				const s = total - m * 60
				return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.games {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 头部 ---------- */
	.games-head {
		padding-bottom: 40rpx;
		flex-shrink: 0;
	}

	.nav-row {
		display: flex;
		align-items: center;
		padding: 10rpx 24rpx 0;
	}

	.nav-back {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-back-hover {
		opacity: 0.55;
	}

	.nav-title {
		margin-left: 8rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.head-sub-white {
		display: block;
		margin-top: 10rpx;
		padding-left: 88rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.84);
	}

	/* ---------- 列表 ---------- */
	.content {
		flex: 1;
		height: 0;
		margin-top: 8rpx;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.panel {
		overflow: hidden;
	}

	.sec-count {
		font-size: 23rpx;
		color: $duck-text-muted;
	}

	.menu-row {
		padding: 26rpx 26rpx;
	}

	.menu-main {
		flex: 1;
		min-width: 0;
	}

	.menu-title {
		display: block;
		font-size: 28rpx;
		font-weight: 500;
		color: $duck-text;
	}

	.menu-desc {
		display: block;
		margin-top: 4rpx;
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.best {
		margin-left: 12rpx;
		height: 34rpx;
		line-height: 34rpx;
		padding: 0 12rpx;
		border-radius: 999rpx;
		background-color: $duck-primary-soft;
		font-size: 19rpx;
		color: $duck-primary-dark;
		flex-shrink: 0;
	}

	.foot-tip {
		display: block;
		margin-top: 28rpx;
		padding: 0 6rpx;
		text-align: center;
		font-size: 21rpx;
		color: #b6beba;
	}

	.bottom-space {
		height: 40rpx;
	}
</style>
