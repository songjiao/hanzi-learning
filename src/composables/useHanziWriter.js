import HanziWriter from 'hanzi-writer'
import { ref, onUnmounted } from 'vue'

export function useHanziWriter() {
  const writer = ref(null)
  const isLoading = ref(false)
  const loadError = ref(null)
  const currentStroke = ref(0)
  const totalStrokes = ref(0)
  const mistakes = ref(0)

  // 初始化书写器
  function initWriter(container, character, options = {}) {
    // 清理旧实例
    if (writer.value) {
      destroy()
    }

    isLoading.value = true
    loadError.value = null

    const defaultOptions = {
      width: 280,
      height: 280,
      padding: 5,
      strokeColor: '#333',
      outlineColor: '#DDD',
      radicalColor: '#168F16',
      showOutline: false,
      showCharacter: false,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 200,
      drawingWidth: 20,
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      charDataLoader: (char, onComplete, onError) => {
        // 从 CDN 加载字符数据
        fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
          .then(res => {
            if (!res.ok) throw new Error('Character not found')
            return res.json()
          })
          .then(onComplete)
          .catch(onError)
      }
    }

    try {
      writer.value = HanziWriter.create(container, character, {
        ...defaultOptions,
        ...options,
        onLoadCharDataSuccess: (data) => {
          totalStrokes.value = data.strokes.length
          isLoading.value = false
          options.onLoadCharDataSuccess?.(data)
        },
        onLoadCharDataError: (reason) => {
          loadError.value = '无法加载汉字数据'
          isLoading.value = false
          options.onLoadCharDataError?.(reason)
        }
      })
    } catch (e) {
      loadError.value = '初始化失败'
      isLoading.value = false
    }
  }

  // 播放笔顺动画
  function animateCharacter() {
    return new Promise((resolve) => {
      if (!writer.value) {
        resolve()
        return
      }
      writer.value.animateCharacter({
        onComplete: resolve
      })
    })
  }

  // 显示汉字
  function showCharacter() {
    writer.value?.showCharacter()
  }

  // 隐藏汉字
  function hideCharacter() {
    writer.value?.hideCharacter()
  }

  // 显示轮廓
  function showOutline() {
    writer.value?.showOutline()
  }

  // 开始测验模式
  function startQuiz(callbacks = {}) {
    if (!writer.value) return

    mistakes.value = 0
    currentStroke.value = 0

    writer.value.quiz({
      onCorrectStroke: (strokeData) => {
        currentStroke.value = strokeData.strokeNum + 1
        callbacks.onCorrectStroke?.(strokeData)
      },
      onMistake: (strokeData) => {
        mistakes.value = strokeData.totalMistakes
        callbacks.onMistake?.(strokeData)
      },
      onComplete: (summaryData) => {
        callbacks.onComplete?.(summaryData)
      },
      showHintAfterMisses: callbacks.showHintAfterMisses || 3,
      markStrokeCorrectAfterMisses: false
    })
  }

  // 取消测验
  function cancelQuiz() {
    writer.value?.cancelQuiz()
  }

  // 隐藏轮廓
  function hideOutline() {
    writer.value?.hideOutline()
  }

  // 重置画布
  function reset() {
    if (writer.value) {
      writer.value.cancelQuiz()
      writer.value.hideCharacter()
      writer.value.hideOutline()
    }
    mistakes.value = 0
    currentStroke.value = 0
  }

  // 销毁实例
  function destroy() {
    if (writer.value) {
      // HanziWriter 没有显式的 destroy 方法，但我们可以清理引用
      writer.value = null
    }
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    writer,
    isLoading,
    loadError,
    currentStroke,
    totalStrokes,
    mistakes,
    initWriter,
    animateCharacter,
    showCharacter,
    hideCharacter,
    showOutline,
    startQuiz,
    cancelQuiz,
    reset,
    destroy
  }
}
