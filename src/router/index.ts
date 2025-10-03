import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import { ShareView } from '@/modules/sharing';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App
  },
  {
    path: '/share/:shareId',
    name: 'Share',
    component: ShareView,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;