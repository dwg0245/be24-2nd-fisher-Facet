<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')

// 참여 내역 리스트 (경매 + 펀딩)
const historyList = ref([])

// 상단 요약 데이터 (총 참여, 진행중, 종료됨)
const summary = ref({
  total: 0,
  ongoing: 0,
  ended: 0
})

// 필터 상태 관리 (all, auction, funding)
const currentFilter = ref('all')

// 필터 클릭 시 실행되는 함수
const setFilter = (filterType) => {
  currentFilter.value = filterType
  currentPage.value = 1
}

// 화면에 그릴 필터링된 리스트 (computed로 자동 계산)
const filteredList = computed(() => {
  if (currentFilter.value === 'all') return historyList.value
  return historyList.value.filter((item) => item.type === currentFilter.value.toUpperCase())
})

// ----------------------------------------------------
// ✨ 페이징 로직 ✨
// ----------------------------------------------------
const currentPage = ref(1)
const itemsPerPage = 5 // 한 페이지당 보여줄 개수

// 총 페이지 수 계산
const totalPages = computed(() => {
  return Math.ceil(filteredList.value.length / itemsPerPage) || 1
})

// 화면에 실제로 그릴 5개짜리 리스트 (slice로 자르기)
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredList.value.slice(start, end)
})

// 페이지 이동 함수
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' }) // 페이지 넘기면 화면 맨 위로 부드럽게 올리기
  }
}

// 백엔드에서 통합 참여 내역 가져오기
const fetchHistory = async () => {
  try {
    const res = await axios.get('/api/user/history', {
      withCredentials: true
    })

    if (res.data.isSuccess || res.data.success) {
      historyList.value = res.data.result.historyList
      summary.value = res.data.result.summary
    }
  } catch (error) {
    console.error('참여 내역을 불러오지 못했습니다.', error)
  }
}

onMounted(() => {
  // 1. 창고에서 데이터 꺼내기
  const savedData = localStorage.getItem('USERINFO')

  if (savedData) {
    // 2. 해독하기 (문자열 -> 객체)
    const userInfo = JSON.parse(savedData)
    userName.value = userInfo.userName
    console.log('유저 정보:', userInfo.userName)
  } else {
    userName.value = '로그인 필요'
  }
  // 화면 켜지면 참여 내역 데이터 불러오기
  fetchHistory()
})
</script>

<template>
  <main class="max-w-7xl mx-auto py-16 px-6 lg:px-10">
    <nav class="text-[10px] text-gray-400 mb-10 uppercase tracking-[0.2em]">
      Home / My / <span class="text-black font-medium">History</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <aside class="lg:col-span-4 border border-gray-100 bg-white shadow-sm p-8">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gray-100 border border-gray-200"></div>
          <div>
            <p class="text-sm text-gray-400 uppercase tracking-[0.2em]">Member</p>
            <p class="text-xl font-medium text-black">{{ userName }}</p>
            <p class="text-xs text-gray-500 mt-1">level: Silver</p>
          </div>
        </div>

        <div class="mt-10 space-y-3 text-sm">
          <RouterLink :to="{ name: 'user_information' }" class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition">내정보</RouterLink>
          <RouterLink :to="{ name: 'shipping' }" class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition font-bold text-black bg-gray-50">주문/참여내역</RouterLink>
          <RouterLink :to="{ name: 'add_points' }" class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition">포인트</RouterLink>
          <RouterLink :to="{ name: 'wish_list' }" class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition">위시리스트</RouterLink>
          <RouterLink :to="{ name: 'ask' }" class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition">문의내역</RouterLink>
        </div>

        <button class="w-full mt-10 py-4 btn-outline font-bold text-[11px] tracking-[0.4em] uppercase">
          Edit Profile
        </button>

        <div class="mt-10 border-t border-gray-100 pt-8">
          <p class="text-[10px] text-gray-400 uppercase tracking-[0.35em] mb-4">History Summary</p>
          <div class="grid grid-cols-3 gap-3">
            <div class="border border-gray-100 p-4 text-center">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">총 참여</p>
              <p class="text-lg font-bold accent-text mt-1">{{ summary.total }}</p>
            </div>
            <div class="border border-gray-100 p-4 text-center">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">진행중</p>
              <p class="text-lg font-bold text-black mt-1">{{ summary.ongoing }}</p>
            </div>
            <div class="border border-gray-100 p-4 text-center">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">종료됨</p>
              <p class="text-lg font-bold text-black mt-1">{{ summary.ended }}</p>
            </div>
          </div>
        </div>
      </aside>

      <section class="lg:col-span-8 space-y-10">
        <div class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 class="text-2xl font-medium text-black">주문 / 참여내역</h1>
              <p class="text-sm text-gray-500 font-light mt-2">
                내가 입찰에 참여한 경매 목록과 펀딩 내역을 확인할 수 있어요.
              </p>
            </div>
          </div>

          <div class="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <button @click="setFilter('all')" :class="['chip px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]', currentFilter === 'all' ? 'active' : '']">All</button>
              <button @click="setFilter('auction')" :class="['chip px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]', currentFilter === 'auction' ? 'active' : '']">Auction</button>
              <button @click="setFilter('funding')" :class="['chip px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]', currentFilter === 'funding' ? 'active' : '']">Funding</button>
            </div>
          </div>
        </div>

        <div v-if="filteredList.length > 0" class="space-y-4">
          <article v-for="item in paginatedList" :key="item.id" class="card p-6">
            <div class="flex items-start gap-5">
              <RouterLink :to="item.type === 'AUCTION' ? `/auction/${item.productIdx}` : `/funding/${item.productIdx}`" class="thumb w-24 h-24 shrink-0">
                <img :src="item.image" class="w-full h-full object-cover" alt="product image" />
              </RouterLink>

              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span class="badge" :class="item.type === 'AUCTION' ? 'bg-gray-100' : 'bg-blue-50 text-blue-600'">
                    {{ item.type === 'AUCTION' ? 'Auction' : 'Funding' }}
                  </span>
                  <span class="badge badge-accent">{{ item.status }}</span>
                  <span class="badge">참여일: {{ item.date }}</span>
                </div>

                <RouterLink :to="item.type === 'AUCTION' ? `/auction/${item.productIdx}` : `/funding/${item.productIdx}`" class="block">
                  <h3 class="text-lg font-medium text-black hover:accent-text transition">
                    {{ item.name }}
                  </h3>
                </RouterLink>

                <p v-if="item.type === 'AUCTION'" class="text-sm text-gray-500 font-light mt-2">
                  나의 입찰가 <span class="font-medium text-black">₩{{ item.myPrice.toLocaleString() }}</span> · 현재 최고가 ₩{{ item.currentPrice.toLocaleString() }}
                </p>
                <p v-else-if="item.type === 'FUNDING'" class="text-sm text-gray-500 font-light mt-2">
                  나의 펀딩 금액 <span class="font-medium text-black">₩{{ item.myPrice.toLocaleString() }}</span>
                </p>

                <div class="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div class="flex items-center gap-3 flex-wrap">
                    <RouterLink :to="item.type === 'AUCTION' ? `/auction/${item.productIdx}` : `/funding/${item.productIdx}`" class="btn-outline px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]">
                      <i :class="item.type === 'AUCTION' ? 'fa-solid fa-gavel' : 'fa-solid fa-seedling'" class="mr-2"></i>
                      {{ item.type === 'AUCTION' ? '경매장 가기' : '펀딩 확인하기' }}
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-3 pt-10 pb-4">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                    class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#A39382] hover:text-[#A39382] disabled:opacity-30 disabled:cursor-not-allowed transition">
              <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>

            <button v-for="page in totalPages" :key="page"
                    @click="changePage(page)"
                    :class="['w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition',
                             currentPage === page ? 'bg-[#A39382] text-white shadow-md' : 'border border-gray-200 text-gray-500 hover:border-[#A39382] hover:text-[#A39382]']">
              {{ page }}
            </button>

            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                    class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#A39382] hover:text-[#A39382] disabled:opacity-30 disabled:cursor-not-allowed transition">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        <div v-else class="border border-gray-100 bg-white shadow-sm p-14 text-center">
          <p class="text-[10px] text-gray-400 uppercase tracking-[0.5em] mb-4">No History</p>
          <h3 class="text-xl font-medium text-black">참여 내역이 없어요</h3>
          <p class="text-sm text-gray-500 font-light mt-3">
            경매에 입찰하거나 펀딩에 참여하면 여기에 표시됩니다.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

