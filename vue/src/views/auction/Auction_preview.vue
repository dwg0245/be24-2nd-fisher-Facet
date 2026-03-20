<script setup>
import { onMounted, reactive, ref, watch, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api/auction'

// 1. 상태 관리 변수들 (전체 선언)
const route = useRoute()
const auctionDetail = ref(null)
const auctionId = ref(null)
const startPrice = ref(0)
const currentPrice = ref(0)
const inputPrice = ref('')
const currentTab = ref('Detail')

// 상태 제어 플래그
const isUpcoming = ref(false) // 경매 시작 전 (Preview)
const isDone = ref(false) // 경매 종료 후 (End)
const countdown = ref('') // 진행 중 카운트다운
const startTimeCountdown = ref('') // 시작 전 카운트다운

let timerInterval = null

// 2. 경매 상세 데이터 불러오기
const getDetail = async () => {
  auctionId.value = Number(route.params.idx)
  try {
    const res = await api.detail(auctionId.value)
    if (res.code == 2000) {
      auctionDetail.value = res.result
      startPrice.value = res.result.startPrice
      currentPrice.value = res.result.currentPrice

      // 데이터 로드 후 카운트다운 시작
      if (res.result.startAt && res.result.endAt) {
        startCountdown(res.result.startAt, res.result.endAt)
      }
    } else {
      alert('데이터를 불러오지 못했습니다.')
    }
  } catch (err) {
    console.error('API Error:', err)
  }
}

// 3. 통합 카운트다운 로직 (시작 전/진행 중/종료 처리)
const startCountdown = (startAtStr, endAtStr) => {
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    const now = new Date().getTime()
    const start = new Date(startAtStr).getTime()
    const end = new Date(endAtStr).getTime()

    if (now < start) {
      // [CASE 1] 경매 시작 전 (Upcoming/Preview)
      isUpcoming.value = true
      isDone.value = false
      const diff = start - now
      startTimeCountdown.value = formatTime(diff)
    } else if (now >= start && now < end) {
      // [CASE 2] 경매 진행 중 (Live)
      isUpcoming.value = false
      isDone.value = false
      const diff = end - now
      countdown.value = formatTime(diff)
    } else {
      // [CASE 3] 경매 종료 (End)
      isUpcoming.value = false
      isDone.value = true
      countdown.value = '00:00:00'
      clearInterval(timerInterval)
    }
  }, 1000)
}

