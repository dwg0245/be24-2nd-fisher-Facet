<script setup></script>

<template>
  <!-- 경매가 종료되었을 때 화면 -->
  <div id="auctionStatus" class="bg-[#2B2B2B] text-white border-b border-black">
    <div
        class="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
    >
      <div>
        <p class="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold">Auction Status</p>
        <p class="text-sm font-light">
          🔒 <span class="font-semibold">경매 종료</span> · 입찰이 마감된 상품입니다
        </p>
      </div>
      <div class="text-sm font-medium accent-text">Final Price ₩ 4,250,000</div>
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
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80"
              class="w-full object-cover grayscale"
              alt="product"
          />

          <div
              class="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-center"
          >
            <p class="luxury-font text-3xl tracking-[0.35em] text-white mb-3">AUCTION CLOSED</p>
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

        <h1 class="text-4xl font-light mb-4">Midnight Sapphire Emerald Ring</h1>

        <p class="text-gray-500 text-sm leading-relaxed mb-10">
          깊은 바다의 색을 닮은 사파이어와 정교한 에메랄드 컷이 조화를 이루는 단 하나의 작품입니다.
        </p>

        <!-- 종료 상태 카드 -->
        <div class="border border-gray-200 bg-[#FAF9F8] p-8 space-y-4">
          <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold">
            Final Result
          </p>

          <div class="flex justify-between items-end">
            <div>
              <p class="text-3xl font-bold accent-text">₩ 4,250,000</p>
              <p class="text-sm text-gray-500 mt-1">최종 낙찰가</p>
            </div>
            <div class="text-right text-sm text-gray-600">
              <p>총 입찰수 28회</p>
              <p>종료일 01.05 18:00</p>
            </div>
          </div>

          <div class="mt-6 border-t border-gray-200 pt-6 text-sm text-gray-600 leading-relaxed">
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
</template>

<style scoped>
:root {
  --accent-color: #a39382;
  --header-h: 80px; /* JS로 자동 업데이트됨 */
  --status-h: 56px; /* JS로 자동 업데이트됨 */
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
  margin: 0;
  word-break: keep-all;
}

.accent-text {
  color: var(--accent-color);
}
.accent-bg {
  background-color: var(--accent-color);
}
.luxury-font {
  font-family: 'Cinzel', serif;
}

/* ✅ 헤더는 원본대로 sticky */
#siteHeader {
  position: sticky;
  top: 0;
  z-index: 50;
}

/* ✅ 상태바는 fixed가 아니라 sticky로!
       헤더 높이만큼 아래에 붙어서 절대 겹치지 않음 */
#auctionStatus {
  position: sticky;
  top: var(--header-h);
  z-index: 40;
}
</style>