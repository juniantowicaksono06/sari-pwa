<style scoped>
    @import '@/assets/css/loading.less';
</style>
<template>
    <div class="loading-container">
        <div>
            <ClipLoader color="red" size="50px" />
        </div>
    </div>
</template>
<script>
    import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
    export default {
        components: {
            ClipLoader
        }
    }
</script>