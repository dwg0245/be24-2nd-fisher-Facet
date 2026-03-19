<script setup>
import { ref, onMounted} from 'vue'
import axios from "axios";
import PortOne from "@portone/browser-sdk/v2"

const currentPoint = ref(0)
const totalPoints = ref(0)
const inputPoints = ref(null)
const PointFilter = ref('price10k')
const isPaymentProcessing = ref(false) // 중복 결제 방지

// 포인트 선택 시 금액 갱신
const currentPoints = async () => {
  if (PointFilter.value === 'price10k') {
    totalPoints.value = 10000
  }

  else if (PointFilter.value === 'price50k') {
    totalPoints.value = 50000
  }

  else if (PointFilter.value === 'price100k') {
    totalPoints.value = 100000
  }
  else if (PointFilter.value === 'price500k') {
    totalPoints.value = 500000
  }
  else if (PointFilter.value === 'price1000k') {
    totalPoints.value = 1000000
  }
  
}

// 직접 포인트 입력
const confirmInput = () => {
  
  if (!inputPoints.value ) return

  // 10,000 단위 체크 로직
  if (inputPoints.value % 100 !== 0) {
    alert('포인트 충전은 100P 단위로만 가능합니다.')
    inputPoints.value = 0 // 잘못된 입력 시 요약 금액 초기화
    return
  }


  totalPoints.value = inputPoints.value
  inputPoints.value = null // 엔터/탭 이후 입력창 비우기
}

// 결제 버튼 실행
const changePoint = async () => {
  if (totalPoints.value <= 0) {
    alert("충전할 금액을 확인해주세요.");
    return;
  }

  if (isPaymentProcessing.value) return;
  isPaymentProcessing.value = true;

  try {
    // ==========================================================
    // 1. 백엔드에 결제 준비(READY) 요청 
    // ==========================================================
    const createRes = await axios.post('http://localhost:8080/point/create', {
      amount: totalPoints.value
    }, {
      withCredentials: true 
    });

    if (createRes.data.code !== 2001) {
      alert(createRes.data.message || "결제 준비 중 문제가 발생했습니다.");
      isPaymentProcessing.value = false;
      return;
    }
    const pointIdx = createRes.data.result.pointIdx;
    const uniquePaymentId = `imp_${crypto.randomUUID().replace(/-/g, '')}`; // 궁금 이게 뭔지 물어봐야ㅕ함

    // ==========================================================
    // 2. 포트원 실제 결제창 띄우기
    // ==========================================================
    const paymentResponse = await PortOne.requestPayment({
      storeId: "store-6d92075a-fcc0-4920-afaf-b9df41abe7ec",
      channelKey: "channel-key-5d4867e9-7b9c-4530-83f9-cf13dbe67c57", 
      paymentId: uniquePaymentId, // 백엔드에서 받아온 주문번호 사용
      orderName: `Facet 포인트 ${totalPoints.value.toLocaleString()}원 충전`,
      totalAmount: totalPoints.value,
      currency: 'KRW',
      payMethod: "CARD" 
    });

    if (paymentResponse.code !== undefined) {
      alert("결제가 취소되었거나 실패했습니다: " + paymentResponse.message);
      return;
    }

  
    // 3. 백엔드에 결제 검증 및 충전 요청
    // ==========================================================
    const verifyRes = await axios.post('http://localhost:8080/point/verify', {
      paymentId: paymentResponse.paymentId, 
      pointIdx: pointIdx 
    }, {
      withCredentials: true
    });


    // 성공 처리
    if (verifyRes.data.code === 2002 || verifyRes.data.isSuccess) {
      alert(`${totalPoints.value.toLocaleString()} 포인트가 성공적으로 충전되었습니다! 💎`);

    
    // 상태 초기화
      currentPoint.value += totalPoints.value; 
      totalPoints.value = 0; 
      PointFilter.value = '';
    } else {
      alert("결제 검증 : " + verifyRes.data.message);
    }

  } catch (error) {
    console.error("결제 진행 중 오류 발생:", error);

    // 에러 상태 코드에 따른 분기 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert("로그인이 필요한 서비스입니다. 로그인을 먼저 진행해주세요.");
    } else {
      alert(error.response?.data?.message || "결제 요청 중 서버 오류가 발생했습니다.");
    }
  } finally {
    isPaymentProcessing.value = false;
  }
}

