import axios from 'axios';

// 確保請求會帶上 Cookies (Rails Session 依賴這個)
axios.defaults.withCredentials = true;

// 登入
export async function loginUser(email, password) {
  const res = await axios.post('/sessions', {
    email: email,
    password: password
  });
  return res.data;
}

// 登出
export async function logoutUser() {
  const res = await axios.delete('/sessions'); 
  return res.data;
}
