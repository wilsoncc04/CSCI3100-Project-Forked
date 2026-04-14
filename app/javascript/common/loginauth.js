import axios from 'axios';

axios.defaults.withCredentials = true;

// login
export async function loginUser(email, password) {
  const res = await axios.post('/sessions', {
    email: email,
    password: password
  });
  return res.data;
}

// logout
export async function logoutUser() {
  const res = await axios.delete('/sessions'); 
  return res.data;
}

// Send password reset OTP email (generic response to prevent account enumeration)
export async function requestPasswordResetOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const res = await axios.post('/users/forgot_password', {
    email: normalizedEmail
  });
  return res.data;
}

// Reset password with email + OTP
export async function resetPasswordWithOtp(email, otp, newPassword) {
  const normalizedEmail = email.trim().toLowerCase();
  const res = await axios.post('/users/reset_password', {
    email: normalizedEmail,
    otp: otp.trim(),
    new_password: newPassword
  });
  return res.data;
}
