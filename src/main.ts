import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { logEnvironmentConfig } from '@/modules/core'

logEnvironmentConfig().then(() => {
  console.log('Environment configuration loaded');
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router).mount('#app')
