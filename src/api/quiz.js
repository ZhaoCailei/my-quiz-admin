import request from './request'

export function fetchQuizzes(params) {
  return request.get('/api/quizzes', { params })
}

export function createQuiz(data) {
  return request.post('/api/quizzes', data)
}

export function updateQuiz(id, data) {
  return request.put(`/api/quizzes/${id}`, data)
}

export function deleteQuiz(id) {
  return request.delete(`/api/quizzes/${id}`)
}
