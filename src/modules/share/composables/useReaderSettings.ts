import { ref, watch } from 'vue';

const STORAGE_KEY = 'reader_prefs';
const MAX_CACHE_AGE_MS = 3600000; // 1 hour
const MAX_CACHE_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB

const DEFAULTS = {
  font: 'inter',
  fontSize: 16,
  lineSpacing: 1.6,
  paragraphSpacing: 1.5,
  pageWidth: 1000,
  autoScroll: false,
  offlineEnabled: false,
  chaptersAhead: 3,
  showGlossary: true,
  showRawContent: true,
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
export const showGlossary = ref<boolean>(p.showGlossary);
export const showRawContent = ref<boolean>(p.showRawContent);

export function resetToDefaults() {
  font.value = DEFAULTS.font;
  fontSize.value = DEFAULTS.fontSize;
  lineSpacing.value = DEFAULTS.lineSpacing;
  paragraphSpacing.value = DEFAULTS.paragraphSpacing;
  pageWidth.value = DEFAULTS.pageWidth;
  autoScroll.value = DEFAULTS.autoScroll;
  offlineEnabled.value = DEFAULTS.offlineEnabled;
  chaptersAhead.value = DEFAULTS.chaptersAhead;
  showGlossary.value = DEFAULTS.showGlossary;
  showRawContent.value = DEFAULTS.showRawContent;
  save(DEFAULTS);
}

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

function cleanStaleEntries(): void {
  const c = getCache();
  const now = Date.now();
  let changed = false;
  for (const key of Object.keys(c)) {
    if (now - c[key].timestamp > MAX_CACHE_AGE_MS) {
      delete c[key];
      changed = true;
    }
  }
  if (changed) setCache(c);
}

function getCacheSizeBytes(): number {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? raw.length : 0;
  } catch {
    return 0;
  }
}

function setCache(c: Record<string, CachedChapter>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch (err) {
    console.warn('[reader_cache] Failed to write cache:', err);
  }
}

export function getCachedCount(): number {
  cleanStaleEntries();
  return Object.keys(getCache()).length;
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function cacheChapter(uuid: string, title: string, content: string) {
  const c = getCache();
  c[uuid] = { uuid, title, content, timestamp: Date.now() };

  // Check if this single entry alone blows the budget
  const entrySize = JSON.stringify(c[uuid]).length;
  if (entrySize > MAX_CACHE_SIZE_BYTES) {
    console.warn('[reader_cache] Chapter too large to cache, skipping:', uuid, entrySize);
    delete c[uuid];
    return;
  }

  // Attempt to persist; if it fails, evict oldest and retry
  let serialized = JSON.stringify(c);
  while (serialized.length > MAX_CACHE_SIZE_BYTES) {
    // Find oldest entry by timestamp
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const key of Object.keys(c)) {
      if (c[key].timestamp < oldestTime) {
        oldestTime = c[key].timestamp;
        oldestKey = key;
      }
    }
    if (!oldestKey || oldestKey === uuid) {
      // Cannot evict further without removing the new entry — skip
      console.warn('[reader_cache] Cannot fit chapter in cache, skipping:', uuid);
      delete c[uuid];
      return;
    }
    delete c[oldestKey];
    serialized = JSON.stringify(c);
  }

  setCache(c);
}

export function getCachedChapter(uuid: string): CachedChapter | null {
  const entry = getCache()[uuid];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > MAX_CACHE_AGE_MS) {
    // Stale — evict and return miss
    const c = getCache();
    delete c[uuid];
    setCache(c);
    return null;
  }
  return entry;
}

// Auto-save on any change
watch([font, fontSize, lineSpacing, paragraphSpacing, pageWidth, autoScroll, offlineEnabled, chaptersAhead, showGlossary, showRawContent], () => {
  save({
    font: font.value,
    fontSize: fontSize.value,
    lineSpacing: lineSpacing.value,
    paragraphSpacing: paragraphSpacing.value,
    pageWidth: pageWidth.value,
    autoScroll: autoScroll.value,
    offlineEnabled: offlineEnabled.value,
    chaptersAhead: chaptersAhead.value,
    showGlossary: showGlossary.value,
    showRawContent: showRawContent.value,
  });
}, { deep: false });
