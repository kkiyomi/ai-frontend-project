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

// Wait for initial navigation to complete before mounting.
// Prevents the START_LOCATION (empty meta) from flashing the wrong layout
// (e.g., the translator workspace on share page URLs).
await router.isReady();

// Load settings BEFORE mount to ensure sections are registered for route sync
loadSettings();

// Initialize theme store to apply saved theme before app renders
useThemeStore();

app.mount('#app');
