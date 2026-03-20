<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router' //useRouter추가
import { computed, ref, onMounted } from 'vue' //ref, onmounted 추가
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter() //추가
const inputQuery = ref('') //추가
const route = useRoute()
const isFunding = computed(() => route.path.includes('funding'))
const authStore = useAuthStore()

const onSearchClick = () => {
  //상수 추가
  //검색어가 공백이면 이동 안한다고오오오
  if (!inputQuery.value.trim()) return

  router.push({
    name: 'auction_list',
    query: { q: inputQuery.value },
  })
}
onMounted(() => {
  // 컴포넌트가 붙자마자 한 번 더 확실히 체크
  authStore.checkLogin()
  console.log('헤더 마운트 시점 로그인 상태:', authStore.isLogin)
})
</script>

<template class="overflow-x-hidden">
  <!-- 로그인 했을 때 헤더 -->
  <div v-if="authStore.isLogin">
    <div class="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-[1440px] mx-auto px-4 md:px-10 h-20 flex justify-between items-center">
        <div class="flex items-center space-x-12">
          <RouterLink :to="{ name: 'Main_root' }" class="flex items-center">
            <div
              class="luxury-font text-2xl font-bold tracking-[0.3em] text-[#A39382] uppercase cursor-pointer leading-none mt-1"
            >
              Facet
            </div></RouterLink
          >

          <nav class="hidden lg:flex items-center space-x-8 text-[14px] font-medium text-gray-500">
            <RouterLink
              :to="{ name: 'Main_root' }"
              :class="
                isFunding
                  ? 'hover:text-black transition-colors' // 선택되었을 때 클래스
                  : 'text-black border-b-2 border-black' // 선택되지 않았을 때 클래스
              "
              class="py-1"
              >경매</RouterLink
            >
            <RouterLink
              :to="{ name: 'main_funding' }"
              :class="
                isFunding
                  ? 'text-black border-b-2 border-black' // 선택되었을 때 클래스
                  : 'hover:text-black transition-colors' // 선택되지 않았을 때 클래스
              "
              class="py-1"
              >펀딩</RouterLink
            >
          </nav>
        </div>

        <div class="flex-1 max-w-md mx-8 hidden md:block">
          <div class="flex items-center gap-2">
            <input
              v-model="inputQuery"
              @keyup.enter="onSearchClick"
              type="text"
              placeholder="어떤 보석을 찾으시나요?"
              class="flex-1 h-[44px] bg-gray-50 border border-gray-100 rounded-full px-6 text-sm focus:outline-none focus:border-[#A39382] transition-all placeholder:text-gray-300"
            />

            <button
              @click="onSearchClick"
              type="button"
              aria-label="검색 실행"
              class="w-[44px] h-[44px] flex items-center justify-center bg-white border border-gray-100 text-[#A39382] rounded-full transition-all duration-300 active:scale-95 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)] hover:border-[#A39382]"
            >
              <i class="fa-solid fa-magnifying-glass text-[14px]"></i>
            </button>
          </div>
        </div>

        <div class="flex items-center">
          <RouterLink :to="{ name: 'user_information' }" class="icon-btn" aria-label="My Page">
            <i class="fa-regular fa-user text-[15px]"></i>
          </RouterLink>

          <button class="lg:hidden ml-4 text-gray-600 flex items-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16m-7 6h7" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 로그인 안 했을 때 헤더 -->
  <div v-else>
    <header class="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-[1440px] mx-auto px-4 md:px-10 h-20 flex justify-between items-center">
        <div class="flex items-center space-x-12">
          <RouterLink :to="{ name: 'Main_auction' }">
            <div
              class="luxury-font text-2xl font-bold tracking-[0.3em] text-[#A39382] uppercase cursor-pointer leading-none mt-[2px]"
            >
              Facet
            </div>
          </RouterLink>

          <nav class="hidden lg:flex items-center space-x-8 text-[14px] font-medium text-gray-500">
            <RouterLink
              :to="{ name: 'Main_auction' }"
              :class="[
                isFunding
                  ? 'hover:text-black transition-colors' // 선택되었을 때 클래스
                  : 'text-black border-b-2 border-black', // 선택되지 않았을 때 클래스
              ]"
              class="py-1"
              >경매</RouterLink
            >
            <RouterLink
              :to="{ name: 'main_funding' }"
              :class="[
                isFunding
                  ? 'text-black border-b-2 border-black' // 선택되었을 때 클래스
                  : 'hover:text-black transition-colors', // 선택되지 않았을 때 클래스
              ]"
              class="py-1"
              >펀딩</RouterLink
            >
          </nav>
        </div>

        <div class="flex-1 max-w-md mx-8 hidden md:block">
          <div class="flex items-center gap-2">
            <input
              v-model="inputQuery"
              @keyup.enter="onSearchClick"
              type="text"
              placeholder="어떤 보석을 찾으시나요?"
              class="flex-1 h-[44px] bg-gray-50 border border-gray-100 rounded-full px-6 text-sm focus:outline-none focus:border-[#A39382] transition-all placeholder:text-gray-300"
            />

            <button
              @click="onSearchClick"
              type="button"
              aria-label="검색 실행"
              class="w-[44px] h-[44px] flex items-center justify-center bg-white border border-gray-100 text-[#A39382] rounded-full transition-all duration-300 active:scale-95 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)] hover:border-[#A39382]"
            >
              <i class="fa-solid fa-magnifying-glass text-[14px]"></i>
            </button>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <button
            class="hidden sm:block text-sm text-gray-500 hover:text-black transition-colors font-medium"
          >
            <RouterLink :to="{ name: 'login' }">로그인</RouterLink>
          </button>
          <div class="w-[1px] h-3 bg-gray-200 hidden sm:block"></div>
          <button
            class="hidden sm:block text-sm text-gray-500 hover:text-black transition-colors font-medium"
          >
            <RouterLink :to="{ name: 'signup' }">회원가입</RouterLink>
          </button>
        </div>
      </div>
    </header>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300&family=Cinzel:wght@400;700&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');
.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}

.luxury-font {
  font-family: 'Cinzel', serif;
}
</style>
