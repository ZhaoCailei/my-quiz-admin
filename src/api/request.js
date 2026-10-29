import axios from 'axios'

// 开发环境由 vue.config.js 中的 devServer.proxy 转发到 http://localhost:3000
// 如果需要直接连接其他地址，可在 .env 中设置 VUE_APP_API_BASE_URL
const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '',
  timeout: 10000
})

request.interceptors.response.use(
  response => response.data,
  error => {
    let message = '请求失败，请稍后重试'

    if (error.response && error.response.data && error.response.data.error) {
      message = error.response.data.error
    } else if (error.response) {
      message = `请求失败（HTTP ${error.response.status}）`
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    } else {
      message = '无法连接后端服务，请先运行 npm run server'
    }

    return Promise.reject(new Error(message))
  }
)

export default request
