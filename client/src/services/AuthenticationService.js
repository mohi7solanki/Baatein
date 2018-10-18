import Api from '@/services/Api'

export default {
  register (credentials) {
    return Api().post('user/register', credentials)
  },
  signin (credentials) {
    return Api().post('user/signin', credentials)
  }
}

// AuthenticationService.register({
//   email: 'testing@gmail.com',
//   password: '123456'
// })