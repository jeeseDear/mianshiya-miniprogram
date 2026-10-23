<template>
	<view class="know">
		<!-- 渐变头部 -->
		<view class="duck-head know-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">知识点</text>
				<text class="nav-cat" v-if="catName">{{ catName }}</text>
			</view>
		</view>

		<template v-if="item">
			<scroll-view class="content" scroll-y :show-scrollbar="false">
				<!-- 标题卡 -->
				<view class="hero">
					<text class="hero-tag">{{ catName }} · 基础知识点</text>
					<text class="hero-title">{{ item.title }}</text>
					<text class="hero-summary">{{ item.summary }}</text>
				</view>

				<!-- 核心要点（加载中显示占位，避免出现「0 条」空块） -->
				<view class="sec" v-if="!detailLoading">
					<view class="sec-head">
						<text class="sec-title">核心要点</text>
						<text class="sec-tag">{{ item.points.length }} 条</text>
					</view>
					<view class="pt" v-for="(p, i) in item.points" :key="i">
						<view class="pt-no">
							<text class="pt-no-txt duck-num">{{ i + 1 }}</text>
						</view>
						<text class="pt-txt">{{ p }}</text>
					</view>
				</view>
				<view class="sec" v-else>
					<view class="sec-head">
						<text class="sec-title">核心要点</text>
						<text class="sec-tag">加载中…</text>
					</view>
				</view>

				<!-- 代码示例 -->
				<view class="sec" v-if="item.code">
					<view class="sec-head">
						<text class="sec-title">代码示例</text>
					</view>
					<view class="code">
						<view class="code-head">
							<view class="code-dot"></view>
							<view class="code-dot"></view>
							<view class="code-dot"></view>
							<text class="code-lang">{{ codeLang }}</text>
						</view>
						<text class="code-text">{{ item.code }}</text>
					</view>
				</view>

				<!-- 易错点 -->
				<view class="sec sec-tip" v-if="item.tips && item.tips.length">
					<view class="sec-head">
						<text class="sec-title">易错 & 追问</text>
					</view>
					<view class="tip-row" v-for="(t, i) in item.tips" :key="i">
						<text class="tip-mark">!</text>
						<text class="tip-txt">{{ t }}</text>
					</view>
				</view>

				<!-- 下一篇 -->
				<view class="next" v-if="next" hover-class="duck-row-hover" @tap="goNext">
					<view class="next-body">
						<text class="next-label">下一篇</text>
						<text class="next-title duck-ellipsis">{{ next.title }}</text>
					</view>
					<view class="duck-ic-arrow"></view>
				</view>

				<view class="bottom-space"></view>
			</scroll-view>

			<!-- 底部操作 -->
			<view class="foot">
				<view class="foot-btn" hover-class="foot-btn-hover" @tap="goQuiz">
					<text class="foot-btn-txt">看「{{ catName }}」问答详解</text>
					<view class="duck-ic-arrow is-white"></view>
				</view>
			</view>
		</template>

		<view class="duck-empty know-empty" v-else>
			<text class="duck-empty-title">没有找到这个知识点</text>
			<text class="duck-empty-desc">它可能已经被移除，回题库看看其他内容</text>
		</view>
	</view>
</template>

