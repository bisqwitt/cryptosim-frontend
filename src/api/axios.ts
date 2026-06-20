import { showError } from '@/services/popupService'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const { message, suggestion } = error.response.data

      showError(message, suggestion)
    } else {
      showError('Unable to connect to the server.', 'Please start the server')
    }

    return Promise.reject(error)
  },
)

export default api
