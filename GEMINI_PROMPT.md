# Gemini Prompt 模板

用于生成课文数据的 prompt，复制后替换【】内的内容：

```
请根据【小学四年级语文上册第X课《课文名》】的内容，生成以下JSON格式的生字词数据。

要求：
1. recognitionChars（识字表）：课本要求会认的字，需要提供组词和释义
2. writingChars（写字表）：课本要求会写的字，需要提供组词和释义
3. words（词语表）：课本要求掌握的词语，需要提供释义
4. 每个字/词的释义要简洁易懂，适合小学生理解
5. 组词要选择常用、学生容易理解的词语
6. 为每个拼音选项生成3个干扰项（相近读音），用于选择题
7. isOptional 表示是否为选读课文

请严格按照以下JSON格式输出：

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
  "writingChars": [
    {
      "char": "潮",
      "pinyin": "cháo",
      "word": "潮水",
      "definition": "海水定时涨落的现象",
      "wrongOptions": ["cáo", "zhāo", "sháo"]
    }
  ],
  "words": [
    {
      "word": "奇观",
      "pinyin": "qí guān",
      "definition": "奇特而又少见的景象",
      "wrongOptions": ["qǐ guān", "qí guàn", "jī guān"]
    }
  ]
}

注意：
- wrongOptions 必须是3个与正确拼音相近但不同的选项，用于出选择题
- 干扰项要合理，可以是声调不同、声母相近或韵母相近的拼音
- 选读课文（课文名带*号）设置 isOptional: true
- 选读课文通常只有 recognitionChars，writingChars 和 words 为空数组
- 只输出JSON，不要其他解释文字
```

## 数据文件格式

文件路径: `public/lessons/grade4-semester1.json`

```json
{
  "grade": "四年级",
  "semester": "上册",
  "units": [
    { "lessonId": 1, "lessonName": "观潮", ... },
    { "lessonId": 2, "lessonName": "走月亮", ... }
  ]
}
```

注意：`units` 字段直接存放课文数组（没有单元层）。

## 添加新学期数据

1. 用 Gemini 生成每课的 JSON 数据
2. 合并到一个文件，如 `public/lessons/grade4-semester2.json`
3. 更新 `public/lessons/index.json` 添加新学期索引
