<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/api/auction'

const auction_list = ref([])
const totalPages = ref(0)
const totalCount = ref(0)
const currentPage = ref(0)

const getlist = async () => {
  const res = await api.auctionList(currentPage.value)
  const result = res.result
  auction_list.value = result.auctionList
  totalPages.value = result.totalPage - 1
  totalCount.value = result.totalCount
  currentPage.value = result.currentPage
  console.log('auction >> ', auction_list.value)
}
onMounted(() => {
  getlist()
})
const goToPage = (num) => {
  currentPage.value = num // 화면상의 번호 업데이트
  getlist() // 페이지 변경 시 목록 다시 불러오기
  window.scrollTo(0, 0) // 페이지 변경 시 상단으로 스크롤
}
</script>

<template class="flex flex-col h-screen">
  <div class="flex flex-1 overflow-hidden">
    <aside class="w-80 border-r border-gray-50 p-10 overflow-y-auto hidden md:block">
      <div class="mb-12">
        <h2 class="luxury-font text-xs font-bold mb-8 tracking-[0.2em] text-gray-300 uppercase">
          Categories
        </h2>
        <ul class="space-y-6 text-gray-500">
          <li class="sidebar-item sidebar-active cursor-pointer">ALL ARCHIVES</li>
          <li class="sidebar-item cursor-pointer">HIGH JEWELRY</li>
          <li class="sidebar-item cursor-pointer">HERITAGE WATCH</li>
          <li class="sidebar-item cursor-pointer">RARE GEMSTONES</li>
          <li class="sidebar-item cursor-pointer">ART PIECES</li>
        </ul>
      </div>

      <div class="pt-10 border-t border-gray-50">
        <h2 class="luxury-font text-xs font-bold mb-6 tracking-[0.2em] text-gray-300 uppercase">
          Status
        </h2>
        <div class="space-y-4">
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" class="w-3 h-3 accent-[#A39382]" checked />
            <span class="text-xs text-gray-500 group-hover:text-black transition"
              >현재 진행 중</span
            >
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" class="w-3 h-3 accent-[#A39382]" />
            <span class="text-xs text-gray-500 group-hover:text-black transition"
              >마감 임박 순</span
            >
          </label>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-12 bg-[#fafafa]">
      <div class="flex justify-between items-center mb-12">
        <p class="text-[12px] text-gray-400 tracking-wider">
          SHOWING <span class="text-black font-bold">{{ totalCount.toLocaleString() }}</span> UNIQUE
          PIECES
        </p>
        <select
          class="custom-select bg-white border border-gray-100 rounded-full px-6 py-2 text-[11px] font-bold outline-none w-40 tracking-tighter cursor-pointer hover:border-[#A39382] transition"
        >
          <option>최근 등록순</option>
          <option>낮은 가격순</option>
          <option>마감 임박순</option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
        <div
          class="premium-card bg-white rounded-3xl overflow-hidden cursor-pointer group"
          v-for="item in auction_list"
        >
          <!-- {{ item }} -->
          <RouterLink :to="`/auction/detail/${item.idx}`" class="block">
            <div class="relative overflow-hidden aspect-[4/5]">
              <img
                :src="item.image"
                class="w-full h-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div
                v-if="item.status == 'BOFORE'"
                class="absolute top-5 right-5 status-badge px-4 py-1.5 rounded-full font-bold"
              >
                UPCOMING
              </div>
              <div
                v-else-if="item.status == 'END'"
                class="absolute top-5 right-5 status-badge px-4 py-1.5 rounded-full font-bold"
              >
                END
              </div>
              <div
                v-else
                class="absolute top-5 right-5 status-badge px-4 py-1.5 rounded-full font-bold"
              >
                LIVE
              </div>
            </div>
            <div class="p-8">
              <p class="text-[10px] text-[#A39382] font-bold tracking-[0.2em] mb-2 uppercase">
                {{ item.category }}
              </p>
              <h3 class="luxury-font font-bold text-lg leading-tight h-14 overflow-hidden">
                {{ item.name }}
              </h3>
              <div class="flex justify-between pt-2 items-end border-t border-gray-50">
                <div>
                  <p class="text-[9px] text-gray-300 uppercase tracking-widest mb-1">경매 시작가</p>
                  <p class="text-[15px] font-bold">₩ {{ item.startPrice.toLocaleString() }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-[#A39382] font-bold mb-1 uppercase tracking-widest">
                    Time Left
                  </p>
                  <p class="text-[13px] font-medium tracking-tighter">{{ item.time }}</p>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="mt-24 flex justify-center items-center space-x-8">
        <button class="text-gray-300 hover:text-[#A39382] transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="flex space-x-6 text-[11px] font-bold tracking-widest">
          <span
            v-for="pageNumber in totalPages"
            :key="pageNumber - 1"
            @click="goToPage(pageNumber)"
            class="cursor-pointer transition pb-1"
            :class="{
              'text-[#A39382] border-b border-[#A39382]': currentPage === pageNumber,
              'text-gray-300 hover:text-black': currentPage !== pageNumber,
            }"
          >
            {{ String(pageNumber).padStart(2, '0') }}
          </span>
        </div>
        <button class="text-gray-300 hover:text-[#A39382] transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M9 5l7 7-7 7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Noto+Sans+KR:wght@300;400;500&display=swap');

:root {
  --accent-color: #a39382;
  --accent-hover: #8e7f70;
  --bg-light: #ffffff;
  --border-color: #eeeeee;
}

body {
  background-color: var(--bg-light);
  color: #1a1a1a;
  font-family: 'Noto Sans KR', sans-serif;
}

.luxury-font {
  font-family: 'Cinzel', serif;
}

/* 사이드바 스타일 */
.sidebar-item {
  transition: all 0.3s ease;
  font-size: 13px;
  letter-spacing: 0.05em;
}

.sidebar-item:hover {
  color: var(--accent-color);
  padding-left: 8px;
}

.sidebar-active {
  color: var(--accent-color);
  font-weight: 600;
}

/* 카드 커스텀 스타일 */
.premium-card {
  border: 1px solid var(--border-color);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.premium-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  border-color: var(--accent-color);
}

.status-badge {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: var(--accent-color);
  font-size: 10px;
  letter-spacing: 0.1em;
  border: 1px solid var(--accent-color);
}

/* 셀렉트 박스 커스텀 */
.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A39382'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
}
</style>
