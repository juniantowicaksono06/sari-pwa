<template>
    <div class="w-100 h-100">
        <Loading v-if="$store.state.loading.isLoading" />
        <Nuxt/>
    </div>
</template>
<script>
    import Loading from '../components/Loading.vue'
    export default {
        components: {
            Loading
        }
    }
</script>