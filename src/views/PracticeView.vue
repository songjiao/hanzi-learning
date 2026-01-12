<template>
  <div class="practice-view">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">← 返回选择</button>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="progress-text">{{ currentIndex + 1 }} / {{ totalItems }}</span>
    </div>

    <!-- 练习完成 -->
    <div v-if="isCompleted" class="completed card">
      <h2>练习完成！</h2>
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ correctCount }}</span>
          <span class="stat-label">正确</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ wrongCount }}</span>
          <span class="stat-label">错误</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ Math.round(accuracy) }}%</span>
          <span class="stat-label">正确率</span>
        </div>
      </div>
      <div class="completed-actions">
        <button class="btn btn-primary" @click="restart">再练一次</button>
        <button class="btn btn-outline" @click="goBack">选择其他</button>
      </div>
    </div>

    <!-- 识字表练习 -->
    <div v-else-if="practiceType === 'recognition'" class="practice-content">
      <RecognitionPractice
        :item="currentItem"
        :show-result="showResult"
        :selected-answer="selectedAnswer"
        @select="handleSelect"
      />
    </div>

    <!-- 写字表练习 -->
    <div v-else-if="practiceType === 'writing'" class="practice-content">
      <WritingPractice
        :item="currentItem"
        :key="currentIndex"
        @complete="handleWritingComplete"
      />
    </div>

    <!-- 词语表练习 -->
    <div v-else-if="practiceType === 'words'" class="practice-content">
      <WordsPractice
        :item="currentItem"
        :show-result="showResult"
        :selected-answer="selectedAnswer"
        @select="handleSelect"
      />
    </div>

    <!-- 下一题按钮 -->
    <div v-if="showResult && !isCompleted" class="next-section">
      <button class="btn btn-primary" @click="nextItem">
        {{ currentIndex < totalItems - 1 ? '下一题' : '查看结果' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLessonStore } from '../stores/lessonStore'
import { useProgressStore } from '../stores/progressStore'
import RecognitionPractice from '../components/RecognitionPractice.vue'
import WritingPractice from '../components/WritingPractice.vue'
import WordsPractice from '../components/WordsPractice.vue'

const route = useRoute()
const router = useRouter()
const lessonStore = useLessonStore()
const progressStore = useProgressStore()

const practiceType = computed(() => route.params.type)
const currentIndex = ref(0)
const showResult = ref(false)
const selectedAnswer = ref(null)
const correctCount = ref(0)
const wrongCount = ref(0)
const isCompleted = ref(false)

// 获取练习项目列表
const items = computed(() => {
  const lesson = lessonStore.currentLesson
  if (!lesson) return []

  switch (practiceType.value) {
    case 'recognition':
      return lesson.recognitionChars || []
    case 'writing':
      return lesson.writingChars || []
    case 'words':
      return lesson.words || []
    default:
      return []
  }
})

const totalItems = computed(() => items.value.length)
const currentItem = computed(() => items.value[currentIndex.value])

const progressPercent = computed(() => {
  if (totalItems.value === 0) return 0
  if (isCompleted.value) return 100
  return ((currentIndex.value + 1) / totalItems.value) * 100
})

const accuracy = computed(() => {
  const total = correctCount.value + wrongCount.value
  if (total === 0) return 0
  return (correctCount.value / total) * 100
})

onMounted(() => {
  if (!lessonStore.currentLesson) {
    router.push('/select')
  }
})

function handleSelect(answer) {
  if (showResult.value) return

  selectedAnswer.value = answer
  const correct = answer === currentItem.value.pinyin

  // 保存进度
  const semesterKey = `${lessonStore.selectedGrade}-${lessonStore.selectedSemester}`
  const charKey = currentItem.value.char || currentItem.value.word
  progressStore.updateCharProgress(
    semesterKey,
    lessonStore.selectedLesson,
    practiceType.value,
    charKey,
    correct
  )

  if (correct) {
    correctCount.value++
    // 正确时直接跳转下一题
    setTimeout(() => {
      nextItem()
    }, 300)
  } else {
    wrongCount.value++
    showResult.value = true
  }
}

function handleWritingComplete(result) {
  const correct = result.success
  showResult.value = true

  if (correct) {
    correctCount.value++
  } else {
    wrongCount.value++
  }

  // 保存进度
  const semesterKey = `${lessonStore.selectedGrade}-${lessonStore.selectedSemester}`
  progressStore.updateCharProgress(
    semesterKey,
    lessonStore.selectedLesson,
    practiceType.value,
    currentItem.value.char,
    correct
  )
}

function nextItem() {
  if (currentIndex.value < totalItems.value - 1) {
    currentIndex.value++
    showResult.value = false
    selectedAnswer.value = null
  } else {
    isCompleted.value = true
  }
}

function restart() {
  currentIndex.value = 0
  showResult.value = false
  selectedAnswer.value = null
  correctCount.value = 0
  wrongCount.value = 0
  isCompleted.value = false
}

function goBack() {
  router.push('/select')
}
</script>

<style scoped>
.practice-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding: 0;
  overflow: hidden;
}

.back-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0;
  flex-shrink: 0;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.progress-section .progress-bar {
  flex: 1;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-light);
  white-space: nowrap;
}

.practice-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.next-section {
  flex-shrink: 0;
  padding-top: 0.5rem;
}

.next-section .btn {
  width: 100%;
}

.completed {
  text-align: center;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.completed h2 {
  color: var(--success-color);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-light);
}

.completed-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
