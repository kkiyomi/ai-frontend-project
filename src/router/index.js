@@ .. @@
 import { createRouter, createWebHistory } from 'vue-router';
-import App from '../App.vue';
-import ShareView from '../components/ShareView.vue';
+import HomePage from '../pages/HomePage.vue';
+import { getFeatureRoutes } from '../features/index.js';
 
-const routes = [
+// Base routes
+const baseRoutes = [
   {
     path: '/',
     name: 'Home',
-    component: App
-  },
-  {
-    path: '/share/:shareId',
-    name: 'Share',
-    component: ShareView,
-    props: true
+    component: HomePage
   }
 ];
 
+// Combine base routes with feature routes
+const routes = [
+  ...baseRoutes,
+  ...getFeatureRoutes()
+];
+
 const router = createRouter({
   history: createWebHistory(),
   routes
 });
 
 export default router;