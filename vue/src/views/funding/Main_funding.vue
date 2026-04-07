<script setup>
import { reactive, onMounted , ref} from 'vue'
import api from '@/api/funding'

const funding_list = reactive([])
const currentList = reactive([])

const getlist = async () => {
  const res = await api.mainfundList()


  if (res.code == 2000) {
    funding_list.push(...res.result)
    currentList.push(...res.result)

  } else {
    alert('list.json 파일을 불러오지 못하였음')
  }
}

// [추가] 현재 선택된 탭 상태 (기본값: '전체')
const currentFilter = ref('all')

// [추가] 화면에 보여줄 프로젝트 리스트 (필터 및 정렬 적용)
const currentItem = () => {
  if (currentFilter.value === 'all') {
    currentList.sort((a, b) => a.idx - b.idx)
  }

  if (currentFilter.value === 'percent') {
    // '마감 임박' 클릭 시: days(남은 일수)가 적은 순으로 정렬
    currentList.sort((a, b) => b.percent - a.percent)
  }

  return currentList
}

onMounted(() => {
  getlist()
})
</script>

<template>
  <!-- Hero Section -->
  <section class="relative h-[65vh] flex items-end overflow-hidden border-b border-[#2A2A2A] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#252525] to-[#0F0F0F] shadow-sm">
    <div class="absolute inset-0 scale-105 group">
      
      <meta name="referrer" content="no-referrer" />
      <div class="absolute inset-0 premium-gradient"></div>
    </div>

    <div class="relative max-w-[1440px] mx-auto px-6 md:px-12 w-full text-white">
      <div class="max-w-2xl reveal active">
        <span class="inline-block text-[#A39382] font-bold tracking-[0.3em] text-xs mb-6 uppercase"
          >Exclusive Selection</span
        >
        <h1 class="text-4xl md:text-7xl font-serif-luxury italic font-light leading-[1.1] mb-6">
          Heritage in<br />Modern Glow
        </h1>
        <p class="text-gray-300 text-sm md:text-base font-light leading-relaxed mb-10 max-w-lg">
          시간이 흘러도 변하지 않는 가치. 아티스트의 영감이 깃든 단 하나의 주얼리를 FACET 펀딩을
          통해 소유하십시오.
        </p>
      </div>
    </div>
  </section>

  <!-- Project List Section -->
  <section class="max-w-[1440px] mx-auto py-24 px-6 md:px-12">
    <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
      <div class="reveal active">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">현재 진행 중인 펀딩</h2>
        <div class="h-1 w-20 bg-[#A39382]"></div>
      </div>

      <div class="flex space-x-2 reveal active" style="transition-delay: 0.2s">
        <button
          @click="((currentFilter = 'all'), currentItem())"
          :class="currentFilter == 'all' ? 'border-black' : ''"
          class="px-5 py-2 text-xs font-bold rounded-full transition-all border text-black hover:border-black"
        >
          전체
        </button>
        <button
          @click="((currentFilter = 'percent'), currentItem())"
          :class="currentFilter == 'percent' ? 'border-black' : ''"
          class="px-5 py-2 text-xs font-bold rounded-full transition-all border text-black hover:border-black"
        >
          인기순
        </button>
        
      </div>
    </div>

    <!-- Project Grid Container -->
    <div id="project-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
      <!-- Content will be dynamically rendered here -->

      <div
        v-for="item in currentList.slice(0, 4)"
        class="group cursor-pointer flex flex-col h-full tab-item-enter"
      >
        <RouterLink :to="`/funding/funding_desc/${item.idx}`" class="block">
          <div class="relative aspect-[4/3] overflow-hidden rounded-sm bg-gray-50 mb-5">
            <img
              :src="item.img"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Jewelry"
            />
            <div class="absolute top-4 left-4">
              <span
                class="bg-black/80 backdrop-blur-md text-white px-3 py-1 text-[10px] font-bold rounded-full tracking-tighter uppercase"
              >
                {{ item.status }}
              </span>
            </div>
          </div>
          <div class="flex flex-col flex-grow">
            <p class="text-[10px] text-[#A39382] font-bold tracking-[0.2em] uppercase mb-2">
              {{ item.brand }}
            </p>
            <h3
              class=" font-bold leading-snug line-clamp-2 min-h-[40px] group-hover:text-[#A39382] transition-colors"
            >
              {{ item.name }}
            </h3>

            <div class="mt-auto pt-5 space-y-3">
              <div class="flex justify-between items-end">
                <span
                  class="`text-2xl font-serif-luxury font-bold ${isClosing ? 'text-red-500' : 'text-[#A39382]'}`"
                >
                  {{ item.percent.toLocaleString() }}<span class="text-xs ml-0.5">%</span>
                </span>
                <span class="text-[13px] font-medium text-gray-900">
                  모인 금액 {{ item.targetPrice.toLocaleString() }}</span>
              </div>
              <div class="w-full h-[2px] bg-gray-100 overflow-hidden rounded-full">
                <div
                  class="h-full ${isClosing ? 'bg-red-500' : 'bg-[#A39382]'} progress-bar-shine"
                  :style="`width: ${Math.min(item.percent / 10, 100)}%`"
                ></div>
              </div>
              <div class="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>{{ item.supporters }}명의 서포터</span>
                <span class="${isClosing ? 'text-red-500 font-bold' : ''}">{{ item.status }}</span>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <div id="load-more-container" class="mt-24 text-center reveal active">
      <RouterLink :to="{ name: 'funding_list' }" class="block">
        <button
          onclick="handleLoadMore()"
          id="load-more-btn"
          class="px-12 py-4 border border-black text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-500 shadow-sm min-w-[240px]"
        >
          More Projects
        </button>
      </RouterLink>
    </div>
  </section>

  <!-- Why Facet -->
  <section class="bg-zinc-900 py-32 text-white overflow-hidden">
    <div class="max-w-[1440px] mx-auto px-6 md:px-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div class="reveal active">
          <span
            class="text-[#A39382] font-bold tracking-[0.3em] text-xs mb-6 inline-block uppercase"
            >Our Commitment</span
          >
          <h2 class="text-4xl md:text-5xl font-serif-luxury italic mb-10 leading-tight">
            장인정신과 데이터가<br />만들어내는 신뢰
          </h2>
          <p class="text-zinc-400 font-light leading-relaxed mb-12">
            Facet은 단순한 판매를 넘어, 작품 하나하나가 가진 역사와 가치를 검증합니다. 전문가의
            안목으로 선별된 메이커들과 함께 주얼리의 새로운 문화를 만듭니다.
          </p>
          <div class="grid grid-cols-2 gap-8">
            <div>
              <p class="text-3xl font-serif-luxury text-[#A39382] mb-2">98.2%</p>
              <p class="text-[10px] uppercase tracking-widest text-zinc-500">
                Project Success Rate
              </p>
            </div>
            <div>
              <p class="text-3xl font-serif-luxury text-[#A39382] mb-2">12,504</p>
              <p class="text-[10px] uppercase tracking-widest text-zinc-500">Active Collectors</p>
            </div>
          </div>
        </div>
        <div class="relative reveal active" style="transition-delay: 0.3s">
          <div class="absolute -inset-10 bg-[#A39382]/10 blur-[100px] rounded-full"></div>
          <img
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1000&q=80"
            class="rounded-sm shadow-2xl relative z-10 w-full"
            alt="Craftsmanship"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300&family=Cinzel:wght@400;700&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

