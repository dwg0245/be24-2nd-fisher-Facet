<script setup>
import { onMounted, reactive, ref, onUnmounted, watch } from 'vue'
import api from '@/api/auction'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const auctionDetail_list = reactive([])
const auctionId = ref(null)
const auctionDetail = ref(null)
const currentTab = ref('Detail')
const startPrice = ref()
const inputPrice = ref('')
const currentPrice = ref()
const bidCount = ref()
let countdown = ref('')
let isBefore = ref(false)
let isDone = ref(false)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const socket = ref(null)
import { Client } from '@stomp/stompjs'

onMounted(() => {
  // 시작하자마자 로그인 여부 확인
  const isLogged = authStore.isLogin || localStorage.getItem('USERINFO')

  if (!authStore.isLogin && !localStorage.getItem('USERINFO')) {
    alert('로그인이 필요한 페이지입니다.')
    router.push('/login')
  } else {
    getDetail()
  }

  // 시작하자마자 웹소켓 연결
  connectWebSocket()
})

onUnmounted(() => {
  if (socket.value && socket.value.active) {
    socket.value.deactivate()
    console.log('웹 소켓 연결 해제 (페이지 이탈)')
  }
})

// 경매 상품 DB에서 불러오기
const getDetail = async () => {
  auctionId.value = Number(route.params.idx)

  const res = await api.detail(auctionId.value)

  if (res.code == 2000) {
    auctionDetail.value = res.result
    startPrice.value = auctionDetail.value.startPrice
    currentPrice.value = auctionDetail.value.currentPrice
    bidCount.value = auctionDetail.value.bidCount
  } else {
    alert('해당 상품에 대한 desc.json 파일을 불러오지 못함')
  }
}
// 경매 시작 전 프리뷰용 감시
watch(
  () => auctionDetail.value?.startAt,
  (newVal) => {
    if (newVal) {
      showPreview(newVal)
    }
  },
  { immediate: true },
)

// 프리뷰 띄우기 로직
const showPreview = (targetDateStr) => {
  const timer = setInterval(() => {
    const target = new Date(targetDateStr).getTime() // 목표 시간 (ms)
    const now = new Date().getTime()

    // 시간이 종료되었을 때
    if (target - now > 0) {
      clearInterval(timer)
      isBefore.value = true
      return
    }
  }, 1000)
}

// 경매 시작 후 카운트 다운용 감시
watch(
  () => auctionDetail.value?.endAt,
  (newVal) => {
    if (newVal) {
      // 데이터가 들어왔을 때만 카운트다운 시작!
      startCountdown(newVal)
    }
  },
  { immediate: true },
)

// 카운트다운 로직
const startCountdown = (targetDateStr) => {
  const timer = setInterval(() => {
    const target = new Date(targetDateStr).getTime() // 목표 시간 (ms)
    const now = new Date().getTime() // 현재 시간 (ms)
    const diff = target - now // 남은 시간 (ms)

    // 시간이 종료되었을 때
    if (diff <= 0) {
      clearInterval(timer)
      isDone.value = true
      countdown.value = '0일 00:00:00'
      return
    }

    // 시간 단위 계산기
    const d = Math.floor(diff / (1000 * 60 * 60 * 24)) // 일
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      .toString()
      .padStart(2, '0') // 시
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      .toString()
      .padStart(2, '0') // 분
    const s = Math.floor((diff % (1000 * 60)) / 1000)
      .toString()
      .padStart(2, '0') // 초

    if (d > 0) {
      countdown.value = `${d}일 ${h}:${m}:${s}`
    } else {
      countdown.value = `${h}:${m}:${s}`
    }
  }, 1000)
}

