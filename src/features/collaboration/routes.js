// Collaboration domain routes
export default [
  {
    path: '/share/:shareId',
    name: 'Share',
    component: () => import('./components/ShareView.vue'),
    props: true
  }
];