import Api from '@/services/Api'

export default {
    sendMessage (id,message) {
        return Api().post('send/'+id, {
            message: message
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