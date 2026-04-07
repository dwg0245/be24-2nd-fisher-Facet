<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/funding'
import { useRewardStore } from '@/stores/rewardStore';

const rewardStore = useRewardStore();
const route = useRoute()
const router = useRouter()

// --- 상태 관리 (State) ---
const fundingDesc = ref(null)
const fundingDetail = ref(null)
const mainImage = ref('')
const activeTab = ref('story')

// 리워드 선택 관련
const isRewardOpen = ref(false)   // 리워드 드롭다운 여부
const selectedReward = ref(null)  // 현재 선택 중인 리워드 객체
const quantity = ref(1)           // 현재 설정 중인 수량 (사용자 선택)
const currentSelected = ref([])   // 최종 담긴 리워드 리스트 (장바구니)



// --- 상품 상세 정보 불러오기 ---
const getDesc = async () => {
  const idx = route.params.idx
  const res = await api.FundingDesc(idx)
  fundingDesc.value = res.result

  mainImage.value = res.result.img

  calculateTimeLeft()
  timerInterval = setInterval(calculateTimeLeft, 1000)
}

// --- 추천 리스트 불러오기 ---
const getDetail = async () => {
  const res = await api.fundingDetail()
  fundingDetail.value = res.result
}

// --- [수정] 리워드 선택 (방어 로직 추가) ---
const selectReward = (item) => {
  // 재고가 0 이하면 함수 실행 중단
  if (!item || item.quantity <= 0) return

  selectedReward.value = item
  quantity.value = 1      // 수량 초기화
  isRewardOpen.value = false
}

// --- [추가] 수량 증가 로직 (재고 제한) ---
const increaseQty = () => {
  if (quantity.value < selectedReward.value.quantity) {
    quantity.value++
  } else {
    alert(`현재 남은 재고는 ${selectedReward.value.quantity}개입니다.`)
  }
}

// --- 리스트에 추가 (장바구니 담기) ---
const addToList = () => {
  if (!selectedReward.value) return

  currentSelected.value.push({
    UUid: Date.now(),
    idx: selectedReward.value.idx,
    title: selectedReward.value.title,
    price: selectedReward.value.price,
    contents: selectedReward.value.contents,
    quantity: quantity.value
  })

  // 선택 영역 초기화
  selectedReward.value = null
  quantity.value = 1
}

// --- 리스트에서 제거 ---
const removeReward = (id) => {
  currentSelected.value = currentSelected.value.filter(i => i.UUid !== id)
}

// --- 총 금액 계산 ---
const targetPrice = computed(() => {
  return currentSelected.value.reduce((acc, i) => acc + (i.price * i.quantity), 0)
})

// --- 피니아 저장 및 결제 이동 ---
const selectAndGo = () => {
  if (currentSelected.value.length === 0) return
  const idx = route.params.idx
  rewardStore.updateRewards(idx, currentSelected.value, targetPrice.value)
  router.push({ name: 'payment' })

}

// --- 메인 이미지 변경 ---
const changeMainImage = (newSrc) => { mainImage.value = newSrc }

// --- 실시간 시간 계산 ---
const timeLeft = ref('')
let timerInterval = null

