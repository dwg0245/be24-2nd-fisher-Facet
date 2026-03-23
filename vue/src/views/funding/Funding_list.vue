<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import api from '@/api/funding'

const funding_list = reactive([])
const currentPage = ref(0)
const currentSize = ref(0)
const totalCount = ref(0)
const totalPage = ref(0)

const currentFilter = ref('all')
const currentCategories = ref('all')

const getlist = async (page, currentFilter, currentCategories) => {

  const res = await api.fundingPageList(page, currentFilter, currentCategories)
  console.log("res", res.result)

  funding_list.length = 0

  if (res.code == 2000) {
    funding_list.push(...res.result.fundingList)
    console.log(funding_list)
    currentPage.value = res.result.currentPage
    currentSize.value = res.result.currentSize
    totalCount.value = res.result.totalCount
    totalPage.value = res.result.totalPage
    console.log(" 성공")
  } else {
    alert('list.json 파일을 불러오지 못하였음')
  }
}


// 6. 숫자를 '01' 형태로 포맷팅
const formatNumber = (num) => {
  return String(num).padStart(2, '0')
}

onMounted(() => {
  getlist(0, 'all', 'all')
})
</script>

<template class="flex flex-col h-screen">
  <div class="flex flex-1 overflow-hidden">
    <aside class="w-80 border-r border-gray-50 p-10 overflow-y-auto hidden md:block">
      <div class="mb-12">
        <h2 class="luxury-font text-xs font-bold mb-8 tracking-[0.2em] text-gray-300 uppercase">
          Categories
        </h2>
        <ul class="space-y-6 text-gray-500">
          <li @click="currentCategories = 'all', getlist(0, 'all', currentCategories)"
            class="sidebar-item sidebar-active cursor-pointer">ALL ARCHIVES</li>
          <li @click="currentCategories = 'ring', getlist(0, 'all', currentCategories)"
            class="sidebar-item cursor-pointer">Ring</li>
          <li @click="currentCategories = 'Necklace', getlist(0, 'all', currentCategories)"
            class="sidebar-item cursor-pointer">Necklace</li>
          <li @click="currentCategories = 'Bracelet', getlist(0, 'all', currentCategories)"
            class="sidebar-item cursor-pointer">Bracelet</li>
          <li @click="currentCategories = 'Earrings', getlist(0, 'all', currentCategories)"
            class="sidebar-item cursor-pointer">Earrings</li>
          <li @click="currentCategories = 'Anklet', getlist(0, 'all', currentCategories)"
            class="sidebar-item cursor-pointer">Anklet</li>
        </ul>
      </div>

      <div class="pt-10 border-t border-gray-50">
        <h2 class="luxury-font text-xs font-bold mb-6 tracking-[0.2em] text-gray-300 uppercase">
          Status
        </h2>
        <div class="space-y-4">
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input type="radio" name="status-filter" @click="getlist(0, 'all', currentCategories)"
              class="w-3 h-3 accent-[#A39382] cursor-pointer" />
            <span class="text-xs text-gray-500 group-hover:text-black transition">현재 진행 중</span>
          </label>

          <label class="flex items-center space-x-3 cursor-pointer group">
            <input type="radio" name="status-filter" @click="getlist(0, 'imminent', currentCategories)"
              class="w-3 h-3 accent-[#A39382] cursor-pointer" />
            <span class="text-xs text-gray-500 group-hover:text-black transition">마감 임박 순</span>
          </label>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-12 bg-[#fafafa]">
      <div class="flex justify-between items-center mb-12">
        <p class="text-[12px] text-gray-400 tracking-wider">
          SHOWING <span class="text-black font-bold">{{ totalCount }}</span> UNIQUE PIECES
        </p>
        <select v-model="currentFilter" @change="getlist(0, currentFilter, currentCategories)"
          class="custom-select bg-white border border-gray-100 rounded-full px-6 py-2 text-[11px] font-bold outline-none w-40 tracking-tighter cursor-pointer hover:border-[#A39382] transition">
          <option value="all">최근
            등록순</option>
          <option value="price">
            낮은 가격순</option>
          <option value="imminent">마감 임박순</option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
        <div class="premium-card bg-white rounded-3xl overflow-hidden cursor-pointer group"
          v-for="item in funding_list">
          <!-- {{ item }} -->
          <RouterLink :to="`/funding/funding_desc/${item.idx}`" class="block">
            <div class="relative overflow-hidden aspect-[4/5]">
              <img :src="item.img" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
              <div class="absolute top-5 right-5 status-badge px-4 py-1.5 rounded-full font-bold">
                LIVE
              </div>
            </div>
            <div class="p-8">
              <p class="text-[10px] text-[#A39382] font-bold tracking-[0.2em] mb-2 uppercase">
                {{ item.category }}
              </p>
              <h3 class="luxury-font font-bold text-lg mb-6 leading-tight h-5 overflow-hidden">
                {{ item.name }}
              </h3>
              <div class="flex justify-between items-end pt-6 border-t border-gray-50">
                <div>
                  <p class="text-[9px] text-gray-300 uppercase tracking-widest mb-1">AMOUNTR RAISED</p>
                  <p class="text-[15px] font-bold"> {{ item.percent }} %</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-[#A39382] font-bold mb-1 uppercase tracking-widest">
                    CLOSES ON
                  </p>
                  <p class="text-[13px] font-medium tracking-tighter">{{ item.endDays }} 일 마감</p>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="mt-24 flex justify-center items-center space-x-8">
        <button class="text-gray-300 hover:text-[#A39382] transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="flex space-x-6 text-[11px] font-bold tracking-widest">
          <span v-for="item in totalPage" :key="pageNo" @click="getlist(item - 1, currentFilter, currentCategories)"
            class="text-[#A39382] border-[#A39382] pb-1">{{ formatNumber(item) }}</span>
        </div>
        <button class="text-gray-300 hover:text-[#A39382] transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