// 시간 포맷팅 헬퍼
const formatTime = (diff) => {
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0')
  const s = Math.floor((diff % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0')
  return d > 0 ? `${d}일 ${h}:${m}:${s}` : `${h}:${m}:${s}`
}

// 4. 입찰 기능
const sendBid = async () => {
  const bidAmount = Number(inputPrice.value)
  if (currentPrice.value < bidAmount) {
    try {
      const bidData = {
        userIdx: 1, // 실제 개발시 JWT 토큰 정보로 교체
        aucProductIdx: auctionId.value,
        bidPrice: bidAmount,
      }
      const res = await api.bid(bidData)
      if (res.data.success) {
        currentPrice.value = res.data.result.bidPrice
        alert(`입찰 성공! 현재 최고가: ${currentPrice.value.toLocaleString()}원`)
      }
    } catch (err) {
      console.error(err)
    }
  } else {
    alert('현재 입찰가보다 높은 금액을 입력하세요.')
  }
}

onMounted(() => {
  getDetail()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div v-if="auctionDetail != null">
    <div v-if="isUpcoming">
      <div class="bg-[#F8F9FA] text-[#A39382] border-b border-gray-100">
        <div
          class="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <p class="text-sm font-medium tracking-widest">
            ✨ <span class="font-bold text-gray-800">UPCOMING AUCTION</span> · 오픈 알림을 설정하고
            첫 입찰의 기회를 잡으세요.
          </p>
          <div
            class="text-sm font-bold font-mono bg-white px-4 py-1 rounded-full shadow-sm border border-gray-100"
          >
            시작까지 {{ startTimeCountdown }}
          </div>
        </div>
      </div>

      <main class="max-w-7xl mx-auto py-16 px-6 lg:px-10 pb-40">
        <nav class="text-[10px] text-gray-400 mb-8 uppercase tracking-[0.2em]">
          Home / Auction / {{ auctionDetail.category }} /
          <span class="text-gray-600">{{ auctionDetail.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div class="relative group">
            <img
              :src="auctionDetail.image"
              class="w-full aspect-[4/4.5] object-cover opacity-90 grayscale-[20%]"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span
                class="px-6 py-3 border border-white text-white luxury-font tracking-[0.3em] backdrop-blur-sm"
                >PREVIEW</span
              >
            </div>
          </div>

          <div class="flex flex-col">
            <span
              class="inline-block px-3 py-1 bg-[#A39382] text-white text-[10px] font-bold rounded-full mb-4 tracking-widest uppercase"
              >Upcoming Artifact</span
            >
            <h1 class="text-4xl font-light mb-6 tracking-tight text-gray-900 leading-tight">
              {{ auctionDetail.name }}
            </h1>
            <p class="text-gray-500 text-sm leading-relaxed mb-10 font-light">
              {{ auctionDetail.history }}
            </p>

            <div class="bg-[#FAF9F8] p-8 border border-gray-100 space-y-6 shadow-sm">
              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">
                  Estimated Starting Price
                </p>
                <p class="text-3xl font-bold accent-text">
                  ₩ {{ Number(startPrice).toLocaleString() }}
                </p>
              </div>

              <div class="pt-6 border-t border-gray-200">
                <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold">
                  Auction Schedule
                </p>
                <div class="space-y-3 text-sm text-gray-700 font-light">
                  <div class="flex justify-between">
                    <span>시작 일시</span
                    ><span class="font-medium">{{ auctionDetail.startAt }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>종료 예정</span><span class="font-medium">{{ auctionDetail.endAt }}</span>
                  </div>
                </div>
              </div>

              <button
                class="w-full mt-6 py-4 border border-[#A39382] text-[#A39382] font-bold text-[11px] tracking-[0.3em] uppercase hover:bg-[#A39382] hover:text-white transition-all active:scale-[0.98]"
              >
                Remind Me (오픈 알림 신청)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-else-if="!isDone">
      <main class="max-w-7xl mx-auto py-12 px-6 lg:px-10 pb-60">
        <nav class="text-[10px] text-gray-400 mb-8 uppercase tracking-[0.2em]">
          Home / Auction / {{ auctionDetail.category }} /
          <span class="text-gray-600">{{ auctionDetail.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-sm overflow-hidden border border-gray-100 group">
              <img
                :src="auctionDetail.image"
                class="w-full aspect-[4/4.5] object-cover group-hover:scale-[1.02] transition duration-700"
              />
            </div>
          </div>

          <div class="flex flex-col">
            <div class="mb-4">
              <span
                class="inline-block px-3 py-1 bg-[#F5F2F0] accent-text text-[10px] font-bold rounded-full mb-3 tracking-widest uppercase"
                >Live Auction</span
              >
              <h1 class="text-4xl font-light tracking-tight mb-3 text-gray-900">
                {{ auctionDetail.name }}
              </h1>
              <p class="text-gray-500 text-sm leading-relaxed font-light">
                {{ auctionDetail.history }}
              </p>
            </div>

            <div class="bg-white p-8 border border-gray-100 rounded-sm mb-8 space-y-6 shadow-sm">
              <div class="flex justify-between items-end border-b border-gray-50 pb-6">
                <div>
                  <p class="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">
                    현재 입찰가
                  </p>
                  <p class="text-3xl font-bold accent-text">
                    ₩ {{ Number(currentPrice).toLocaleString() }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">
                    남은 시간
                  </p>
                  <p class="text-xl font-mono text-gray-800 tracking-wider">{{ countdown }}</p>
                </div>
              </div>

              <div class="pt-6">
                <div class="flex items-center space-x-2 mb-4">
                  <input
                    v-model="inputPrice"
                    type="number"
                    placeholder="입찰 금액을 입력하세요"
                    class="flex-1 bg-white border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:border-[#A39382] transition-all"
                  />
                  <span class="text-gray-400 text-xs font-bold tracking-widest">KRW</span>
                </div>
                <button
                  @click="sendBid"
                  class="w-full py-4 bid-button border border-[#A39382]/50 font-bold text-xs tracking-[0.3em] uppercase"
                >
                  Place a Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-else>
      <div class="bg-[#2B2B2B] text-white border-b border-black">
        <div
          class="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <p class="text-sm font-light">
            🔒 <span class="font-semibold">경매 종료</span> · 입찰이 마감된 상품입니다
          </p>
          <div class="text-sm font-medium accent-text">
            Final Price ₩ {{ Number(currentPrice).toLocaleString() }}
          </div>
        </div>
      </div>

      <main class="max-w-7xl mx-auto py-16 px-6 lg:px-10 pb-40">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div class="relative bg-gray-50 border border-gray-100 overflow-hidden">
            <img :src="auctionDetail.image" class="w-full aspect-[4/4.5] object-cover grayscale" />
            <div
              class="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-center"
            >
              <p class="luxury-font text-3xl tracking-[0.35em] text-white mb-3">AUCTION CLOSED</p>
              <p class="text-sm text-gray-300 italic">This auction has ended</p>
            </div>
          </div>

          <div class="flex flex-col">
            <span
              class="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full mb-4 tracking-widest uppercase"
              >Auction Closed</span
            >
            <h1 class="text-4xl font-light mb-4">{{ auctionDetail.name }}</h1>
            <div class="border border-gray-200 bg-[#FAF9F8] p-8 space-y-4">
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold">
                Final Result
              </p>
              <p class="text-3xl font-bold accent-text">
                ₩ {{ Number(currentPrice).toLocaleString() }}
              </p>
              <p class="text-sm text-gray-600 border-t border-gray-200 pt-4">
                이 경매는 종료되었습니다. 낙찰자는 마이페이지에서 주문 상태를 확인해주세요.
              </p>
              <RouterLink
                to="/mypage/orders"
                class="inline-block mt-4 px-6 py-3 border border-gray-300 text-[11px] font-bold uppercase tracking-[0.2em] hover:border-[#A39382] transition"
                >주문 확인하기</RouterLink
              >
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  <div v-else class="py-20 text-center text-gray-400 font-light tracking-widest">
    AUTHENTICATING ARTIFACT...
  </div>
</template>

<style scoped>
/* 폰트 및 기존 스타일 유지 */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&family=Cinzel:wght@700&display=swap');

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}
.luxury-font {
  font-family: 'Cinzel', serif;
}
.accent-text {
  color: #a39382;
}
.bid-button {
  transition: all 0.3s ease;
  color: #a39382;
}
.bid-button:hover {
  background-color: #a39382;
  color: #fff;
  box-shadow: 0 0 15px rgba(163, 147, 130, 0.3);
}
</style>
