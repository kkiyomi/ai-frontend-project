import { useFeaturesStore } from './store';

export const useFeatures = () => {
  const store = useFeaturesStore();
  return {
    isEnabled: store.isEnabled,
    allEnabled: store.allEnabled,
    anyEnabled: store.anyEnabled,
    flags: store.flags,
    enabledFlags: store.enabledFlags,
  };
};
