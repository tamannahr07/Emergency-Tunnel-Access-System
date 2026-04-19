import API from './authService'

export const generateOTP = () => API.post('/otp/generate')

export const verifyOTP = (code, rfidUid = null) =>
  API.post('/otp/verify', { code, rfidUid })

export const getCurrentOTP = () => API.get('/otp/current')
