<template>
	<view class="qa">
		<!-- 渐变头部 -->
		<view class="duck-head qa-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">问答详解</text>
				<view class="nav-fav" hover-class="nav-fav-hover" @tap="toggleFav">
					<text class="nav-fav-txt" :class="{ 'is-on': fav }">{{ fav ? '★' : '☆' }}</text>
				</view>
				<text class="nav-cat" v-if="catName">{{ catName }}</text>
			</view>
		</view>

		<template v-if="item">
			<scroll-view class="content" scroll-y :show-scrollbar="false">
				<!-- 标题卡 -->
				<view class="hero">
					<view class="hero-tags">
						<text class="hero-tag">NO.{{ no }}</text>
						<text class="hero-tag is-level" :class="{ 'is-hard': item.level === 3 }">{{ levelText[item.level] }}</text>
						<text class="hero-tag is-plain">热度 {{ item.hot }}</text>
					</view>
					<text class="hero-title">{{ item.title }}</text>
					<view class="hero-short">
						<text class="hero-short-mark">答</text>
						<text class="hero-short-txt">{{ item.short }}</text>
					</view>
				</view>

				<!-- 回答重点 -->
				<view class="sec">
					<view class="sec-head">
						<text class="sec-title">回答重点</text>
						<text class="sec-tag">{{ item.points.length }} 条</text>
					</view>
					<view class="pt" v-for="(p, i) in item.points" :key="i">
						<view class="pt-no">
							<text class="pt-no-txt duck-num">{{ i + 1 }}</text>
						</view>
						<text class="pt-txt">{{ p }}</text>
					</view>
				</view>

				<!-- 详细答案 -->
				<view class="sec">
					<view class="sec-head">
						<text class="sec-title">详细答案</text>
					</view>
					<view class="para" v-for="(d, i) in item.detail" :key="i">
						<view class="para-head">
							<view class="para-bar"></view>
							<text class="para-h">{{ d.h }}</text>
						</view>
						<text class="para-p">{{ d.p }}</text>
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

				<!-- 扩展知识 -->
				<view class="sec sec-ext" v-if="item.extend && item.extend.length">
					<view class="sec-head">
						<text class="sec-title">扩展知识</text>
						<text class="sec-tag">追问备用</text>
					</view>
					<view class="ext-row" v-for="(e, i) in item.extend" :key="i">
						<view class="ext-dot"></view>
						<text class="ext-txt">{{ e }}</text>
					</view>
				</view>

				<!-- 上一题 / 下一题 -->
				<view class="switch-card">
					<view class="switch-item" :class="{ 'is-off': !prev }" hover-class="switch-hover" @tap="goPrev">
						<text class="switch-label">上一题</text>
						<text class="switch-title duck-ellipsis">{{ prev ? prev.title : '已经是第一题' }}</text>
					</view>
					<view class="switch-line"></view>
					<view class="switch-item is-right" :class="{ 'is-off': !next }" hover-class="switch-hover" @tap="goNext">
						<text class="switch-label">下一题</text>
						<text class="switch-title duck-ellipsis">{{ next ? next.title : '已经是最后一题' }}</text>
					</view>
				</view>

				<view class="foot-tip">
					<text class="foot-tip-txt">{{ sourceTip }}</text>
				</view>

				<view class="bottom-space"></view>
			</scroll-view>

			<!-- 底部操作 -->
			<view class="foot">
				<view class="foot-btn" hover-class="foot-btn-hover" @tap="goRand">
					<text class="foot-btn-txt">随机看一题</text>
					<view class="duck-ic-arrow is-white"></view>
				</view>
			</view>
		</template>

		<view class="duck-empty qa-empty" v-else>
			<text class="duck-empty-title">没有找到这道题</text>
			<text class="duck-empty-desc">它可能已经被移除，回题库看看其他题目</text>
		</view>
	</view>
</template>

