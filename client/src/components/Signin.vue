<template>
  <div>
    <h1>Signin</h1>
    <input type="text" name="username" placeholder="username" v-model="username"><br>
    <input type="password" name="password" placeholder="password" v-model="password"><br>
    <button type="submit" @click="signin">Signin</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';

@Component
import AuthenticationService from '../services/AuthenticationService'
import { constants } from 'http2';
export default {
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async signin () {
      console.log('yeah')
      const response = await AuthenticationService.signin({
        username: this.username,
        password: this.password
      })
      console.log(response.data)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>
