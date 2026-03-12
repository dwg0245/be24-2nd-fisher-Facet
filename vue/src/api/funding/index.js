import api from '@/plugins/axiosinterceptor'

const mainfundList = async () => {
  const res = await api.get('/funding/fundinglist')
  // console.log('index', res)
  return res.data
}

const fundingPageList = async (page,currentFilter,currentCategories) =>{
  const res = await api.get(`/funding/fundingPageList?page=${page}&size=9&currentFilter=${currentFilter}&currentCategories=${currentCategories}`)
  //console.log("펀딩 페이지 리스트",res.data)
  return res.data
}

const fundescList = async () => {
  const res = await api.get('/funding/funding_list')
  console.log('index', res)
  return res.data
}

const getFundingDetail = async (idx) => {
  const res = await api.get(`/json/funding_detail/${idx}`)
  return res.data
}

export default { mainfundList, fundescList, getFundingDetail, fundingPageList }
