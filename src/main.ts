import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { logEnvironmentConfig } from '@/modules/core'
import { loadSettings } from './settings'
import { useThemeStore } from '@/modules/theme'

logEnvironmentConfig().then(() => {
  console.log('Environment configuration loaded');
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router);

// For share routes (/s/...), wait for the route to resolve before mounting.
// Without this, the translator workspace flashes briefly on direct share-page loads
// because $route.meta.isShare is still undefined during the initial render.
const path = window.location.pathname;
if (path.startsWith('/s/')) {
  await router.isReady();
}

// Load settings BEFORE mount to ensure sections are registered for route sync
loadSettings();

// Initialize theme store to apply saved theme before app renders
useThemeStore();

app.mount('#app');
