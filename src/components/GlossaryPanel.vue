<template>
  <div class="h-full bg-white flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Glossary</h2>
        <button
          @click="toggleGlossaryVisibility"
          class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close glossary"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <p class="text-sm text-gray-500 mt-1">{{ glossaryTerms.length }} terms defined</p>
      <p v-if="currentChapter" class="text-xs text-blue-600 mt-1">
        Chapter: {{ currentChapter.title }}
      </p>
      <p v-else-if="currentSeries" class="text-xs text-green-600 mt-1">
        Series: {{ currentSeries.name }} (series-level terms)
      </p>
      
      <!-- Add Term Button -->
      <div class="mt-3">
        <button
          v-if="!showAddForm"
          @click="showAddForm = true"
          :disabled="!currentSeries"
          class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          :class="{ 'opacity-50 cursor-not-allowed': !currentSeries }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>{{ currentSeries ? 'Add New Term' : 'Select Series First' }}</span>
        </button>
      </div>
    </div>

    <!-- Add Term Form -->
    <div v-if="showAddForm" class="p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900">Add New Term</h3>
        <button
          @click="cancelAddForm"
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
      
      <form @submit.prevent="handleAddTerm" class="space-y-3">
        <div>
          <input
            v-model="newTerm.term"
            type="text"
            placeholder="Term (e.g., character name)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
          <p v-if="termExistsError" class="text-xs text-red-600 mt-1">{{ termExistsError }}</p>
        </div>
        <div>
          <input
            v-model="newTerm.translation"
            type="text"
            placeholder="Translation"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
        </div>
        <div>
          <textarea
            v-model="newTerm.definition"
            placeholder="Definition or context"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
          ></textarea>
        </div>
        <div class="flex items-center space-x-3">
          <select
            v-model="newTerm.category"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="character">Character</option>
            <option value="place">Place</option>
            <option value="cultural">Cultural</option>
            <option value="idiom">Idiom</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            :disabled="!newTerm.term.trim() || !newTerm.translation.trim() || !!termExistsError"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            :class="{ 'opacity-50 cursor-not-allowed': !newTerm.term.trim() || !newTerm.translation.trim() || !!termExistsError }"
          >
            Add
          </button>
        </div>
      </form>
    </div>

    <!-- Terms List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="text-4xl mb-3">⏳</div>
        <p class="text-sm text-gray-500">Loading glossary terms...</p>
      </div>
      
      <div v-else-if="!currentChapter" class="p-8 text-center">
        <div class="text-4xl mb-3">📖</div>
        <p class="text-sm text-gray-500">
          {{ currentSeries ? 'Select a chapter to view chapter-specific terms' : 'Select a series to view its glossary' }}
        </p>
        <p v-if="currentSeries && glossaryTerms.length > 0" class="text-xs text-gray-400 mt-2">
          Showing {{ glossaryTerms.length }} series-level terms
        </p>
      </div>
      
      <div v-else-if="!glossaryTerms || glossaryTerms.length === 0" class="p-8 text-center">
        <div class="text-4xl mb-3">📚</div>
        <p class="text-sm text-gray-500">No glossary terms for this chapter</p>
        <p class="text-xs text-gray-400 mt-1">Add terms to improve translations for "{{ currentChapter.title }}"</p>
      </div>

      <div v-else class="p-4 space-y-4">
        <!-- Category Groups -->
        <div v-for="(terms, category) in termsByCategory" :key="category" class="space-y-2">
          <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {{ category }} ({{ terms.length }})
          </h3>
          
          <div class="space-y-2">
            <div
              v-for="term in terms"
              :key="term.id"
              class="group p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div v-if="!editingTerms.has(term.id)" class="space-y-2">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <span class="font-medium text-gray-900 text-sm">{{ term.term }}</span>
                      <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {{ getCategoryIcon(term.category) }}
                      </span>
                      <span v-if="!term.chapterId" class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        Series
                      </span>
                    </div>
                    <p class="text-sm text-green-600 font-medium mt-1">{{ term.translation }}</p>
                    <p v-if="term.definition" class="text-xs text-gray-500 mt-1">{{ term.definition }}</p>
                  </div>
                  
                  <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      @click="startEditingTerm(term)"
                      class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit term"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      @click="removeTerm(term.id)"
                      class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove term"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-400">
                  <span>Used {{ term.frequency }} times</span>
                  <span v-if="term.isUserDefined" class="px-2 py-1 bg-gray-100 rounded-full">Custom</span>
                </div>
              </div>

              <!-- Edit Form -->
              <div v-else class="space-y-2">
                <input
                  v-model="term.term"
                  type="text"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  v-model="term.translation"
                  type="text"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <textarea
                  v-model="term.definition"
                  rows="2"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                ></textarea>
                <div class="flex items-center space-x-2">
                  <select
                    v-model="term.category"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="character">Character</option>
                    <option value="place">Place</option>
                    <option value="cultural">Cultural</option>
                    <option value="idiom">Idiom</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    @click="saveTermEdit(term)"
                    class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    @click="cancelTermEdit(term)"
                    class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggestions Section -->
    <div v-if="currentChapter" class="border-t border-gray-200 p-4 bg-gray-50">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900">Suggested Terms</h3>
        <button
          @click="generateSuggestions"
          :disabled="isGeneratingSuggestions"
          class="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {{ isGeneratingSuggestions ? 'Analyzing...' : 'Refresh' }}
        </button>
      </div>
      
      <div v-if="suggestions.length === 0" class="text-xs text-gray-500">
        No suggestions available
      </div>
      
      <div v-else class="space-y-1">
        <button
          v-for="suggestion in suggestions.slice(0, 5)"
          :key="suggestion"
          @click="addSuggestedTerm(suggestion)"
          class="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700 rounded transition-colors"
        >
          + {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGlossary } from '../composables/useGlossary';
