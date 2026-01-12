import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLessonStore = defineStore('lesson', () => {
  const lessonIndex = ref(null)
  const currentSemesterData = ref(null)
  const selectedGrade = ref(null)
  const selectedSemester = ref(null)
  const selectedLesson = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 加载索引文件
  async function loadIndex() {
    if (lessonIndex.value) return lessonIndex.value

    loading.value = true
    error.value = null
    try {
      const response = await fetch('/lessons/index.json')
      lessonIndex.value = await response.json()
      return lessonIndex.value
    } catch (e) {
      error.value = '加载数据索引失败'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // 加载学期数据
  async function loadSemesterData(gradeId, semesterId) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/lessons/${gradeId}-${semesterId}.json`)
      currentSemesterData.value = await response.json()
      selectedGrade.value = gradeId
      selectedSemester.value = semesterId
      return currentSemesterData.value
    } catch (e) {
      error.value = '加载课文数据失败'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // 获取课文列表（units 字段现在直接是 lessons 数组）
  const lessons = computed(() => {
    return currentSemesterData.value?.units || []
  })

  // 获取当前选中的课文
  const currentLesson = computed(() => {
    if (!currentSemesterData.value || !selectedLesson.value) {
      return null
    }
    return lessons.value.find(l => l.lessonId === selectedLesson.value)
  })

  // 选择课文
  function selectLesson(lessonId) {
    selectedLesson.value = lessonId
  }

  // 重置选择
  function resetSelection() {
    selectedGrade.value = null
    selectedSemester.value = null
    selectedLesson.value = null
    currentSemesterData.value = null
  }

  return {
    lessonIndex,
    currentSemesterData,
    selectedGrade,
    selectedSemester,
    selectedLesson,
    lessons,
    loading,
    error,
    currentLesson,
    loadIndex,
    loadSemesterData,
    selectLesson,
    resetSelection
  }
})
