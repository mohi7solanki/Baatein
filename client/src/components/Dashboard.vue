<template>
  <div class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary">
        <span class="md-title">Postman Chat</span>
      </md-app-toolbar>

      <md-app-drawer md-permanent="full">
        <md-toolbar class="md-transparent" md-elevation="0">
          <md-field>
            <md-icon>search</md-icon>
            <label>Enter name</label>
            <md-input type="text" v-model="searchText"></md-input>
          </md-field>
        </md-toolbar>

        <md-list v-for="user in filteredUsers">
          <md-list-item>
            <md-icon>account_circle</md-icon>
            <span class="md-list-item-text">{{ user.username }}</span>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <div v-for="message in messageList" class="md-layout md-alignment-bottom-right">
          <div class="message-border">{{ message }}</div>
        </div>
        <div class="input-msg">
          <md-field>
            <label>Enter your message here</label>
            <md-textarea v-model="message"></md-textarea>
          </md-field>
          <div class="md-layout md-alignment-bottom-right">
             <md-button class="md-raised md-primary" @click="sendMessage(message)">Send message</md-button>
          </div>
        </div>
      </md-app-content>
    </md-app>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';

@Component
import { MdApp } from '../../node_modules/vue-material/dist/components'
import AuthenticationService from '../services/AuthenticationService'
import UserService from '../services/UserService'
import { constants } from 'http2';
export default {
  data () {
    return {
      users: [],
      searchText: '',
      currentUser : [],
      messageList: [],
      message: ''
    }
  },
  methods: {
    async getUsers () {
      try {
        const response = await UserService.getAllUsers()
        response['data'].forEach(user => {
          if(this.currentUser.data._id !== user._id) {
            this.users.push(user)
          }
        })
      } catch (err) {
        console.log(err)
      }
    },
    isUserLoggedin: function () {
      UserService.isLoggedin()
      .then (function (resp) {
        this.currentUser = resp
      }.bind(this),
      function (resp) {
        this.$router.push({name: 'signin'})
      }.bind(this))
    },
    sendMessage: function (message) {
      this.messageList.push(message)
    }
  },
  mounted() {
    this.getUsers()
  },
  computed: {
    filteredUsers: function() {
      var self = this.users
      return this.users.filter(function (user) {
        return user.username.match(this.searchText)
      }.bind(this))
    }
  },
  beforeMount() {
    this.isUserLoggedin()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .md-app {
    max-height: 1000px;
    border: 1px solid rgba(#000, .12);
  }

   // Demo purposes only
  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }

  // .input-msg {
  //   position: fixed;
  //   bottom: 0;
  //   width: 100%;
  // }
  .message-border {
    border: 1px solid grey;
    border-radius: 10px;
    padding: 5px;
    background-color: lightgray;
    color: black;
  }
</style>
