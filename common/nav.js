/**
 * 自定义导航栏（navigationStyle: custom）的两个小工具
 *
 * menuSafeRight()  微信右上角胶囊按钮占掉的宽度（px），用来给右侧留安全区，
 *                  否则自绘的「取消 / 收藏 / 重开」会被胶囊盖住；H5、App 返回 0
 * navBack(url)     返回上一页；没有上一页（分享进入、首屏直接打开）时跳到指定页
 */

export function menuSafeRight() {
	try {
		if (typeof uni.getMenuButtonBoundingClientRect !== 'function') return 0
		const rect = uni.getMenuButtonBoundingClientRect()
		if (!rect || !rect.width || !rect.left) return 0
		const info = uni.getSystemInfoSync()
		// 胶囊左边界到屏幕右边的距离 + 8px 呼吸位
		const width = info.windowWidth - rect.left + 8
		return width > 0 ? width : 0
	} catch (e) {
		return 0
	}
}

export function navBack(url) {
	uni.navigateBack({
		delta: 1,
		fail: () => {
			if (!url) return
			uni.switchTab({
				url,
				fail: () => {
					uni.reLaunch({ url })
				}
			})
		}
	})
}
