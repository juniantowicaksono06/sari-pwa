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
<!-- <script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(function(OneSignal) {
    OneSignal.init({
      appId: "ebea8143-f92d-44ab-b94f-03b09e4a6d95",
    });
  });
</script> -->