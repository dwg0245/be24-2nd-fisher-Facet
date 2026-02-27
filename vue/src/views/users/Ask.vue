<script setup></script>

<template>
  <main class="max-w-[1200px] mx-auto px-6 py-12">
    <!-- HERO -->
    <section class="glass rounded-3xl p-10 md:p-16 border-none shadow-sm overflow-hidden relative mb-12">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-[#A39382]/10 blur-3xl rounded-full"></div>

      <div class="relative z-10 text-center">
        <h2 class="text-sm font-bold text-[#A39382] uppercase tracking-[0.4em] mb-4">Concierge</h2>
        <h1 class="text-3xl md:text-5xl font-light font-serif-luxury italic mb-6 text-[#1a1a1a]">
          How can we assist you?
        </h1>
        <p class="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
          Facet의 큐레이션 서비스와 경매 참여에 관한 궁금증을 해결해 드립니다.<br />
          아래의 FAQ를 확인하시거나 전담 컨시어지에게 1:1 문의를 남겨주세요.
        </p>

        <div class="max-w-xl mx-auto flex flex-col md:flex-row gap-3">
          <div class="relative flex-1">
            <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
            <input type="text" placeholder="궁금한 내용을 입력하세요"
              class="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-5 text-sm input-focus transition shadow-inner" />
          </div>
          <button
            class=" text-black font-bold rounded-2xl px-8 py-5 text-[11px] tracking-widest uppercase shadow-lg hover:bg transition-all">
            Search
          </button>
        </div>
      </div>
    </section>

    <!-- QUICK CATEGORIES -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      <a href="#faq" class="glass card-hover rounded-2xl p-6 md:p-8 text-center border-none">
        <div class="text-3xl mb-4">💍</div>
        <p class="font-bold text-gray-800 text-sm mb-1">경매 참여 안내</p>
        <p class="text-[11px] text-gray-400 font-light">입찰 및 낙찰 프로세스</p>
      </a>
      <a href="#faq" class="glass card-hover rounded-2xl p-6 md:p-8 text-center border-none">
        <div class="text-3xl mb-4">💳</div>
        <p class="font-bold text-gray-800 text-sm mb-1">결제 및 환불</p>
        <p class="text-[11px] text-gray-400 font-light">안전 결제 시스템 안내</p>
      </a>
      <a href="#faq" class="glass card-hover rounded-2xl p-6 md:p-8 text-center border-none">
        <div class="text-3xl mb-4">📦</div>
        <p class="font-bold text-gray-800 text-sm mb-1">배송 및 검수</p>
        <p class="text-[11px] text-gray-400 font-light">전문 감정 및 보안 배송</p>
      </a>
      <a href="#faq" class="glass card-hover rounded-2xl p-6 md:p-8 text-center border-none">
        <div class="text-3xl mb-4">🛡️</div>
        <p class="font-bold text-gray-800 text-sm mb-1">보안 및 인증</p>
        <p class="text-[11px] text-gray-400 font-light">판매자 인증 정책</p>
      </a>
    </div>

    <!-- FAQ -->
    <section id="faq" class="mb-16">
      <div class="flex items-center space-x-4 mb-8">
        <h2 class="text-2xl font-bold text-gray-800">자주 묻는 질문</h2>
        <div class="h-[1px] flex-1 bg-gray-100"></div>
      </div>

      <div class="glass rounded-3xl overflow-hidden border-none shadow-sm">
        <details class="border-b border-gray-50 group" open>
          <summary class="cursor-pointer px-8 py-6 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
            <p class="font-medium text-gray-800">낙찰된 상품의 취소가 가능한가요?</p>
            <span class="text-gray-300 group-open:rotate-180 transition-transform">↓</span>
          </summary>
          <div class="px-8 pb-8 text-sm text-gray-500 leading-relaxed bg-white font-light">
            낙찰은 판매자와의 법적 계약을 의미하므로 원칙적으로 단순 변심에 의한 취소는 불가합니다.
            단, 상품 상세 설명과 실제 상품이 현저히 다르거나 가품으로 판명될 경우 Facet의 안전 거래
            정책에 따라 100% 환불을 보장합니다.
          </div>
        </details>

        <details class="border-b border-gray-50 group">
          <summary class="cursor-pointer px-8 py-6 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
            <p class="font-medium text-gray-800">주얼리 전문 감정서가 포함되나요?</p>
            <span class="text-gray-300 group-open:rotate-180 transition-transform">↓</span>
          </summary>
          <div class="px-8 pb-8 text-sm text-gray-500 leading-relaxed bg-white font-light">
            Facet에서 거래되는 모든 하이 주얼리는 전문 감정팀의 1차 검수를 거치며, GIA 또는 국내
            공인 감정서가 포함된 상품은 상세 페이지에 별도 표기됩니다. 보증서가 없는 빈티지 제품의
            경우 Facet 자체 정품 인증서가 발행됩니다.
          </div>
        </details>

        <details class="border-b border-gray-50 group">
          <summary class="cursor-pointer px-8 py-6 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
            <p class="font-medium text-gray-800">해외 배송이 가능한가요?</p>
            <span class="text-gray-300 group-open:rotate-180 transition-transform">↓</span>
          </summary>
          <div class="px-8 pb-8 text-sm text-gray-500 leading-relaxed bg-white font-light">
            네, Facet은 전 세계 주요 국가로의 보안 배송(Secure Shipping)을 지원합니다. 다만, 국가별
            통관 규정 및 관세율이 상이하므로 낙찰 전 고객 센터를 통해 배송 가능 여부와 예상 비용을
            확인하시기 바랍니다.
          </div>
        </details>
      </div>
    </section>

    <!-- 1:1 INQUIRY (Balanced Layout) -->
    <section id="ticket">
      <div class="mb-10">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">1:1 컨시어지 문의</h2>
        <p class="text-gray-400 text-sm font-light">
          전문 상담원이 영업일 기준 24시간 이내에 답변을 드립니다.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        <!-- Form Area -->
        <div class="lg:col-span-7">
          <form class="space-y-6 h-full flex flex-col justify-between" onsubmit="event.preventDefault()">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</label>
                  <select
                    class="w-full bg-white border border-gray-200 rounded-lg px-4 py-4 text-sm focus:border-[#A39382] outline-none cursor-pointer">
                    <option>결제 및 입찰</option>
                    <option>배송 및 환불</option>
                    <option>상품 감정 문의</option>
                    <option>보안 및 계정</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                  <input type="email" placeholder="example@facet.com"
                    class="w-full bg-white border border-gray-200 rounded-lg px-4 py-4 text-sm focus:border-[#A39382] outline-none" />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subject</label>
                <input type="text" placeholder="문의 제목을 입력하세요"
                  class="w-full bg-white border border-gray-200 rounded-lg px-4 py-4 text-sm focus:border-[#A39382] outline-none" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message Details</label>
                <textarea rows="10" placeholder="구체적인 내용을 입력해 주세요."
                  class="w-full bg-white border border-gray-200 rounded-lg px-4 py-4 text-sm focus:border-[#A39382] outline-none resize-none"></textarea>
              </div>
            </div>
            <button type="submit"
              class="w-full text-black py-5 rounded-lg text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg mt-6 ">
              Send Message
            </button>
          </form>
        </div>


        <!-- Contact Info (Balanced Sidebar) -->
        <div class="lg:col-span-5">
          <div class="glass rounded-3xl p-10 h-full border-none flex flex-col">
            <h3 class="text-xl font-bold mb-8 font-serif-luxury italic">Contact Info</h3>
            <div class="space-y-10 flex-grow">
              <div class="flex items-start space-x-4">
                <div
                  class="bg-[#A39382]/10 p-3 rounded-full text-xl leading-none flex items-center justify-center w-12 h-12">
                  📞
                </div>
                <div>
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Customer Line
                  </p>
                  <p class="text-lg font-bold text-[#A39382]">1588-0000</p>
                  <p class="text-[11px] text-gray-400 mt-1">
                    평일 10:00 - 18:00 (주말/공휴일 휴무)
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div
                  class="bg-[#A39382]/10 p-3 rounded-full text-xl leading-none flex items-center justify-center w-12 h-12">
                  ✉️
                </div>
                <div>
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Official Email
                  </p>
                  <p class="text-sm font-medium">concierge@facet.luxury</p>
                </div>
              </div>

              <!-- Added Info to fill the space -->
              <div class="pt-8 border-t border-gray-50 mt-auto space-y-6">
                <div class="flex items-start space-x-4">
                  <div class="text-lg w-12 flex justify-center mt-1">📍</div>
                  <div>
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Main Atelier
                    </p>
                    <p class="text-[12px] text-gray-500 leading-relaxed font-light">
                      서울특별시 용산구 한남대로 123-45<br />
                      FACET 빌딩 2F-4F
                    </p>
                  </div>
                </div>
                <div class="flex items-start space-x-4">
                  <div class="text-lg w-12 flex justify-center mt-1">👤</div>
                  <div>
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Service Director
                    </p>
                    <p class="text-[12px] text-gray-500 font-light">
                      Julian H. | Head of Concierge
                    </p>
                  </div>
                </div>
                <p class="text-xs leading-relaxed text-gray-400 font-light italic mt-6 pt-4 border-t border-gray-50/50">
                  긴급한 보안 관련 문의나 가품 신고는 24시간 연중무휴로 접수되며 최우선적으로
                  처리됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- NEW SECTION: Inquiry List -->
      <section>
        <div class="flex justify-between items-end mb-6 border-b border-gray-100 pb-4 mt-16">
          <div>
            <h2 class="text-xl font-bold mb-2">내 문의 내역</h2>
            <p class="text-xs text-gray-400">최근 3개월간의 문의 기록입니다.</p>
          </div>
          <button class="text-xs font-medium text-gray-500 hover:text-black flex items-center">
            전체보기
            <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Inquiry Item 1 (Completed) -->
          <div
            class="group border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-all cursor-pointer bg-white">
            <div class="flex justify-between items-start mb-3">
              <div class="flex space-x-2 items-center">
                <span class="status-badge status-completed tracking-tighter">답변 완료</span>
                <span class="text-[10px] text-gray-400 font-medium">결제 및 입찰</span>
              </div>
              <span class="text-[11px] text-gray-300">2024.02.26</span>
            </div>
            <h4 class="text-sm font-semibold mb-2 group-hover:underline">입찰한 다이아몬드 링의 잔금 결제 방법 문의</h4>
            <p class="text-xs text-gray-500 line-clamp-1 mb-0">마이페이지에서 카드 결제 시 자꾸 오류가 발생하는데 무통장 입금이 가능한가요...</p>
          </div>

          <!-- Inquiry Item 2 (Pending) -->
          <div
            class="group border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-all cursor-pointer bg-white">
            <div class="flex justify-between items-start mb-3">
              <div class="flex space-x-2 items-center">
                <span class="status-badge status-pending tracking-tighter">답변 대기</span>
                <span class="text-[10px] text-gray-400 font-medium">배송 문의</span>
              </div>
              <span class="text-[11px] text-gray-300">2024.02.27</span>
            </div>
            <h4 class="text-sm font-semibold mb-2 group-hover:underline">배송지 변경 요청 (주문번호 #FCT-2024-002)</h4>
            <p class="text-xs text-gray-500 line-clamp-1 mb-0">이사 일정 때문에 이번 주 금요일까지 배송지를 수정하고 싶습니다.</p>
          </div>

          <!-- Inquiry Item 3 (Completed) -->
          <div
            class="group border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-all cursor-pointer bg-white">
            <div class="flex justify-between items-start mb-3">
              <div class="flex space-x-2 items-center">
                <span class="status-badge status-completed tracking-tighter">답변 완료</span>
                <span class="text-[10px] text-gray-400 font-medium">상품 상태 문의</span>
              </div>
              <span class="text-[11px] text-gray-300">2024.02.20</span>
            </div>
            <h4 class="text-sm font-semibold mb-2 group-hover:underline">GIA 감정서 진위 확인 부탁드립니다.</h4>
            <p class="text-xs text-gray-500 line-clamp-1 mb-0">업로드해주신 사진 속 감정서 번호가 명확히 보이지 않아 재문의 남깁니다.</p>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Noto+Sans+KR:wght@100;300;400;500;700&display=swap');

:root {
  --accent-color: #a39382;
  --accent-hover: #1a1a1a;
  --bg-page: #f8f6f4;
  --text-main: #1a1a1a;
  --border-color: #e5e7eb;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  font-family: 'Noto Sans KR', sans-serif;
  word-break: keep-all;
}

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
}

.luxury-font {
  font-family: 'Cinzel', serif;
}

.glass {
  background: #ffffff;
  border: 1px solid var(--border-color);
}

.glass-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
}

.input-focus:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(163, 147, 130, 0.08);
  outline: none;
}

.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
}

.text-accent {
  color: var(--accent-color);
}

details summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}

.bg-soft {
  background-color: #ffffff;
}

.letter-spacing-huge {
  letter-spacing: 0.3em;
}

html {
  scroll-behavior: smooth;
}
</style>
