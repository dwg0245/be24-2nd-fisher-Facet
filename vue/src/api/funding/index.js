import api from '@/plugins/axiosinterceptor'

const mainfundList = async () => {
  const res = await api.get('/funding/fundinglist')
  // console.log('index', res)
  return res.data
}

const fundescList = async () => {
  const res = await api.get('/json/funding_list')
  console.log('index', res)
  return res.data
}

const getFundingDetail = async (idx) => {
  const res = await api.get(`/json/funding_detail/${idx}`)
  return res.data
}

export default { mainfundList, fundescList, getFundingDetail }
