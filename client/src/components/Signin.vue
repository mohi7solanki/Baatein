<template>
  <div>
    <!-- <h1>Signin</h1>
    <input type="text" name="username" placeholder="username" v-model="username"><br>
    <input type="password" name="password" placeholder="password" v-model="password"><br>
    <button type="submit" @click="signin">Signin</button> -->
    <div class="md-layout md-gutter md-alignment-center-center signin-div">
      <md-card class="signin-card" md-with-hover>
        <md-card-header>
          <div class="md-title"><md-icon>chat</md-icon> Baatein - Login</div>
        </md-card-header>

        <md-card-content>
          <md-field>
            <label>Username</label>
            <md-input v-model="username"></md-input>
          </md-field>
          <md-field>
            <label>Password</label>
            <md-input v-model="password" type="password"></md-input>
          </md-field>
        </md-card-content>
        <hr>
        <md-card-actions>
          <md-button @click="register">Register</md-button>
          <md-button @click="login">Login</md-button>
        </md-card-actions>
      </md-card>
    </div>
    <md-snackbar :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ snackbarMessage }}</span>
    </md-snackbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';

@Component
import AuthenticationService from '../services/AuthenticationService'
import UserService from '../services/UserService'
import { constants } from 'http2';
export default {
  data () {
    return {
      username: '',
      password: '',
      showSnackbar: false,
      position: 'left',
      duration: 4000,
      isInfinity: false,
      snackbarMessage: ''
    }
  },
  methods: {
    login () {
      AuthenticationService.signin({
        username: this.username,
        password: this.password
      })
      .then( function (resp) {
        this.$router.push({name: 'userDash', params: {username: this.username}})
      }.bind(this), function (resp) {
        this.showSnackbar = true
        this.snackbarMessage = 'Invalid username or password'
      }.bind(this))
    },
    register () {
      this.$router.push({name: 'register'})
    },
    isLoggedin () {
      UserService.isLoggedin()
      .then (function (resp) {
        this.$router.push({name: 'userDash', params: {username: resp.data.username}})
      }.bind(this),
      function (resp) {
        this.$router.push({name: 'signin'})
      }.bind(this))
    }
  },
  beforeMount() {
    this.isLoggedin()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .signin-div {
    margin-top: 5%;
  }
  .signin-card {
    min-width: 400px;
  }
</style>
