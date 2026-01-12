<template>
  <div class="progress-view">
    <button class="back-btn" @click="goBack">← 返回</button>

    <h2>学习进度</h2>

    <div v-if="!hasProgress" class="no-progress card">
      <p>还没有学习记录</p>
      <button class="btn btn-primary" @click="goToSelect">开始学习</button>
    </div>

    <div v-else class="progress-list">
      <div v-for="(semesterData, semesterKey) in progressData.progress" :key="semesterKey" class="semester-section">
        <h3>{{ formatSemesterKey(semesterKey) }}</h3>

        <div v-for="(lessonData, lessonKey) in semesterData" :key="lessonKey" class="lesson-card card">
          <h4>{{ formatLessonKey(semesterKey, lessonKey) }}</h4>

          <div class="type-progress" v-if="lessonData.recognition">
            <div class="type-header">
              <span class="type-name">识字表</span>
              <span class="type-stats">{{ getMasteredCount(lessonData.recognition) }} / {{ getTotal(lessonData.recognition) }} 已掌握</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: getProgressPercent(lessonData.recognition) + '%' }"></div>
            </div>
          </div>

          <div class="type-progress" v-if="lessonData.writing">
            <div class="type-header">
              <span class="type-name">写字表</span>
              <span class="type-stats">{{ getMasteredCount(lessonData.writing) }} / {{ getTotal(lessonData.writing) }} 已掌握</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: getProgressPercent(lessonData.writing) + '%' }"></div>
            </div>
          </div>

          <div class="type-progress" v-if="lessonData.words">
            <div class="type-header">
              <span class="type-name">词语表</span>
              <span class="type-stats">{{ getMasteredCount(lessonData.words) }} / {{ getTotal(lessonData.words) }} 已掌握</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: getProgressPercent(lessonData.words) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasProgress" class="reset-section">
      <button class="btn btn-outline" @click="confirmReset">重置所有进度</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'

const router = useRouter()
const progressStore = useProgressStore()

const progressData = computed(() => progressStore.data)

// 课程名称缓存
const lessonNameCache = ref({})

// 加载课程名称
async function loadLessonNames(semesterKey) {
  if (lessonNameCache.value[semesterKey]) return

  try {
    const response = await fetch(`/lessons/${semesterKey}.json`)
    const data = await response.json()
    lessonNameCache.value[semesterKey] = {}
    data.units.forEach(lesson => {
      lessonNameCache.value[semesterKey][`lesson-${lesson.lessonId}`] = lesson.lessonName
    })
  } catch (e) {
    console.error('加载课程名称失败', e)
  }
}

// 监听进度数据变化，加载课程名称
watch(() => Object.keys(progressData.value.progress), (semesterKeys) => {
  semesterKeys.forEach(key => loadLessonNames(key))
}, { immediate: true })

const hasProgress = computed(() => {
  return Object.keys(progressData.value.progress).length > 0
})

function formatSemesterKey(key) {
  // grade4-semester1 -> 四年级上册
  const gradeMap = {
    grade1: '一年级',
    grade2: '二年级',
    grade3: '三年级',
    grade4: '四年级',
    grade5: '五年级',
    grade6: '六年级'
  }
  const semesterMap = {
    semester1: '上册',
    semester2: '下册'
  }

  const [grade, semester] = key.split('-')
  return `${gradeMap[grade] || grade} ${semesterMap[semester] || semester}`
}

function formatLessonKey(semesterKey, lessonKey) {
  // lesson-1 -> 第1课 观潮
  const num = lessonKey.replace('lesson-', '')
  const lessonName = lessonNameCache.value[semesterKey]?.[lessonKey]
  return lessonName ? `第 ${num} 课 ${lessonName}` : `第 ${num} 课`
}

function getMasteredCount(typeData) {
  return Object.values(typeData).filter(item => item.status === 'mastered').length
}

function getTotal(typeData) {
  return Object.keys(typeData).length
}

function getProgressPercent(typeData) {
  const total = getTotal(typeData)
  if (total === 0) return 0
  return (getMasteredCount(typeData) / total) * 100
}

function goBack() {
  router.push('/')
}

function goToSelect() {
  router.push('/select')
}

function confirmReset() {
  if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
    progressStore.resetProgress()
  }
}
</script>

<style scoped>
.progress-view {
  padding: 1rem 0;
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

h2 {
  margin-bottom: 1.5rem;
}

.no-progress {
  text-align: center;
  padding: 2rem;
}

.no-progress p {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.semester-section {
  margin-bottom: 1.5rem;
}

.semester-section h3 {
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

.lesson-card {
  margin-bottom: 0.75rem;
}

.lesson-card h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.type-progress {
  margin-bottom: 0.75rem;
}

.type-progress:last-child {
  margin-bottom: 0;
}

.type-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.type-name {
  color: var(--text-color);
}

.type-stats {
  color: var(--text-light);
}

.reset-section {
  margin-top: 2rem;
  text-align: center;
}

.reset-section .btn {
  color: var(--error-color);
  border-color: var(--error-color);
}

.reset-section .btn:hover {
  background: var(--error-color);
  color: white;
}
</style>
