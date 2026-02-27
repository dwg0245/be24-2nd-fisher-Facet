import api from '@/plugins/axiosinterceptor'

const login = async (req) => {
  const res = await api.post('/user/login', req)
  console.log('index', res)
  return res
}

// signup.vue에서 넣어준 매개변수가 들어와서 백엔드로 보내진다.
const signup = async (req) => {
  const res = await api.post('/user/signup', req)
  console.log('index', res)
  return res
}

export default { login, signup }
