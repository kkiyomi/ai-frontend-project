import { ref, watch } from 'vue';

const STORAGE_KEY = 'reader_prefs';

const DEFAULTS = {
  font: 'default',
  fontSize: 16,
  lineSpacing: 1.6,
  paragraphSpacing: 1.5,
  pageWidth: 1000,
  autoScroll: false,
  offlineEnabled: false,
  chaptersAhead: 3,
};

function load(): typeof DEFAULTS {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

function save(prefs: typeof DEFAULTS) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

// Singleton
const p = load();

export const font = ref<string>(p.font);
export const fontSize = ref<number>(p.fontSize);
export const lineSpacing = ref<number>(p.lineSpacing);
export const paragraphSpacing = ref<number>(p.paragraphSpacing);
export const pageWidth = ref<number>(p.pageWidth);
export const autoScroll = ref<boolean>(p.autoScroll);
export const offlineEnabled = ref<boolean>(p.offlineEnabled);
export const chaptersAhead = ref<number>(p.chaptersAhead);

// Cache tracking (separate from preferences)
const CACHE_KEY = 'reader_cache';
export interface CachedChapter {
  uuid: string;
  title: string;
  content: string;
  timestamp: number;
}

function getCache(): Record<string, CachedChapter> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function setCache(c: Record<string, CachedChapter>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch { /* ignore */ }
}

export function getCachedCount(): number {
  return Object.keys(getCache()).length;
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function cacheChapter(uuid: string, title: string, content: string) {
  const c = getCache();
  c[uuid] = { uuid, title, content, timestamp: Date.now() };
  setCache(c);
}

export function getCachedChapter(uuid: string): CachedChapter | null {
  return getCache()[uuid] || null;
}

// Auto-save on any change
watch([font, fontSize, lineSpacing, paragraphSpacing, pageWidth, autoScroll, offlineEnabled, chaptersAhead], () => {
  save({
    font: font.value,
    fontSize: fontSize.value,
    lineSpacing: lineSpacing.value,
    paragraphSpacing: paragraphSpacing.value,
    pageWidth: pageWidth.value,
    autoScroll: autoScroll.value,
    offlineEnabled: offlineEnabled.value,
    chaptersAhead: chaptersAhead.value,
  });
}, { deep: false });
