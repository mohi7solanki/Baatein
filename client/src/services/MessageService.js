import Api from '@/services/Api'

export default {
    sendMessage (id,message) {
        return Api().post('chat/add/'+id, {
            body: { message: message }
        })
        .then (function (resp) {
          return resp
        })
    },
    retrieveMessage (id) {
      return Api().get('chat/show/'+id)
        .then (function (resp) {
          return resp
        })
    }
  }