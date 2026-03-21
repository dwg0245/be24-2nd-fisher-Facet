import api from '@/plugins/axiosinterceptor'

const login = async (req) => {
  const res = await api.post('/user/login', req)
  // console.log('index', res)
  return res
}

const logout = async (req) => {
  return await api.post('/user/logout', req)
}

// signup.vue에서 넣어준 매개변수가 들어와서 백엔드로 보내진다.
const signup = async (req) => {
  const res = await api.post('/user/signup', req)
  // console.log('index', res)
  return res
}

// 문의 요청후 응답 받기 
const reg = async (regForm)=>{
  const res = await api.post('/ask/reg', regForm)
  // console.log(res)
  return res;
}

// 사용자가 남긴 문의 내역을 받아오기 
const list = async () =>{
  const res = await api.get('/ask/list')
  return res.data;
}

const kakaoCallBack = async () =>{
  const res = await api.get("/user/callback")
  // console.log("kakaoCallBack", res)
  return res
}

export default { login, logout, signup, reg, list, kakaoCallBack }

