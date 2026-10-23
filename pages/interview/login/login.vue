<template>
	<view class="page">
		<view :style="{ height: statusBar + 'px' }"></view>

		<view class="bar" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
			<view class="back" hover-class="back-hover" @tap="goBack">
				<view class="duck-ic-back"></view>
			</view>
		</view>

		<view class="main">
			<view class="logo">
				<text class="logo-txt">鸭</text>
			</view>

			<text class="title">登录</text>
			<text class="sub">账号不存在时会自动注册</text>

			<view class="form">
				<!-- 账号 -->
				<view class="row" :class="{ 'is-focus': active === 'account' }">
					<input
						class="input"
						v-model="account"
						:maxlength="20"
						placeholder="账号"
						placeholder-class="ph"
						confirm-type="next"
						@focus="active = 'account'"
						@blur="active = ''"
					/>
					<view v-if="account" class="clear" @tap="account = ''">
						<view class="duck-ic-close"></view>
					</view>
				</view>

				<!-- 密码 -->
				<view class="row" :class="{ 'is-focus': active === 'pwd' }">
					<input
						class="input"
						v-model="password"
						:password="!showPwd"
						:maxlength="32"
						placeholder="密码（至少 6 位）"
						placeholder-class="ph"
						confirm-type="done"
						@focus="active = 'pwd'"
						@blur="active = ''"
						@confirm="doLogin"
					/>
					<view class="eye" :class="{ 'is-off': !showPwd }" @tap="showPwd = !showPwd">
						<view class="eye-slash"></view>
					</view>
				</view>
			</view>

			<view class="submit" :class="canLogin ? 'is-on' : 'is-off'" @tap="doLogin">
				<text>{{ loading ? '处理中…' : '登录' }}</text>
			</view>

			<view class="agree" @tap="agreed = !agreed">
				<view class="checkbox" :class="{ 'is-on': agreed }">
					<view class="tick"></view>
				</view>
				<view class="agree-txt">
					<text>已阅读并同意</text>
					<text class="agree-link" @tap.stop="showAgreement">《用户协议》</text>
					<text>与</text>
					<text class="agree-link" @tap.stop="showAgreement">《隐私政策》</text>
				</view>
			</view>
		</view>

		<view class="foot">
			<text class="guest" @tap="asGuest">先随便看看</text>
		</view>
	</view>
</template>

