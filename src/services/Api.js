import axios from 'axios'

export default () => {
  return axios.create({
    baseURL: 'https://mevn-chat.herokuapp.com',
    withCredentials: true
  })
}