import { useChapters } from '../composables/useChapters';
import type { GlossaryTerm } from '../types';

const { 
  glossaryTerms, 
  isLoading,
  termsByCategory, 
  loadGlossaryTerms,
  addTerm, 
  updateTerm, 
  removeTerm, 
  suggestTermsFromText,
  termExistsInSeries,
  toggleGlossaryVisibility 
} = useGlossary();

const { currentChapter, currentSeries } = useChapters();

const newTerm = ref({
  term: '',
  translation: '',
  definition: '',
  category: 'character' as const,
  isUserDefined: true,
});

const suggestions = ref<string[]>([]);
const isGeneratingSuggestions = ref(false);
const editingTerms = ref<Set<string>>(new Set());
const showAddForm = ref(false);
const termExistsError = ref('');

const handleAddTerm = async () => {
  if (!newTerm.value.term.trim() || !newTerm.value.translation.trim()) return;
  
  // Check if term already exists in series
  const exists = await termExistsInSeries(newTerm.value.term.trim());
  if (exists) {
    termExistsError.value = 'This term already exists in the current series';
    return;
  }
  
  await addTerm({
    term: newTerm.value.term.trim(),
    translation: newTerm.value.translation.trim(),
    definition: newTerm.value.definition.trim(),
    category: newTerm.value.category,
    isUserDefined: true,
  });
  
  // Reset form
  newTerm.value = {
    term: '',
    translation: '',
    definition: '',
    category: 'character',
    isUserDefined: true,
  };
  
  termExistsError.value = '';
  // Hide form after adding
  showAddForm.value = false;
};

const cancelAddForm = () => {
  // Reset form
  newTerm.value = {
    term: '',
    translation: '',
    definition: '',
    category: 'character',
    isUserDefined: true,
  };
  
  termExistsError.value = '';
  // Hide form
  showAddForm.value = false;
};

// Clear error when term changes
watch(() => newTerm.value.term, () => {
  termExistsError.value = '';
});

const startEditingTerm = (term: GlossaryTerm) => {
  editingTerms.value.add(term.id);
};

const saveTermEdit = async (term: GlossaryTerm) => {
  await updateTerm(term.id, term);
  editingTerms.value.delete(term.id);
};

const cancelTermEdit = (term: GlossaryTerm) => {
  editingTerms.value.delete(term.id);
  // Reload terms to reset any unsaved changes
  loadGlossaryTerms();
};

const addSuggestedTerm = (suggestion: string) => {
  newTerm.value.term = suggestion;
  // Focus on translation input would be nice here
};

const generateSuggestions = () => {
  if (!currentChapter.value || !currentSeries.value) return;
  
  isGeneratingSuggestions.value = true;
  
  // Simulate async operation
  setTimeout(() => {
    const allText = currentChapter.value!.paragraphs
      .map(p => p.originalText)
      .join(' ');
    
    suggestions.value = suggestTermsFromText(allText);
    isGeneratingSuggestions.value = false;
  }, 1000);
};

const getCategoryIcon = (category: string): string => {
  const icons = {
    character: '👤',
    place: '📍',
    cultural: '🏛️',
    idiom: '💭',
    other: '📝',
  };
  return icons[category as keyof typeof icons] || '📝';
};

// Load glossary terms when component mounts or chapter changes
onMounted(() => {
  loadGlossaryTerms();
  if (currentChapter.value && currentSeries.value) {
    generateSuggestions();
  }
});

// Watch for chapter or series changes and reload glossary
watch([() => currentChapter.value?.id, () => currentSeries.value?.id], () => {
  loadGlossaryTerms();
  if (currentChapter.value && currentSeries.value) {
    generateSuggestions();
  }
});
</script>