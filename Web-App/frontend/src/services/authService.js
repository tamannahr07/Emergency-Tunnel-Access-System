import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sgs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sgs_token')
      localStorage.removeItem('sgs_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const login = (email, password) =>
  API.post('/auth/login', { email, password })

export const register = (email, password) =>
  API.post('/auth/register', { email, password })

export const getMe = () => API.get('/auth/me')

export const logout = () => {
  localStorage.removeItem('sgs_token')
  localStorage.removeItem('sgs_user')
}

export default API
