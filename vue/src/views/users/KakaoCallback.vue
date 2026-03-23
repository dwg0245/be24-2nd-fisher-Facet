<script setup>
import { reactive, onMounted } from 'vue'
import api from '@/api/user'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()

const authStore = useAuthStore()
const loginAndFetchDetail = async () => {
  try {
    const res = await api.kakaoCallBack()
    console.log(res.status)
    if (res.status == 200) {
      authStore.login(JSON.stringify(res.data.result))
      router.push({ name: 'user_information' })
    } else {
      console.log(res)
      alert('아이디와 비밀번호를 확인해보세요.')
    }
  } catch (error) {
    alert('아이디와 비밀번호를 확인해보세요.')
  }
}

onMounted(() => {
  loginAndFetchDetail() // 페이지 로드 시 바로 유저 정보 확인
})
</script>

<template></template>

<style scoped></style>