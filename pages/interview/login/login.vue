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

			<!-- 登录 / 注册切换：只靠字重、颜色和下划线区分，不加底色块 -->
			<view class="tabs">
				<view class="tab" :class="{ 'is-on': mode === 'login' }" @tap="switchMode('login')">
					<text class="tab-txt">登录</text>
				</view>
				<view class="tab" :class="{ 'is-on': mode === 'register' }" @tap="switchMode('register')">
					<text class="tab-txt">注册</text>
				</view>
			</view>

			<text class="sub">{{ mode === 'login' ? '账号密码登录，进度跨设备同步' : '注册后自动登录，游客记录会合并过来' }}</text>

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

				<!-- 昵称：只有注册时出现，留空就用账号名 -->
				<view v-if="mode === 'register'" class="row" :class="{ 'is-focus': active === 'nick' }">
					<input
						class="input"
						v-model="nickname"
						:maxlength="20"
						placeholder="昵称（可选）"
						placeholder-class="ph"
						confirm-type="next"
						@focus="active = 'nick'"
						@blur="active = ''"
					/>
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
						@confirm="submit"
					/>
					<view class="eye" :class="{ 'is-off': !showPwd }" @tap="showPwd = !showPwd">
						<view class="eye-slash"></view>
					</view>
				</view>

				<!-- 图形验证码 -->
				<view class="row" :class="{ 'is-focus': active === 'cap' }">
					<input
						class="input"
						v-model="captchaCode"
						:maxlength="4"
						placeholder="图形验证码"
						placeholder-class="ph"
						confirm-type="done"
						@focus="active = 'cap'"
						@blur="active = ''"
						@confirm="submit"
					/>
					<!-- 点图换一张：一是一次性，二是不给脚本读答案的机会 -->
					<view class="cap" hover-class="cap-hover" @tap="refreshCaptcha">
						<image v-if="captchaImage" class="cap-img" :src="captchaImage" mode="scaleToFill" />
						<view v-else class="cap-empty">
							<text class="cap-empty-txt">{{ captchaLoading ? '加载中' : '点击重试' }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="submit" :class="canSubmit ? 'is-on' : 'is-off'" hover-class="submit-hover" @tap="submit">
				<text>{{ loading ? '处理中…' : mode === 'login' ? '登录' : '注册' }}</text>
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
	import { loginPassword, register, loginGuest, getUser, getToken, getBaseUrl, fetchCaptcha } from '@/common/api.js'
	import { syncUserData } from '@/common/user-store.js'
	import { menuSafeRight } from '@/common/nav.js'
	import { showLoading, hideLoading, hidePageLoading } from '@/common/loading.js'

	const ACCOUNT_RE = /^[A-Za-z0-9_]{3,20}$/

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				/** login / register：两种模式共用一套表单，只是提交的接口不同 */
				mode: 'login',
				account: '',
				nickname: '',
				password: '',
				showPwd: false,
				agreed: false,
				loading: false,
				active: '',
				/** 图形验证码：id + 图片（base64），答案只在服务端 */
				captchaId: '',
				captchaImage: '',
				captchaCode: '',
				captchaLoading: false,
				/** 进页面时缓存的用户，用来判断「已经是登录状态」还是游客 */
				current: null
			}
		},
		computed: {
			accountOk() {
				return ACCOUNT_RE.test(this.account)
			},
			canSubmit() {
				return (
					this.agreed &&
					this.accountOk &&
					this.password.length >= 6 &&
					this.captchaCode.length === 4 &&
					!this.loading
				)
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
			this.refreshCaptcha()
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

			/* ---------- 图形验证码 ---------- */
			/** 换一张验证码。点图 / 登录失败时都会调 */
			async refreshCaptcha() {
				if (this.captchaLoading) return
				this.captchaLoading = true
				this.captchaCode = ''
				try {
					const res = await fetchCaptcha()
					this.captchaId = res.captcha_id || ''
					this.captchaImage = res.image || ''
				} catch (e) {
					// 图加载不出来通常就是后端没启动，这里不弹窗打断，
					// 占位文字提示「点击重试」，真去提交时 submit 会给出详细原因
					this.captchaId = ''
					this.captchaImage = ''
				} finally {
					this.captchaLoading = false
				}
			},

			/* ---------- 登录 / 注册 ---------- */
			/** 切换模式。密码和验证码都清掉：验证码是一次性的，换模式必须换图 */
			switchMode(next) {
				if (this.mode === next || this.loading) return
				this.mode = next
				this.password = ''
				this.captchaCode = ''
				this.active = ''
				this.refreshCaptcha()
			},

			async submit() {
				if (this.loading) return
				if (!this.accountOk) {
					uni.showToast({ title: '账号需 3-20 位字母、数字或下划线', icon: 'none' })
					return
				}
				if (this.password.length < 6) {
					uni.showToast({ title: '密码至少 6 位', icon: 'none' })
					return
				}
				if (this.captchaCode.length !== 4) {
					uni.showToast({ title: '请输入图形验证码', icon: 'none' })
					return
				}
				if (!this.agreed) {
					uni.showToast({ title: '请先勾选同意协议', icon: 'none' })
					return
				}

				const isRegister = this.mode === 'register'
				this.loading = true
				showLoading(isRegister ? '注册中' : '登录中')
				try {
					const payload = {
						account: this.account,
						password: this.password,
						captchaId: this.captchaId,
						captchaCode: this.captchaCode
					}
					if (isRegister) {
						payload.nickname = this.nickname
						await register(payload)
					} else {
						await loginPassword(payload)
					}
					// 换账号后重新拉一遍服务端数据，页面上立刻是新账号的进度
					await syncUserData({ silent: true })
					hideLoading()
					uni.showToast({ title: isRegister ? '注册成功' : '登录成功', icon: 'success' })
					this.leave()
				} catch (e) {
					hideLoading()
					// 验证码是一次性的：不管哪一步失败，服务端都已经把它作废了，
					// 所以必须换一张，否则用户再点提交一定还是同样的报错
					this.refreshCaptcha()
					// 注册时账号被占用，直接把人引到登录，省得自己再切一次
					if (isRegister && e && e.status === 409) {
						this.mode = 'login'
						uni.showToast({ title: '该账号已注册，请直接登录', icon: 'none' })
						return
					}
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
					// 连不上时把地址亮出来，省得猜是网络问题还是服务挂了
					uni.showModal({
						title: '连不上服务器',
						content:
							'当前接口地址：' +
							getBaseUrl() +
							'\n\n请检查：\n1. 网络是否正常\n2. 开发者工具是否勾选「不校验合法域名」\n3. 服务器上的 duck-api 是否在运行',
						showCancel: false,
						confirmText: '知道了'
					})
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
		/* 支付宝那种「上半屏一层柔和色晕，往下沉成中性浅灰」。
		   表单块做成白色浮卡，所以在浅灰底上才有层次；一片纯白反而糊成一团 */
		background-color: #f4f8f6;
		background-image: linear-gradient(
			180deg,
			#d6f2e4 0rpx,
			#e8f8f0 240rpx,
			#f4faf7 620rpx,
			#f4f8f6 100%
		);
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

	/* 登录 / 注册切换：只靠字重、颜色和一小段主色下划线区分，不放色块 */
	.tabs {
		display: flex;
		align-items: baseline;
		margin-top: 40rpx;
	}

	.tab {
		position: relative;
		margin-right: 48rpx;
		padding-bottom: 14rpx;
	}

	.tab-txt {
		font-size: 46rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #9faaa5;
		transition: color 0.18s ease;
	}

	.tab.is-on .tab-txt {
		font-weight: 700;
		color: $duck-text;
	}

	.tab.is-on::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 40rpx;
		height: 6rpx;
		border-radius: 3rpx;
		background-color: $duck-primary;
	}

	.sub {
		display: block;
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #7f8d87;
	}

	/* ---------- 表单 ---------- */
	.form {
		margin-top: 64rpx;
	}

	/* 支付宝式输入框：白色圆角浮卡，聚焦时描主色边 + 一点主色光晕。
	   不用下划线，去掉那一圈灰线页面会干净很多 */
	.row {
		display: flex;
		align-items: center;
		height: 104rpx;
		padding: 0 28rpx;
		border: 2rpx solid transparent;
		border-radius: 22rpx;
		background-color: #ffffff;
		box-shadow: 0 4rpx 18rpx rgba(18, 72, 52, 0.05);
		box-sizing: border-box;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
	}

	.row + .row {
		margin-top: 24rpx;
	}

	.row.is-focus {
		border-color: $duck-primary;
		box-shadow: 0 6rpx 24rpx rgba(0, 181, 120, 0.14);
	}

	.input {
		flex: 1;
		height: 100rpx;
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

	/* ---------- 图形验证码 ---------- */
	/* 图片是 110×40 px 的透明底 PNG，按 2.75 的宽高比换成 rpx，避免拉伸变形；
	   透明底是为了让它直接坐在输入框的浅灰底上，不出现一块突兀的灰方块 */
	.cap {
		flex-shrink: 0;
		width: 220rpx;
		height: 80rpx;
		margin-left: 16rpx;
	}

	.cap-hover {
		opacity: 0.6;
	}

	.cap-img {
		display: block;
		width: 220rpx;
		height: 80rpx;
	}

	.cap-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		border-radius: 8rpx;
		background-color: #eff2f0;
	}

	.cap-empty-txt {
		font-size: 22rpx;
		color: #8c9591;
	}

	/* ---------- 按钮 ---------- */
	.submit {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100rpx;
		margin-top: 56rpx;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: 600;
		transition: opacity 0.18s ease;
	}

	.submit-hover {
		opacity: 0.88;
	}

	.submit.is-on {
		background-color: $duck-primary;
		color: #ffffff;
		box-shadow: 0 10rpx 26rpx rgba(0, 181, 120, 0.22);
	}

	.submit.is-off {
		background-color: #e7ecea;
		color: #a9b3ae;
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
		color: #7f8d87;
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
		color: #7f8d87;
	}
</style>
