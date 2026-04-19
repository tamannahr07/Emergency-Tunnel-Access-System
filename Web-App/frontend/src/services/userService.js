import API from './authService'

export const saveDetails = (formData) =>
  API.post('/user/details', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const verifyCode = (code) =>
  API.post('/user/verify-code', { code })

export const biometricDone = () =>
  API.post('/user/biometric-done')

export const generateCard = (rfidUid = null) =>
  API.post('/user/generate-card', { rfidUid })

export const getProfile = () =>
  API.get('/user/profile')
