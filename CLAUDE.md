# 汉字学习应用 - Claude 开发指南

## 项目概述

基于 Vue 3 的纯前端汉字学习应用，面向小学生，用于练习语文课本中的生字词。

## 技术栈

- Vue 3 + Vite
- Vue Router (路由)
- Pinia (状态管理)
- Hanzi Writer (汉字书写验证)
- localStorage (进度存储)

## 项目结构

```
hanzi-learning/
├── public/lessons/          # 课文数据（JSON格式）
│   ├── index.json           # 数据索引
│   └── grade4-semester1.json
├── src/
│   ├── main.js              # 入口
│   ├── App.vue              # 根组件
│   ├── router/index.js      # 路由配置
│   ├── stores/
│   │   ├── lessonStore.js   # 课文数据状态
│   │   └── progressStore.js # 学习进度状态
│   ├── composables/
│   │   └── useHanziWriter.js # Hanzi Writer 封装
│   ├── components/
│   │   ├── RecognitionPractice.vue  # 识字练习
│   │   ├── WritingPractice.vue      # 写字练习
│   │   └── WordsPractice.vue        # 词语练习
│   ├── views/
│   │   ├── HomeView.vue     # 首页
│   │   ├── SelectView.vue   # 选择页
│   │   ├── PracticeView.vue # 练习页
│   │   └── ProgressView.vue # 进度页
│   └── styles/
│       └── main.css         # 全局样式
├── GEMINI_PROMPT.md         # Gemini 生成数据的 prompt
└── package.json
```

## 常用命令

```bash
npm install    # 安装依赖
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
```

## 核心功能

### 练习模式

1. **识字表练习**：显示汉字+组词+释义，选择正确拼音（答对自动下一题）
2. **写字表练习**：显示拼音+组词+释义（汉字用拼音替代），书写汉字验证笔顺
3. **词语表练习**：显示词语+释义，选择正确拼音

### 数据格式

课文数据示例 (`public/lessons/grade4-semester1.json`)：
```json
{
  "grade": "四年级",
  "semester": "上册",
  "units": [
    {
      "lessonId": 1,
      "lessonName": "观潮",
      "isOptional": false,
      "recognitionChars": [
        {
          "char": "盐",
          "pinyin": "yán",
          "word": "食盐",
          "definition": "一种白色晶体，用来调味",
          "wrongOptions": ["yǐn", "yàn", "yuán"]
        }
      ],
      "writingChars": [...],
      "words": [...]
    }
  ]
}
```

### 进度存储

使用 localStorage 存储学习进度，key 为 `hanzi_learning_progress`。

## 开发注意事项

1. **数据同步**：修改 `lessons/` 目录下的数据后，需同步到 `public/lessons/`
2. **移动端适配**：页面需在一屏内显示完整，不需要滚动
3. **书写验证**：使用 Hanzi Writer 库，默认不显示灰色轮廓
4. **答题逻辑**：选择题答对自动跳转下一题，答错显示正确答案

## 添加新课文数据

1. 参考 `GEMINI_PROMPT.md` 使用 Gemini 生成数据
2. 将生成的 JSON 添加到对应学期的数据文件
3. 更新 `public/lessons/index.json` 索引
