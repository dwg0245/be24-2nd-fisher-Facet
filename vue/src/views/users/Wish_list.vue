<script setup>
  import { onMounted, ref } from 'vue'

const userName = ref('')

onMounted(() => {
  // 1. 창고에서 데이터 꺼내기
  const savedData = localStorage.getItem('USERINFO')

  if (savedData) {
    // 2. 해독하기 (문자열 -> 객체)
    const userInfo = JSON.parse(savedData)
    userName.value = userInfo.userName
    console.log('유저 정보:', userInfo.userName)
  } else {
    userName.value = '로그인 필요'
  }
})
</script>

<template>
  <main class="max-w-7xl mx-auto py-16 px-6 lg:px-10">
    <!-- Breadcrumb -->
    <nav class="text-[10px] text-gray-400 mb-10 uppercase tracking-[0.2em]">
      Home / My / <span class="text-black font-medium">Wishlist</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left: My Side -->
      <aside class="lg:col-span-4 border border-gray-100 bg-white shadow-sm p-8">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gray-100 border border-gray-200"></div>
          <div>
            <p class="text-sm text-gray-400 uppercase tracking-[0.2em]">Member</p>
            <p class="text-xl font-medium text-black">{{ userName }}</p>
            <p class="text-xs text-gray-500 mt-1">level: Silver</p>
          </div>
        </div>

        <div class="mt-10 space-y-3 text-sm">
          <RouterLink
            :to="{ name: 'user_information' }"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition"
          >
            내정보
          </RouterLink>

          <RouterLink
            :to="{ name: 'shipping' }"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition"
          >
            주문/참여내역
          </RouterLink>

          <RouterLink
            :to="{ name: 'add_points' }"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition"
          >
            포인트
          </RouterLink>

          <RouterLink
            :to="{ name: 'wish_list' }"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition"
          >
            위시리스트
          </RouterLink>

          <RouterLink
            :to="{ name: 'ask' }"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition"
          >
            문의내역
          </RouterLink>
        </div>
        <button
          class="w-full mt-10 py-4 btn-outline font-bold text-[11px] tracking-[0.4em] uppercase"
        >
          Edit Profile
        </button>

        <!-- Optional: Wishlist Summary -->
        <div class="mt-10 border-t border-gray-100 pt-8">
          <p class="text-[10px] text-gray-400 uppercase tracking-[0.35em] mb-4">Wishlist Summary</p>
          <div class="grid grid-cols-3 gap-3">
            <div class="border border-gray-100 p-4 text-center">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Total</p>
              <p class="text-lg font-bold accent-text mt-1">8</p>
            </div>
            <div class="border border-gray-100 p-4 text-center">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Auction</p>
              <p class="text-lg font-bold text-black mt-1">5</p>
            </div>
            <div class="border border-gray-100 p-4 text-center">
              <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Funding</p>
              <p class="text-lg font-bold text-black mt-1">3</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right: Wishlist -->
      <section class="lg:col-span-8 space-y-10">
        <!-- Title + Actions -->
        <div class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 class="text-2xl font-medium text-black">위시리스트</h1>
              <p class="text-sm text-gray-500 font-light mt-2">
                관심 등록한 경매/펀딩 상품을 한 번에 관리할 수 있어요.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button class="btn-ghost px-4 py-3 text-[11px] font-bold uppercase tracking-[0.25em]">
                <i class="fa-regular fa-trash-can mr-2"></i>선택 삭제
              </button>
              <button
                class="btn-outline px-4 py-3 text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                <i class="fa-solid fa-bag-shopping mr-2"></i>장바구니 담기
              </button>
            </div>
          </div>

          <!-- Filters Row -->
          <div class="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <button
                class="chip active px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]"
                data-filter="all"
              >
                All
              </button>
              <button
                class="chip px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]"
                data-filter="auction"
              >
                Auction
              </button>
              <button
                class="chip px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]"
                data-filter="funding"
              >
                Funding
              </button>
              <button
                class="chip px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]"
                data-filter="ending"
              >
                마감임박
              </button>
              <button
                class="chip px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]"
                data-filter="price"
              >
                가격↓
              </button>
            </div>

            <div class="flex items-center gap-3">
              <div class="relative">
                <i
                  class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]"
                ></i>
                <input
                  id="search"
                  type="text"
                  placeholder="상품명/판매자 검색"
                  class="w-[260px] bg-gray-50 border border-gray-100 rounded-full pl-9 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#A39382] transition-all"
                />
              </div>

              <select
                id="sort"
                class="bg-white border border-gray-100 rounded-full px-4 py-2 text-xs text-gray-700 focus:outline-none focus:border-[#A39382] transition-all"
              >
                <option value="recent">최근 등록순</option>
                <option value="ending">마감 임박순</option>
                <option value="priceAsc">가격 낮은순</option>
                <option value="priceDesc">가격 높은순</option>
              </select>
            </div>
          </div>

          <!-- Alert Toggle -->
          <div class="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
            <div>
              <p class="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-bold">
                Price/Status Alert
              </p>
              <p class="text-sm text-gray-500 font-light mt-2">
                관심 상품의 가격/상태 변경 알림을 받을 수 있어요.
              </p>
            </div>
            <button id="alertToggle" class="toggle" aria-label="toggle alert"></button>
          </div>
        </div>

        <!-- List -->
        <div class="space-y-4">
          <!-- Item 1 (Auction) -->
          <article
            class="card p-6"
            data-type="auction"
            data-name="미니멀 다이아 반지"
            data-seller="OceanGem Official"
            data-price="268000"
            data-ending="3"
            v-for="i in [1, 2, 3]"
          >
            <div class="flex items-start gap-5">
              <label class="pt-1">
                <input class="pick" type="checkbox" aria-label="select item" />
              </label>

              <RouterLink to="auction-detail.html" class="thumb w-24 h-24 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=240&q=80"
                  class="w-full h-full object-cover"
                  alt="auction item"
                />
              </RouterLink>

              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="px-2 py-1 text-[10px] uppercase tracking-[0.2em] bg-[#FBFAF9] border border-gray-100 rounded-full text-gray-500"
                    >Auction</span
                  >
                  <span
                    class="px-2 py-1 text-[10px] uppercase tracking-[0.2em] bg-white border border-gray-100 rounded-full text-gray-500"
                    >Live</span
                  >
                  <span
                    class="px-2 py-1 text-[10px] uppercase tracking-[0.2em] bg-white border border-gray-100 rounded-full text-gray-500"
                    >Ends in 03d</span
                  >
                </div>

                <RouterLink to="auction-detail.html" class="block">
                  <h3 class="text-lg font-medium text-black hover:accent-text transition">
                    [14K] 미니멀 다이아 반지
                  </h3>
                </RouterLink>

                <p class="text-sm text-gray-500 font-light mt-2">
                  판매자 OceanGem Official · 현재가
                  <span class="font-medium text-black">₩268,000</span>
                </p>

                <div
                  class="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div class="flex items-center gap-3">
                    <button
                      class="btn-ghost px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
                    >
                      <i class="fa-regular fa-heart mr-2 accent-text"></i>관심해제
                    </button>
                    <button
                      class="btn-outline px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
                    >
                      <i class="fa-solid fa-gavel mr-2"></i>입찰하러 가기
                    </button>
                  </div>

                  <div class="text-right">
                    <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Watcher</p>
                    <p class="text-sm font-medium text-black">128</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State (필요 시 사용) -->
        <div class="hidden border border-gray-100 bg-white shadow-sm p-14 text-center" id="empty">
          <p class="text-[10px] text-gray-400 uppercase tracking-[0.5em] mb-4">No Items</p>
          <h3 class="text-xl font-medium text-black">위시리스트가 비어 있어요</h3>
          <p class="text-sm text-gray-500 font-light mt-3">
            마음에 드는 상품을 저장하고 비교해보세요.
          </p>
          <div class="flex justify-center mt-10">
            <RouterLink
              to="/funding/funding_list"
              class="btn-outline px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              Shop Now
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

