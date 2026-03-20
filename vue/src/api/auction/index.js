import api from '@/plugins/axiosinterceptor'

// get은 가져오기, post은 보낼때
const mainList = async () => {
  const res = await api.get('/auction/mainList')
  return res.data;
}

const auctionList = async (page) => {
  const res = await api.get(`/auction/list?page=${page}`)
  return res.data
}

const detail = async (ListId) => {
  const res = await api.get(`/auction/detail/${ListId}`)
  return res.data
}

const getImage = async (prodIdx) => {
  const res = await api.get(`/auction/image/get/${prodIdx}`)
}

const bid = async (bidData) => {
  const res = await api.post('/auction/bid', bidData)
  return res.data
}

export default { mainList, auctionList, detail, getImage, bid }
