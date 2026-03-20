import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './App.vue'
import { useAuthStore } from '@/stores/useAuthStore' // 민주님의 스토어 경로

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const authStore = useAuthStore()
const hasToken = document.cookie.split(';').some((item) => item.trim().startsWith('ATOKEN='))

if (hasToken) {
  authStore.isLogin = true
  // 필요하다면 여기서 유저 정보를 다시 가져오는 API를 호출해도 좋습니다.
}

app.use(router)
app.mount('#app')
