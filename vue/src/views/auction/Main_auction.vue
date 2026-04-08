<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/api/auction'

const auction_list = reactive([])
const currentList = reactive([])

// 경매 상품 DB에서 불러오기
const getlist = async () => {
  const res = await api.mainList()

  if (res.code == 2000) {
    auction_list.length = 0
    auction_list.push(...res.result.auctionList)
  } else {
    alert('해당 상품에 대한 desc.json 파일을 불러오지 못함')
  }
}

// [추가] 현재 선택된 탭 상태 (기본값: '전체')
const currentFilter = ref('all')

// [추가] 화면에 보여줄 프로젝트 리스트 (필터 및 정렬 적용)
const displayItems = () => {
  if (currentFilter.value === 'all') {
    currentList.sort((a, b) => a.idx - b.idx)
  }

  if (currentFilter.value === 'imminent') {
    // '마감 임박' 클릭 시: days(남은 일수)가 적은 순으로 정렬
    currentList.sort((a, b) => a.days - b.days)
  }

  return currentList
}

const currentImg = ref(0)

const bannerItems = computed(() => {
  if (!auction_list) return []

  return auction_list.slice(0, 4)
})
// 다음 버튼 함수
const nextBanner = () => {
  if (bannerItems.value.length === 0) return

  if (currentImg.value < bannerItems.value.length - 1) {
    currentImg.value++
    // 3. 로그 출력 시에도 .value 필수
    console.log(auction_list.slice(0, 7))
  } else {
    currentImg.value = 0
  }
}

// 이전 버튼 함수
const prevBanner = () => {
  if (bannerItems.value.length === 0) return

  if (currentImg.value > 0) {
    currentImg.value--
  } else {
    currentImg.value = bannerItems.value.length - 1 // 처음이면 마지막으로
  }
}

// 숫자를 '01' 형태로 포맷팅
const formatNumber = (num) => {
  return String(num + 1).padStart(2, '0')
}

onMounted(() => {
  getlist()
})
</script>

