import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import App from '../App.vue';
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
    path: '/s/:uuid',
    name: 'ShareChapter',
    component: () => import('@/modules/share/components/ShareChapterView.vue'),
    meta: { isShare: true },
  },
  {
    path: '/s/:uuid/series',
    name: 'ShareSeries',
    component: () => import('@/modules/share/components/ShareSeriesView.vue'),
    meta: { isShare: true },
  },
  {
    path: '/s/:uuid/chapters/:chapterUuid',
    name: 'ShareChapterInSeries',
    component: () => import('@/modules/share/components/ShareChapterView.vue'),
    meta: { isShare: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

setupRouteGuards(router);

export default router;