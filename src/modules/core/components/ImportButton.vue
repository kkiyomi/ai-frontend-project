<template>
    <!-- Upload Button -->
    <button
      @click="triggerFileInput"
      :disabled="disabled || isImporting"
      :class="buttonClass"
      :title="buttonTitle"
      type="button"
    >
      <slot name="button-content">
        <template v-if="isImporting">
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </template>
        <template v-else>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </template>
        <span v-if="buttonText" class="ml-1">{{ buttonText }}</span>
      </slot>
    </button>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="handleFileUpload"
    />

    <!-- Progress Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div class="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-base-content">
            {{ isImporting ? getStageTitle() : 'Import Results' }}
          </h3>
          <button
            v-if="!isImporting"
            @click="closeModal"
            class="text-base-content/40 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Import Progress -->
        <div v-if="isImporting" class="space-y-4">
          <progress
            class="progress progress-primary h-2 rounded-full"
            :value="importProgress?.percentage || 0"
            max="100"
          ></progress>
          <div class="space-y-2">
            <p class="text-sm text-gray-600 text-center">
              {{ getStageDescription() }}
            </p>
            <p v-if="importProgress" class="text-xs text-base-content/60 text-center">
              Row {{ importProgress.currentRow }} of {{ importProgress.totalRows }}
            </p>
          </div>
          <div class="text-center">
            <button
              @click="cancelImport"
              class="px-4 py-2 alert alert-error rounded-lg transition-colors text-sm font-medium"
              type="button"
            >
              Cancel Import
            </button>
          </div>
        </div>

        <!-- Import Results -->
        <div v-else-if="importResult" class="space-y-4">
          <div class="text-center">
            <div class="text-4xl mb-2">
              {{ importResult.successRows > 0 ? '✅' : '❌' }}
            </div>
            <p class="text-sm text-gray-600">
              {{ importResult.successRows }} of {{ importResult.totalRows }} rows imported successfully
            </p>
            <p class="text-xs text-base-content/60 mt-1">
              Import completed in {{ (importResult.duration / 1000).toFixed(1) }} seconds
            </p>
          </div>

          <!-- Success Summary -->
          <div v-if="importResult.successRows > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-green-600">Successfully imported:</h4>
            <div class="text-xs text-gray-600 bg-green-50 px-3 py-2 rounded">
              <p>{{ importResult.successRows }} rows processed without errors</p>
              <p v-if="importResult.validationErrors > 0" class="mt-1">
                {{ importResult.validationErrors }} rows skipped due to validation errors
              </p>
              <p v-if="importResult.importErrors > 0" class="mt-1">
                {{ importResult.importErrors }} rows failed during import
              </p>
            </div>
          </div>

          <!-- Error Details -->
          <div v-if="hasErrors" class="space-y-2">
            <h4 class="text-sm font-medium text-red-600">Errors encountered:</h4>
            <div class="max-h-48 overflow-y-auto space-y-1">
              <div
                v-for="error in errorRows"
                :key="`error-${error.row}`"
                class="text-xs text-gray-600 bg-red-50 px-2 py-1 rounded"
              >
                <div class="font-medium">Row {{ error.row }}</div>
                <div class="text-red-500">{{ error.error }}</div>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <button
            @click="closeModal"
            class="w-full px-4 py-2 btn btn-primary transition-colors text-sm font-medium"
            type="button"
          >
            Close
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="importError" class="space-y-4">
          <div class="text-center">
            <div class="text-4xl mb-2">❌</div>
            <p class="text-sm text-red-600">Import failed</p>
            <p class="text-xs text-base-content/60 mt-1">{{ importError }}</p>
          </div>
          <button
            @click="closeModal"
            class="w-full px-4 py-2 btn btn-primary transition-colors text-sm font-medium"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ImportResult, ImportProgress } from '../composables/useImporter'

interface Props {
  // Button configuration
  buttonClass?: string
  buttonTitle?: string
  buttonText?: string
  icon?: 'upload' | 'import' | 'file'
  
  // File input
  accept?: string
  multiple?: boolean
  disabled?: boolean
  
  // Import function (required)
  importFunction: (file: File) => Promise<ImportResult>
  
