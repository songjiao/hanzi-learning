import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sourceDir = path.resolve(__dirname, '../node_modules/hanzi-writer-data')
const targetDir = path.resolve(__dirname, '../public/hanzi-data')

// 创建目标目录
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// 复制所有 .json 文件
const files = fs.readdirSync(sourceDir)
let count = 0

files.forEach(file => {
  if (file.endsWith('.json')) {
    fs.copyFileSync(
      path.join(sourceDir, file),
      path.join(targetDir, file)
    )
    count++
  }
})

console.log(`✓ 已复制 ${count} 个汉字数据文件到 public/hanzi-data/`)