:root {
  --accent-color: #a39382;
  --accent-hover: #8e7f70;
  --bg-light: #ffffff;
  --text-main: #1a1a1a;
  --text-soft: #3a3a3a;
  --border-color: #eeeeee;
  --chip-bg: #fbfaf9;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background: var(--bg-light);
  color: var(--text-main);
  margin: 0;
  word-break: keep-all;
}

.accent-text {
  color: var(--accent-color);
}

.accent-bg {
  background: var(--accent-color);
}

.border-accent {
  border-color: var(--accent-color);
}

.btn-outline {
  transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  background: transparent;
}

.btn-outline:hover {
  background: var(--accent-color);
  color: #fff;
  box-shadow: 0 10px 20px rgba(163, 147, 130, 0.18);
  transform: translateY(-2px);
}

.btn-ghost {
  border: 1px solid var(--border-color);
  background: #fff;
  transition: all 0.25s ease;
}

.btn-ghost:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.04);
}

.nav-link {
  color: #6b7280;
  transition: all 0.25s ease;
  position: relative;
  padding: 6px 0;
}

.nav-link:hover {
  color: var(--text-main);
}

.nav-link.active {
  color: var(--text-main);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 100%;
  height: 2px;
  background: var(--accent-color);
  border-radius: 2px;
  box-shadow: 0 6px 16px rgba(163, 147, 130, 0.25);
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(163, 147, 130, 0.35);
  background: #fff;
  color: var(--accent-color);
  border-radius: 9999px;
  transition: all 0.25s ease;
  position: relative;
}

.icon-btn:hover {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(163, 147, 130, 0.22);
}

.icon-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9999px;
  background: var(--accent-color);
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 10px 18px rgba(163, 147, 130, 0.25);
}

.chip {
  background: var(--chip-bg);
  border: 1px solid var(--border-color);
  color: #6b7280;
  transition: all 0.2s ease;
}

.chip:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.03);
}

.chip.active {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: #fff;
  box-shadow: 0 10px 18px rgba(163, 147, 130, 0.08);
}

.card {
  border: 1px solid var(--border-color);
  background: #fff;
  transition: all 0.25s ease;
}

.card:hover {
  border-color: rgba(163, 147, 130, 0.55);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.thumb {
  background: #f7f7f7;
  border: 1px solid #f1f1f1;
  overflow: hidden;
}

.badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-color);
  background: #fff;
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 9999px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6b7280;
}

.badge-accent {
  border-color: rgba(163, 147, 130, 0.35);
  background: rgba(163, 147, 130, 0.08);
  color: var(--accent-color);
  font-weight: 700;
}

.badge-dark {
  background: #111827;
  border-color: #111827;
  color: #fff;
  font-weight: 700;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f8f8f8;
}

::-webkit-scrollbar-thumb {
  background: var(--accent-color);
  border-radius: 3px;
}
</style>