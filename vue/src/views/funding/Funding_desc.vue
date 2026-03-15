<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/funding'

const fundingDesc = ref()   // 해당 상품 리스트 
const fundingDetail = ref() // 추천 상품 리스트
const route = useRoute()
const Quantity = ref(1)


const activeTab = ref('story')
const selectedReward = ref(null)

const mainImage = ref('')

const getDesc = async () => {
  const idx = route.params.idx
  const res = await api.FundingDesc(idx)
  // console.log(res.result)
  fundingDesc.value = res.result

  mainImage.value = res.result.img

  // 데이터 불러온 후 바로 카운트다운 시작
  calculateTimeLeft()
  timerInterval = setInterval(calculateTimeLeft, 1000)

}

const getDetail = async () => {
  const res = await api.fundingDetail()
  // console.log(res)
  fundingDetail.value = res.result
  console.log("fundingDesc", fundingDetail.value)
}

const addQuantity = () => {
  Quantity.value = Quantity.value + 1
}

const minusQuantity = () => {
  if (Quantity.value > 1)
    Quantity.value = Quantity.value - 1
}

// 총 금액 계산 로직 (선택된 리워드 가격 * 수량)
const totalPrice = computed(() => {
  if (!selectedReward.value) return 0
  return selectedReward.value.price * Quantity.value
})

// 리워드 선택 함수
const selectReward = (item) => {
  selectedReward.value = item
}

// 메인 이미지 변경
const changeMainImage = (newSrc) => {
  mainImage.value = newSrc
}

// 실시간 시간 
// ... 기존 변수들 ...
const timeLeft = ref('')
let timerInterval = null