<script>
	import { categories, levelText, findQa, qaOfCat, randomQa } from '@/common/interview-data.js'
	import { isFavorite, toggleFavorite, recordAnswer } from '@/common/interview-store.js'

	export default {
		data() {
			return {
				statusBar: 0,
				id: '',
				catId: 'js',
				item: null,
				fav: false,
				levelText: levelText
			}
		},
		computed: {
			catName() {
				const c = categories.find((x) => x.id === this.catId)
				return c ? c.name : ''
			},
			list() {
				return qaOfCat(this.catId)
			},
			index() {
				return this.list.findIndex((q) => q.id === this.id)
			},
			prev() {
				return this.index > 0 ? this.list[this.index - 1] : null
			},
			next() {
				return this.index > -1 && this.index < this.list.length - 1 ? this.list[this.index + 1] : null
			},
			no() {
				const i = this.index
				const n = i > -1 ? i + 1 : 0
				return n < 10 ? '0' + n : '' + n
			},
			sourceTip() {
				return '共 ' + this.list.length + ' 道 ' + this.catName + ' 问答 · 题目与解析参考自面试鸭'
			},
			codeLang() {
				const map = { js: 'javascript', ts: 'typescript', css: 'css', html: 'html', vue: 'vue', react: 'jsx', node: 'javascript', browser: 'javascript', build: 'javascript', algo: 'javascript', py: 'python' }
				return map[this.catId] || 'javascript'
			}
		},
		onLoad(options) {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.id = (options && options.id) || ''
			this.item = findQa(this.id)
			this.catId = (options && options.cat) || (this.item && this.item.cat) || 'js'
			if (this.item) {
				// 打开即记为已读：用于阅读进度、今日打卡与「已读记录」
				recordAnswer(this.item.id, true)
				this.fav = isFavorite(this.item.id)
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			toggleFav() {
				if (!this.item) return
				this.fav = toggleFavorite(this.item.id)
				uni.showToast({ title: this.fav ? '已收藏' : '已取消收藏', icon: 'none' })
			},
			open(target) {
				if (!target) return
				uni.redirectTo({
					url: '/pages/interview/qa/qa?id=' + target.id + '&cat=' + target.cat
				})
			},
			goPrev() {
				this.open(this.prev)
			},
			goNext() {
				this.open(this.next)
			},
			goRand() {
				const q = randomQa(this.catId, this.id)
				if (!q) {
					uni.showToast({ title: '暂时没有更多题目', icon: 'none' })
					return
				}
				this.open(q)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qa {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 头部 ---------- */
	.qa-head {
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

	.nav-fav {
		margin-left: auto;
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-fav-hover {
		opacity: 0.7;
	}

	.nav-fav-txt {
		font-size: 36rpx;
		line-height: 1;
		color: rgba(255, 255, 255, 0.82);
	}

	.nav-fav-txt.is-on {
		color: #ffd34d;
	}

	.nav-cat {
		margin-left: 12rpx;
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
		padding: 30rpx 28rpx 28rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
	}

	.hero-tags {
		display: flex;
		align-items: center;
	}

	.hero-tag {
		height: 36rpx;
		line-height: 36rpx;
		padding: 0 14rpx;
		margin-right: 10rpx;
		border-radius: 8rpx;
		background-color: $duck-primary-soft;
		color: $duck-primary-dark;
		font-size: 20rpx;
		font-weight: 600;
	}

	.hero-tag.is-level {
		background-color: #eef4ff;
		color: #3b6fe0;
	}

	.hero-tag.is-level.is-hard {
		background-color: #fff2e8;
		color: #d97706;
	}

	.hero-tag.is-plain {
		background-color: #f4f6f5;
		color: $duck-text-muted;
		font-weight: 500;
	}

	.hero-title {
		display: block;
		margin-top: 18rpx;
		font-size: 38rpx;
		font-weight: 700;
		line-height: 1.4;
		color: $duck-text;
	}

	.hero-short {
		display: flex;
		align-items: flex-start;
		margin-top: 20rpx;
		padding: 20rpx 22rpx;
		border-radius: 14rpx;
		background-color: #f4fbf7;
	}

	.hero-short-mark {
		width: 36rpx;
		height: 36rpx;
		line-height: 36rpx;
		text-align: center;
		border-radius: 8rpx;
		background-color: $duck-primary;
		color: #ffffff;
		font-size: 20rpx;
		font-weight: 700;
		flex-shrink: 0;
		margin-right: 14rpx;
		margin-top: 4rpx;
	}

	.hero-short-txt {
		flex: 1;
		font-size: 25rpx;
		line-height: 1.68;
		color: $duck-primary-dark;
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

	/* 要点 */
	.pt {
		display: flex;
		align-items: flex-start;
		margin-top: 16rpx;
	}

	.pt:first-of-type {
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

	/* 详细答案 */
	.para + .para {
		margin-top: 26rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #f0f3f1;
	}

	.para-head {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.para-bar {
		width: 6rpx;
		height: 26rpx;
		border-radius: 4rpx;
		background: linear-gradient(180deg, #5be0ac 0%, #00b578 100%);
		margin-right: 12rpx;
	}

	.para-h {
		font-size: 26rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.para-p {
		display: block;
		font-size: 26rpx;
		line-height: 1.78;
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

	/* 扩展知识 */
	.sec-ext {
		background-color: #f6fbf8;
		box-shadow: none;
	}

	.ext-row {
		display: flex;
		align-items: flex-start;
		margin-top: 14rpx;
	}

	.ext-row:first-of-type {
		margin-top: 0;
	}

	.ext-dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: $duck-primary;
		flex-shrink: 0;
		margin-top: 14rpx;
		margin-right: 14rpx;
	}

	.ext-txt {
		flex: 1;
		font-size: 25rpx;
		line-height: 1.7;
		color: $duck-text-sub;
	}

	/* 上一题 / 下一题 */
	.switch-card {
		display: flex;
		align-items: stretch;
		margin-top: 24rpx;
		padding: 22rpx 20rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(20, 32, 26, 0.05);
	}

	.switch-item {
		flex: 1;
		min-width: 0;
		padding: 0 8rpx;
	}

	.switch-item.is-right {
		text-align: right;
	}

	.switch-item.is-off {
		opacity: 0.42;
	}

	.switch-hover {
		opacity: 0.6;
	}

	.switch-label {
		display: block;
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.switch-title {
		display: block;
		margin-top: 6rpx;
		font-size: 25rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.switch-line {
		width: 1rpx;
		background-color: #eef1ef;
		margin: 4rpx 6rpx;
	}

	.foot-tip {
		margin-top: 20rpx;
		text-align: center;
	}

	.foot-tip-txt {
		font-size: 20rpx;
		color: #b3beb8;
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

	.qa-empty {
		margin-top: 120rpx;
	}
</style>
