// plugins/axios-no-verify.js
import https from 'https';
import CryptoJS from 'crypto-js';

export default ({ $axios, store, $cookies }) => {
    $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false })
    $axios.onRequest(config => {
        config.headers.common['x-api-key'] = process.env.VEDITA_API_KEY
        if ($cookies.get('credentials')) {
            const bytes  = CryptoJS.AES.decrypt($cookies.get('credentials'), process.env.SALT_KEY);
            const JWTToken = bytes.toString(CryptoJS.enc.Utf8);
            config.headers.common['app-name'] = 'SARI'
            if(JWTToken != "") {
                config.headers.common['Authorization'] = `Bearer ${JWTToken}`
            }
        }
    })
};