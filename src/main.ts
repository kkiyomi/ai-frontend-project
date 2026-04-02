import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { logEnvironmentConfig } from '@/modules/core'
import { loadSettings } from './settings'

logEnvironmentConfig().then(() => {
  console.log('Environment configuration loaded');
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router);

// Load settings BEFORE mount to ensure sections are registered for route sync
loadSettings();

app.mount('#app');
