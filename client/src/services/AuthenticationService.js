import Api from '@/services/Api'

export default {
  register (credentials) {
    return Api().post('user/register', credentials)
  },
  signin (credentials) {
    return Api()
    .post('user/signin', credentials)
    .then(function (resp) {
      console.log(resp)
      return resp
    })
  },
  logout () {
    return Api().get('user/logout')
      .then (function (resp) {
        return resp
      })
  }
}