<script>
	import { getCategories, randomQa, findKnowledge, knowledgeOfCat, fetchKnowledgeDetail } from '@/common/question-source.js'
	import { menuSafeRight, navBack } from '@/common/nav.js'

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				id: '',
				catId: '',
				item: null,
				detailLoading: false
			}
		},
		computed: {
			catName() {
				const c = getCategories().find((x) => x.id === this.catId)
				return c ? c.name : ''
			},
			codeLang() {
				return this.catId === 'py' ? 'python' : this.catId === 'css' ? 'css' : this.catId === 'html' ? 'html' : this.catId === 'ts' ? 'typescript' : 'javascript'
			},
			next() {
				const list = knowledgeOfCat(this.catId)
				const i = list.findIndex((k) => k.id === this.id)
				return i > -1 && i < list.length - 1 ? list[i + 1] : null
			}
		},
		onLoad(options) {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.menuRight = menuSafeRight()
			this.id = (options && options.id) || ''

			// 先用摘要占位，标题立即可见
			const brief = findKnowledge(this.id)
			this.catId = (options && options.cat) || (brief && brief.cat) || ''
			if (brief) {
				this.item = {
					id: brief.id,
					cat: brief.cat,
					title: brief.title,
					summary: brief.summary,
					points: [],
					code: '',
					tips: []
				}
			}

			this.loadDetail()
		},
		methods: {
			async loadDetail() {
				if (!this.id) return
				this.detailLoading = true
				try {
					const detail = await fetchKnowledgeDetail(this.id)
					this.item = detail
					this.catId = detail.cat || this.catId
				} catch (e) {
					uni.showToast({ title: '知识点加载失败', icon: 'none' })
				} finally {
					this.detailLoading = false
				}
			},
			goBack() {
				navBack('/pages/interview/index/index')
			},
			goNext() {
				const n = this.next
				if (!n) return
				uni.redirectTo({
					url: '/pages/interview/knowledge/knowledge?id=' + n.id + '&cat=' + n.cat
				})
			},
			goQuiz() {
				// 点底部按钮直接进本分类的问答详解
				const q = randomQa(this.catId)
				if (q) {
					uni.navigateTo({
						url: '/pages/interview/qa/qa?id=' + q.id + '&cat=' + q.cat
					})
					return
				}
				try {
					uni.setStorageSync('duck:bank-cat', this.catId)
				} catch (e) {
					// ignore
				}
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.know {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 头部 ---------- */
	.know-head {
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

	.nav-cat {
		margin-left: auto;
		height: 44rpx;
		line-height: 44rpx;
		padding: 0 18rpx;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.22);
		font-size: 21rpx;
		color: #ffffff;
	}

	/* ---------- 内容 ---------- */
	.content {
		flex: 1;
		height: 0;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.hero {
		margin-top: 24rpx;
		padding: 32rpx 28rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
	}

	.hero-tag {
		display: inline-block;
		height: 38rpx;
		line-height: 38rpx;
		padding: 0 16rpx;
		border-radius: 8rpx;
		background-color: $duck-primary-soft;
		color: $duck-primary-dark;
		font-size: 21rpx;
		font-weight: 600;
	}

	.hero-title {
		display: block;
		margin-top: 18rpx;
		font-size: 40rpx;
		font-weight: 700;
		line-height: 1.35;
		color: $duck-text;
	}

	.hero-summary {
		display: block;
		margin-top: 14rpx;
		font-size: 26rpx;
		line-height: 1.7;
		color: $duck-text-sub;
	}

	.sec {
		margin-top: 24rpx;
		padding: 28rpx 26rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(20, 32, 26, 0.05);
	}

	.sec-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.sec-title {
		font-size: 30rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.sec-tag {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.pt {
		display: flex;
		align-items: flex-start;
		margin-top: 16rpx;
	}

	.pt:first-child {
		margin-top: 0;
	}

	.pt-no {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background-color: $duck-primary-soft;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 4rpx;
		margin-right: 14rpx;
	}

	.pt-no-txt {
		font-size: 20rpx;
		font-weight: 700;
		color: $duck-primary-dark;
	}

	.pt-txt {
		flex: 1;
		font-size: 26rpx;
		line-height: 1.72;
		color: $duck-text-sub;
	}

	/* 代码块 */
	.code {
		padding: 20rpx 22rpx 24rpx;
		background-color: #0f1a14;
		border-radius: 16rpx;
	}

	.code-head {
		display: flex;
		align-items: center;
		margin-bottom: 14rpx;
	}

	.code-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.28);
		margin-right: 10rpx;
	}

	.code-lang {
		margin-left: auto;
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.42);
	}

	.code-text {
		font-size: 23rpx;
		line-height: 1.68;
		color: #d6f5e5;
		font-family: Menlo, Consolas, monospace;
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* 易错点 */
	.sec-tip {
		background-color: #fff8ec;
		box-shadow: none;
	}

	.tip-row {
		display: flex;
		align-items: flex-start;
		margin-top: 14rpx;
	}

	.tip-row:first-of-type {
		margin-top: 0;
	}

	.tip-mark {
		width: 32rpx;
		height: 32rpx;
		line-height: 32rpx;
		text-align: center;
		border-radius: 50%;
		background-color: #ffb020;
		color: #ffffff;
		font-size: 20rpx;
		font-weight: 700;
		flex-shrink: 0;
		margin-top: 4rpx;
		margin-right: 12rpx;
	}

	.tip-txt {
		flex: 1;
		font-size: 25rpx;
		line-height: 1.7;
		color: #8a5a00;
	}

	/* 下一篇 */
	.next {
		display: flex;
		align-items: center;
		margin-top: 24rpx;
		padding: 26rpx 26rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(20, 32, 26, 0.05);
	}

	.next-body {
		flex: 1;
		min-width: 0;
		margin-right: 16rpx;
	}

	.next-label {
		display: block;
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.next-title {
		display: block;
		margin-top: 6rpx;
		font-size: 27rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.bottom-space {
		height: 40rpx;
	}

	/* ---------- 底部操作 ---------- */
	.foot {
		flex-shrink: 0;
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		box-shadow: 0 -4rpx 18rpx rgba(20, 32, 26, 0.06);
	}

	.foot-btn {
		height: 88rpx;
		border-radius: 999rpx;
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 20rpx rgba(0, 181, 120, 0.24);
	}

	.foot-btn-hover {
		opacity: 0.86;
	}

	.foot-btn-txt {
		font-size: 28rpx;
		font-weight: 600;
		color: #ffffff;
		margin-right: 6rpx;
	}

	.know-empty {
		margin-top: 120rpx;
	}
</style>
