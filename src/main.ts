import '@/styles.css'
import { createApp } from 'vue'
import App from '@/App.vue'
import { createRoutes } from '@/routes'

createApp(App).use(createRoutes()).mount('#app')