// 카운트다운 계산 함수
const calculateTimeLeft = () => {
  if (!fundingDesc.value || !fundingDesc.value.endDays) return

  const targetDate = new Date(fundingDesc.value.endDays).getTime()
  const now = new Date().getTime()
  const distance = targetDate - now

  if (distance < 0) {
    timeLeft.value = "펀딩 종료"
    if (timerInterval) clearInterval(timerInterval)
    return
  }

  // 일, 시, 분, 초 계산
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  // 00 형식으로 맞추기 (예: 04일 05:06:07)
  timeLeft.value = `${String(days).padStart(2, '0')}일 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 현재 퍼센트 계산 
const calculatedPercent = computed(() => {
  // 데이터가 없거나 목표 금액이 0인 경우 방어 로직
  if (!fundingDesc.value || !fundingDesc.value.targetPrice || fundingDesc.value.targetPrice === 0) {
    return 0;
  }

  // 현재 모인 금액 (DB 필드명이 'raised'라고 가정)
  const raised = fundingDesc.value.targetPrice; // 실제 DB에서 넘어오는 '현재 모금액' 필드명으로 수정하세요.
  // 목표 금액 (DB 필드명이 'goalPrice'라고 가정)
  const goal = 10800000; // 이 부분도 DB 필드(fundingDesc.value.goalPrice)로 교체 가능합니다.

  return Math.floor((raised / goal) * 100);
});

onMounted(() => {
  getDesc()
  getDetail()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <main v-if="fundingDesc" class="max-w-[1440px] mx-auto px-4 md:px-10 py-8">
    <!-- Breadcrumb -->
    <nav class="text-[10px] text-gray-400 mb-6 uppercase tracking-[0.2em]">
      Home / Funding / Handmade /
      <span class="text-gray-600">Celestial Rose — 수공예 다이아 귀걸이</span>
    </nav>

    <!-- Cover -->
    <section class="relative overflow-hidden rounded-md border border-[#2A2A2A] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#252525] to-[#111111] shadow-sm h-[260px] md:h-[340px] mb-10 flex items-end">
      <!-- <img :src="fundingDesc.img"
        alt="Funding Cover" class="w-full h-full object-cover" /> -->
      <div class="absolute inset-0 banner-gradient"></div>

      <div class="absolute left-6 md:left-10 bottom-8 md:bottom-10 text-white max-w-2xl">
        <div class="flex items-center space-x-2 mb-4">
          <span
            class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest">Handmade</span>
          <span class="px-3 py-1 bg-[#A39382] rounded-full text-[10px] uppercase tracking-widest">{{
            fundingDesc.category }}</span>
          <span class="px-3 py-1 bg-black/35 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest"
            id="status-badge">{{ fundingDesc.brand }}</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-light font-serif-luxury italic leading-tight">
          {{ fundingDesc.name }}
        </h1>
        <p class="text-sm md:text-[14px] font-light text-gray-200 leading-loose mt-4 opacity-95">
          장인의 손끝에서 완성되는 수공예 주얼리. 펀딩으로 제작을 응원하고, 리워드로 당신만의 작품을
          받아보세요.
        </p>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left: Story / Detail -->
      <div class="lg:col-span-8">
        <section class="mb-10">
          <div class="border border-gray-100 bg-gray-50 rounded-md overflow-hidden">
            <div class="aspect-square w-full">
              <img id="main-img" :src="mainImage" class="w-full h-full object-cover" alt="Main" />
            </div>
          </div>

          <div class="mt-4 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              class="thumb shrink-0 border border-[#A39382] rounded-md overflow-hidden w-24 aspect-square bg-white"
              @click="changeMainImage(fundingDesc.img)">
              <img :src="fundingDesc.img" class="w-full h-full object-cover" alt="Thumb 1" />
            </button>
            <div v-for="img in fundingDesc.fundingImgList">
              <button
                class="thumb shrink-0 border border-[#A39382] rounded-md overflow-hidden w-24 aspect-square bg-white"
                @click="changeMainImage(img.imgDetail)" :data-src="img.imgDetail">
                <img :src="img.imgDetail" class="w-full h-full object-cover" alt="Thumb 1" />
              </button>
            </div>

          </div>
        </section>

        <!-- Tabs -->
        <div class="flex border-b border-gray-100 mb-6">
          <button v-for="tab in ['story', 'maker', 'process', 'shipping']" :key="tab" @click="activeTab = tab" :class="['px-6 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors',
            activeTab === tab ? 'tab-active font-bold' : 'text-gray-400 font-medium']">
            {{ tab }}
          </button>
        </div>

        <!-- Tab Contents -->
        <div v-show="activeTab === 'story'" id="tab-story" class="tab-panel space-y-10">
          <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-6 border border-gray-100 rounded-md bg-white">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Key Point</p>
              <p class="text-sm text-gray-700 leading-relaxed font-light">
                {{ fundingDesc.fundingStory.keyPoint }}
              </p>
            </div>
            <div class="p-6 border border-gray-100 rounded-md bg-white">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Material</p>
              <p class="text-sm text-gray-700 leading-relaxed font-light">
                {{ fundingDesc.fundingStory.material }}
              </p>
            </div>
            <div class="p-6 border border-gray-100 rounded-md bg-white">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Handmade</p>
              <p class="text-sm text-gray-700 leading-relaxed font-light">
                {{ fundingDesc.fundingStory.handMade }}
              </p>
            </div>
          </section>



          <section class="p-8 border border-gray-100 rounded-md bg-white space-y-5">
            <h2 class="text-xl font-light tracking-[0.25em] uppercase text-gray-900">
              Project Story
            </h2>
            <p class="text-sm text-gray-600 leading-relaxed font-light">
              {{ fundingDesc.fundingStory.projectStory }}
            </p>
          </section>

          <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-8 border border-gray-100 rounded-md bg-white">
              <h3 class="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-3">
                For Supporters
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed font-light">
                사이즈/도금 옵션은 결제 후에도 마감 전까지 변경 가능(프로젝트 정책에 따라 상이).
                수공예 특성상 미세한 결 차이가 있을 수 있으며, 이는 불량이 아닌 작품의 개성으로
                안내됩니다.
              </p>
            </div>
            <div class="p-8 border border-gray-100 rounded-md bg-white">
              <h3 class="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-3">Care Guide</h3>
              <p class="text-sm text-gray-600 leading-relaxed font-light">
                착용 후 부드러운 천으로 닦아 보관해 주세요. 향수/헤어스프레이/수영장 등 화학 성분
                접촉은 변색을 유발할 수 있습니다.
              </p>
            </div>
          </section>
        </div>

        <div v-show="activeTab === 'maker'" id="tab-maker" class="tab-panel space-y-10">
          <section class="p-8 border border-gray-100 rounded-md bg-white">
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Maker</p>
                <h2 class="text-2xl font-light text-gray-900">{{ fundingDesc.brand }}</h2>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-5 bg-gray-50 rounded-md border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Experience</p>
                <p class="text-sm text-gray-700 font-light">{{ fundingDesc.fundingMaker.experience }}</p>
              </div>
              <div class="p-5 bg-gray-50 rounded-md border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Style</p>
                <p class="text-sm text-gray-700 font-light">{{ fundingDesc.fundingMaker.style }}</p>
              </div>
              <div class="p-5 bg-gray-50 rounded-md border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Promise</p>
                <p class="text-sm text-gray-700 font-light">{{ fundingDesc.fundingMaker.promise }}</p>
              </div>
            </div>

            <div class="mt-8 text-sm text-gray-600 leading-relaxed font-light">
              <p>
                “작품이 되는 순간은, 재료의 작은 결을 읽어내는 시간에서 시작됩니다.” {{ fundingDesc.brand }}는
                수공예의 결을 살리는 제작 방식으로, 똑같은 제품이 반복되지 않도록 각 작품에 미세한
                변주를 남깁니다.
              </p>
            </div>
          </section>
        </div>

        <div v-show="activeTab === 'process'" id="tab-process" class="tab-panel  space-y-10">
          <section class="p-8 border border-gray-100 rounded-md bg-white space-y-6">
            <h2 class="text-xl font-light tracking-[0.25em] uppercase text-gray-900">
              Making Process
            </h2>

            <div class="space-y-8">
              <div v-for="(Process, index) in fundingDesc.fundingProcessList" :key="Process.idx"
                class="flex items-start space-x-4 mb-8">

                <div
                  class="w-8 h-8 rounded-full accent-bg text-white flex items-center justify-center text-sm font-bold process-number shrink-0">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ Process.title }}</p>
                  <p class="text-sm text-gray-600 font-light leading-relaxed mt-1">
                    {{ Process.contents }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-show="activeTab === 'shipping'" id="tab-shipping" class="tab-panel  space-y-10">
          <section class="p-8 border border-gray-100 rounded-md bg-white space-y-6">
            <h2 class="text-xl font-light tracking-[0.25em] uppercase text-gray-900">
              Shipping & Policy
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 font-light leading-relaxed">
              <div class="p-6 bg-gray-50 rounded-md border border-gray-100">
                <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Estimated Delivery
                </p>
                <p>펀딩 종료 후 10~21일 내 순차 발송 (수량/공정에 따라 변동 가능)</p>
              </div>
              <div class="p-6 bg-gray-50 rounded-md border border-gray-100">
                <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Exchange / Refund
                </p>
                <p>
                  수공예 맞춤 제작 특성상 단순 변심 환불 제한. 불량/파손은 수령 후 7일 이내 접수.
                </p>
              </div>
            </div>

            <div class="text-sm text-gray-600 font-light leading-relaxed">
              <p class="flex items-start">
                <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3 mt-2"></span>
                도금/원석/수공예 공정 특성상 미세한 색/결 차이가 있을 수 있습니다.
              </p>
              <p class="flex items-start mt-3">
                <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3 mt-2"></span>
                배송 주소/옵션 변경은 “펀딩 종료 전”에만 가능하도록 설정할 수 있습니다(운영 정책에
                따라).
              </p>
            </div>
          </section>
        </div>
      </div>

      <!-- Right: Funding summary + Rewards -->
      <aside class="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
        <div class="border border-gray-100 rounded-md bg-white p-7 shadow-sm space-y-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-medium">
                Funding Progress
              </p>
              <p class="text-3xl font-bold accent-text" id="percent-text">{{ calculatedPercent }} %</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-medium">
                Time Left
              </p>
              <p class="text-lg font-mono text-gray-800 tracking-wider" id="countdown">
                {{ timeLeft || '계산 중...' }}
              </p>
            </div>
          </div>

          <div>
            <div class="w-full h-[4px] rounded-full overflow-hidden bg-gray-100">
              <div id="progress-fill" class="h-full" :style="{
                width: Math.min(calculatedPercent, 100) + '%',
                backgroundColor: '#a39382'
              }"></div>
            </div>
            <div class="flex justify-between mt-3 text-sm">
              <div class="space-x-2">
                <span class="text-gray-400 text-[11px]">모인 금액</span>
                <span class="text-gray-900 font-medium" id="raised">
                  ₩{{ Number(fundingDesc.targetPrice).toLocaleString() }}</span>
              </div>
              <div class="space-x-2">
                <span class="text-gray-400 text-[11px]">목표</span>
                <span class="text-gray-900 font-medium" id="goal">₩ 10,800,000</span>
              </div>
            </div>
            <div class="flex justify-between mt-2 text-sm">
              <div class="space-x-2">
                <span class="text-gray-400 text-[11px]">서포터</span>
                <span class="text-gray-900 font-medium" id="supporters">{{ fundingDesc.supporters }}명</span>
              </div>
              <div class="space-x-2">
                <span class="text-gray-400 text-[11px]">종료</span>
                <span class="text-gray-900 font-medium">{{ fundingDesc.endDays }}</span>
              </div>
            </div>
          </div>

          <div class="flex space-x-2 pt-1">
            <button class="flex-1 py-3 text-[11px] font-bold tracking-widest uppercase ghost-btn rounded-sm">
              ❤️ 위시리스트
            </button>
            
          </div>

          <div class="pt-2">
            <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Selected Reward</p>
            <p class="text-sm text-gray-700 font-light" id="selected-reward-text">
              {{ selectedReward ? selectedReward.title : '리워드를 선택해주세요.' }}
            </p>
          </div>

          <!-- ✅ 첫 번째 버튼 수정: 색상 강제 지정 -->
          <button id="support-btn"
            class="w-full py-4 bg-[#9B8A7E] text-white font-bold text-xs tracking-[0.3em] uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8e7f74] transition-colors">
            Support this Project
          </button>

          <p class="text-[11px] text-gray-400 leading-relaxed font-light">
            결제는 프로젝트 종료 시점에 진행되며, 목표 미달 시 자동 취소됩니다(정책 설정 가능).
          </p>
        </div>

        <div class="border border-gray-100 rounded-md bg-white p-7 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold">리워드 선택</h3>
            <span class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Rewards</span>
          </div>

          <div class="space-y-4 max-h-[420px] overflow-auto pr-1 no-scrollbar">
            <button class="reward reward-card w-full text-left rounded-md p-5"
              v-for="item in fundingDesc.fundingRewardsList" :key="item.idx" @click="selectReward(item)">

              <div class="flex items-start justify-between">
                <div>
                  <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                    Option {{ item.idx }}
                  </p>
                  <p class="text-sm font-bold text-gray-900">{{ item.title }}</p>
                  <p class="text-[12px] text-gray-500 mt-2 font-light leading-relaxed">
                    {{ item.contents }}
                  </p>
                </div>
                <div class="text-right ml-4">
                  <p class="text-sm font-bold accent-text">
                    ₩{{ Number(item.price).toLocaleString() }}
                  </p>
                  <p class="text-[11px] text-gray-400 mt-1">수량: {{ item.stock }}</p>
                </div>
              </div>
            </button>
          </div>

          <!-- 수량 선택 부분-->
          <div class="mt-6 border-t border-gray-100 pt-6 space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400">Quantity</p>
              <div class="flex items-center space-x-2">
                <button @click="minusQuantity()" id="qty-minus"
                  class="w-9 h-9 ghost-btn rounded-sm flex items-center justify-center">
                  −
                </button>
                <input id="qty" type="number" :min="1" :value="Quantity"
                  class="w-14 text-center border border-gray-100 rounded-sm py-2 focus:outline-none focus:border-[#A39382]" />
                <button @click="addQuantity()" id="qty-plus"
                  class="w-9 h-9 ghost-btn rounded-sm flex items-center justify-center">
                  +
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400">Total</p>
              <p class="text-lg font-bold accent-text" id="total">₩ {{ totalPrice.toLocaleString() }}</p>
            </div>

            <!-- ✅ 두 번째 버튼 수정: 색상 강제 지정 -->
            <button id="support-btn-2" :disabled="!selectedReward"
              class="w-full py-4 bg-[#9B8A7E] text-white font-bold text-xs tracking-[0.3em] uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8e7f74] transition-colors">
              Support Now
            </button>

            <p class="text-[11px] text-gray-400 leading-relaxed font-light">
              * “Add-on”은 단독 구매가 아닌 리워드와 함께 선택하는 옵션으로 설계했습니다(필요하면
              로직 확장 가능).
            </p>
          </div>
        </div>
      </aside>
    </section>

    <section class="mt-24">
      <div class="flex justify-between items-end mb-8">
        <h2 class="text-2xl font-bold">함께 보면 좋은 수공예 펀딩</h2>
        <RouterLink :to="{ name: 'funding_list' }">
          <button class="text-sm text-gray-400 hover:text-black transition">더보기</button>
        </RouterLink>

      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        <div v-for="product in fundingDetail.fundingList" class="group cursor-pointer">
          <div class="aspect-video overflow-hidden bg-gray-100 mb-4 relative rounded-md">
            <img :src="product.img"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Related">
            <div class="absolute top-3 left-3">
              <span
                class="bg-[#A39382] text-white px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase">Handmade</span>
            </div>
          </div>
          <h3 class="text-md font-bold leading-snug group-hover:text-[#A39382] transition-colors line-clamp-2">
            {{ product.brand }} — {{ product.name }}</h3>
          <p class="text-[12px] text-gray-400 mt-2">{{ product.category }} | {{ product.percent }}% 달성</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

:root {
  /* ✅ CSS 변수도 동일한 색상으로 업데이트 */
  --accent-color: #9B8A7E;
  --accent-hover: #8e7f70;
  --bg-light: #ffffff;
  --text-main: #1a1a1a;
  --border-color: #eeeeee;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background: var(--bg-light);
  color: var(--text-main);
  margin: 0;
  word-break: keep-all;
}

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}

.luxury-font {
  font-family: 'Cinzel', serif;
}

.accent-text {
  color: var(--accent-color);
}

.accent-bg {
  background-color: var(--accent-color);
}

.border-accent {
  border-color: var(--accent-color);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.banner-gradient {
  background: linear-gradient(to right, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0) 62%);
}

.tab-active {
  border-bottom: 2px solid var(--accent-color);
  color: var(--accent-color);
}

/* ✅ primary-btn 색상을 브라운 톤으로 고정 */
.primary-btn {
  background: #9B8A7E;
  color: #fff;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  opacity: 0.92;
  background: #8e7f74;
}

.ghost-btn {
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.reward-card {
  border: 1px solid #f1f1f1;
  transition: all 0.2s ease;
}

.reward-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.reward-selected {
  border-color: var(--accent-color) !important;
  box-shadow: 0 12px 35px rgba(163, 147, 130, 0.18) !important;
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

/* ✅ 시안처럼 번호를 스타일링하기 위한 CSS 추가 */
.process-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #9B8A7E;
  /* --accent-color 값 직접 적용 */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Cinzel', serif;
  /* 숫자 폰트 스타일 */
  margin-top: -2px;
  /* 제목 텍스트와 높이를 맞추기 위한 미세 조정 */
}

/* 타블렛/모바일 대응을 위한 미세 조정 */
@media (max-width: 768px) {
  .process-item {
    gap: 1rem;
  }

  .process-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>