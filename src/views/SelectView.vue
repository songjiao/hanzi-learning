<template>
  <div class="select-view">
    <!-- 加载状态 -->
    <div v-if="lessonStore.loading" class="loading">
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="lessonStore.error" class="error card">
      <p>{{ lessonStore.error }}</p>
      <button class="btn btn-primary" @click="loadData">重试</button>
    </div>

    <!-- 选择学期 -->
    <div v-else-if="!lessonStore.selectedSemester" class="selection">
      <h2>选择学期</h2>
      <div class="options-list">
        <template v-for="grade in lessonStore.lessonIndex?.availableData" :key="grade.gradeId">
          <button
            v-for="semester in grade.semesters"
            :key="`${grade.gradeId}-${semester.semesterId}`"
            class="option-btn"
            @click="selectSemester(grade.gradeId, semester.semesterId)"
          >
            {{ grade.gradeName }} {{ semester.semesterName }}
          </button>
        </template>
      </div>
    </div>

    <!-- 选择课文 -->
    <div v-else-if="!lessonStore.selectedLesson" class="selection">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2>选择课文</h2>
      <div class="options-list">
        <button
          v-for="lesson in lessonStore.lessons"
          :key="lesson.lessonId"
          class="option-btn"
          @click="lessonStore.selectLesson(lesson.lessonId)"
        >
          {{ lesson.lessonId }}. {{ lesson.lessonName }}
          <span v-if="lesson.isOptional" class="optional-tag">选读</span>
        </button>
      </div>
    </div>

    <!-- 选择练习类型 -->
    <div v-else class="selection">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2>{{ lessonStore.currentLesson?.lessonName }}</h2>
      <p class="select-hint">选择练习类型</p>

      <div class="practice-types">
        <button
          class="practice-type-btn card"
          @click="startPractice('recognition')"
          :disabled="!hasRecognitionChars"
        >
          <span class="type-icon">👁️</span>
          <span class="type-title">识字表</span>
          <span class="type-desc">看字选读音</span>
          <span class="type-count" v-if="hasRecognitionChars">
            {{ lessonStore.currentLesson.recognitionChars.length }} 个字
          </span>
        </button>

        <button
          class="practice-type-btn card"
          @click="startPractice('writing')"
          :disabled="!hasWritingChars"
        >
          <span class="type-icon">✍️</span>
          <span class="type-title">写字表</span>
          <span class="type-desc">听音写汉字</span>
          <span class="type-count" v-if="hasWritingChars">
            {{ lessonStore.currentLesson.writingChars.length }} 个字
          </span>
        </button>

        <button
          class="practice-type-btn card"
          @click="startPractice('words')"
          :disabled="!hasWords"
        >
          <span class="type-icon">📝</span>
          <span class="type-title">词语表</span>
          <span class="type-desc">看词选读音</span>
          <span class="type-count" v-if="hasWords">
            {{ lessonStore.currentLesson.words.length }} 个词
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLessonStore } from '../stores/lessonStore'

const router = useRouter()
const lessonStore = useLessonStore()

onMounted(() => {
  loadData()
})

async function loadData() {
  await lessonStore.loadIndex()
}

async function selectSemester(gradeId, semesterId) {
  await lessonStore.loadSemesterData(gradeId, semesterId)
}

const hasRecognitionChars = computed(() => {
  return lessonStore.currentLesson?.recognitionChars?.length > 0
})

const hasWritingChars = computed(() => {
  return lessonStore.currentLesson?.writingChars?.length > 0
})

const hasWords = computed(() => {
  return lessonStore.currentLesson?.words?.length > 0
})

function goBack() {
  if (lessonStore.selectedLesson) {
    lessonStore.selectLesson(null)
  } else if (lessonStore.selectedSemester) {
    lessonStore.resetSelection()
  }
}

function startPractice(type) {
  router.push(`/practice/${type}`)
}
</script>

<style scoped>
.select-view {
  padding: 1rem 0;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.selection h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.select-hint {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.optional-tag {
  font-size: 0.75rem;
  background: var(--warning-color);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.practice-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.practice-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.practice-type-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.practice-type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.type-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.type-desc {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 0.25rem;
}

.type-count {
  font-size: 0.875rem;
  color: var(--primary-color);
  margin-top: 0.5rem;
}
</style>
