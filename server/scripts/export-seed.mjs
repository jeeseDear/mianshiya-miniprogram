/**
 * 把前端的题库数据导出成 JSON，供后端建库使用。
 *
 * 前端数据结构（common/）是 ES Module，Node 默认按 CJS 解析 .js，
 * 所以用 `node --experimental-default-type=module` 跑（见 package.json 的 seed 脚本）。
 *
 * 运行：node --experimental-default-type=module scripts/export-seed.mjs
 * 产出：seed/questions.json  seed/categories.json  seed/knowledge.json
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../seed')
mkdirSync(outDir, { recursive: true })

const data = await import('../../common/interview-data.js')
const kb = await import('../../common/knowledge.js')

const { categories, qaQuestions } = data
const { knowledge } = kb

function save(name, payload) {
	const file = resolve(outDir, name)
	writeFileSync(file, JSON.stringify(payload, null, '\t') + '\n', 'utf8')
	const size = (JSON.stringify(payload).length / 1024).toFixed(1)
	console.log(`✔ ${name}  ${Array.isArray(payload) ? payload.length + ' 条' : ''}  ${size} KB`)
}

save('categories.json', categories)
save('questions.json', qaQuestions)
save('knowledge.json', knowledge)

const stats = categories.map((c) => `${c.id}:${qaQuestions.filter((q) => q.cat === c.id).length}`)
console.log('分类题量：', stats.join('  '))
