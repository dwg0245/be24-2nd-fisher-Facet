import api from '@/plugins/axiosinterceptor'

const mainfundList = async () => {
  const res = await api.get('/funding/fundinglist')
  // console.log('index', res)
  return res.data
}

const fundingPageList = async (page,currentFilter,currentCategories,currentStatus) =>{
  const res = await api.get(`/funding/fundingPageList?page=${page}&size=9&currentFilter=${currentFilter}&currentCategories=${currentCategories}&currentStatus=${currentStatus}`)
  //console.log("펀딩 페이지 리스트",res.data)
  return res.data
}

const fundingDetail = async () => {
  const res = await api.get("funding/DetailList?page=0&size=4&endDay=1")
  // console.log('index', res.data)
  return res.data
}

const FundingDesc = async (idx) => {
  const res = await api.get(`/funding/descList/${idx}`)
  // console.log(res.data)
  return res.data
}

 const fundOrders = async(orderDto)=>{
  const res = await api.post('/fundOrders/create', orderDto)
  // console.log("res.data", res.data)
  return res.data;
 }

 const verifyOrders = async (paymentId)=>{
  const res = await api.post("/fundOrders/verify", paymentId)
  return res.data
 }

export default { mainfundList, FundingDesc, fundingPageList ,fundingDetail, fundOrders, verifyOrders}
