<template>
  <div>
    <div class="md-layout md-gutter md-alignment-center-center register-div">
      <md-card class="register-card" md-with-hover>
        <md-card-header>
          <div class="md-title"><md-icon>chat</md-icon> Baatein - Register</div>
          <div class="md-subhead">Not like slack though :(</div>
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
import AuthenticationService from '@/services/AuthenticationService'
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
    // Action on calling register function
    async register () {
      if (this.username==='' && this.password === '') { // if username and password is empty
        this.showSnackbar = true
        this.snackbarMessage = 'Username and password can\'t be left empty' 
      }
      else if (this.password === '') { // if username is empty
        this.showSnackbar = true
        this.snackbarMessage = 'Password can\'t be left empty'
      }
      else if (this.username === '') { // if password is empty
        this.showSnackbar = true
        this.snackbarMessage = 'Username can\'t be left empty'
      }
      else {
        const response = await AuthenticationService.register({
          username: this.username,
          password: this.password
        })
        if(response.status === 200) { // Success
          this.showSnackbar = true
          this.snackbarMessage = 'Registered successfully'
          setTimeout(function(){
              this.$router.push({name: 'signin'})
          }.bind(this), 1000)
        } 
        else { // failure
          this.showSnackbar = true
          this.snackbarMessage = 'There was some error while registering'
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .register-div {
    margin-top: 5%;
  }
  .register-card {
    min-width: 400px;
  }
</style>
