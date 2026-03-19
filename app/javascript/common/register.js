import axios from 'axios'

// Minimal helper for registering a user and verifying token
export async function registerUser({ name, email, password, hostel = '' }) {
  const res = await axios.post('/users/register', { user: { name, email, password, hostel } })
  return res.data
}

export async function verifyToken(token) {
  const url = new URL('/users/verify', window.location.origin)
  url.searchParams.set('token', token)
  const res = await axios.get(url.toString())
  return res.data
}
