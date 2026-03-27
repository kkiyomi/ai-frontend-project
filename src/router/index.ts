import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import App from '../App.vue';
import ShareViewPage from '../components/ShareViewPage.vue';
import { setupRouteGuards } from './guards';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App,
    meta: { requiresSidebar: true }
  },
  {
    path: '/series/:seriesId',
    name: 'SeriesDetail',
    component: App,
    meta: { requiresSidebar: true },
    props: (route: RouteLocationNormalized) => ({ seriesId: route.params.seriesId })
  },
  {
    path: '/series/:seriesId/chapters/:chapterId',
    name: 'ChapterDetail',
    component: App,
    meta: { requiresSidebar: true },
    props: (route: RouteLocationNormalized) => ({ 
      seriesId: route.params.seriesId,
      chapterId: route.params.chapterId 
    })
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

setupRouteGuards(router);

export default router;