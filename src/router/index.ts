import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import App from '../App.vue';
import { setupRouteGuards } from './guards';
import ShareChapterView from '@/modules/share/components/ShareChapterView.vue';
import ShareSeriesView from '@/modules/share/components/ShareSeriesView.vue';

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
    path: '/s/chapter/:chapterUuid',
    name: 'ShareChapter',
    component: ShareChapterView,
    meta: { isShare: true },
  },
  {
    path: '/s/:seriesUuid',
    name: 'ShareSeries',
    component: ShareSeriesView,
    meta: { isShare: true },
  },
  {
    path: '/s/:seriesUuid/:chapterUuid',
    name: 'ShareChapterInSeries',
    component: ShareChapterView,
    meta: { isShare: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

setupRouteGuards(router);

export default router;