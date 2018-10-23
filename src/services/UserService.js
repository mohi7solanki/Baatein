import Api from '@/services/Api'

export default {
  getAllUsers () {
    return Api().get('users')
      .then (function (resp) {
        return resp
      })
  },
  isLoggedin () {
    return Api().get('user/isloggedin')
      .then (function (resp) {
        return resp
      })
  }
}