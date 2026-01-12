import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    cors: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.sjfarmltd.com'
    ]
  }
})
