<template>
  <div class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary">
        <span class="md-title">{{  talkingUser.username  }}</span>
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
          <md-list-item @click="changeTalkingUser(user)" :class="{active:user._id===talkingUser._id,unread:user.unread}">
            <md-icon>account_circle</md-icon>
            <span class="md-list-item-text">{{ user.username }}</span>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <div v-for="message in messageList">
          <div class="md-layout md-alignment-bottom-left" v-if="message.from==talkingUser._id" style="margin-bottom:10px">
            <div class="message-border" >{{ message.data }}</div>
          </div>
          <div class="md-layout md-alignment-bottom-right" v-if="message.from!=talkingUser._id" style="margin-bottom:10px">
            <div class="message-border" >{{ message.data }}</div>
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
      </md-app-content>
    </md-app>
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
      socket: ''
    }
  },
  methods: {
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
        console.log(err)
      }
    },
    isUserLoggedin: function () {
      UserService.isLoggedin()
      .then (function (resp) {
        this.currentUser = resp.data
        console.log(this.currentUser)
      }.bind(this),
      function (resp) {
        this.$router.push({name: 'signin'})
      }.bind(this))
    },
    sendMessage: function (message) {
      MessageService.sendMessage(this.talkingUser._id, message)
      .then (function (resp) {
        this.usersmsg[this.talkingUser._id].push(resp.data)
        this.messageList = this.usersmsg[this.talkingUser._id]
      }.bind(this))
      .catch(e => {
        console.log(e)
      })
    },
    changeTalkingUser(user) {
      if (!(user._id in this.usersmsg)) {
        console.log(1)
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
        .catch(e => {
          console.log(e)
        })
      }
      else {
        console.log(2)
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
    connectsocket(){
      console.log('connect')
      this.socket = io('http://localhost:4000')
      this.socket.on('connect', function(){
        console.log('connect')
      });
      this.socket.on('new-message', function(data){
        console.log(data)
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
      // this.socket.emit('login', 'wfwrefrf', (data) => {
      //   console.log(data); // data will be 'woot'
      // });
    }
  },
  mounted() {
    this.getUsers()
    this.connectsocket()
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
  .active {
    background-color: lightgray;
  }
  .unread {
    background-color: green;
  }
</style>
