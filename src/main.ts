import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { logEnvironmentConfig } from './utils/environment'

// Log environment configuration in development
logEnvironmentConfig();

createApp(App).mount('#app')
