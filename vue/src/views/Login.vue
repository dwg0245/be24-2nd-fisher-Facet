<script setup>
import { reactive, onMounted } from 'vue'
import api from '@/api/user'
import { useRouter } from 'vue-router'
import useAuthStore from '@/stores/useAuthStore'

const router = useRouter()
const loginForm = reactive({
  email: '',
  password: '',
})

const authStore = useAuthStore()
const login = async () => {
  try {
    const res = await api.login(loginForm)
    if (res.status == 200) {
      // 보안상 안전하지 않은 방식이라 실무에서는 절대 사용 안함
      // localStorage.setItem('ATOKEN', res.data.token)

      authStore.login(JSON.stringify(res.data))
      router.push({ name: 'user_information' })
    } else {
      console.log(res)
      alert('아이디와 비밀번호를 확인해보세요.')
    }
  } catch (error) {
    alert('아이디와 비밀번호를 확인해보세요.')
  }
}

// 환경 변수 로드

const kakaoRedirectUri = "http://localhost:8080/oauth2/authorization/kakao"
const googleRedirectUri = "http://localhost:8080/oauth2/authorization/google"


const loginWithKakao = () => {
  // 백엔드의 OAuth2 엔드포인트로 브라우저 주소 자체를 이동시킵니다.
  window.location.href = kakaoRedirectUri;
};

const loginWithGoogle = () => {
  window.location.href = googleRedirectUri;
};

</script>

<template>
  <div class="flex items-center justify-center min-h-screen py-16 px-6 bg-[#f8f6f4]">
    <div class="premium-card w-full max-w-[540px] rounded-3xl p-10 md:p-16">
      <!-- Logo & Header -->
      <RouterLink :to="{ name: 'Main_auction' }" class="block text-center mb-14">
        <h1 class="text-3xl font-bold text-[#A39382] letter-spacing-huge uppercase mb-4 cursor-pointer">
          Facet
        </h1>
        <div class="h-[1px] w-12 bg-[#A39382] mx-auto mb-6"></div>
        <h2 class="text-xl font-light font-serif-luxury italic text-[#1a1a1a] mb-2">
          Welcome Back
        </h2>
        <p class="text-gray-400 text-[13px] font-light">당신의 소중한 아카이브에 접속하세요</p>
      </RouterLink>

      <div class="space-y-7">
        <!-- Email Field -->
        <div class="group">
          <label class="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-400 group-focus-within:text-[#A39382] transition-colors">
            Email Address
          </label>
          <input v-model="loginForm.email" type="text" placeholder="example@facet.com"
            class="w-full input-style rounded-lg px-5 py-4 text-sm placeholder:text-gray-300" />
        </div>

        <!-- Password Field -->
        <div class="group">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#A39382] transition-colors">
              Security Password
            </label>
          </div>
          <input v-model="loginForm.password" type="password" placeholder="비밀번호를 입력하세요"
            class="w-full input-style rounded-lg px-5 py-4 text-sm placeholder:text-gray-300" />
        </div>

        <!-- Auto Login -->
        <div class="flex items-center space-x-2 pb-2">
          <input type="checkbox" id="remember" class="w-4 h-4 border-gray-200 rounded accent-[#A39382]" />
          <label for="remember" class="text-[12px] text-gray-500 cursor-pointer">Stay signed in</label>
        </div>

        <!-- Primary Action Buttons -->
        <div class="flex gap-3 mt-4">
          <button @click.prevent="login()" class="btn-base btn-primary">Login</button>
          <RouterLink to="/signup" class="btn-base btn-outline">Join Now</RouterLink>
        </div>

        <!-- Social Login Divider -->
        <div class="relative flex items-center justify-center py-4">
          <div class="flex-grow border-t border-gray-100"></div>
          <span class="flex-shrink mx-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Or continue with</span>
          <div class="flex-grow border-t border-gray-100"></div>
        </div>

        <!-- Kakao Social Button -->
        <button 
          id="kakao-login-btn" 
          @click="loginWithKakao()"
          class="w-full flex items-center justify-center gap-3 py-4 bg-[#FEE500] hover:bg-[#FDE100] transition-all rounded-lg text-[#191919] text-[11px] font-bold uppercase tracking-[0.1em] shadow-sm"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-4.97 0-9 3.181-9 7.105 0 2.53 1.704 4.753 4.318 6.007l-1.091 4.004c-.048.175.056.355.225.388.053.01.107.01.16-.002l4.711-3.118c.224.019.452.03.687.03 4.97 0 9-3.181 9-7.105S16.97 3 12 3z"/>
          </svg>
          Login with Kakao
        </button>

        <button 
          @click="loginWithGoogle()"
          class="w-full flex items-center justify-center gap-3 py-4 mt-3 bg-white border border-gray-200 hover:bg-gray-50 transition-all rounded-lg text-[#191919] text-[11px] font-bold uppercase tracking-[0.1em] shadow-sm"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Login with Google
        </button>

        <p id="token-result" class="text-center text-[10px] text-red-400"></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

:root {
  --accent-color: #1a1a1a;
  --accent-hover: #404040;
  --bg-page: #f8f6f4;
  --text-main: #1a1a1a;
  --border-color: #e5e7eb;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  font-family: 'Noto Sans KR', sans-serif;
  word-break: keep-all;
}

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}

.premium-card {
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.03);
}

.input-style {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-style:focus {
  border-color: #a39382;
  outline: none;
  box-shadow: 0 0 0 4px rgba(163, 147, 130, 0.08);
}

.btn-base {
  flex: 1;
  font-weight: 700;
  padding: 1.25rem 0;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.btn-primary {
  background-color: #000000;
  color: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background-color: #1a1a1a;
  transform: translateY(-2px);
}

.btn-outline {
  border: 1px solid #e5e7eb;
  color: #767676;
  background-color: transparent;
}

.btn-outline:hover {
  border-color: #a39382;
  color: #a39382;
  background-color: #fcfcfc;
}

.letter-spacing-huge {
  letter-spacing: 0.4em;
}
</style>