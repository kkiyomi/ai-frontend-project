import { createApp } from 'vue'
import router from './router'
import './style.css'
import App from './App.vue'
import { logEnvironmentConfig } from './utils/environment'
import { useDarkMode } from './composables/useDarkMode'

// Log environment configuration in development
logEnvironmentConfig().then(() => {
  console.log('Environment configuration loaded');
});

const app = createApp(App);

// Initialize dark mode before mounting
const { initializeDarkMode } = useDarkMode();
initializeDarkMode();

app.use(router).mount('#app');
