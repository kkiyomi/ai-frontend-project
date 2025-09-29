import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './style.css';
import App from './App.vue';
import { logEnvironmentConfig } from './shared/services/environmentService.js';
import { setupStores } from './store/index.js';

// Log environment configuration in development
logEnvironmentConfig().then(() => {
  console.log('Environment configuration loaded');
});

const app = createApp(App);
const pinia = createPinia();

// Setup Pinia
app.use(pinia);

// Setup feature stores
setupStores();

// Setup router
app.use(router);

// Mount app
app.mount('#app');