<script>
	import { loginPassword, loginGuest, getUser, getToken } from '@/common/api.js'
	import { syncUserData } from '@/common/user-store.js'
	import { menuSafeRight } from '@/common/nav.js'
	import { showLoading, hideLoading, hidePageLoading } from '@/common/loading.js'

	const ACCOUNT_RE = /^[A-Za-z0-9_]{3,20}$/

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				account: '',
				password: '',
				showPwd: false,
				agreed: false,
				loading: false,
				active: '',
				/** 进页面时缓存的用户，用来判断「已经是登录状态」还是游客 */
				current: null
			}
		},
		computed: {
			accountOk() {
				return ACCOUNT_RE.test(this.account)
			},
			canLogin() {
				return this.agreed && this.accountOk && this.password.length >= 6 && !this.loading
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
			this.current = getUser()
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
			showAgreement() {
				uni.showModal({
					title: '用户协议与隐私政策',
					content:
						'面试鸭仅收集你的账号、昵称与刷题记录，用于登录、展示学习进度和跨设备同步。' +
						'密码经加盐哈希后存储，服务端不保存明文。' +
						'不收集通讯录、位置等无关信息，也不会把数据提供给第三方。' +
						'你可以在「我的 → 清空学习数据」随时删除全部记录，或退出登录停止同步。',
					showCancel: false,
					confirmText: '知道了',
					confirmColor: '#00B578'
				})
			},

			/* ---------- 登录 / 注册 ---------- */
			async doLogin() {
				if (this.loading) return
				if (!this.accountOk) {
					uni.showToast({ title: '账号需 3-20 位字母、数字或下划线', icon: 'none' })
					return
				}
				if (this.password.length < 6) {
					uni.showToast({ title: '密码至少 6 位', icon: 'none' })
					return
				}
				if (!this.agreed) {
					uni.showToast({ title: '请先勾选同意协议', icon: 'none' })
					return
				}

				this.loading = true
				showLoading('登录中')
				try {
					await loginPassword({ account: this.account, password: this.password })
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
			async asGuest() {
				if (this.current && this.current.is_guest === false) {
					uni.showToast({ title: '当前已登录', icon: 'none' })
					this.leave()
					return
				}
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

			handleFail(e) {
				const status = e && e.status
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
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #ffffff;
	}

	/* ---------- 顶栏 ---------- */
	.bar {
		display: flex;
		align-items: center;
		height: 88rpx;
		padding-left: 20rpx;
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
		background-color: #f2f4f3;
	}

	/* 公共返回箭头是白色的，浅色底上换成深灰 */
	.back .duck-ic-back::after {
		border-left-color: #23282b;
		border-bottom-color: #23282b;
	}

	/* ---------- 主体 ---------- */
	.main {
		flex: 1;
		padding: 40rpx 56rpx 0;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 88rpx;
		height: 88rpx;
		border-radius: 26rpx;
		background-color: $duck-primary;
	}

	.logo-txt {
		font-size: 44rpx;
		font-weight: 700;
		line-height: 1;
		color: #ffffff;
	}

	.title {
		display: block;
		margin-top: 40rpx;
		font-size: 50rpx;
		font-weight: 700;
		color: $duck-text;
		letter-spacing: -1rpx;
	}

	.sub {
		display: block;
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #9aa4a0;
	}

	/* ---------- 表单 ---------- */
	.form {
		margin-top: 76rpx;
	}

	.row {
		display: flex;
		align-items: center;
		height: 112rpx;
		border-bottom: 2rpx solid #edeff0;
		transition: border-color 0.18s ease;
	}

	.row.is-focus {
		border-bottom-color: $duck-primary;
	}

	.input {
		flex: 1;
		height: 112rpx;
		font-size: 32rpx;
		color: $duck-text;
	}

	.ph {
		font-size: 30rpx;
		color: #bcc4c1;
	}

	.clear {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 52rpx;
		height: 52rpx;
	}

	/* ---------- 眼睛（纯 CSS，不占图片资源） ---------- */
	.eye {
		position: relative;
		flex-shrink: 0;
		width: 52rpx;
		height: 52rpx;
	}

	.eye::before {
		content: '';
		position: absolute;
		left: 8rpx;
		top: 13rpx;
		width: 36rpx;
		height: 24rpx;
		border: 3rpx solid #b6bfbb;
		border-radius: 50%;
		box-sizing: border-box;
	}

	.eye::after {
		content: '';
		position: absolute;
		left: 21rpx;
		top: 18rpx;
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: #b6bfbb;
	}

	.eye-slash {
		position: absolute;
		left: 6rpx;
		top: 24rpx;
		width: 40rpx;
		height: 3rpx;
		border-radius: 3rpx;
		background-color: #b6bfbb;
		transform: rotate(45deg) scaleX(0);
		transition: transform 0.16s ease;
	}

	.eye.is-off .eye-slash {
		transform: rotate(45deg) scaleX(1);
	}

	/* ---------- 按钮 ---------- */
	.submit {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100rpx;
		margin-top: 64rpx;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: 600;
		transition: opacity 0.18s ease;
	}

	.submit.is-on {
		background-color: $duck-primary;
		color: #ffffff;
	}

	.submit.is-off {
		background-color: #f0f2f1;
		color: #b9c1be;
	}

	/* ---------- 协议 ---------- */
	.agree {
		display: flex;
		align-items: flex-start;
		margin-top: 36rpx;
	}

	.checkbox {
		position: relative;
		flex-shrink: 0;
		width: 30rpx;
		height: 30rpx;
		margin-top: 3rpx;
		border-radius: 50%;
		border: 2rpx solid #d2d8d5;
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
		top: 6rpx;
		width: 9rpx;
		height: 5rpx;
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
		font-size: 22rpx;
		line-height: 1.6;
		color: #9aa4a0;
	}

	.agree-link {
		color: $duck-primary;
	}

	/* ---------- 底部 ---------- */
	.foot {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
		padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
	}

	.guest {
		padding: 16rpx 32rpx;
		font-size: 26rpx;
		color: #9aa4a0;
	}
</style>
