<template>
  <div class="recognition-practice">
    <!-- 汉字展示 -->
    <div class="character-card card">
      <div class="character-display">{{ item.char }}</div>
      <div class="word-display">{{ item.word }}</div>
      <div class="definition-display">{{ item.definition }}</div>
    </div>

    <!-- 选项 -->
    <div class="options">
      <button
        v-for="option in shuffledOptions"
        :key="option"
        class="option-btn"
        :class="{
          correct: (showResult || isCorrectAnswer(option)) && option === item.pinyin,
          wrong: showResult && option === selectedAnswer && option !== item.pinyin,
          selected: option === selectedAnswer
        }"
        :disabled="showResult || selectedAnswer"
        @click="$emit('select', option)"
      >
        {{ option }}
      </button>
    </div>

    <!-- 反馈 -->
    <div v-if="showResult" class="feedback" :class="isCorrect ? 'success' : 'error'">
      {{ isCorrect ? '正确！' : `正确答案：${item.pinyin}` }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  showResult: {
    type: Boolean,
    default: false
  },
  selectedAnswer: {
    type: String,
    default: null
  }
})

defineEmits(['select'])

const isCorrect = computed(() => {
  return props.selectedAnswer === props.item.pinyin
})

// 判断是否选对了（用于立即显示绿色）
function isCorrectAnswer(option) {
  return props.selectedAnswer === option && option === props.item.pinyin
}

// 打乱选项顺序
const shuffledOptions = computed(() => {
  const options = [props.item.pinyin, ...props.item.wrongOptions]
  return shuffleArray([...options])
})

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
</script>

<style scoped>
.recognition-practice {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
}

.character-card {
  text-align: center;
  padding: 1rem;
  flex-shrink: 0;
}

.character-display {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--text-color);
  line-height: 1.1;
}

.word-display {
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.definition-display {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 0.25rem;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  flex: 1;
}

.options .option-btn {
  padding: 0.75rem;
  font-size: 1rem;
  min-height: 44px;
}

.feedback {
  flex-shrink: 0;
}
</style>
