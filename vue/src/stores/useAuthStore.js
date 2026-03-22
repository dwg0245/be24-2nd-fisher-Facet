import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios' // api 대신 axios로 명확히 임포트



export const useAuthStore = defineStore('auth', () => {
  // 1. 초기값 설정: 로컬스토리지에 데이터가 있으면 바로 true로 시작!
  const isLogin = ref(!!localStorage.getItem('USERINFO'))
  const user = ref(null)

  const login = (userInfo) => {
    isLogin.value = true
    // 만약 userInfo가 객체라면 stringify 하고, 문자열이라면 그대로 저장
    const dataToSave = typeof userInfo === 'string' ? userInfo : JSON.stringify(userInfo)
    localStorage.setItem('USERINFO', dataToSave)
  }

  const checkLogin = () => {
    const data = localStorage.getItem('USERINFO')
    isLogin.value = !!data
    return isLogin.value
  }

  const logout = () => {
    localStorage.removeItem('USERINFO') // clear()보다는 특정 키만 지우는 게 안전해요
    isLogin.value = false
    user.value = null
  }

  // 2. 라우터 가드에서 호출할 진짜 토큰 검증 함수
  const validateToken = async () => {
    const tokenData = localStorage.getItem('USERINFO')
    if (!tokenData) {
      isLogin.value = false
      return false
    }

    try {
      // JSON 문자열에서 토큰값만 추출 (구조에 따라 다를 수 있음)
      const parsed = JSON.parse(tokenData)
      const token = parsed.token || parsed.accessToken // 서버 응답 구조에 맞게 수정

      // 실제 백엔드 주소로 확인 요청 (예시)
      // await axios.get('/api/auth/validate', { headers: { Authorization: `Bearer ${token}` } })

      isLogin.value = true
      return true
    } catch (error) {
      console.error('토큰 검증 실패:', error)
      logout() // 검증 실패 시 자동 로그아웃
      return false
    }
  }

  return { isLogin, user, checkLogin, login, logout, validateToken }
})


export default useAuthStore;

