import Vue from 'vue'
import Router from 'vue-router'
import Register from '@/views/Register'
import Signin from '@/views/Signin'
import Dashboard from '@/views/Dashboard'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'register',
      component: Register,
    },
    {
      path: '/signin',
      name: 'signin',
      component: Signin
    },
    {
      path: '/user/:username',
      name: 'userDash',
      component: Dashboard
    }
  ],
});
