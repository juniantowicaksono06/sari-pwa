<template>
  <div class="container-fluid h-100">
    <Avatar />
  </div>
</template>

<script>
  import Avatar from '../components/Avatar.vue'
  export default {
    components: {
      Avatar,
      // Head
    },
    middleware: ['authenticated'],
    head() {
      return {
        title: "SARI - Voice Assistant"
      }
    },
    mounted() {
      const body = document.body
      body.classList.add('grapari-bg')
      
      setTimeout(() => {
        this.$store.dispatch('loading/actionHideLoading')
      }, 800)
      // this.tes();
    },
    methods: {
      
    },
  }
</script>