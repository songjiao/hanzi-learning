<template>
  <div class="home">
    <div class="welcome-card card">
      <h2>欢迎来到汉字学习</h2>
      <p>选择课文，开始练习生字词吧！</p>
    </div>

    <div class="menu-grid">
      <button class="menu-item card" @click="goToSelect">
        <span class="menu-icon">📚</span>
        <span class="menu-title">开始学习</span>
        <span class="menu-desc">选择课文练习</span>
      </button>

      <button class="menu-item card" @click="goToProgress">
        <span class="menu-icon">📊</span>
        <span class="menu-title">学习进度</span>
        <span class="menu-desc">查看掌握情况</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToSelect = () => {
  router.push('/select')
}

const goToProgress = () => {
  router.push('/progress')
}
</script>

<style scoped>
.home {
  padding: 1rem 0;
}

.welcome-card {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-card h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.welcome-card p {
  color: var(--text-light);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.menu-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.menu-item:active {
  transform: translateY(0);
}

.menu-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.menu-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.menu-desc {
  font-size: 0.875rem;
  color: var(--text-light);
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
