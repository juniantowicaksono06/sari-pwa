<style lang="less">
    @import '@/assets/css/login.less';
</style>
<template>
    <div class="container-fluid h-100">
        <div class="d-flex h-100 justify-content-center align-items-center">
            <div class="card" id="loginCard">
                <div class="card-body">
                    <h5 class="text-center">Login Page</h5>
                    <div class="form-group">
                        <label for="usernameInput">Username</label>
                        <input type="text" class="form-control" v-model="username">
                    </div>
                    <div class="form-group">
                        <label for="usernameInput">Password</label>
                        <input type="password" class="form-control" v-model="password">
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" @click="actionLogin">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    const CryptoJS = require("crypto-js");
    export default {
        layout: 'default',
        middleware: ['authenticated'],
        data() {
            return {
                username: "",
                password: ""
            }
        },
        methods: {
            async actionLogin() {
                this.$store.dispatch('loading/actionShowLoading')
                let formData = new FormData()
                formData.append('username', this.username)
                formData.append('password', this.password)
                var login = false
                try {
                    login = await this.$axios.$post('vedita-login', formData)
                }
                catch(error) {
                    alert(error)
                }
                this.$store.dispatch('loading/actionHideLoading')
                if (login == false) return
                if (login.status_code == 200) {
                    const {data} = login
                    const {token} = data
                    const cipherText = CryptoJS.AES.encrypt(token, process.env.SALT_KEY).toString()
                    this.$store.dispatch('auth/actionSetCredentials', token)
                    this.$cookies.set("credentials", cipherText, {
                       path: "/",
                    });
                    this.$router.push('/')
                }
            }
        },
        head() {
            return {
                title: "Login Page"
            }
        },
        mounted() {
            setTimeout(() => {
                this.$store.dispatch('loading/actionHideLoading')
            }, 800);
        }
    }
</script>