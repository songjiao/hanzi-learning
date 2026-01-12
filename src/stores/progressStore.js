import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'hanzi_learning_progress'

export const useProgressStore = defineStore('progress', () => {
  // 从 localStorage 加载数据
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load progress from storage:', e)
    }
    return {
      progress: {},
      settings: {
        showHintAfterMisses: 3,
        autoPlayAnimation: true
      }
    }
  }

  const data = ref(loadFromStorage())

  // 监听变化自动保存
  watch(data, (newData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    } catch (e) {
      console.error('Failed to save progress to storage:', e)
    }
  }, { deep: true })

  // 获取指定字符的进度
  function getCharProgress(semesterKey, lessonId, type, char) {
    const path = `${semesterKey}.lesson-${lessonId}.${type}`
    const typeProgress = getNestedValue(data.value.progress, path) || {}
    return typeProgress[char] || { status: 'new', correctCount: 0, mistakeCount: 0 }
  }

  // 更新字符进度
  function updateCharProgress(semesterKey, lessonId, type, char, isCorrect) {
    const path = `${semesterKey}.lesson-${lessonId}.${type}`

    // 确保路径存在
    if (!data.value.progress[semesterKey]) {
      data.value.progress[semesterKey] = {}
    }
    const lessonKey = `lesson-${lessonId}`
    if (!data.value.progress[semesterKey][lessonKey]) {
      data.value.progress[semesterKey][lessonKey] = {}
    }
    if (!data.value.progress[semesterKey][lessonKey][type]) {
      data.value.progress[semesterKey][lessonKey][type] = {}
    }

    const charProgress = data.value.progress[semesterKey][lessonKey][type][char] || {
      status: 'new',
      correctCount: 0,
      mistakeCount: 0
    }

    if (isCorrect) {
      charProgress.correctCount++
    } else {
      charProgress.mistakeCount++
    }

    // 更新掌握状态
    charProgress.status = calculateStatus(charProgress)
    charProgress.lastPracticed = new Date().toISOString()

    data.value.progress[semesterKey][lessonKey][type][char] = charProgress
  }

  // 计算掌握状态：答对一次即为掌握
  function calculateStatus(progress) {
    if (progress.correctCount >= 1) {
      return 'mastered'
    }
    return 'new'
  }

  // 获取课文的整体进度
  function getLessonProgress(semesterKey, lessonId, type) {
    const lessonKey = `lesson-${lessonId}`
    const typeProgress = data.value.progress?.[semesterKey]?.[lessonKey]?.[type] || {}

    const chars = Object.values(typeProgress)
    if (chars.length === 0) return { total: 0, mastered: 0, learning: 0 }

    return {
      total: chars.length,
      mastered: chars.filter(c => c.status === 'mastered').length,
      learning: chars.filter(c => c.status === 'learning').length
    }
  }

  // 辅助函数：获取嵌套对象值
  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  // 重置进度
  function resetProgress() {
    data.value.progress = {}
  }

  return {
    data,
    getCharProgress,
    updateCharProgress,
    getLessonProgress,
    resetProgress
  }
})
