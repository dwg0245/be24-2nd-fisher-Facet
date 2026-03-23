import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRewardStore = defineStore('reward', () => {
  // 선택된 리워드들을 담는 배열
  const selectedRewards = ref([])
  const totalPrice = ref()
  const productIdx = ref()

  // 리워드 추가 또는 초기화 로직
  const updateRewards = (idx, rewards,Price) => {
    productIdx.value = idx
    selectedRewards.value = rewards
    totalPrice.value = Price

  }
  console.log("피니아",productIdx.value)

  const clearRewards = () =>{
    selectedRewards.value = []
    totalPrice.value = ''
  }


  return { selectedRewards, totalPrice, productIdx,  updateRewards, clearRewards }
})