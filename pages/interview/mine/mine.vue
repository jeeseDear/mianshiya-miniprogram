<template>
	<view class="mine">
		<!-- 渐变头部 -->
		<view class="duck-head mine-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="profile" hover-class="profile-hover" @tap="tapProfile">
				<view class="avatar" :class="{ 'is-login': loggedIn }">
					<image
						v-if="user && user.avatar"
						class="avatar-img"
						:src="user.avatar"
						mode="aspectFill"
					/>
					<text v-else class="avatar-txt">鸭</text>
					<view class="avatar-badge" v-if="loggedIn">
						<view class="avatar-badge-tick"></view>
					</view>
				</view>
				<view class="profile-info">
					<view class="name-row">
						<text class="name">{{ displayName }}</text>
						<text class="lv">Lv.{{ level.lv }}</text>
					</view>
					<text class="lv-name">{{ profileSub }}</text>
				</view>
				<view class="login-pill" v-if="!loggedIn">
					<text class="login-pill-txt">登录</text>
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
			<view class="duck-row menu-row" hover-class="duck-row-hover" @tap="goGo">
				<view class="menu-tile go-tile">
					<view class="go-pc is-b"></view>
					<view class="go-pc is-w"></view>
				</view>
				<view class="menu-main">
					<text class="menu-title">围棋</text>
					<text class="menu-desc">9 路小棋盘，围空多者胜</text>
				</view>
				<view class="duck-ic-arrow"></view>
			</view>
			<view class="duck-row menu-row" hover-class="duck-row-hover" @tap="goMatch">
				<view class="menu-tile match-tile">
					<view class="mt-dot d1"></view>
					<view class="mt-dot d2"></view>
					<view class="mt-dot d3"></view>
					<view class="mt-dot d4"></view>
				</view>
				<view class="menu-main">
					<text class="menu-title">消消乐</text>
					<text class="menu-desc">三消连锁，25 步刷高分</text>
				</view>
				<view class="duck-ic-arrow"></view>
			</view>
			<view class="duck-row menu-row" hover-class="duck-row-hover" @tap="goTetris">
				<view class="menu-tile tetris-tile">
					<view class="tt-b t1"></view>
					<view class="tt-b t2"></view>
					<view class="tt-b t3"></view>
					<view class="tt-b t4"></view>
				</view>
				<view class="menu-main">
					<text class="menu-title">俄罗斯方块</text>
					<text class="menu-desc">整行消除，越堆越快</text>
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
			<view
				class="duck-row menu-row"
				v-if="loggedIn"
				hover-class="duck-row-hover"
				@tap="confirmLogout"
			>
				<view class="menu-tile" style="background: #f2f4f6">
					<text class="menu-tile-txt" style="color: #5c6b64">退</text>
				</view>
				<view class="menu-main">
					<text class="menu-title">退出登录</text>
					<text class="menu-desc">切换到游客身份，数据仍保留在账号里</text>
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
	import { getCategories, allQuestions } from '@/common/question-source.js'
	import { getStats, resetAll, syncUserData, clearLocal } from '@/common/user-store.js'
	import { getUser as getCachedUser, logout, updateProfile } from '@/common/api.js'
	import { ensureReady } from '@/common/bootstrap.js'
	import { showLoading, hideLoading, showPageLoading, hidePageLoading } from '@/common/loading.js'

	export default {
		data() {
			return {
				statusBar: 0,
				catCount: getCategories().length,
				total: allQuestions().length,
				/** 当前用户（含 is_guest 标记），null 表示还没拿到 */
				user: null,
				stats: { done: 0, right: 0, wrong: 0, favorite: 0, rate: 0, progress: 0, streak: 0, today: 0 }
			}
		},
		computed: {
			/** 只有手机号登录才算「已登录」，游客也显示入口 */
			loggedIn() {
				return !!(this.user && this.user.is_guest === false)
			},
			displayName() {
				if (!this.user) return '未登录'
				return this.user.nickname || (this.loggedIn ? '面试鸭用户' : '未登录')
			},
			profileSub() {
				if (!this.loggedIn) return '游客模式 · 已读 ' + this.stats.done + ' 题'
				// 已登录显示账号，让用户知道当前是哪个号
				const acct = this.user && (this.user.account || this.user.phone)
				if (acct) return acct + ' · 已读 ' + this.stats.done + ' 题'
				return this.level.name + ' · 已读 ' + this.stats.done + ' 题'
			},
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
			this.user = getCachedUser()
			this.stats = getStats(allQuestions().length)
			hidePageLoading()
			this.syncFromCloud()
		},
		methods: {
			// 学习数据以服务端为准，本地缓存先显示再校准
			async syncFromCloud() {
				await ensureReady()
				await syncUserData({ silent: true })
				this.user = getCachedUser()
				this.catCount = getCategories().length
				this.total = allQuestions().length
				this.stats = getStats(this.total)
			},
			goLogin() {
				uni.navigateTo({ url: '/pages/interview/login/login' })
			},
			/** 点头部：游客去登录，已登录给「改昵称 / 退出」两个操作 */
			tapProfile() {
				if (!this.loggedIn) {
					this.goLogin()
					return
				}
				uni.showActionSheet({
					itemList: ['修改昵称', '退出登录'],
					success: (res) => {
						if (res.tapIndex === 0) this.editNickname()
						else if (res.tapIndex === 1) this.confirmLogout()
					}
				})
			},
			editNickname() {
				// #ifndef MP-WEIXIN
				uni.showToast({ title: '当前环境不支持修改昵称，请在微信小程序里操作', icon: 'none' })
				return
				// #endif
				uni.showModal({
					title: '修改昵称',
					editable: true,
					placeholderText: '输入新昵称（最多 16 个字）',
					content: (this.user && this.user.nickname) || '',
					confirmText: '保存',
					confirmColor: '#00B578',
					success: async (res) => {
						if (!res.confirm) return
						const name = (res.content || '').trim()
						if (!name) {
							uni.showToast({ title: '昵称不能为空', icon: 'none' })
							return
						}
						if (name.length > 16) {
							uni.showToast({ title: '昵称最多 16 个字', icon: 'none' })
							return
						}
						showLoading('保存中')
						try {
							await updateProfile({ nickname: name })
							this.user = getCachedUser()
							hideLoading()
							uni.showToast({ title: '已保存', icon: 'none' })
						} catch (e) {
							hideLoading()
							uni.showToast({ title: '保存失败，请检查网络', icon: 'none' })
						}
					}
				})
			},
			confirmLogout() {
				uni.showModal({
					title: '退出登录',
					content: '退出后会切换到游客身份，学习数据仍保留在账号里，重新登录即可找回。',
					confirmText: '退出',
					confirmColor: '#FF4D4F',
					success: async (res) => {
						if (!res.confirm) return
						showLoading('退出中')
						try {
							await logout()
							// 换号了，先清掉内存里的旧账号数据，再拉新游客的空数据
							clearLocal()
							await syncUserData({ silent: true })
							this.user = getCachedUser()
							this.stats = getStats(this.total)
							hideLoading()
							uni.showToast({ title: '已退出登录', icon: 'none' })
						} catch (e) {
							hideLoading()
							uni.showToast({ title: '退出失败，请检查网络', icon: 'none' })
						}
					}
				})
			},
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
			goGo() {
				uni.navigateTo({ url: '/pages/interview/game/go' })
			},
			goMatch() {
				uni.navigateTo({ url: '/pages/interview/game/match' })
			},
			goTetris() {
				uni.navigateTo({ url: '/pages/interview/game/tetris' })
			},
			about() {
				uni.showModal({
					title: '关于面试鸭',
					content: '共 ' + this.total + ' 道问答，题目与解析参考自面试鸭（mianshiya.com）。学习数据已同步到云端，换设备登录同一账号可继续。',
					showCancel: false,
					confirmText: '知道了',
					confirmColor: '#00B578'
				})
			},
			clearData() {
				uni.showModal({
					title: '清空学习数据',
					content: '收藏、阅读记录和打卡数据都会被清除，且云端数据一并删除，确定继续吗？',
					confirmText: '清空',
					confirmColor: '#FF4D4F',
					cancelText: '取消',
					success: async (res) => {
						if (!res.confirm) return
						showLoading('处理中')
						try {
							await resetAll()
							this.stats = getStats(allQuestions().length)
							hideLoading()
							setTimeout(() => {
								uni.showToast({ title: '已清空', icon: 'none' })
							}, 60)
						} catch (e) {
							hideLoading()
							uni.showToast({ title: '清空失败，请检查网络', icon: 'none' })
						}
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
		position: relative;
		overflow: hidden;
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

	/* 已登录：一圈金边 + 右下角对勾徽标 */
	.avatar.is-login {
		border-color: rgba(255, 209, 102, 0.9);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: block;
	}

	.avatar-badge {
		position: absolute;
		right: 2rpx;
		bottom: 2rpx;
		width: 34rpx;
		height: 34rpx;
		border-radius: 50%;
		background-color: #ffb000;
		border: 3rpx solid #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.avatar-badge-tick {
		width: 12rpx;
		height: 7rpx;
		margin-top: -3rpx;
		border-left: 3rpx solid #ffffff;
		border-bottom: 3rpx solid #ffffff;
		transform: rotate(-45deg);
		box-sizing: border-box;
	}

	/* 登录入口胶囊 */
	.login-pill {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 52rpx;
		padding: 0 24rpx;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.94);
	}

	.login-pill-txt {
		font-size: 23rpx;
		font-weight: 600;
		color: $duck-primary-dark;
	}

	.profile-hover {
		opacity: 0.9;
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
		max-width: 320rpx;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
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

	.go-tile {
		position: relative;
		background: linear-gradient(135deg, #f0e6d6, #ccb896);
	}

	.go-pc {
		position: absolute;
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		box-sizing: border-box;
	}

	.go-pc.is-b {
		left: 11rpx;
		top: 11rpx;
		background: radial-gradient(circle at 34% 28%, #6a7175, #1c1f21 78%);
		box-shadow: 0 2rpx 4rpx rgba(30, 20, 10, 0.3);
	}

	.go-pc.is-w {
		right: 11rpx;
		bottom: 11rpx;
		background: radial-gradient(circle at 34% 28%, #ffffff, #e6e0d3 80%);
		border: 2rpx solid #d3cab8;
		box-shadow: 0 2rpx 4rpx rgba(30, 20, 10, 0.18);
	}

	.match-tile {
		position: relative;
		background: linear-gradient(135deg, #fff2e6, #ffd6ad);
	}

	.mt-dot {
		position: absolute;
		width: 22rpx;
		height: 22rpx;
		border-radius: 7rpx;
	}

	.mt-dot.d1 {
		left: 12rpx;
		top: 12rpx;
		background: linear-gradient(160deg, #ff9a9a, #e0433f);
	}

	.mt-dot.d2 {
		right: 12rpx;
		top: 12rpx;
		background: linear-gradient(160deg, #ffe08a, #f2b705);
	}

	.mt-dot.d3 {
		left: 12rpx;
		bottom: 12rpx;
		background: linear-gradient(160deg, #7fe0b4, #00a86b);
	}

	.mt-dot.d4 {
		right: 12rpx;
		bottom: 12rpx;
		background: linear-gradient(160deg, #7fb6ff, #2b6fe0);
	}

	.tetris-tile {
		position: relative;
		background: linear-gradient(135deg, #e8f3ff, #cfe0ff);
	}

	.tt-b {
		position: absolute;
		width: 24rpx;
		height: 24rpx;
		border-radius: 6rpx;
		box-shadow: inset 0 -3rpx 0 rgba(0, 0, 0, 0.16);
	}

	.tt-b.t1 {
		left: 10rpx;
		top: 10rpx;
		background: linear-gradient(160deg, #7ce9f7, #17a9d4);
	}

	.tt-b.t2 {
		left: 38rpx;
		top: 10rpx;
		background: linear-gradient(160deg, #d8b4fe, #8b3fd9);
	}

	.tt-b.t3 {
		left: 10rpx;
		top: 38rpx;
		background: linear-gradient(160deg, #ffe08a, #f0a020);
	}

	.tt-b.t4 {
		left: 38rpx;
		top: 38rpx;
		background: linear-gradient(160deg, #9bf0b8, #14a05a);
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
