import api from '@/plugins/axiosinterceptor'

// get은 가져오기, post은 보낼때
const auctionList = async (page) => {
  const res = await api.get(`/auction/list?page=${page}`)
  return res.data
}

const detail = async (ListId) => {
  const res = await api.get(`/auction/detail/${ListId}`)
  return res.data
}

const bid = async (bidData) => {
  const res = await api.post('/auction/bid', bidData)
  return res.data
}

export default { auctionList, detail, bid }
