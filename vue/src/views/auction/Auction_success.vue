<script setup>
import { ref } from 'vue'

// 실제로는 백엔드에서 받아온 데이터와 현재 로그인한 유저 ID를 비교하여
// 이 유저가 낙찰자인지 판별하는 로직이 들어갈 거예요.
const isWinner = ref(true)
const finalPrice = ref(4250000)
const productName = ref('Midnight Sapphire Emerald Ring')
</script>

<template>
  <div
      id="auctionStatus"
      class="winner-status-bar bg-[#A39382] text-white border-b border-[#8E7F6F] shadow-md"
  >
    <div
        class="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
    >
      <div>
        <p class="text-[10px] uppercase tracking-[0.3em] text-white/80 font-bold">Winner Status</p>
        <p class="text-sm font-light">
          🏆 <span class="font-semibold">축하합니다!</span> 민주님께서 최종 낙찰자로 선정되셨습니다.
        </p>
      </div>
      <div class="text-sm font-medium text-white underline underline-offset-4">
        낙찰 증명서 발급 가능
      </div>
    </div>
  </div>

  <main class="max-w-7xl mx-auto py-16 px-6 lg:px-10 pb-40">
    <nav class="text-[10px] text-gray-400 mb-8 uppercase tracking-[0.2em]">
      Home / Auction / Ring / <span class="text-gray-600">{{ productName }}</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div class="space-y-6">
        <div class="relative bg-gray-50 border border-gray-100 overflow-hidden shadow-sm">
          <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80"
              class="w-full object-cover"
              alt="product"
          />

          <div
              class="absolute inset-0 bg-[#A39382]/20 flex flex-col items-center justify-center text-center border-4 border-[#A39382]/50 m-4"
          >
            <div class="bg-white/90 p-8 backdrop-blur-sm shadow-2xl">
              <p class="luxury-font text-3xl tracking-[0.35em] text-[#A39382] mb-3">
                CONGRATULATIONS
              </p>
              <p class="text-[11px] text-gray-600 tracking-widest uppercase mb-1">Winning Bidder</p>
              <div class="w-10 h-[1px] bg-[#A39382] mx-auto mt-4"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <span
            class="inline-block px-3 py-1 bg-[#A39382] text-white text-[10px] font-bold rounded-full mb-4 tracking-widest uppercase self-start"
        >
          Successfully Won
        </span>

        <h1 class="text-4xl font-light mb-4">{{ productName }}</h1>

        <p class="text-gray-500 text-sm leading-relaxed mb-10">
          귀하의 안목으로 선택된 이 특별한 주얼리는 이제 당신의 소유입니다.<br />
          최종 낙찰가를 확인하시고 절차에 따라 결제를 완료해 주세요.
        </p>

        <div class="border-2 border-[#A39382] bg-white p-8 space-y-6 shadow-xl">
          <div class="flex justify-between items-start">
            <p class="text-[10px] uppercase tracking-[0.25em] text-[#A39382] font-bold">
              Final Winning Price
            </p>
            <span class="text-[10px] text-gray-400">Order ID: FACET-2026-0312</span>
          </div>

          <div class="flex justify-between items-end">
            <div>
              <p class="text-4xl font-bold text-black">₩ {{ finalPrice.toLocaleString() }}</p>
              <p class="text-sm text-[#A39382] mt-2 font-medium italic">
                귀하가 제안한 최고 입찰가입니다.
              </p>
            </div>
            <div class="text-right text-[12px] text-gray-500">
              <p>입찰 성공 시각: 03.12 14:25</p>
              <p>총 경쟁 입찰수: 28회</p>
            </div>
          </div>

          <div class="mt-6 border-t border-gray-100 pt-6">
            <h4 class="text-[11px] font-bold text-gray-700 uppercase mb-3">Notice for Winner</h4>
            <ul class="text-[12px] text-gray-500 space-y-2 list-disc list-inside leading-relaxed">
              <li>낙찰일로부터 3일 이내에 결제가 완료되어야 합니다.</li>
              <li>미결제 시 낙찰이 취소될 수 있으며 이용에 제한을 받을 수 있습니다.</li>
              <li>모든 보석은 Facet의 정밀 감정서를 동봉하여 배송됩니다.</li>
            </ul>
          </div>

          <div class="flex flex-col gap-3 mt-8">
            <button
                class="w-full bg-black text-white px-6 py-5 text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-[#A39382] transition-all duration-500 shadow-lg"
            >
              지금 결제하기 (Checkout Now)
            </button>
            <RouterLink
                to="/mypage/orders"
                class="w-full text-center px-6 py-4 text-[11px] font-bold uppercase tracking-[0.3em] border border-gray-200 hover:border-black transition"
            >
              주문 상세 내역 보기
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.luxury-font {
  font-family: 'Cinzel', serif;
}

/* 기존 #auctionStatus와 .winner-status-bar 설정을 하나로 합칩니다 */
#auctionStatus {
  /* 1. 크롬에서 가장 잘 작동하는 sticky */
  position: sticky;

  /* 2. [핵심] 스크롤 시 '천장'에 붙도록 0으로 설정 */
  top: 0;

  /* 3. 본문 이미지나 다른 요소보다 무조건 위로 (헤더보다 높게) */
  z-index: 999;

  /* 4. 디자인 유지 */
  background-color: #a39382;
  border-bottom: 1px solid #8e7f6f;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 본문 카드의 그림자 효과 */
.shadow-xl {
  box-shadow: 0 20px 40px rgba(163, 147, 130, 0.15);
}
</style>