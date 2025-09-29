// Dynamic feature loader
// This file automatically discovers and exports all features

const features = {};

// Import all feature modules
const featureModules = import.meta.glob('./**/index.js', { eager: true });

for (const path in featureModules) {
  const featureName = path.split('/')[1]; // Extract feature name from path
  const module = featureModules[path];
  
  if (module.default) {
    features[featureName] = module.default;
  }
}

// Collect all routes from features
export const getFeatureRoutes = () => {
  const routes = [];
  
  Object.values(features).forEach(feature => {
    if (feature.routes) {
      routes.push(...feature.routes);
    }
  });
  
  return routes;
};

// Collect all stores from features
export const getFeatureStores = () => {
  const stores = {};
  
  Object.entries(features).forEach(([name, feature]) => {
    if (feature.store) {
      stores[name] = feature.store;
    }
  });
  
  return stores;
};

export default features;