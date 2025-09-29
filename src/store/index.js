// Pinia store setup with automatic feature store registration
import { createPinia } from 'pinia';
import { getFeatureStores } from '../features/index.js';

export const pinia = createPinia();

// Auto-register all feature stores
export const setupStores = () => {
  const featureStores = getFeatureStores();
  
  // Stores are automatically registered when imported and used
  // This function can be used for any additional store setup if needed
  console.log('Available feature stores:', Object.keys(featureStores));
  
  return featureStores;
};

export default pinia;