const calculateTimeLeft = () => {
  if (!fundingDesc.value?.endDays) return
  const targetDate = new Date(fundingDesc.value.endDays).getTime()
  const distance = targetDate - new Date().getTime()

  if (distance < 0) {
    timeLeft.value = "펀딩 종료"
    clearInterval(timerInterval)
    return
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  timeLeft.value = `${String(days).padStart(2, '0')}일 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}




onMounted(() => {
  getDesc()
  getDetail()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <main v-if="fundingDetail && fundingDesc" class="max-w-[1440px] mx-auto px-4 md:px-10 py-8">
    <nav class="text-[10px] text-gray-400 mb-6 uppercase tracking-[0.2em]">
      Home / Funding / Handmade /
      <span class="text-gray-600">{{ fundingDesc.name }}</span>
    </nav>

    <section
      class="relative overflow-hidden rounded-md border border-[#2A2A2A] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#252525] to-[#111111] shadow-sm h-[260px] md:h-[340px] mb-10 flex items-end">
      <div class="absolute inset-0 banner-gradient"></div>
      <div class="absolute left-6 md:left-10 bottom-8 md:bottom-10 text-white max-w-3xl px-4">
        <div class="flex items-center space-x-2 mb-4">
          <span
            class="inline-flex items-center rounded-full bg-zinc-800/50 px-4 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700/50 uppercase tracking-widest">Handmade</span>
          <span
            class="inline-flex items-center rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-800 ring-1 ring-inset ring-zinc-300 uppercase tracking-widest">{{
              fundingDesc.category }}</span>
          <span
            class="inline-flex items-center rounded-full bg-zinc-500 px-4 py-1.5 text-xs font-medium text-white ring-1 ring-inset ring-zinc-400">{{
              fundingDesc.brand }}</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-light font-serif-luxury italic leading-tight">{{ fundingDesc.name }}</h1>
        <p class="text-sm md:text-[14px] font-light text-gray-200 leading-loose mt-4 opacity-95">
          작가의 섬세한 손길로 탄생하는 수공예 주얼리. 펀딩을 통해 팀의 창작 활동을 응원하고 소장해 보세요.
        </p>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div class="lg:col-span-8">
        <section class="mb-10">
          <div class="border border-gray-100 bg-gray-50 rounded-md overflow-hidden aspect-square">
            <img :src="mainImage" class="w-full h-full object-cover transition-opacity duration-300" alt="Main" />
          </div>
          <div class="mt-4 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              class="thumb shrink-0 border border-[#A39382] rounded-md overflow-hidden w-24 aspect-square bg-white"
              @click="changeMainImage(fundingDesc.img)">
              <img :src="fundingDesc.img" class="w-full h-full object-cover" alt="Thumb Main" />
            </button>
            <div v-for="img in fundingDesc.fundImgList" :key="img.idx">
              <button
                class="thumb shrink-0 border border-gray-200 rounded-md overflow-hidden w-24 aspect-square bg-white hover:border-[#A39382]"
                @click="changeMainImage(img.imgDetail)">
                <img :src="img.imgDetail" class="w-full h-full object-cover" alt="Thumb Detail" />
              </button>
            </div>
          </div>
        </section>

        <div class="flex border-b border-gray-100 mb-6">
          <button v-for="tab in ['story', 'maker', 'process', 'shipping']" :key="tab" @click="activeTab = tab"
            :class="['px-6 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors', activeTab === tab ? 'border-b-2 border-[#A39382] text-black font-bold' : 'text-gray-400 font-medium']">
            {{ tab }}
          </button>
        </div>

        <div v-show="activeTab === 'story'" class="space-y-10">
          <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-6 border border-gray-100 rounded-md bg-white">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Key Point</p>
              <p class="text-sm text-gray-700 leading-relaxed font-light">{{ fundingDesc.fundStory?.keyPoint }}</p>
            </div>
            <div class="p-6 border border-gray-100 rounded-md bg-white">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Material</p>
              <p class="text-sm text-gray-700 leading-relaxed font-light">{{ fundingDesc.fundStory?.material }}</p>
            </div>
            <div class="p-6 border border-gray-100 rounded-md bg-white">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Handmade</p>
              <p class="text-sm text-gray-700 leading-relaxed font-light">{{ fundingDesc.fundStory?.handMade }}</p>
            </div>
          </section>
          <section class="p-8 border border-gray-100 rounded-md bg-white">
            <h2 class="text-xl font-light tracking-[0.25em] uppercase text-gray-900 mb-5">Project Story</h2>
            <p class="text-sm text-gray-600 leading-relaxed font-light">{{ fundingDesc.fundStory?.projectStory }}</p>
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
                <p class="text-sm text-gray-700 font-light">{{ fundingDesc.fundMaker.experience }}</p>
              </div>
              <div class="p-5 bg-gray-50 rounded-md border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Style</p>
                <p class="text-sm text-gray-700 font-light">{{ fundingDesc.fundMaker.style }}</p>
              </div>
              <div class="p-5 bg-gray-50 rounded-md border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Promise</p>
                <p class="text-sm text-gray-700 font-light">{{ fundingDesc.fundMaker.promise }}</p>
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
              <div v-for="(Process, index) in fundingDesc.fundProcessList" :key="Process.idx"
                class="flex items-start space-x-4 mb-8">
                <div
                  class="w-8 h-8 rounded-full bg-[#A39382] text-white flex items-center justify-center text-sm font-bold process-number shrink-0 mt-0.5">
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
        <aside class="lg:col-span-4 lg:sticky lg:top-10 self-start space-y-6">
          <div class="border border-gray-100 rounded-md bg-white p-7 shadow-sm space-y-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-medium">
                  Funding Progress
                </p>
                <p class="text-3xl font-bold accent-text" id="percent-text">{{ fundingDesc.percent }} %</p>
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
                  width: Math.min(fundingDesc.percent, 100) + '%',
                  backgroundColor: '#a39382'
                }"></div>
              </div>
              <div class="flex justify-between mt-3 text-sm">
                <div class="space-x-2">
                  <span class="text-gray-400 text-[11px]">모인 금액</span>
                  <span class="text-gray-900 font-medium" id="raised">
                    ₩ {{ Number(fundingDesc.targetPrice).toLocaleString() }}</span>
                </div>
                <div class="space-x-2">
                  <span class="text-gray-400 text-[11px]">목표</span>
                  <span class="text-gray-900 font-medium" id="goal">₩{{ Number(fundingDesc.goalPrice).toLocaleString()
                    }}</span>
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


          </div>

          <!-- 리워드 상품 -->
          <div class="space-y-3 pt-4 border-t border-gray-50">
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Reward Selection</p>

            <div class="relative">
              <button @click="isRewardOpen = !isRewardOpen"
                class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-sm bg-white hover:border-gray-300 shadow-sm text-left">
                <span :class="selectedReward ? 'text-gray-900 font-bold' : 'text-gray-400 text-sm'">
                  {{ selectedReward ? selectedReward.title : '리워드를 선택해주세요' }}
                </span>
                <span class="text-gray-400 transition-transform" :class="{ 'rotate-180': isRewardOpen }">▼</span>
              </button>

              <div v-if="isRewardOpen"
                class="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-sm shadow-2xl max-h-[300px] overflow-y-auto">
                <div v-for="item in fundingDesc.fundingRewardsList" :key="item.idx"
                  @click="item.quantity > 0 ? selectReward(item) : null"
                  :class="['p-4 border-b border-gray-50 flex justify-between items-center transition-colors',
                    item.quantity <= 0 ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'hover:bg-stone-50 cursor-pointer']">

                  <div class="flex-1">
                    <p class="text-[16px] font-bold text-gray-900 mb-1">
                      {{ item.title }}
                      <span v-if="item.quantity <= 0" class="ml-2 text-[10px] text-red-500 font-normal">[품절]</span>
                    </p>
                    <p class="text-[13px] text-gray-400 mb-1">{{ item.contents }}</p>
                    <p class="text-sm font-bold text-[#A39382]">₩ {{ item.price.toLocaleString() }}</p>
                  </div>

                  <div class="text-right shrink-0 ml-4">
                    <p class="text-[10px] font-bold" :class="item.quantity > 0 ? 'text-gray-400' : 'text-red-400'">
                      {{ item.quantity > 0 ? `재고 ${item.quantity}개` : 'SOLD OUT' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedReward"
              class="bg-stone-50 p-6 rounded-xl border border-stone-100 space-y-4 animate-fadeIn">
              <div class="flex items-center justify-between">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">수량</p>
                <div class="flex items-center border border-gray-200 bg-white rounded-sm">
                  <button @click="quantity > 1 ? quantity-- : null"
                    class="w-8 h-8 flex items-center justify-center">-</button>
                  <span class="w-10 text-center text-sm font-bold border-x border-gray-100">{{ quantity }}</span>
                  <button @click="increaseQty" class="w-8 h-8 flex items-center justify-center">+</button>
                </div>
              </div>
              <button @click="addToList"
                class="w-full py-4 bg-[#A39382] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm">
                리워드 담기
              </button>
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">Selected List</p>
            <div v-if="currentSelected.length === 0" class="text-sm text-gray-300 italic">추가된 리워드가 없습니다.</div>
            <div class="space-y-2">
              <div v-for="reward in currentSelected" :key="reward.UUid"
                class="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
                <div class="flex-1 pr-2">
                  <p class="text-[12px] font-medium text-gray-800 line-clamp-1">{{ reward.title }}</p>
                  <p class="text-[13px] text-gray-400 mb-1">{{ reward.contents }}</p>
                  <p class="text-[11px] text-gray-500">{{ reward.quantity }}개</p>
                </div>
                <div class="text-right flex items-center gap-3">
                  <span class="text-xs font-bold">₩{{ (reward.price * reward.quantity).toLocaleString() }}</span>
                  <button @click="removeReward(reward.UUid)" class="text-gray-300 hover:text-red-500 text-lg">✕</button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400">Total Amount</p>
            <p class="text-xl font-bold text-[#A39382]">₩ {{ targetPrice.toLocaleString() }}</p>
          </div>
          <button @click="selectAndGo" :disabled="currentSelected.length === 0"
            class="w-full py-4 bg-[#9B8A7E] text-white font-bold text-xs tracking-[0.3em] uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8e7f74] transition-colors">
            Support this Project
          </button>
        </aside>
    </section>

  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.banner-gradient {
  background: linear-gradient(to right, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0) 62%);
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>