:root {
  --brand-gold: #a39382;
  --brand-dark: #1a1a1a;
  --brand-bg: #fdfcfb;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  word-break: keep-all;
  background-color: var(--brand-bg);
  color: var(--brand-dark);
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

.premium-gradient {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(26, 26, 26, 0.2) 100%);
}

.progress-bar-shine {
  position: relative;
  overflow: hidden;
}
.progress-bar-shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}
@keyframes shine {
  to {
    left: 100%;
  }
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.active {
  opacity: 1;
  transform: translateY(0);
}

.hover-lift {
  transition:
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s ease;
}
.hover-lift:hover {
  transform: translateY(-12px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08);
}

/* 탭 전환 애니메이션 */
#project-grid {
  transition: opacity 0.4s ease;
}
.tab-item-enter {
  animation: tabFadeIn 0.6s ease-out forwards;
}
@keyframes tabFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-btn.active {
  background-color: #000;
  color: #fff;
}

/* 로딩 애니메이션 (버튼용) */
.loading-dots::after {
  content: '...';
  animation: dots 1.5s steps(5, end) infinite;
}
@keyframes dots {
  0%,
  20% {
    color: rgba(0, 0, 0, 0);
    text-shadow:
      0.25em 0 0 rgba(0, 0, 0, 0),
      0.5em 0 0 rgba(0, 0, 0, 0);
  }
  40% {
    color: black;
    text-shadow:
      0.25em 0 0 rgba(0, 0, 0, 0),
      0.5em 0 0 rgba(0, 0, 0, 0);
  }
  60% {
    text-shadow:
      0.25em 0 0 black,
      0.5em 0 0 rgba(0, 0, 0, 0);
  }
  80%,
  100% {
    text-shadow:
      0.25em 0 0 black,
      0.5em 0 0 black;
  }
}
</style>
