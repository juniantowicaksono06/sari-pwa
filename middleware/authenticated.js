const CryptoJS = require("crypto-js");


export default function ({ redirect, store, app }) {
    console.log(process.env.SALT_KEY)
    if (app.$cookies.get('credentials')) {
        try {
            const bytes  = CryptoJS.AES.decrypt(app.$cookies.get('credentials'), process.env.SALT_KEY);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (originalText && location.pathname.startsWith("/login")) {
                location.href = '/'
            }
            else if(!originalText && !location.pathname.startsWith("/login")) {
                location.href = '/login'
            }
            store.dispatch('auth/actionSetCredentials', originalText)
        } catch (error) {
            app.$cookies.remove('credentials')
            location.href = '/login'
            // return redirect('/')
        }
    }    
    else {
        if(!location.pathname.startsWith("/login")) {
            location.href = '/login'
        }
    }
}