  // Display options
  showProgress?: boolean
  showResults?: boolean
  autoCloseDelay?: number
  
  // Initial state
  isImporting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  buttonClass: 'p-1 text-base-content/40 hover:text-primary/60 transition-colors',
  buttonTitle: 'Import data from file',
  accept: '.csv',
  multiple: false,
  disabled: false,
  showProgress: true,
  showResults: true,
  autoCloseDelay: 3000,
  isImporting: false,
  icon: 'upload',
})

const emit = defineEmits<{
  'import-started': []
  'import-completed': [result: ImportResult]
  'import-error': [error: Error]
  'file-selected': [file: File]
  'import-cancelled': []
}>()

// Refs
const fileInput = ref<HTMLInputElement>()
const isImporting = ref(props.isImporting)
const showModal = ref(false)
const importProgress = ref<ImportProgress | null>(null)
const importResult = ref<ImportResult | null>(null)
const importError = ref<string | null>(null)
const autoCloseTimer = ref<NodeJS.Timeout | null>(null)

// Computed
const hasErrors = computed(() => {
  if (!importResult.value) return false
  return importResult.value.validationErrors > 0 || importResult.value.importErrors > 0
})

const errorRows = computed(() => {
  if (!importResult.value) return []
  return importResult.value.results.filter(r => !r.success)
})

const getStageTitle = () => {
  if (!importProgress.value) return 'Importing...'
  const stage = importProgress.value.stage
  const titles = {
    parsing: 'Parsing CSV File',
    validating: 'Validating Data',
    transforming: 'Transforming Data',
    importing: 'Importing Data',
    complete: 'Import Complete'
  }
  return titles[stage] || 'Importing...'
}

const getStageDescription = () => {
  if (!importProgress.value) return 'Starting import...'
  const stage = importProgress.value.stage
  const descriptions = {
    parsing: 'Reading and parsing CSV file structure',
    validating: 'Validating data against schema',
    transforming: 'Transforming data for import',
    importing: 'Saving data to database',
    complete: 'Import completed successfully'
  }
  return descriptions[stage] || 'Processing...'
}

// Methods
const triggerFileInput = () => {
  if (props.disabled || isImporting.value) return
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  // Reset state
  isImporting.value = true
  showModal.value = true
  importProgress.value = null
  importResult.value = null
  importError.value = null
  
  // Clear any existing auto-close timer
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
    autoCloseTimer.value = null
  }

  // Emit file selected event
  const file = files[0]
  emit('file-selected', file)

  // Emit import started event
  emit('import-started')

  try {
    // Execute import function
    const result = await props.importFunction(file)
    
    // Update state
    importResult.value = result
    importProgress.value = {
      stage: 'complete',
      currentRow: result.totalRows,
      totalRows: result.totalRows,
      percentage: 100
    }
    
    // Emit completed event
    emit('import-completed', result)
    
    // Auto-close on success if configured
    if (props.autoCloseDelay > 0 && !hasErrors.value) {
      autoCloseTimer.value = setTimeout(() => {
        closeModal()
      }, props.autoCloseDelay)
    }
    
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Import failed'
    console.error('Import error:', error)
    emit('import-error', error instanceof Error ? error : new Error('Import failed'))
    
  } finally {
    isImporting.value = false
    
    // Reset file input
    if (target) {
      target.value = ''
    }
  }
}

const cancelImport = () => {
  // In a real implementation, this would trigger an abort controller
  // For now, just stop the import and close the modal
  isImporting.value = false
  showModal.value = false
  importProgress.value = null
  importResult.value = null
  importError.value = null
  emit('import-cancelled')
}

const closeModal = () => {
  if (isImporting.value) return // Don't allow closing during import
  
  // Clear auto-close timer
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
    autoCloseTimer.value = null
  }
  
  showModal.value = false
  importResult.value = null
  importError.value = null
}

const updateProgress = (progress: ImportProgress) => {
  importProgress.value = progress
}

// Watch for external isImporting changes
watch(() => props.isImporting, (newValue) => {
  isImporting.value = newValue
})

// Cleanup
const cleanup = () => {
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
  }
}

defineExpose({
  triggerFileInput,
  cancelImport,
  closeModal,
  updateProgress
})
</script>