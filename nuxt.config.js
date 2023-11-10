export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  server: {
    host: '0.0.0.0'
  },
  
  axios: {
      baseUrl: process.env.VEDITA_API_BASE_URL,
      proxyHeaders: false,
      credentials: false
  },
  
  env: {
    VEDITA_API_BASE_URL: process.env.VEDITA_API_BASE_URL,
    DID_API_KEY: process.env.DID_API_KEY,
    VEDITA_API_KEY: process.env.VEDITA_API_KEY,
    SALT_KEY: process.env.SALT_KEY,
    DEBUG_MODE: process.env.DEBUG_MODE,
    ONESIGNAL_APPID: process.env.ONESIGNAL_APPID
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'sari_pwa',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
      },
      {
        name: 'HandheldFriendly',
        content: 'true'
      },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],  
    script: [
        // {
        //     src: 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js', async: false,
        // },
        {
            src: 'js/record.js', async: false,
        },
        {
            src: 'js/jquery.slim.min.js', async: false
        },
        // {
        //   src: 'js/phaser.min.js', async: false,
        // },
        {
            src: 'js/bootstrap.bundle.min.js', async: true,
        },
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~assets/css/global.less'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [ 
    {
      src: '~/plugins/axios',
    },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/pwa'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    'cookie-universal-nuxt',
    '@nuxtjs/onesignal'
  ],
  oneSignal: {
    // cdn: true,
    // OneSignalSDK: "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js",
    init: {
      appId: process.env.ONESIGNAL_APPID,
      allowLocalhostAsSecureOrigin: true
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      compact: true
    }
  },
  pwa: {
    manifest: {
        name: 'SARI PWA',
        short_name: 'SARI',
        description: 'This is an early build stage of SARI with Progressive Web Apps (PWA)', 
        start_url: '/',
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2196F3",
        lang: 'en',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon.png',
                sizes: '512x131',
                type: 'image/png'
            }
        ]
    }
  }
}
