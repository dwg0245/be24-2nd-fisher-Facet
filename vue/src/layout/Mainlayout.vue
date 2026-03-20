<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { onMounted } from 'vue'

const authStore = useAuthStore()

// 화면에 모든것이 출력이 되면 실행해라
onMounted(() => {
  authStore.checkLogin() //추가
  authStore.isMainPage
})
</script>

<template>
  <Header></Header>
  <RouterView></RouterView>
  <Footer></Footer>
</template>

<style scoped></style>
