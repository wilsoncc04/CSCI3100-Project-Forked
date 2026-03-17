// Minimal helper for registering a user and verifying token
export async function registerUser({ name, email, password, hostel = '' }) {
  const res = await fetch('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: { name, email, password, hostel } })
  })
  return res.json()
}

export async function verifyToken(token) {
  const url = new URL('/users/verify', window.location.origin)
  url.searchParams.set('token', token)
  const res = await fetch(url.toString(), { method: 'GET' })
  return res.json()
}
