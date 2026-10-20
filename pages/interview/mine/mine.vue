<template>
	<view class="mine">
		<!-- 渐变头部 -->
		<view class="duck-head mine-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="profile">
				<view class="avatar">
					<text class="avatar-txt">鸭</text>
				</view>
				<view class="profile-info">
					<view class="name-row">
						<text class="name">前端刷题人</text>
						<text class="lv">Lv.{{ level.lv }}</text>
					</view>
					<text class="lv-name">{{ level.name }} · 已读 {{ stats.done }} 题</text>
				</view>
			</view>
		</view>

		<!-- 数据卡（上浮） -->
		<view class="stats-card">
			<view class="stat">
				<text class="stat-num duck-num">{{ stats.done }}</text>
				<text class="stat-label">累计阅读</text>
			</view>
			<view class="stat-line"></view>
			<view class="stat">
				<text class="stat-num duck-num">{{ stats.progress }}<text class="stat-unit">%</text></text>
				<text class="stat-label">已读进度</text>
			</view>
			<view class="stat-line"></view>
			<view class="stat">
				<text class="stat-num duck-num">{{ stats.streak }}</text>
				<text class="stat-label">连续天数</text>
			</view>
		</view>

		<!-- 题库进度 -->
		<view class="duck-panel progress">
			<view class="pg-head">
				<text class="pg-title">阅读进度</text>
				<text class="pg-num duck-num">{{ stats.done }} / {{ total }}</text>
			</view>
			<view class="pg-bar">
				<view class="pg-in" :style="{ width: stats.progress + '%' }"></view>
			</view>
			<view class="pg-foot">
				<text class="pg-tip">{{ progressTip }}</text>
				<view class="pg-link" @tap="goBank">
					<text class="pg-link-txt">继续看看</text>
					<view class="duck-ic-arrow is-green"></view>
				</view>
			</view>
		</view>

		<!-- 功能宫格 -->
		<view class="duck-sec-head">
			<text class="duck-sec-title">我的题单</text>
			<view class="sec-more" @tap="goBank">
				<text class="sec-more-txt">全部题库</text>
				<view class="duck-ic-arrow"></view>
			</view>
		</view>

		<view class="duck-grid mine-grid">
			<view class="grid-item" hover-class="grid-hover" @tap="goCollect('fav')">
				<view class="grid-tile" style="background: linear-gradient(135deg, #ffce5c, #ffb000)">
					<image class="grid-icon" src="/static/icons/ic-star.png" mode="aspectFit" />
				</view>
				<text class="grid-label">我的收藏</text>
			</view>
			<view class="grid-item" hover-class="grid-hover" @tap="goCollect('read')">
				<view class="grid-tile" style="background: linear-gradient(135deg, #ff8a80, #ff5252)">
					<image class="grid-icon" src="/static/icons/ic-check.png" mode="aspectFit" />
				</view>
				<text class="grid-label">已读记录</text>
			</view>
			<view class="grid-item" hover-class="grid-hover" @tap="goBank">
				<view class="grid-tile" style="background: linear-gradient(135deg, #4cb8ff, #1e90ff)">
					<image class="grid-icon" src="/static/icons/ic-book.png" mode="aspectFit" />
				</view>
				<text class="grid-label">全部题库</text>
			</view>
			<view class="grid-item" hover-class="grid-hover" @tap="goBank">
				<view class="grid-tile" style="background: linear-gradient(135deg, #ff9c6e, #ff7a45)">
					<image class="grid-icon" src="/static/icons/ic-chart.png" mode="aspectFit" />
				</view>
				<text class="grid-label">高频排行</text>
			</view>
		</view>

		<!-- 放松一下 -->
		<view class="duck-sec-head">
			<text class="duck-sec-title">放松一下</text>
			<text class="sec-more-txt">刷题累了，来一局</text>
		</view>

		<view class="duck-panel menu-panel">
			<view class="duck-row menu-row" hover-class="duck-row-hover" @tap="goGame">
				<view class="menu-tile game-tile">
					<image class="game-icon" src="/static/icons/ic-game.png" mode="aspectFit" />
				</view>
				<view class="menu-main">
					<text class="menu-title">五子棋</text>
					<text class="menu-desc">和电脑对局，五子连珠即胜</text>
				</view>
				<view class="duck-ic-arrow"></view>
			</view>
			<view class="duck-row menu-row" hover-class="duck-row-hover" @tap="goChess">
				<view class="menu-tile chess-tile">
					<view class="chess-pc">
						<text class="chess-pc-txt">象</text>
					</view>
				</view>
				<view class="menu-main">
					<text class="menu-title">中国象棋</text>
					<text class="menu-desc">楚河汉界，执红人机对弈</text>
				</view>
				<view class="duck-ic-arrow"></view>
			</view>
		</view>

		<!-- 更多 -->
		<view class="duck-sec-head">
			<text class="duck-sec-title">更多设置</text>
		</view>

		<view class="duck-panel menu-panel">
			<view class="duck-row menu-row" hover-class="duck-row-hover" @tap="about">
				<view class="menu-tile" style="background: #eef1f8">
					<text class="menu-tile-txt" style="color: #4d5f8f">关</text>
				</view>
				<view class="menu-main">
					<text class="menu-title">关于面试鸭</text>
					<text class="menu-desc">题库来源、许可与数据说明</text>
				</view>
				<view class="duck-ic-arrow"></view>
			</view>
			<view class="duck-row menu-row" hover-class="duck-row-hover" @tap="clearData">
				<view class="menu-tile" style="background: #fff1f0">
					<text class="menu-tile-txt" style="color: #d9363e">清</text>
				</view>
				<view class="menu-main">
					<text class="menu-title">清空学习数据</text>
					<text class="menu-desc">收藏、阅读记录与打卡都会被清除</text>
				</view>
				<view class="duck-ic-arrow"></view>
			</view>
		</view>

		<view class="version">
			<text>面试鸭 v1.0.0</text>
		</view>
	</view>
