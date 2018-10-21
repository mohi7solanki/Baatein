<template>
  <div class="page-container full-page">
    <md-app>
      <md-app-toolbar class="md-primary">
        <div class="md-toolbar-row">
          <div class="md-toolbar-section-start">
            <span class="md-title" v-if="talkingUser === ''">Baatein Etihaas</span>
            <span class="md-title" v-if="talkingUser !== ''">Baatein Etihaas - {{ talkingUser.username }}</span>
          </div>
          <div class="md-toolbar-section-end">
            <md-button class="md-raised" @click="logout">Logout</md-button>
          </div>
        </div>
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
          <md-list-item @click="changeTalkingUser(user)" :class="{active:user._id===talkingUser._id}">
            <md-icon>account_circle</md-icon>
            <span class="md-list-item-text">{{ user.username }}</span>
            <md-badge v-if="user.unread" class="md-square badge" md-content="NEW" />
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <div v-if="talkingUser === ''">
          <div class="welcome-card">
            <h2>Welcome to Baatein <md-icon>chat</md-icon></h2>
            <h4>A world full of gossips</h4>
            <p>Search for a friend and just start your bak-bak!!</p>
          </div>
        </div>
        <div v-if="talkingUser !== ''">
          <div class="msg-list">
            <div v-for="message in messageList">
              <div class="md-layout md-alignment-bottom-left padding left" v-if="message.from==talkingUser._id">
                <div class="message-border message-conf received">{{ message.data }}</div>
              </div>
              <div class="md-layout md-alignment-bottom-right padding right" style="padding-right:40px" v-if="message.from!=talkingUser._id">
                <div class="message-border message-conf sent" >{{ message.data }}</div>
              </div>
            </div>
          </div>
          <div class="input-msg">
            <md-field>
              <label>Enter your message here</label>
              <md-textarea v-model="message"></md-textarea>
            </md-field>
            <div class="md-layout md-alignment-bottom-right">
              <md-button class="md-raised md-primary" @click="sendMessage(message);message=''">Send message</md-button>
            </div>
          </div>
        </div>
      </md-app-content>
    </md-app>
    <md-snackbar :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ snackbarMessage }}</span>
    </md-snackbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';


import AuthenticationService from '../services/AuthenticationService'
import UserService from '../services/UserService'
import MessageService from '../services/MessageService'
import { constants } from 'http2';
import io from 'socket.io-client/dist/socket.io'

