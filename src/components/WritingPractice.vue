<template>
  <div class="writing-practice">
    <!-- 题目信息 -->
    <div class="question-card card">
      <div class="pinyin-display">{{ item.pinyin }}</div>
      <div class="word-display">{{ maskedWord }}</div>
      <div class="definition-display">{{ maskedDefinition }}</div>
    </div>

    <!-- 书写区域 -->
    <div class="writer-section card">
      <div class="writer-header">
        <span class="stroke-info">
          笔画：{{ currentStroke }} / {{ totalStrokes }}
        </span>
        <span v-if="mistakes > 0" class="mistake-info">
          错误：{{ mistakes }}
        </span>
      </div>

      <!-- 书写画布 -->
      <div class="writer-container">
        <div ref="writerRef" class="writer-canvas"></div>
        <div v-if="isLoading" class="writer-loading">加载中...</div>
        <div v-if="loadError" class="writer-error">{{ loadError }}</div>
      </div>

      <!-- 控制按钮 -->
      <div class="writer-controls">
        <button class="btn btn-outline" @click="showAnimation">
          演示笔顺
        </button>
        <button class="btn btn-outline" @click="resetWriter">
          重写
        </button>
      </div>
    </div>

    <!-- 完成反馈 -->
    <div v-if="isCompleted" class="feedback" :class="isSuccess ? 'success' : 'error'">
      <template v-if="isSuccess">
        写得很好！
      </template>
      <template v-else>
        再练习一下吧！
      </template>
    </div>

    <!-- 完成后显示正确汉字 -->
    <div v-if="isCompleted" class="correct-char card">
      <span class="correct-label">正确写法：</span>
      <span class="correct-display">{{ item.char }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useHanziWriter } from '../composables/useHanziWriter'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])

const writerRef = ref(null)
const isCompleted = ref(false)
const isSuccess = ref(false)

const {
  isLoading,
  loadError,
  currentStroke,
  totalStrokes,
  mistakes,
  initWriter,
  animateCharacter,
  showCharacter,
  startQuiz,
  reset
} = useHanziWriter()

// 将文本中的目标字替换为拼音
function maskChar(text) {
  if (!text || !props.item?.char) return text
  return text.replace(new RegExp(props.item.char, 'g'), `(${props.item.pinyin})`)
}

// 将组词中的目标字替换
const maskedWord = computed(() => {
  return maskChar(props.item?.word)
})

// 将释义中的目标字替换
const maskedDefinition = computed(() => {
  return maskChar(props.item?.definition)
})

// 初始化并自动开始测验
function initAndStartQuiz() {
  if (writerRef.value && props.item?.char) {
    // 根据屏幕高度动态计算画布大小
    const maxSize = Math.min(window.innerHeight * 0.35, window.innerWidth - 60, 250)
    const size = Math.max(180, maxSize)
    initWriter(writerRef.value, props.item.char, {
      width: size,
      height: size,
      showOutline: false,  // 不显示轮廓
      showCharacter: false
    })

    // 等待初始化完成后自动开始测验
    nextTick(() => {
      setTimeout(() => {
        startQuizMode()
      }, 300)
    })
  }
}

onMounted(() => {
  initAndStartQuiz()
})

// 监听 item 变化，重新初始化
watch(() => props.item, (newItem) => {
  if (writerRef.value && newItem?.char) {
    isCompleted.value = false
    isSuccess.value = false
    initAndStartQuiz()
  }
}, { immediate: false })

function showAnimation() {
  showCharacter()
  animateCharacter().then(() => {
    // 动画结束后重新开始测验
    resetWriter()
  })
}

function startQuizMode() {
  startQuiz({
    showHintAfterMisses: 3,
    onCorrectStroke: () => {
      // 正确笔画反馈
    },
    onMistake: () => {
      // 错误反馈
    },
    onComplete: (summary) => {
      isCompleted.value = true
      // 错误次数少于总笔画数视为成功
      isSuccess.value = summary.totalMistakes < totalStrokes.value
      emit('complete', {
        success: isSuccess.value,
        mistakes: summary.totalMistakes,
        character: props.item.char
      })
    }
  })
}

function resetWriter() {
  reset()
  isCompleted.value = false
  isSuccess.value = false
  // 重写后自动开始测验
  nextTick(() => {
    setTimeout(() => {
      startQuizMode()
    }, 100)
  })
}
</script>

<style scoped>
.writing-practice {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.question-card {
  text-align: center;
  padding: 0.75rem;
  flex-shrink: 0;
}

.pinyin-display {
  font-size: 1.5rem;
  color: var(--primary-color);
  font-weight: bold;
}

.word-display {
  font-size: 1rem;
  color: var(--text-color);
  margin-top: 0.25rem;
}

.definition-display {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 0.25rem;
}

.writer-section {
  padding: 0.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.writer-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-light);
  flex-shrink: 0;
}

.mistake-info {
  color: var(--error-color);
}

.writer-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  border-radius: var(--radius);
  flex: 1;
  min-height: 200px;
}

.writer-canvas {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: white;
}

.writer-loading,
.writer-error {
  position: absolute;
  color: var(--text-light);
}

.writer-error {
  color: var(--error-color);
}

.writer-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.writer-controls .btn {
  flex: 1;
  padding: 0.625rem;
  font-size: 0.875rem;
}

.feedback {
  flex-shrink: 0;
  padding: 0.5rem;
  margin: 0;
}

.correct-char {
  text-align: center;
  padding: 0.5rem;
  flex-shrink: 0;
}

.correct-label {
  font-size: 0.75rem;
  color: var(--text-light);
}

.correct-display {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-color);
  display: block;
  margin-top: 0.25rem;
}
</style>
