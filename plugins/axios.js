// plugins/axios-no-verify.js
import https from 'https';

// Create a new Axios instance with a custom httpsAgent

// const instance = axios.create({
//   httpsAgent: new https.Agent({
//     rejectUnauthorized: false, // Disable certificate verification
//   }),
// });

export default ({ $axios }) => {
    console.log($axios)
    $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false })
};