</template>

<script>
	import { categories, qaQuestions } from '@/common/interview-data.js'
	import { getStats, resetAll } from '@/common/interview-store.js'
	import { showLoading, hideLoading, sleep, showPageLoading, hidePageLoading } from '@/common/loading.js'

	export default {
		data() {
			return {
				statusBar: 0,
				catCount: categories.length,
				total: qaQuestions.length,
				stats: { done: 0, right: 0, wrong: 0, favorite: 0, rate: 0, progress: 0, streak: 0, today: 0 }
			}
		},
		computed: {
			level() {
				const n = this.stats.done
				if (n >= 200) return { lv: 5, name: '面霸鸭' }
				if (n >= 100) return { lv: 4, name: '老练鸭' }
				if (n >= 40) return { lv: 3, name: '进阶鸭' }
				if (n >= 10) return { lv: 2, name: '入门鸭' }
				return { lv: 1, name: '萌新鸭' }
			},
			progressTip() {
				if (!this.total) return '题库还没有数据，先去补充题目'
				const p = this.stats.progress
				if (p >= 100) return '全部刷完，去见面试官吧'
				if (p >= 60) return '已经过半，再坚持一下'
				if (p >= 20) return '进展不错，保持节奏'
				if (p > 0) return '刚起步，先每天 5 题'
				return '还没有开始，从每日一题起步'
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
		},
		onShow() {
			showPageLoading()
			this.stats = getStats(qaQuestions.length)
			hidePageLoading()
		},
		methods: {
			goBank() {
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			},
			goCollect(tab) {
				uni.setStorageSync('duck:collect-tab', tab)
				uni.switchTab({ url: '/pages/interview/collect/collect' })
			},
			goGame() {
				uni.navigateTo({ url: '/pages/interview/game/game' })
			},
			goChess() {
				uni.navigateTo({ url: '/pages/interview/game/chess' })
			},
			about() {
				uni.showModal({
					title: '关于面试鸭',
					content: '共 ' + this.total + ' 道问答，题目与解析参考自面试鸭（mianshiya.com）。所有学习数据保存在本地，换设备不会同步。',
					showCancel: false,
					confirmText: '知道了',
					confirmColor: '#00B578'
				})
			},
			clearData() {
				uni.showModal({
					title: '清空学习数据',
					content: '收藏、阅读记录和打卡数据都会被清除，确定继续吗？',
					confirmText: '清空',
					confirmColor: '#FF4D4F',
					cancelText: '取消',
					success: async (res) => {
						if (!res.confirm) return
						showLoading('处理中')
						await sleep(300)
						resetAll()
						this.stats = getStats(qaQuestions.length)
						hideLoading()
						setTimeout(() => {
							uni.showToast({ title: '已清空', icon: 'none' })
						}, 60)
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.mine {
		min-height: 100vh;
		background-color: $duck-bg;
		padding-bottom: 60rpx;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.mine-head {
		padding-bottom: 84rpx;
	}

	.profile {
		display: flex;
		align-items: center;
		padding: 36rpx 32rpx 0;
	}

	.avatar {
		width: 124rpx;
		height: 124rpx;
		border-radius: 50%;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
		flex-shrink: 0;
		border: 4rpx solid rgba(255, 255, 255, 0.6);
	}

	.avatar-txt {
		font-size: 52rpx;
		font-weight: 700;
		color: $duck-primary;
		letter-spacing: 1rpx;
	}

	.profile-info {
		flex: 1;
		min-width: 0;
	}

	.name-row {
		display: flex;
		align-items: center;
	}

	.name {
		font-size: 42rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: -0.5rpx;
	}

	.lv {
		margin-left: 14rpx;
		height: 40rpx;
		line-height: 40rpx;
		padding: 0 16rpx;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.24);
		color: #ffffff;
		font-size: 21rpx;
		font-weight: 600;
	}

	.lv-name {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.84);
	}

	/* ---------- 数据卡 ---------- */
	.stats-card {
		display: flex;
		align-items: center;
		margin: -60rpx 24rpx 0;
		padding: 34rpx 0;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
		position: relative;
		z-index: 2;
	}

	.stat {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-line {
		width: 1rpx;
		height: 46rpx;
		background-color: #f0f2f1;
	}

	.stat-num {
		font-size: 46rpx;
		font-weight: 700;
		color: $duck-text;
		line-height: 1.1;
		letter-spacing: -1rpx;
	}

	.stat-unit {
		font-size: 24rpx;
		font-weight: 600;
	}

	.stat-label {
		margin-top: 10rpx;
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	/* ---------- 进度 ---------- */
	.progress {
		margin: 20rpx 24rpx 0;
		padding: 28rpx 26rpx;
	}

	.pg-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.pg-title {
		font-size: 28rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.pg-num {
		font-size: 23rpx;
		color: $duck-text-muted;
	}

	.pg-bar {
		margin-top: 20rpx;
		height: 12rpx;
		border-radius: 999rpx;
		background-color: #f0f3f1;
		overflow: hidden;
	}

	.pg-in {
		height: 100%;
		border-radius: 999rpx;
		background: linear-gradient(90deg, #5be0ac 0%, #00b578 100%);
		transition: width 0.45s ease;
	}

	.pg-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 18rpx;
	}

	.pg-tip {
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	.pg-link {
		display: flex;
		align-items: center;
	}

	.pg-link-txt {
		margin-right: 4rpx;
		font-size: 23rpx;
		font-weight: 600;
		color: $duck-primary-dark;
	}

	/* ---------- 区块 ---------- */
	.sec-more {
		display: flex;
		align-items: center;
	}

	.sec-more-txt {
		margin-right: 4rpx;
		font-size: 24rpx;
		color: $duck-text-muted;
	}

	.mine-grid {
		margin: 0 24rpx;
		padding-bottom: 4rpx;
	}

	/* ---------- 菜单 ---------- */
	.menu-panel {
		margin: 0 24rpx;
	}

	.menu-row {
		padding: 26rpx 26rpx;
	}

	.menu-tile {
		width: 72rpx;
		height: 72rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 22rpx;
		flex-shrink: 0;
	}

	.menu-tile-txt {
		font-size: 26rpx;
		font-weight: 600;
	}

	.game-tile {
		background: linear-gradient(135deg, #56cf9b, #00b578);
	}

	.game-icon {
		width: 44rpx;
		height: 44rpx;
	}

	.chess-tile {
		background: linear-gradient(135deg, #f7e2bb, #e2b97e);
	}

	.chess-pc {
		width: 54rpx;
		height: 54rpx;
		border-radius: 50%;
		box-sizing: border-box;
		background: radial-gradient(circle at 34% 28%, #fffdf4, #f0e2c4 78%);
		border: 2rpx solid #c09a6b;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chess-pc-txt {
		font-size: 32rpx;
		font-weight: 700;
		line-height: 1;
		color: #c62828;
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

	/* ---------- 版本 ---------- */
	.version {
		margin-top: 48rpx;
		text-align: center;
		font-size: 21rpx;
		color: #b3beb8;
	}
</style>
