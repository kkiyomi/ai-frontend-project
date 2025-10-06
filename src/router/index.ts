import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import ShareViewPage from '../components/ShareViewPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App
  },
  {
    path: '/share/:shareId',
    name: 'Share',
    component: ShareViewPage,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;