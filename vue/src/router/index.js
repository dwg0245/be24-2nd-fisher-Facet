
// 하나인 것처럼 만들어주는 것
import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      name: 'login',
      path: '/login',
      meta: {
        title: ' 로그인 페이지',
        requiresAuth: false,
      },
      component: () => import('../views/Login.vue'),
    },
    {
      name: 'signup',
      path: '/signup',
      meta: {
        title: ' 회원가입 페이지',
        requiresAuth: false,
      },
      component: () => import('../views/Signup.vue'),
    },
    {
      path: '/',
      component: () => import('../layout/Mainlayout.vue'),
      children: [
        {
          name: 'Main_root',
          path: '',
          meta: {
            title: '경매 메인페이지',
            requiresAuth: false,
          },
          component: () => import('../views/auction/Main_auction.vue'),
        },
        {
          name: 'Main_auction',
          path: 'auction/Main_auction',
          meta: {
            title: '메인 경매',
            requiresAuth: false,
          },
          component: () => import('../views/auction/Main_auction.vue'),
        },
        {
          name: 'auction_list',
          path: 'auction/list',
          meta: {
            title: '경매 상품 리스트',
            requiresAuth: false,
          },
          component: () => import('../views/auction/Auction_list.vue'),
        },
        {
          name: 'auction_detail',
          path: 'auction/detail/:idx',
          meta: {
            title: '경매 상세',
            requiresAuth: true,
          },
          component: () => import('../views/auction/Auction_detail.vue'),
        },
        {
          name: 'auction_end',
          path: 'auction/end',
          meta: {
            title: '경매 종료',
            requiresAuth: false,
          },
          component: () => import('../views/auction/Auction_end.vue'),
        },
        {
          name: 'auction_success',
          path: 'auction/success',
          meta: {
            title: '경매 성공',
            requiresAuth: true,
          },
          component: () => import('../views/auction/Auction_success.vue'),
        },
        {
          name: 'auction_preview',
          path: 'auction/preview/:idx',
          meta: {
            title: '경매 프리뷰',
            requiresAuth: false,
          },
          component: () => import('../views/auction/Auction_preview.vue'),
        },

        {
          name: 'main_funding',
          path: 'funding/main_funding',
          meta: {
            title: '펀딩 메인 페이지',
            requiresAuth: false,
          },
          component: () => import('@/views/funding/Main_funding.vue'),
        },
        {
          name: 'funding_list',
          path: 'funding/funding_list',
          meta: {
            title: '펀딩 리스트 페이지',
            requiresAuth: false,
          },
          component: () => import('../views/funding/Funding_list.vue'),
        },
        {
          name: 'funding_desc',
          path: 'funding/funding_desc/:idx',
          meta: {
            title: '펀딩 상세 페이지',
            requiresAuth: false,
          },
          component: () => import('../views/funding/Funding_desc.vue'),
        },

        {
          name: 'serch',
          path: 'features/serch',
          meta: {
            title: '검색',
            requiresAuth: false,
          },
          component: () => import('../views/features/Search.vue'),
        },
        {
          name: 'payment',
          path: 'features/payment',
          meta: {
            title: '결제',
            requiresAuth: true,
          },
          component: () => import('../views/features/Payment.vue'),
        },

        {
          path: 'users/user_information',
          name: 'user_information',
          meta: {
            title: '내 정보',
            requiresAuth: true,
          },
          component: () => import('../views/users/User_information.vue'),
        },
        {
          name: 'add_points',
          path: 'users/add_points',
          meta: {
            title: '포인트 충전',
            requiresAuth: true,
          },
          component: () => import('../views/users/Add_points.vue'),
        },
        {
          name: 'shipping',
          path: 'users/shipping',
          meta: {
            title: '배송 서비스',
            requiresAuth: true,
          },
          component: () => import('../views/users/Shipping.vue'),
        },
        {
          path: 'users/wish_list',
          name: 'wish_list',
          meta: {
            title: '위시리스트',
            requiresAuth: true,
          },
          component: () => import('../views/users/Wish_list.vue'),
        },
        {
          path: 'ask',
          name: 'ask',
          meta: {
            title: '문의 사항',
            requiresAuth: true,
          },
          component: () => import('../views/users/Ask.vue'),
        },
        {
          name: 'payment',
          path: 'funding/payment',
          meta: {
            title: '결제',
            requiresAuth: false,
          },
          component: () => import('../views/users/Payment.vue'),
        },
        {
          path: 'kakaoCallBack',
          name: 'kakaoCallBack',
          meta: {
            title: 'callback',
            requiresAuth: false,
          },
          component: () => import('../views/users/KakaoCallback.vue'),
        },
      ],
    },
  ],
  // 페이지가 바뀌거나 데이터가 업데이트되었을 때 스크롤을 맨 위로 올리는 방법
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  // 백엔드로 토큰 확인요청
  const isAuthenticated = await authStore.validateToken()
  const token = localStorage.getItem('USERINFO') // 민주님이 확인하신 토큰 이름

  if (to.meta.requiresAuth && !token) {
    alert('로그인이 필요한 서비스입니다.')
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  } else {
    return next()
  }
})

export default router
