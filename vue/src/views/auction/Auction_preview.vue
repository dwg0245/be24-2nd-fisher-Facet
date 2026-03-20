<script setup>
import { onMounted, reactive, ref, onUnmounted, watch } from 'vue'
import api from '@/api/auction'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const auctionDetail_list = reactive([])
const auctionId = ref(null)
const auctionDetail = ref(null)
const startPrice = ref()
const inputPrice = ref('')
const currentPrice = ref()
let countdown = ref('')
let isBefore = ref(false)
let isDone = ref(false)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  const isLogged = authStore.isLogin || localStorage.getItem('USERINFO')

  if (!authStore.isLogin && !localStorage.getItem('USERINFO')) {
    alert('로그인이 필요한 페이지입니다.')
    router.push('/login')
  } else {
    getDetail()
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
  } else {
    alert('해당 상품에 대한 desc.json 파일을 불러오지 못함')
  }
}

const currentTab = ref('Detail')
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

// // 웹소켓
// let socket = null
// const messages = reactive([])
// const message = ref('')
// onMounted(() => {
//   const wsUri = 'ws://127.0.0.1:8080/ws/chat'
//   socket = new WebSocket(wsUri)
//
//   socket.addEventListener('open', () => {
//     console.log('CONNECTED')
//   })
//
//   socket.addEventListener('message', (e) => {
//     const data = JSON.parse(e.data)
//     console.log('받은 데이터:', data.payload)
//     currentPrice.value = data.payload
//   })
//   socket.addEventListener('close', (e) => {
//     console.log('CLOSED')
//   })
// })
//
// const send = () => {
//   if (currentPrice.value < Number(inputPrice.value)) {
//     currentPrice.value = Number(inputPrice.value)
//     socket.send(inputPrice.value)
//   } else {
//     alert('현재 입찰가보다 높은 금액을 입력하세요.')
//   }
// }
</script>

<template>
  <div v-if="auctionDetail != null">
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

    <div v-else-if="!isDone">
      <main class="max-w-7xl mx-auto py-12 px-6 lg:px-10 pb-60">...</main>
    </div>

    <div v-else-if="isDone">...</div>
  </div>
  <div v-else class="py-20 text-center text-gray-400">데이터를 불러오는 중입니다.</div>
</template>
