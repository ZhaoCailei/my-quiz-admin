import Vue from 'vue'
import VueRouter from 'vue-router'
import AdminLayout from '@/layout/AdminLayout.vue'
import UserView from '@/views/UserView.vue'
import QuizView from '@/views/QuizView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/user',
    children: [
      {
        path: 'user',
        name: 'User',
        component: UserView,
        meta: { title: '用户管理' }
      },
      {
        path: 'quiz',
        name: 'Quiz',
        component: QuizView,
        meta: { title: '题目管理' }
      }
    ]
  },
  {
    path: '*',
    redirect: '/user'
  }
]

const router = new VueRouter({
  routes
})

router.afterEach(to => {
  const title = to.meta && to.meta.title
  document.title = title ? `${title} - Quiz后台管理` : 'Quiz后台管理'
})

export default router