export default {
  data () {
    return {
      users: [],
      usersmsg: {},
      searchText: '',
      currentUser : [],
      messageList: [],
      message: '',
      talkingUser: '',
      socket: '',
      showSnackbar: false,
      position: 'left',
      duration: 4000,
      isInfinity: false,
      snackbarMessage: ''
    }
  },
  methods: {
    // Get all users registered on baatein
    async getUsers () {
      try {
        const response = await UserService.getAllUsers()
        response['data'].forEach(user => {
          if(this.currentUser._id !== user._id) {
            user.unread = false
            this.users.push(user)
          }
        })
        
      } catch (err) {
        this.showSnackbar = true
        this.snackbarMessage = err
      }
    },

    // Check if current user is logged in 
    isUserLoggedin: function () {
      UserService.isLoggedin()
      .then (function (resp) {
        this.currentUser = resp.data
      }.bind(this),
      function (resp) {
        this.$router.push({name: 'signin'})
      }.bind(this))
    },

    // Action on sending a message
    sendMessage: function (message) {
      MessageService.sendMessage(this.talkingUser._id, message)
      .then (function (resp) {
        this.usersmsg[this.talkingUser._id].push(resp.data)
        this.messageList = this.usersmsg[this.talkingUser._id]
      }.bind(this))
      .catch(function (err) {
        this.showSnackbar = true
        this.snackbarMessage = err
      })
    },

    // When a user changes from a user to a different user to talk
    changeTalkingUser(user) {
      if (!(user._id in this.usersmsg)) {
        MessageService.retrieveMessage(user._id)
        .then (function (resp) {
          this.usersmsg[user._id] = resp.data
          this.messageList = resp.data
          this.talkingUser = user
          for(var i=0; i< this.users.length; i++){
            if(this.users[i]._id == user._id){
              this.users[i].unread = false
              break
            }
          }
        }.bind(this))
        .catch(function (err) {
          this.showSnackbar = true
          this.snackbarMessage = err
        })
      }
      else {
        this.messageList = this.usersmsg[user._id]
        this.talkingUser = user
        for(var i=0; i< this.users.length; i++){
          if(this.users[i]._id == user._id){
            this.users[i].unread = false
            break
          }
        }
      }
    },

    // Socket connection initialization on opening a chat window
    connectsocket(){
      this.socket = io('http://localhost:4000')
      this.socket.on('connect', function(){
        console.log('connect')
      });
      this.socket.on('new-message', function(data){
        var convWith = data.from;
        if (this.usersmsg[convWith]) {
          this.usersmsg[convWith].push(data)
          if (this.talkingUser._id==convWith) {
            this.messageList = this.usersmsg[convWith]
          }
          else{
            for(var i=0; i< this.users.length; i++){
              if(this.users[i]._id == convWith){
                this.users[i].unread = true
                break
              }
            }
          }
        }
        else{
          for(var i=0; i< this.users.length; i++){
            if(this.users[i]._id == convWith){
              this.users[i].unread = true
              break
            }
          }
        }
      }.bind(this));
    },

    // Action on logging out from a session
    logout () {
      AuthenticationService.logout()
        .then(function (resp) {
          this.showSnackbar = true
          this.snackbarMessage = 'Logout Sucessful'
          setTimeout(function(){
            this.$router.push({name: 'signin'})
          }.bind(this), 1000)
        }.bind(this), function (resp) {
          this.showSnackbar = true
          this.snackbarMessage = 'Logout Unsucessful'
        }.bind(this))
    }
  },
  mounted() {
    this.getUsers()
    this.connectsocket()
  },
  computed: {
    // Search filter implemented
    filteredUsers: function() {
      var self = this.users
      return this.users.filter(function (user) {
        return user.username.match(this.searchText)
      }.bind(this))

    }
  },
  beforeMount() {
    // Check unauthorized access to url
    this.isUserLoggedin()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .full-page {
    min-height: 772px;
    max-height: 772px;
  }
  .page-container {
    padding: 70px;
    background: linear-gradient(grey, yellow);
  }
  .md-app {
    border: 1px solid rgba(#000, .12);
    min-height: 640px;
    max-height: 640px;
  }
  .md-app-toolbar {
    background-color: darkkhaki !important;
  }
  .md-drawer {
    width: 375px;
    max-width: calc(100vw - 125px);
  }
  .md-content {
    background-image: url('../../public/img/leaves.png')
  }
  .input-msg {
    position: fixed;
    bottom: 0;
    width: 98%;
  }
  .md-field {
    background-color: white !important;
  }
  .message-conf {
    &.sent {
      margin-bottom:10px;
      background-color: rgb(212, 255, 196);
    }
    &.received {
      margin-bottom:10px;
      background-color: lightblue;
    }
  }
  .message-border {
    border-radius: 10px;
    padding: 8px 15px 8px 15px;
    color: black;
  }
  .active {
    background-color: lightgray;
  }
  .welcome-card {
    position: absolute;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    border: 1px solid lightgray;
    padding: 100px;
    border-radius: 10px;
    background-color: snow;
  }

  .badge {
    background-color: greenyellow;
  }

  .msg-list {
    height: 350px;
    overflow-y: auto;
  }

  .padding {
    &.left {
      padding-left: 40px;
    }
    &.right {
      padding-right: 40px;
    }
  } 
</style>
