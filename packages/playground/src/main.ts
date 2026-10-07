import { createApp } from 'vue'
import VPdf from '@whykhamist/vpdf'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(VPdf)
app.mount('#app')
