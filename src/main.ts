import { createApp } from 'vue'
import router from './router'
import './style.css'
import App from './App.vue'
import { logEnvironmentConfig } from './utils/environment'

// Log environment configuration in development
logEnvironmentConfig();

createApp(App).use(router).mount('#app')