// DB에서 현재 로그인한 유저의 포인트를 가져오는 함수
const fetchCurrentPoint = async () => {
  try {
    // 💡 주의: 아래 주소는 회원님의 실제 '유저 정보 조회 API' 주소로 변경하셔야 합니다! (예: /user/info, /user/mypage 등)
    const res = await axios.get('http://localhost:8080/point/current', {
      withCredentials: true
    });

    // 백엔드 응답 성공 시, DB의 포인트 값을 화면 변수에 덮어씌움
    if (res.data.isSuccess || res.data.code === 2000) {
      currentPoint.value = res.data.result.currentPoint; // 백엔드 DTO 구조에 맞게 '.point' 부분은 수정해 주세요
    }
  } catch (error) {
    console.error("유저 정보를 불러오는데 실패했습니다.", error);
  }
}

onMounted(() => {
  fetchCurrentPoint();
});




</script>

<template>
  <main class="max-w-[1080px] mx-auto px-6 py-10 lg:py-16">
    <div class="flex flex-col lg:flex-row gap-10">
      <!-- Left Side: Selection (7 Cols) -->
      <div class="flex-1 space-y-8">
        <header>
          <h1 class="text-2xl font-bold mb-2">포인트 충전</h1>
          <p class="text-gray-400 text-sm font-light">
            옥션 입찰과 작품 소장을 위한 포인트를 충전하세요.
          </p>
        </header>

        <!-- Current Balance Display -->
        <section class="premium-card p-8 bg-gradient-to-br from-[#1a1a1a] to-[#333333] text-white">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-[14px] uppercase tracking-widest text-black mb-2">현재 포인트</p>
              <p class="text-3xl font-serif-luxury italic tracking-wider text-black">{{ currentPoint.toLocaleString() }}
                Point</p>
            </div>
            <div
              class="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl bg-white/5">
              💎
            </div>
          </div>
        </section>

        <!-- Step 01: Amount Selection -->
        <section class="premium-card p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 border-b border-gray-50 pb-4">
            01. 충전 금액 선택
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <!-- Option 1 -->
            <label class="relative cursor-pointer">
              <input @click="((PointFilter = 'price10k'), currentPoints())" type="radio" name="point_amount"
                value="10000" class="hidden point-option" checked />
              <div class="point-card p-6 border border-gray-100 rounded-2xl transition-all text-center">
                <p class="text-sm font-medium text-gray-400 mb-1">10,000 P</p>
                <p class="text-lg font-bold">₩ 10,000</p>
              </div>
            </label>
            <!-- Option 2 -->
            <label class="relative cursor-pointer">
              <input @click="((PointFilter = 'price50k'), currentPoints())" type="radio" name="point_amount"
                value="50000" class="hidden point-option" />
              <div class="point-card p-6 border border-gray-100 rounded-2xl transition-all text-center">
                <p class="text-sm font-medium text-gray-400 mb-1">50,000 P</p>
                <p class="text-lg font-bold">₩ 50,000</p>
              </div>
            </label>
            <!-- Option 3 (Best Value) -->
            <label class="relative cursor-pointer">
              <input @click="((PointFilter = 'price100k'), currentPoints())" type="radio" name="point_amount"
                value="100000" class="hidden point-option" />
              <div
                class="point-card p-6 border border-gray-100 rounded-2xl transition-all text-center relative overflow-hidden">
                <div
                  class="absolute top-0 right-0 bg-[#A39382] text-white text-[8px] px-2 py-0.5 font-bold uppercase tracking-tighter">
                  Best
                </div>
                <p class="text-sm font-medium text-gray-400 mb-1">100,000 P</p>
                <p class="text-lg font-bold">₩ 100,000</p>
              </div>
            </label>
            <!-- Option 4 -->
            <label class="relative cursor-pointer">
              <input @click="((PointFilter = 'price500k'), currentPoints())" type="radio" name="point_amount"
                value="500000" class="hidden point-option" />
              <div class="point-card p-6 border border-gray-100 rounded-2xl transition-all text-center">
                <p class="text-sm font-medium text-gray-400 mb-1">500,000 P</p>
                <p class="text-lg font-bold">₩ 500,000</p>
              </div>
            </label>
            <!-- Option 5 -->
            <label class="relative cursor-pointer">
              <input @click="((PointFilter = 'price1000k'), currentPoints())" type="radio" name="point_amount"
                value="1000000" class="hidden point-option" />
              <div class="point-card p-6 border border-gray-100 rounded-2xl transition-all text-center">
                <p class="text-sm font-medium text-gray-400 mb-1">1,000,000 P</p>
                <p class="text-lg font-bold">₩ 1,000,000</p>
              </div>
            </label>
            <!-- Custom Input -->
            <div class="flex flex-col">
              <input @change="((PointFilter = 'priceInput'), confirmInput())" v-model="inputPoints" type="number"
                name="point_amount" placeholder="직접 입력"
                class="h-full p-4 bg-gray-50 border border-transparent rounded-2xl text-center text-sm font-bold input-focus transition-all" />
            </div>
          </div>
        </section>

        <!-- Step 02: Payment Method -->
        <section class="premium-card p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 border-b border-gray-50 pb-4">
            02. 결제 수단
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label class="cursor-pointer">
              <input type="radio" name="payment" class="hidden peer" checked />
              <div
                class="p-4 border border-gray-100 rounded-xl text-center text-[11px] font-bold peer-checked:border-[#A39382] peer-checked:bg-[#fcfcfb] peer-checked:text-[#A39382] transition-all uppercase tracking-wider">
                Credit Card
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="payment" class="hidden peer" />
              <div
                class="p-4 border border-gray-100 rounded-xl text-center text-[11px] font-bold peer-checked:border-[#A39382] peer-checked:bg-[#fcfcfb] peer-checked:text-[#A39382] transition-all uppercase tracking-wider">
                Naver Pay
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="payment" class="hidden peer" />
              <div
                class="p-4 border border-gray-100 rounded-xl text-center text-[11px] font-bold peer-checked:border-[#A39382] peer-checked:bg-[#fcfcfb] peer-checked:text-[#A39382] transition-all uppercase tracking-wider">
                Kakao Pay
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="payment" class="hidden peer" />
              <div
                class="p-4 border border-gray-100 rounded-xl text-center text-[11px] font-bold peer-checked:border-[#A39382] peer-checked:bg-[#fcfcfb] peer-checked:text-[#A39382] transition-all uppercase tracking-wider">
                Bank Transfer
              </div>
            </label>
          </div>
        </section>
      </div>

      <!-- Right Side: Sticky Summary Box (5 Cols) -->
      <div class="lg:w-96">
        <div class="lg:sticky lg:top-24 space-y-6">
          <div class="premium-card p-8 border border-[#A39382]/10">
            <h3 class="text-lg font-bold mb-8">충전 요약</h3>

            <div class="space-y-4 text-sm mb-8 pb-8 border-b border-gray-100">
              <div class="flex justify-between text-gray-500">
                <span>선택한 포인트</span>
                <span class="font-medium text-[#1a1a1a]">{{ totalPoints.toLocaleString() }} P</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>결제 금액</span>
                <span class="font-medium text-[#1a1a1a]">₩ {{ totalPoints.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-gray-400 text-[11px] italic">
                <span>* 부가세(VAT) 포함</span>
              </div>
            </div>

            <div class="flex justify-between items-baseline mb-10">
              <span class="text-sm font-bold">총 결제 금액</span>
              <span class="text-3xl font-bold text-[#A39382]">₩ {{ totalPoints.toLocaleString() }}</span>
            </div>

            <!-- Action Button -->
            <button @click="changePoint()"
              class="w-full py-5 bg-[#1a1a1a] text-white font-bold text-xs tracking-[0.3em] uppercase rounded-xl hover:bg-[#333333] transition-all shadow-xl shadow-black/10">
              Charge Point
            </button>

            <p class="text-[10px] text-center text-gray-400 mt-8 leading-relaxed font-light">
              포인트는 즉시 충전되며 아카이브 내<br />모든 경매 및 구매에 사용할 수 있습니다.
            </p>
          </div>

          <!-- Guidelines -->
          <div class="p-7 bg-white rounded-3xl border border-gray-100">
            <h4 class="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              Inquiry & Policy
            </h4>
            <ul class="text-[11px] text-gray-500 space-y-2 leading-relaxed font-light">
              <li>• 충전 후 사용하지 않은 포인트는 7일 이내 환불 가능합니다.</li>
              <li>• 포인트 유효기간은 충전일로부터 5년입니다.</li>
              <li>• 법인카드의 경우 결제 한도가 제한될 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f8f6f4;
  word-break: keep-all;
}

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}

:root {
  --accent-color: #a39382;
  --accent-hover: #1a1a1a;
  --border-color: #e5e7eb;
}

.input-focus:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(163, 147, 130, 0.08);
}

.premium-card {
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
}

input[type='checkbox'],
input[type='radio'] {
  accent-color: var(--accent-color);
}

/* 포인트 선택 카드 커스텀 */
.point-option:checked+.point-card {
  border-color: var(--accent-color);
  background-color: #fcfcfb;
  box-shadow: 0 4px 15px rgba(163, 147, 130, 0.15);
}
</style>
