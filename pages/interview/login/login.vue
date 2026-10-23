<template>
	<view class="login-page">
		<!-- 渐变头部：品牌区 -->
		<view class="duck-head login-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="head-bar" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
				<view class="back" hover-class="back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="head-title">登录</text>
			</view>

			<view class="brand">
				<view class="brand-logo">
					<text class="brand-logo-txt">鸭</text>
				</view>
				<text class="brand-name">前端面试鸭</text>
				<text class="brand-sub">登录后进度云端同步，换设备接着刷</text>
			</view>
		</view>

		<!-- 登录卡 -->
		<view class="login-body">
			<view class="duck-panel login-card">
				<view class="field">
					<text class="field-label">昵称</text>
					<input
						class="field-input"
						v-model="nickname"
						type="nickname"
						:maxlength="16"
						placeholder="给自己起个名字"
						placeholder-class="field-ph"
						confirm-type="done"
					/>
				</view>
				<text class="field-tip">不填的话默认叫「面试鸭用户」，登录后也能改</text>

				<!-- #ifdef MP-WEIXIN -->
				<view
					class="duck-btn login-btn"
					:class="canLogin ? 'duck-btn-primary' : 'is-disabled'"
					:hover-class="canLogin ? 'duck-btn-hover' : 'none'"
					@tap="doLogin"
				>
					<text>{{ loading ? '登录中…' : '微信一键登录' }}</text>
				</view>
				<!-- #endif -->

				<!-- #ifndef MP-WEIXIN -->
				<view class="duck-btn duck-btn-primary login-btn" hover-class="duck-btn-hover" @tap="doGuestLogin">
					<text>游客身份进入</text>
				</view>
				<text class="env-tip">当前环境不支持微信登录，可用游客身份体验</text>
				<!-- #endif -->

				<!-- #ifdef MP-WEIXIN -->
				<view class="guest-btn" hover-class="duck-btn-hover" @tap="asGuest">
					<text>先随便看看（游客）</text>
				</view>
				<!-- #endif -->

				<view class="agree" @tap="toggleAgree">
					<view class="checkbox" :class="{ 'is-on': agreed }">
						<view class="tick"></view>
					</view>
					<view class="agree-txt">
						<text>我已阅读并同意</text>
						<text class="agree-link" @tap.stop="showAgreement">《用户协议》</text>
						<text>与</text>
						<text class="agree-link" @tap.stop="showAgreement">《隐私政策》</text>
					</view>
				</view>
			</view>

			<!-- 登录能带来什么 -->
			<view class="benefits">
				<view class="benefit">
					<view class="benefit-dot is-green"></view>
					<text class="benefit-txt">收藏、错题、阅读记录跟着账号走</text>
				</view>
				<view class="benefit">
					<view class="benefit-dot is-blue"></view>
					<text class="benefit-txt">换手机不用从头刷</text>
				</view>
				<view class="benefit">
					<view class="benefit-dot is-gold"></view>
					<text class="benefit-txt">游客期间的刷题记录登录后自动合并</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { loginWechat, loginGuest, getUser, getToken } from '@/common/api.js'
	import { syncUserData } from '@/common/user-store.js'
	import { menuSafeRight } from '@/common/nav.js'
	import { showLoading, hideLoading, hidePageLoading } from '@/common/loading.js'

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				nickname: '',
				agreed: false,
				loading: false,
				/** 进页面时缓存的用户，用来判断「已经是正式账号」还是游客 */
				current: null
			}
		},
		computed: {
			canLogin() {
				return this.agreed && !this.loading
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

			const user = getUser()
			this.current = user
			// 已登录的老用户进来改昵称：预填当前昵称
			if (user && user.is_guest === false && user.nickname) this.nickname = user.nickname
		},
		onReady() {
			// 关掉路由拦截器开的那层页面 loading
			hidePageLoading()
		},
		methods: {
			goBack() {
				uni.navigateBack({
					delta: 1,
					fail: () => {
						uni.switchTab({ url: '/pages/interview/mine/mine' })
					}
				})
			},
			toggleAgree() {
				this.agreed = !this.agreed
			},
			showAgreement() {
				uni.showModal({
					title: '用户协议与隐私政策',
					content:
						'面试鸭仅收集你的昵称、头像与刷题记录，用于展示学习进度和跨设备同步。' +
						'不收集通讯录、位置等无关信息，也不会把数据提供给第三方。' +
						'你可以在「我的 → 清空学习数据」随时删除全部记录，或退出登录停止同步。',
					showCancel: false,
					confirmText: '知道了',
					confirmColor: '#00B578'
				})
			},

			/** 微信一键登录：code 交后端换 openid，游客数据会被合并过去 */
			async doLogin() {
				if (this.loading) return
				if (!this.agreed) {
					uni.showToast({ title: '请先勾选同意协议', icon: 'none' })
					return
				}
				if (this.current && this.current.is_guest === false) {
					uni.showToast({ title: '你已经是登录状态', icon: 'none' })
					return
				}

				this.loading = true
				showLoading('登录中')
				try {
					await loginWechat({ nickname: this.nickname.trim() || '面试鸭用户' })
					// 换账号后重新拉一遍服务端数据，页面上立刻是新账号的进度
					await syncUserData({ silent: true })
					hideLoading()
					uni.showToast({ title: '登录成功', icon: 'success' })
					this.leave()
				} catch (e) {
					hideLoading()
					this.handleFail(e)
				} finally {
					this.loading = false
				}
			},

			/** 游客进入：bootstrap 通常已经建好游客身份，这里只兜底 */
			async doGuestLogin() {
				if (!this.agreed) {
					uni.showToast({ title: '请先勾选同意协议', icon: 'none' })
					return
				}
				showLoading('准备中')
				try {
					if (!getToken()) await loginGuest()
					hideLoading()
					this.leave()
				} catch (e) {
					hideLoading()
					this.handleFail(e)
				}
			},

			asGuest() {
				// 已经登录了正式账号，不要因为点「游客」把账号挤掉
				if (this.current && this.current.is_guest === false) {
					uni.showToast({ title: '当前已登录', icon: 'none' })
					this.leave()
					return
				}
				if (!this.agreed) {
					uni.showToast({ title: '请先勾选同意协议', icon: 'none' })
					return
				}
				this.doGuestLogin()
			},

			handleFail(e) {
				const status = e && e.status
				if (status === 501) {
					uni.showModal({
						title: '暂时无法微信登录',
						content:
							'服务端还没有配置 WX_APPID / WX_SECRET。你可以先用游客身份体验，' +
							'数据会存在本机对应的游客账号里。',
						confirmText: '游客进入',
						cancelText: '再等等',
						confirmColor: '#00B578',
						success: (res) => {
							if (res.confirm) this.doGuestLogin()
						}
					})
					return
				}
				if (status === 0) {
					uni.showToast({ title: '连不上服务器，请稍后再试', icon: 'none' })
					return
				}
				uni.showToast({ title: (e && e.message) || '登录失败', icon: 'none' })
			},

			/** 登录完成：有上一页就退回去，否则进「我的」 */
			leave() {
				setTimeout(() => {
					uni.navigateBack({
						delta: 1,
						fail: () => {
							uni.switchTab({ url: '/pages/interview/mine/mine' })
						}
					})
				}, 650)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-page {
		min-height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 头部 ---------- */
	.login-head {
		padding-bottom: 96rpx;
	}

	.head-bar {
		display: flex;
		align-items: center;
		height: 88rpx;
		padding-left: 16rpx;
	}

	.back {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
	}

	.back-hover {
		background-color: rgba(255, 255, 255, 0.16);
	}

	.head-title {
		margin-left: 8rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24rpx 48rpx 0;
	}

	.brand-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 132rpx;
		height: 132rpx;
		border-radius: 40rpx;
		background-color: #ffffff;
		box-shadow: 0 12rpx 32rpx rgba(0, 107, 72, 0.22);
	}

	.brand-logo-txt {
		font-size: 60rpx;
		font-weight: 700;
		color: $duck-primary;
		line-height: 1;
	}

	.brand-name {
		margin-top: 24rpx;
		font-size: 42rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 1rpx;
	}

	.brand-sub {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.86);
		text-align: center;
	}

	/* ---------- 主体 ---------- */
	.login-body {
		padding: 0 32rpx 60rpx;
	}

	.login-card {
		margin-top: -72rpx;
		padding: 40rpx 36rpx 32rpx;
		background-color: #ffffff;
		border-radius: 28rpx;
		box-shadow: 0 12rpx 36rpx rgba(15, 42, 31, 0.08);
	}

	.field {
		display: flex;
		align-items: center;
		height: 96rpx;
		padding: 0 26rpx;
		background-color: #f5f8f6;
		border-radius: 20rpx;
	}

	.field-label {
		flex-shrink: 0;
		width: 88rpx;
		font-size: 27rpx;
		color: $duck-text-muted;
	}

	.field-input {
		flex: 1;
		height: 96rpx;
		font-size: 29rpx;
		color: $duck-text;
	}

	.field-ph {
		color: #b6c2bc;
		font-size: 27rpx;
	}

	.field-tip {
		display: block;
		margin: 14rpx 4rpx 0;
		font-size: 21rpx;
		color: #a3b0a9;
	}

	.login-btn {
		margin-top: 40rpx;
	}

	.guest-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 84rpx;
		margin-top: 16rpx;
		border-radius: 999rpx;
		font-size: 27rpx;
		color: #5c6b64;
	}

	.env-tip {
		display: block;
		margin-top: 18rpx;
		font-size: 21rpx;
		color: #a3b0a9;
		text-align: center;
	}

	/* ---------- 协议 ---------- */
	.agree {
		display: flex;
		align-items: flex-start;
		margin-top: 28rpx;
		padding: 0 4rpx;
	}

	.checkbox {
		position: relative;
		flex-shrink: 0;
		width: 32rpx;
		height: 32rpx;
		margin-top: 2rpx;
		border-radius: 50%;
		border: 2rpx solid #ccd6d0;
		box-sizing: border-box;
		transition: all 0.16s ease;
	}

	.checkbox.is-on {
		background-color: $duck-primary;
		border-color: $duck-primary;
	}

	.tick {
		position: absolute;
		left: 9rpx;
		top: 7rpx;
		width: 10rpx;
		height: 6rpx;
		border-left: 2rpx solid #ffffff;
		border-bottom: 2rpx solid #ffffff;
		transform: rotate(-45deg) scale(0);
		transition: transform 0.16s ease;
		box-sizing: border-box;
	}

	.checkbox.is-on .tick {
		transform: rotate(-45deg) scale(1);
	}

	.agree-txt {
		flex: 1;
		margin-left: 12rpx;
		font-size: 21rpx;
		line-height: 1.5;
		color: #98a6a0;
	}

	.agree-link {
		color: $duck-primary;
	}

	/* ---------- 说明 ---------- */
	.benefits {
		margin-top: 44rpx;
		padding: 0 12rpx;
	}

	.benefit {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.benefit-dot {
		width: 10rpx;
		height: 10rpx;
		margin-right: 16rpx;
		border-radius: 50%;
	}

	.benefit-dot.is-green {
		background-color: $duck-primary;
	}

	.benefit-dot.is-blue {
		background-color: #3b8ff0;
	}

	.benefit-dot.is-gold {
		background-color: #f0a020;
	}

	.benefit-txt {
		font-size: 23rpx;
		color: #8b9a93;
	}
</style>