<template>
  <div v-if="auction_list != null">
    <!-- Hero & Ranking Section -->
    <section
        class="max-w-[1440px] mx-auto px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-gray-50 pb-12"
    >
      <!-- [좌측] 메인 비주얼 슬라이더 -->
      <div
          class="lg:col-span-9 relative group h-[400px] md:h-[550px] overflow-hidden rounded-md shadow-sm"
      >
        <RouterLink :to="`/auction/detail/${auction_list[currentImg]?.idx}`">
          <div id="hero-slider" class="relative w-full h-full">
            <img
                id="slider-img"
                :src="auction_list[currentImg]?.image"
                class="w-full h-full object-cover fade-in"
                alt="Main Jewelry"
            />

            <div class="absolute inset-0 banner-gradient"></div>

            <div
                class="absolute bottom-10 left-10 text-white max-w-2xl fade-in"
                id="slider-content"
            >
              <h2
                  class="text-3xl md:text-5xl font-light font-serif-luxury leading-tight italic mb-4 line-clamp-1"
              >
                {{ auction_list[currentImg]?.name }}
              </h2>
              <p
                  id="slider-desc"
                  class="text-sm font-light text-gray-200 leading-loose mb-6 opacity-90"
              >
                역사적 가치를 지닌 빈티지 주얼리부터, 현대적 마스터피스까지 당신만의 빛을 찾으세요.
              </p>
              <div class="flex space-x-2">
                <span
                    class="px-3 py-1 bg-white/60 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest"
                >{{ auction_list[currentImg]?.category }}</span
                >
                <span
                    class="px-3 py-1 bg-[#A39382] rounded-full text-[10px] uppercase tracking-widest"
                >{{ auction_list[currentImg]?.brandName }}</span
                >
              </div>
            </div>
          </div>
        </RouterLink>

        <div
            class="absolute bottom-6 right-10 flex items-center space-x-4 text-white text-[10px] tracking-widest z-10"
        >
          <span id="slider-counter">{{ formatNumber(currentImg) }} / 05</span>
          <div class="flex space-x-1">
            <button
                @click="prevBanner"
                class="w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            >
              ←
            </button>
            <button
                @click="nextBanner"
                class="w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            >
              →
            </button>
          </div>
        </div>
        >
      </div>

      <!-- [우측] 실시간 랭킹 -->
      <div class="lg:col-span-3 flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold">실시간 랭킹</h3>
          <span class="text-[10px] text-gray-400">Live Ranking</span>
        </div>
        <div class="flex-1 flex flex-col justify-between space-y-4">
          <RouterLink
              v-for="item in auction_list?.slice(0, 7)"
              :to="`/auction/detail/${item.idx}`"
              class="flex items-center space-x-3 group"
          >
            <span class="text-xl font-bold italic text-[#A39382] w-6">{{ item.idx }}</span>
            <div class="flex-1">
              <p class="text-[13px] font-medium group-hover:underline line-clamp-1">
                {{ item.name }}
              </p>
              <p class="text-[10px] text-[#A39382] font-bold">{{ auction_list[currentImg]?.brandName }}</p>
            </div>
            <div class="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
              <img :src="item.image" class="w-full h-full object-cover" alt="Ring" />
            </div>
          </RouterLink>
        </div>
        <RouterLink :to="{ name: 'auction_list' }">
          <button
              class="w-full mt-6 py-3 bg-gray-50 text-[11px] text-gray-500 rounded-md hover:bg-gray-100 transition"
          >
            랭킹 전체보기
          </button>
        </RouterLink>
      </div>
    </section>

    <!-- Categories -->
    <section class="max-w-[1440px] mx-auto py-10 px-4 md:px-10">
      <div
          class="flex items-center justify-between overflow-x-auto no-scrollbar pb-8 border-b border-gray-50"
      >
        <div
            v-for="cat in [
            { name: '반지', icon: '💍' },
            { name: '목걸이', icon: '✨' },
            { name: '귀걸이', icon: '💎' },
            { name: '팔찌', icon: '📿' },
            { name: '시계', icon: '⌚' },
            { name: '다이아', icon: '🔍' },
            { name: '빈티지', icon: '🏺' },
            { name: '원석', icon: '🔮' },
            { name: '커스텀', icon: '🛠️' },
          ]"
            :key="cat.name"
            class="flex flex-col items-center min-w-[90px] cursor-pointer group"
        >
          <RouterLink
              :to="`/auction/list?category=${cat.name}`"
              class="flex flex-col items-center w-full"
          >
            <div
                class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-white group-hover:border-[#A39382] border border-transparent transition-all duration-300 shadow-sm mb-3"
            >
              {{ cat.icon }}
            </div>
            <span
                class="text-[12px] font-medium text-gray-600 group-hover:text-[#A39382] transition-colors"
            >
              {{ cat.name }}
            </span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 추천 프로젝트 Grid -->
    <section class="max-w-[1440px] mx-auto py-12 px-4 md:px-10">
      <div class="flex justify-between items-end mb-8">
        <h2 class="text-2xl font-bold">인기 프로젝트</h2>
        <nav class="flex space-x-4 text-sm font-medium text-gray-400">
          <button
              @click="((currentFilter = 'all'), displayItems())"
              :class="currentFilter == 'all' ? 'border-black' : ''"
              class="px-5 py-2 text-xs font-bold rounded-full transition-all border text-black hover:border-black"
          >
            전체
          </button>
          <button
              :class="currentFilter == 'imminent' ? 'border-black' : ''"
              @click="((currentFilter = 'imminent'), displayItems())"
              class="px-5 py-2 text-xs font-bold rounded-full transition-all border text-black hover:border-black"
          >
            마감임박
          </button>
        </nav>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
        <!-- Project Card 1 -->
        <div
            class="group cursor-pointer flex flex-col h-full"
            v-for="item in auction_list?.slice(0, 4).filter(i => i.status === 'LIVE').slice(0, 4)"
        >
          <div class="aspect-video overflow-hidden bg-gray-100 mb-4 relative rounded-md">
            <RouterLink :to="`/auction/detail/${item.idx}`">
              <img
                  :src="item.image"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  :class="{ 'ended-image': item.status === 'END' }"
                  alt="Jewelry"
              />
            </RouterLink>

            <div class="absolute top-3 left-3">
              <span
                  v-if="item.status == 'BEFORE'"
                  class="bg-[#A39382] text-white px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase"
              >Coming Soon</span
              >
              <span
                  v-else-if="item.status == 'END'"
                  class="bg-[#000000] text-[#cccccc] px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase"
              >END</span
              >
              <span
                  v-else
                  class="bg-[#CC0000] text-white px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase"
              >Live</span
              >
            </div>
          </div>
          <div class="flex flex-col flex-grow">
            <!-- min-h-[48px]를 통해 제목이 1줄이어도 2줄 높이를 차지하게 하여 아래 요소들의 위치를 고정합니다 -->
            <h3
                class="text-md font-bold leading-snug group-hover:text-[#A39382] transition-colors line-clamp-2 min-h-[48px]"
            >
              {{ item.name }}
            </h3>
            <p class="text-[12px] text-gray-400 mb-4">
              {{ item.brandName }} &nbsp | &nbsp{{ item.category }}
            </p>

            <!-- mt-auto를 통해 게이지바 세트가 항상 하단에 붙도록 합니다 -->
            <div class="mt-auto pt-2">
              <div class="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
                <div class="w-[45%] h-full bg-[#A39382]"></div>
              </div>
              <div class="flex justify-between items-center mt-3">
                <div class="flex items-center space-x-2">
                  <span class="text-[13px] font-medium text-gray-400 italic"
                  >₩ {{ item?.startPrice.toLocaleString() }}</span
                  >
                </div>
                <span class="text-[12px] text-gray-400">
                  {{ item.bidCount.toLocaleString() }}명 참여</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-20">
        <button
            class="px-10 py-3 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition rounded-md"
        >
          <RouterLink :to="{ name: 'auction_list' }">프로젝트 더보기</RouterLink>
        </button>
      </div>
    </section>
  </div>
  <div v-else class="py-20 text-center text-gray-400">데이터를 불러오는 중입니다.</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');
/* Cinzel(로고용) 및 Noto Sans KR 폰트 추가 */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

body {
  font-family: 'Noto Sans KR', sans-serif;
  word-break: keep-all;
}

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}

.luxury-font {
  font-family: 'Cinzel', serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.banner-gradient {
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%);
}

/* 슬라이드 전환 애니메이션 */
.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0.3;
  }

  to {
    opacity: 1;
  }
}

.ended-image {
  /* 이미지 밝기를 60%로 낮춥니다. (0%는 완전 검은색, 100%는 원본) */
  filter: brightness(0.6) saturate(0.8);
  /* 부드럽게 전환되도록 애니메이션 효과 추가 (선택사항) */
  transition: filter 0.3s ease;
}
</style>