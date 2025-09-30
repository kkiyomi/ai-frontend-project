import { createApp } from 'vue'
import router from './router'
import './style.css'
import App from './App.vue'
import { logEnvironmentConfig } from '@/modules/core'
import { vGlossary } from '@/modules/glossary'

logEnvironmentConfig().then(() => {
  console.log('Environment configuration loaded');
});

const app = createApp(App);

app.directive('glossary', vGlossary);

app.use(router).mount('#app')