:root {
  --accent-color: #a39382;
  --accent-hover: #8e7f70;
  --bg-light: #ffffff;
  --text-main: #1a1a1a;
  --text-soft: #3a3a3a;
  --border-color: #eeeeee;
  --chip-bg: #fbfaf9;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background: var(--bg-light);
  color: var(--text-main);
  margin: 0;
  word-break: keep-all;
}

.accent-text {
  color: var(--accent-color);
}
.accent-bg {
  background: var(--accent-color);
}
.border-accent {
  border-color: var(--accent-color);
}

.btn-outline {
  transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  background: transparent;
}
.btn-outline:hover {
  background: var(--accent-color);
  color: #fff;
  box-shadow: 0 10px 20px rgba(163, 147, 130, 0.18);
  transform: translateY(-2px);
}

.btn-ghost {
  border: 1px solid var(--border-color);
  background: #fff;
  transition: all 0.25s ease;
}
.btn-ghost:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.04);
}

.nav-link {
  color: #6b7280;
  transition: all 0.25s ease;
  position: relative;
  padding: 6px 0;
}
.nav-link:hover {
  color: var(--text-main);
}
.nav-link.active {
  color: var(--text-main);
}
.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 100%;
  height: 2px;
  background: var(--accent-color);
  border-radius: 2px;
  box-shadow: 0 6px 16px rgba(163, 147, 130, 0.25);
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(163, 147, 130, 0.35);
  background: #fff;
  color: var(--accent-color);
  border-radius: 9999px;
  transition: all 0.25s ease;
}
.icon-btn:hover {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(163, 147, 130, 0.22);
}
.icon-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9999px;
  background: var(--accent-color);
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 10px 18px rgba(163, 147, 130, 0.25);
}

.chip {
  background: var(--chip-bg);
  border: 1px solid var(--border-color);
  color: #6b7280;
  transition: all 0.2s ease;
}
.chip:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.03);
}
.chip.active {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: #fff;
  box-shadow: 0 10px 18px rgba(163, 147, 130, 0.08);
}

.card {
  border: 1px solid var(--border-color);
  background: #fff;
  transition: all 0.25s ease;
}
.card:hover {
  border-color: rgba(163, 147, 130, 0.55);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.thumb {
  background: #f7f7f7;
  border: 1px solid #f1f1f1;
  overflow: hidden;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  position: relative;
  transition: all 0.2s ease;
}
.toggle::after {
  content: '';
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #fff;
  border: 1px solid #e5e7eb;
  position: absolute;
  top: 50%;
  left: 3px;
  transform: translateY(-50%);
  transition: all 0.2s ease;
}
.toggle.on {
  background: rgba(163, 147, 130, 0.18);
  border-color: rgba(163, 147, 130, 0.35);
}
.toggle.on::after {
  left: 22px;
  border-color: rgba(163, 147, 130, 0.55);
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
