<template>
  <v-snackbar v-model="show" :color="color" :timeout="10000">
    {{message}}
    <v-btn flat @click="retryExpand" v-if="message==='expand failed'">Retry</v-btn>
    <v-btn flat color="orange" @click="show = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      show: false,
      message: ''
    }
  },
  methods: {
    ...mapActions([
      'setMessage',
      'expandAction'
    ]),
    retryExpand: function(){
      this.expandAction(this.$store.state.expand.failedNodes)
    }
  },
  computed: {
    ...mapState({
      color: state => state.snackbar.color
    })
  },
  created: function () {
    this.$store.watch(state => state.snackbar.message, () => {
      const msg = this.$store.state.snackbar.message
      if (msg !== '') {
        this.show = true
        this.message = this.$store.state.snackbar.message
        
        this.setMessage('')
      }
    })
}
}
</script>