// 입찰 기능
const sendBid = async () => {
  const bidData = {
    userIdx: 1,
    aucProductIdx: auctionId.value,
    bidPrice: Number(inputPrice.value),
  }
  if (currentPrice.value < Number(inputPrice.value)) {
    if (inputPrice.value % auctionDetail.value.bidIncrement == 0) {
      currentPrice.value = Number(inputPrice.value)
      try {
        const res = await api.bid(bidData)
        if (res.success) {
          // 서버에서 업데이트된 상품의 '현재가'를 받아와서 화면에 반영
          currentPrice.value = res.result.bidPrice
          bidCount.value = bidCount.value + 1
          const bidUpdateMessage = {
            auctionId: auctionId.value,
            newPrice: currentPrice.value,
            bidCount: bidCount.value
          }
          socket.value.publish({
            destination: '/ws/bid/' + auctionId.value, // Config의 applicationDestinationPrefixes + @MessageMapping
            body: JSON.stringify(bidUpdateMessage),
          })
          alert('입찰 성공! 현재 최고가는 ' + currentPrice.value.toLocaleString() + '원입니다.')
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      alert('입찰 단위에 맞는 금액을 입력해주세요.')
    }
  } else {
    alert('현재 입찰가보다 높은 금액을 입력하세요.')
  }
}

// 웹소켓
const connectWebSocket = () => {
  const ws = new Client({
    brokerURL: 'ws://localhost:5173/ws',
  })
  socket.value = ws

  ws.onConnect = () => {
    console.log('스톰프 연결 성공')

    ws.subscribe(`/topic/${auctionId.value}`, (message) => {
      const data = JSON.parse(message.body)

      currentPrice.value = data.newPrice
      bidCount.value = data.bidCount
    })
  }
  ws.activate() // 연결 활성화
}
</script>

<template>
  <div v-if="auctionDetail != null">
    <!-- 경매 시작 전 프리뷰 화면 -->
    <div v-if="isBefore">
      <div class="bg-[#A39382] text-white">
        <div class="max-w-7xl mx-auto px-6 py-3 text-center">
          <p class="text-sm font-light tracking-widest">
            COMING SOON · 본 상품은 <span class="font-bold">{{ auctionDetail.startAt }}</span
            >에 경매가 시작됩니다.
          </p>
        </div>
      </div>

      <main class="max-w-7xl mx-auto py-12 px-6 lg:px-10 pb-60">
        <nav class="text-[10px] text-gray-400 mb-8 uppercase tracking-[0.2em]">
          Home / Auction / Preview / <span class="text-gray-600">{{ auctionDetail.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div class="relative bg-gray-50 border border-gray-100 overflow-hidden group">
            <img :src="auctionDetail.image" class="w-full aspect-[4/4.5] object-cover grayscale" />
            <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div class="text-center border border-white/30 p-10 backdrop-blur-sm">
                <p class="luxury-font text-2xl tracking-[0.4em] text-white mb-2">UPCOMING</p>
                <p class="text-white/80 text-xs tracking-widest font-light">Available Soon</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col justify-center">
            <span
              class="inline-block w-fit px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full mb-4 tracking-widest uppercase"
            >
              Preview Only
            </span>
            <h1 class="text-4xl font-light tracking-tight mb-6 text-gray-900">
              {{ auctionDetail.name }}
            </h1>

            <div class="bg-white p-8 border border-gray-100 rounded-sm space-y-8 shadow-sm">
              <div class="text-center pb-6 border-b border-gray-50">
                <p class="text-gray-400 text-[10px] uppercase tracking-[0.3em] mb-4">
                  Auction Starts In
                </p>
                <p class="text-4xl font-mono text-gray-800 tracking-tighter">{{ countdown }}</p>
              </div>

              <div class="space-y-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400 font-light">경매 시작가</span>
                  <span class="text-gray-800 font-medium"
                    >₩ {{ Number(startPrice).toLocaleString() }}</span
                  >
                </div>
                <div class="flex justify-between text-sm border-t border-gray-50 pt-4">
                  <span class="text-gray-400 font-light">입찰 단위</span>
                  <span class="text-gray-800 font-medium"
                    >₩ {{ Number(auctionDetail.bidIncrement).toLocaleString() }}</span
                  >
                </div>
              </div>

              <button
                disabled
                class="w-full py-4 border border-gray-200 text-gray-300 font-bold text-xs tracking-[0.3em] uppercase cursor-not-allowed"
              >
                Wait for Launch
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div v-else>
      <!-- 경매가 진행 중일 때 화면 -->
      <div :class="!isDone ? 'block' : 'hidden'">
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
                  alt="Main Product"
                  class="w-full aspect-[4/4.5] object-cover group-hover:scale-[1.02] transition duration-700"
                />
              </div>
              <div class="grid grid-cols-4 gap-4">
                <div
                  class="border border-accent p-1 bg-white"
                  v-for="item in auctionDetail.img_detail"
                >
                  <RouterLink to="/auction/Main_auction">
                    <img
                      :src="item"
                      class="w-full aspect-square grayscale object-cover hover:grayscale-0 transition cursor-pointer"
                    />
                  </RouterLink>
                </div>
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
                    <p
                      class="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-2 font-medium"
                    >
                      현재 입찰가
                    </p>
                    <p id="currentPrice" class="text-3xl font-bold accent-text">
                      ₩ {{ Number(currentPrice).toLocaleString() }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p
                      class="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-2 font-medium"
                    >
                      남은 시간
                    </p>
                    <p class="text-xl font-mono text-gray-800 tracking-wider" id="countdown">
                      {{ countdown }}
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-y-4 gap-x-8 text-sm pt-2">
                  <div class="flex justify-between border-b border-gray-50 pb-2">
                    <span class="text-gray-400 font-light">시작가</span>
                    <span class="text-gray-700 font-medium"
                      >₩ {{ Number(startPrice).toLocaleString() }}</span
                    >
                  </div>
                  <div class="flex justify-between border-b border-gray-50 pb-2">
                    <span class="text-gray-400 font-light">입찰 단위</span>
                    <span class="text-gray-700 font-medium">
                      ₩ {{ Number(auctionDetail.bidIncrement).toLocaleString() }}</span
                    >
                  </div>
                  <div class="flex justify-between border-b border-gray-50 pb-2">
                    <span class="text-gray-400 font-light">총 입찰수</span>
                    <span id="bidCount" class="text-gray-700 font-medium">
                      {{ Number(bidCount).toLocaleString() }}회</span
                    >
                  </div>
                  <div class="flex justify-between border-b border-gray-50 pb-2">
                    <span class="text-gray-400 font-light">종료 예정</span>
                    <span class="text-gray-700 font-medium">{{ auctionDetail.endAt }}</span>
                  </div>
                </div>

                <div class="pt-6">
                  <div class="flex items-center space-x-2 mb-4">
                    <input
                      v-model="inputPrice"
                      type="number"
                      placeholder="입찰 금액을 입력하세요"
                      :step="auctionDetail.bidIncrement"
                      id="message"
                      class="flex-1 bg-white border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:border-[#A39382] transition-all placeholder:text-gray-300"
                    />
                    <span class="text-gray-400 text-xs font-bold tracking-widest">KRW</span>
                  </div>
                  <button
                    @click="sendBid"
                    class="w-full py-4 bid-button border border-[#A39382]/50 font-bold text-xs tracking-[0.3em] uppercase"
                    id="sendBid"
                  >
                    Place a Bid
                  </button>
                </div>
              </div>

              <div class="flex border-b border-gray-100 mb-6">
                <button
                  v-for="tabBtn in ['Detail', 'History', 'Shipping']"
                  :key="tabBtn"
                  @click="currentTab = tabBtn"
                  class="px-6 py-3 text-[11px] font-bold tab-active uppercase tracking-[0.2em]"
                >
                  {{ tabBtn }}
                </button>
              </div>

              <div
                v-if="currentTab === 'Detail'"
                class="text-sm text-gray-500 leading-relaxed space-y-3 font-light"
              >
                <p class="flex items-center">
                  <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3"></span>
                  • 원산지: {{ auctionDetail.origin }}
                </p>
                <p class="flex items-center">
                  <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3"></span>
                  • 소재: {{ auctionDetail.material }}
                </p>
                <p class="flex items-center">
                  <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3"></span>
                  • 사이즈: {{ auctionDetail.size }}
                </p>
              </div>
              <div
                v-if="currentTab === 'History'"
                class="text-sm text-gray-500 leading-relaxed space-y-3 font-light"
              >
                <p class="flex items-center">
                  <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                  • 상품 설명: {{ auctionDetail.description }}
                </p>
              </div>
              <div
                v-if="currentTab === 'Shipping'"
                class="text-sm text-gray-500 leading-relaxed font-light"
              >
                <p class="flex items-center">
                  <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3"></span>
                  • 배송방법: {{ auctionDetail.shippingMethod }}
                </p>
                <p class="flex items-center">
                  <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3"></span>
                  • 배송비: {{ Number(auctionDetail.shippingPrice).toLocaleString() }} KRW
                </p>
                <p class="flex items-center">
                  <span class="w-1.5 h-1.5 accent-bg rounded-full mr-3"></span>
                  • 예상 소요 시간: {{ auctionDetail.shippingDuration }}
                </p>
              </div>
            </div>
          </div>

          <section class="mt-32">
            <h2
              class="text-xl font-light mb-12 tracking-[0.4em] text-center uppercase text-gray-800"
            >
              Related Artifacts
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="group cursor-pointer" v-for="item in auctionDetail_list.slice(0, 4)">
                <RouterLink :to="`/auction/auction_desc/${item.idx}`">
                  <div
                    class="aspect-square bg-gray-50 mb-4 overflow-hidden border border-gray-100 relative"
                  >
                    <img
                      :src="item.img"
                      alt="Related"
                      class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition duration-700"
                    />
                    <div
                      class="absolute top-0 right-0 accent-bg px-3 py-1 text-[9px] text-white font-bold tracking-widest uppercase"
                    >
                      Upcoming
                    </div>
                  </div>
                  <h3
                    class="text-[10px] uppercase tracking-widest text-gray-400 mb-1 group-hover:text-black transition-colors"
                  >
                    {{ item.name }}
                  </h3>
                  <p class="text-sm font-bold text-gray-800">₩ {{ item.price.toLocaleString() }}</p>
                </RouterLink>
              </div>
            </div>
          </section>
        </main>
      </div>
      <!-- 경매가 종료되었을 때 화면 -->
      <div :class="isDone ? 'block' : 'hidden'">
        <div id="auctionStatus" class="bg-[#2B2B2B] text-white border-b border-black">
          <div
            class="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div>
              <p class="text-sm font-light">
                🔒 <span class="font-semibold">경매 종료</span> · 입찰이 마감된 상품입니다
              </p>
            </div>
            <div class="text-sm font-medium accent-text">
              Final Price ₩ {{ auctionDetail.currentPrice.toLocaleString() }}
            </div>
          </div>
        </div>
        <main class="max-w-7xl mx-auto py-16 px-6 lg:px-10 pb-40">
          <nav class="text-[10px] text-gray-400 mb-8 uppercase tracking-[0.2em]">
            Home / Auction / Ring / <span class="text-gray-600">Midnight Sapphire Ring</span>
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <!-- Product Image (종료 오버레이) -->
            <div class="space-y-6">
              <div class="relative bg-gray-50 border border-gray-100 overflow-hidden">
                <img
                  :src="auctionDetail.image"
                  class="w-full aspect-[4/4.5] object-cover grayscale"
                  alt="product"
                />

                <div
                  class="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-center"
                >
                  <p class="luxury-font text-3xl tracking-[0.35em] text-white mb-3">
                    AUCTION CLOSED
                  </p>
                  <p class="text-sm text-gray-300">This auction has ended</p>
                </div>
              </div>
            </div>

            <!-- Right -->
            <div class="flex flex-col">
              <span
                class="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full mb-4 tracking-widest uppercase"
              >
                Auction Closed
              </span>

              <h1 class="text-4xl font-light mb-4">{{ auctionDetail.name }}</h1>

              <p class="text-gray-500 text-sm leading-relaxed mb-10">
                깊은 바다의 색을 닮은 사파이어와 정교한 에메랄드 컷이 조화를 이루는 단 하나의
                작품입니다.
              </p>

              <!-- 종료 상태 카드 -->
              <div class="border border-gray-200 bg-[#FAF9F8] p-8 space-y-4">
                <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold">
                  Final Result
                </p>

                <div class="flex justify-between items-end">
                  <div>
                    <p class="text-3xl font-bold accent-text pb-1">
                      ₩ {{ auctionDetail.currentPrice.toLocaleString() }}
                    </p>
                    <p class="text-sm text-gray-500 mt-1">최종 낙찰가</p>
                  </div>
                  <div class="text-right text-sm text-gray-600">
                    <p class="pb-1">총 입찰수 {{ auctionDetail.bidCount.toLocaleString() }}회</p>
                    <p>종료일 {{ auctionDetail.endAt }}</p>
                  </div>
                </div>

                <div
                  class="mt-6 border-t border-gray-200 pt-6 text-sm text-gray-600 leading-relaxed"
                >
                  이 경매는 종료되었습니다.<br />
                  낙찰자는 마이페이지에서 주문 및 배송 상태를 확인할 수 있습니다.
                </div>

                <a
                  href="./orders.html"
                  class="inline-block mt-6 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.3em] border border-gray-300 hover:border-[#A39382] hover:text-[#A39382] transition"
                >
                  주문 / 배송 확인
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>

  <div v-else class="py-20 text-center text-gray-400">데이터를 불러오는 중입니다.</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

:root {
  --accent-color: #a39382;
  --accent-hover: #8e7f70;
  --bg-light: #ffffff;
  --text-main: #1a1a1a;
  --border-color: #eeeeee;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
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

.bid-button {
  transition: all 0.3s ease;
  background-color: transparent;
  color: var(--accent-color);
}

.bid-button:hover {
  background-color: #a39382;
  color: #fff;
  box-shadow: 0 0 15px rgba(163, 147, 130, 0.4);
}

.tab-active {
  border-bottom: 2px solid var(--accent-color);
  color: var(--accent-color);
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
