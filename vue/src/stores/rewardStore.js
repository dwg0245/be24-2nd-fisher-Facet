import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRewardStore = defineStore('reward', () => {
  // 선택된 리워드들을 담는 배열
  const selectedRewards = ref([])
  const targetPrice = ref()
  const productIdx = ref()

  // 리워드 추가 또는 초기화 로직
  const updateRewards = (idx, rewards,Price) => {
    productIdx.value = idx
    selectedRewards.value = rewards
    targetPrice.value = Price

  }

  const clearRewards = () =>{
    selectedRewards.value = []
    targetPrice.value = ''
  }


  return { selectedRewards, targetPrice, productIdx,  updateRewards, clearRewards }
})