<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from '@/api/user/index.js'

const authStore = useAuthStore()

const router = useRouter()
const userInfo = ref({
  userName: '',
  phoneNumber: '',
  address: '',
  birthDate: ''
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const changePassword = async () => {
  //두 변수를 비교해서 오타가 있는지 확인
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword){
    alert("새 비밀번호가 일치하지 않습니다")
    return
  }

  try {
    const res = await axios.post('/api/user/updatepassword', {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    }, { withCredentials: true })
    
    if (res.data.success || res.data.isSuccess) {
      alert('비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해 주세요.')

      authStore.logout()
      document.cookie = "ATOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      router.push('/login')
    }
  } catch (error) {
    alert(error.response?.data?.message || "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해 주세요.")
  }
}

const fetchUserInfo = async () => {
  try {
    const res = await axios.get('/api/user/getuserinfo', {
      withCredentials: true
    })
    if (res.data.success || res.data.isSuccess || res.data.code === 2000) {
      const data = res.data.result;

      userInfo.value.phoneNumber = data.phoneNumber; // 전화번호
      userInfo.value.address = data.address;         // 주소
      userInfo.value.birthDate = data.birthDate;

      console.log('DB에서 성공적으로 불러온 정보:', userInfo.value);
    }
    } catch (error) {
    console.error('정보를 불러오지 못했습니다.', error)
  }
}
onMounted(() => {
  fetchUserInfo()
})

const saveUserInfo = async () => {
  try {
    const res = await axios.post('/api/user/updateuserinfo',{
      phoneNumber: userInfo.value.phoneNumber,
      address: userInfo.value.address,
      birthDate: userInfo.value.birthDate
    }, {
      withCredentials: true
    })

    if (res.data.isSuccess) {
      alert('개인정보가 성공적으로 저장되었습니다! 🎉')
      userInfo.value = res.data.result 
    }
  } catch (error) {
    alert('정보 저장에 실패했습니다.')
    console.error(error)
  }
}

onMounted(() => {
  // 화면이 켜지자마자 백엔드에서 정보 가져오기!
  fetchUserInfo()
})

onMounted(() => {
  // 1. 창고에서 데이터 꺼내기
  const savedData = localStorage.getItem('USERINFO')

  if (savedData) {
    // 2. 해독하기 (문자열 -> 객체)
    const saveuser = JSON.parse(savedData)
    userInfo.value = saveuser
    console.log('유저 정보:', userInfo.value)
  } else {
    userName.value = '로그인 필요'
  }
})

const logout = async () => {
  try {
    // 쿠키 삭제를 위한 백엔드 통신
    const res = await api.logout()
    if (res.status == 200) {
      authStore.logout(JSON.stringify(res.data))
      router.push('/')
    } else {
      alert('다시 시도해주세요.')
    }
  } catch (error) {
    alert('다시 시도해주세요.')
  }
}
</script>

<template>
  <main class="max-w-7xl mx-auto py-16 px-6 lg:px-10">
    <!-- Breadcrumb -->
    <nav class="text-[10px] text-gray-400 mb-10 uppercase tracking-[0.2em]">
      Home / My / <span class="text-black font-medium">Profile</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left -->
      <aside class="lg:col-span-4 border border-gray-100 bg-white shadow-sm p-8">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gray-100 border border-gray-200"></div>
          <div>
            <p class="text-sm text-gray-400 uppercase tracking-[0.2em]">Member</p>
            <p class="text-xl font-medium text-black">{{ userInfo.userName }}</p>
            <p class="text-xs text-gray-500 mt-1">level: Silver</p>
          </div>
        </div>

        <div class="mt-10 space-y-3 text-sm">
          <!-- ✅ 현재 페이지 강조 -->
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
            주문/배송
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
          <i class="fa-regular fa-pen-to-square mr-2"></i>Edit Profile
        </button>

        <div class="mt-10 border-t border-gray-100 pt-8">
          <p class="text-[10px] text-gray-400 uppercase tracking-[0.35em] mb-4">Security</p>
          <a
            href="#password"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition text-sm"
          >
            비밀번호 변경
          </a>
          <a
            @click="logout()"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition text-sm text-gray-500"
          >
            <button>로그아웃</button>
          </a>
          <a
            href="#withdraw"
            class="block py-3 px-4 border border-gray-100 hover:border-gray-200 transition text-sm text-gray-500"
          >
            회원 탈퇴
          </a>
        </div>
      </aside>

      <!-- Right -->
      <section class="lg:col-span-8 space-y-10">
        <!-- Header / Actions -->
        <div class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 class="text-2xl font-medium text-black">내 정보</h1>
              <p class="text-sm text-gray-500 font-light mt-2">
                개인정보 및 배송 정보를 관리할 수 있어요.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                id="cancelBtn"
                class="btn-ghost px-5 py-3 text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                취소
              </button>
              <button
                id="saveBtn"
                @click="saveUserInfo" 
                class="btn-outline px-5 py-3 text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                저장
              </button>
            </div>
          </div>

          <div class="mt-6 border-t border-gray-100 pt-6 flex items-start justify-between gap-6">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-bold">Notice</p>
              <p class="hint mt-2">
                * 포트폴리오용 UI입니다. 저장 버튼 클릭 시 실제로 서버 반영은 되지 않고, 알림만
                표시됩니다.
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Member ID</p>
              <p class="text-sm font-medium text-black">FACET-USER-0102</p>
            </div>
          </div>
        </div>

        <!-- Basic Info -->
        <section class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex items-end justify-between mb-8">
            <h2 class="text-xs font-bold tracking-[0.5em] uppercase text-gray-400">Basic Info</h2>
            <span class="text-[10px] text-gray-400 uppercase tracking-[0.25em]">Profile</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="field-label">Name</label>
              <input class="field" type="text" v-model="userInfo.userName" placeholder="이름" readonly />
              <p class="hint">실명 기반 거래/배송을 위해 정확히 입력해 주세요.</p>
            </div>

            <div class="space-y-2">
              <label class="field-label">Phone</label>
              <input class="field" type="text" v-model="userInfo.phoneNumber" placeholder="휴대폰 번호" />
              <p class="hint">배송 알림 및 보안 인증에 사용됩니다.</p>
            </div>

            <div class="space-y-2">
              <label class="field-label">Address</label>
              <input class="field" type="text" v-model="userInfo.address" placeholder="주소" />
              <p class="hint">영수증/공지/문의 답변 수신에 사용됩니다.</p>
            </div>

            <div class="space-y-2">
              <label class="field-label">Birthday</label>
              <input class="field" type="date" v-model="userInfo.birthDate" />
              <p class="hint">연령 인증이 필요한 서비스에 활용될 수 있어요.</p>
            </div>
          </div>
        </section>

        <!-- Address / Delivery -->
        <section class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex items-end justify-between mb-8">
            <h2 class="text-xs font-bold tracking-[0.5em] uppercase text-gray-400">Shipping</h2>
            <button class="btn-ghost px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em]">
              <i class="fa-solid fa-plus mr-2"></i>배송지 추가
            </button>
          </div>

          <div class="space-y-4">
            <!-- Default Address -->
            <div class="border border-gray-100 p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">
                    Default Address
                  </p>
                  <p class="text-lg font-medium text-black">집</p>
                  <p class="text-sm text-gray-500 font-light mt-2">
                    (06236) 서울 강남구 테헤란로 123, 10층<br />
                    수령인: 오은서 / 010-1234-5678
                  </p>
                </div>

                <div class="text-right">
                  <span
                    class="inline-flex items-center px-2 py-1 text-[10px] uppercase tracking-[0.2em] bg-[#FBFAF9] border border-gray-100 rounded-full text-gray-500 mb-3"
                  >
                    <i class="fa-solid fa-location-dot mr-2"></i>Primary
                  </span>
                  <div class="flex items-center gap-2 justify-end">
                    <button
                      class="btn-ghost px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
                    >
                      수정
                    </button>
                    <button
                      class="btn-ghost px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Another Address -->
            <div class="border border-gray-100 p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">
                    Saved Address
                  </p>
                  <p class="text-lg font-medium text-black">회사</p>
                  <p class="text-sm text-gray-500 font-light mt-2">
                    (04524) 서울 중구 세종대로 55<br />
                    수령인: 오은서 / 010-1234-5678
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    class="btn-ghost px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
                  >
                    기본 설정
                  </button>
                  <button
                    class="btn-ghost px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Preferences -->
        <section class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex items-end justify-between mb-8">
            <h2 class="text-xs font-bold tracking-[0.5em] uppercase text-gray-400">Preferences</h2>
            <span class="text-[10px] text-gray-400 uppercase tracking-[0.25em]">Marketing</span>
          </div>

          <div class="space-y-6">
            <div class="flex items-start justify-between gap-6 border border-gray-100 p-6">
              <div>
                <p class="text-sm font-medium text-black">마케팅 정보 수신 동의</p>
                <p class="hint mt-2">
                  프로모션/신규 컬렉션/이벤트 소식을 이메일로 받아볼 수 있어요.
                </p>
              </div>
              <button class="toggle on" aria-label="toggle marketing" id="marketingToggle"></button>
            </div>

            <div class="flex items-start justify-between gap-6 border border-gray-100 p-6">
              <div>
                <p class="text-sm font-medium text-black">입찰/배송 알림</p>
                <p class="hint mt-2">낙찰/배송 상태 변경 시 알림을 받을 수 있어요.</p>
              </div>
              <button class="toggle on" aria-label="toggle notify" id="notifyToggle"></button>
            </div>
          </div>
        </section>

        <!-- Password -->
        <section id="password" class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex items-end justify-between mb-8">
            <h2 class="text-xs font-bold tracking-[0.5em] uppercase text-gray-400">Security</h2>
            <span class="text-[10px] text-gray-400 uppercase tracking-[0.25em]">Password</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="field-label">Current Password</label>
              <input class="field" type="password" v-model="passwordData.currentPassword" placeholder="현재 비밀번호" />
            </div>
            <div class="space-y-2">
              <label class="field-label">New Password</label>
              <input class="field" type="password" v-model="passwordData.newPassword" placeholder="새 비밀번호" />
            </div>
            <div class="space-y-2">
              <label class="field-label">Confirm</label>
              <input class="field" type="password" v-model="passwordData.confirmPassword" placeholder="새 비밀번호 확인" />
            </div>
            <div class="flex items-end">
              <button @click="changePassword" class="btn-outline w-full py-4 font-bold text-[11px] tracking-[0.35em] uppercase">
                비밀번호 변경
              </button>
            </div>
          </div>

          <p class="hint mt-6">
            * 비밀번호 변경은 실제 서비스에서는 본인 인증/재로그인이 필요할 수 있어요.
          </p>
        </section>

        <!-- Withdraw -->
        <section id="withdraw" class="border border-gray-100 bg-white shadow-sm p-8">
          <div class="flex items-end justify-between mb-8">
            <h2 class="text-xs font-bold tracking-[0.5em] uppercase text-gray-400">Account</h2>
            <span class="text-[10px] text-gray-400 uppercase tracking-[0.25em]">Withdraw</span>
          </div>

          <div class="border border-gray-100 p-6">
            <p class="text-sm text-gray-700 font-light leading-relaxed">
              회원 탈퇴 시 보유 포인트/쿠폰/거래 내역은 복구가 불가합니다. 진행 중인 입찰/배송이
              있다면 탈퇴가 제한될 수 있습니다.
            </p>
            <div class="mt-6 flex items-center gap-2">
              <button class="btn-ghost px-5 py-3 text-[11px] font-bold uppercase tracking-[0.25em]">
                탈퇴 안내 보기
              </button>
              <button
                class="btn-outline px-5 py-3 text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                회원 탈퇴 신청
              </button>
            </div>
          </div>
        </section>
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

/* Form */
.field-label {
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 700;
}
.field {
  width: 100%;
  background: #fff;
  border: 1px solid #f1f1f1;
  padding: 14px 14px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
}
.field:focus {
  border-color: rgba(163, 147, 130, 0.65);
  box-shadow: 0 0 0 4px rgba(163, 147, 130, 0.1);
}
.hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 300;
  line-height: 1.6;
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
