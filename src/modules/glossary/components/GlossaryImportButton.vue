<template>
  <ImportButton
    ref="importButton"
    :button-class="buttonClass"
    :button-title="buttonTitle"
    :button-text="buttonText"
    :accept="accept"
    :multiple="multiple"
    :disabled="disabled"
    :import-function="importGlossaryFile"
    :show-progress="showProgress"
    :show-results="showResults"
    :auto-close-delay="autoCloseDelay"
    :is-importing="isImporting"
    @import-started="onImportStarted"
    @import-completed="onImportCompleted"
    @import-error="onImportError"
    @file-selected="onFileSelected"
    @import-cancelled="onImportCancelled"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ImportButton } from '@/modules/core'
import { useGlossaryImporter } from '../composables/useGlossaryImporter'
import { useGlossaryStore } from '../store'
import type { ImportResult } from '@/modules/core'

interface Props {
  seriesId?: string
  chapterId?: string
  
  // Pass-through props for ImportButton
  buttonClass?: string
  buttonTitle?: string
  buttonText?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  showProgress?: boolean
  showResults?: boolean
  autoCloseDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  buttonClass: 'p-1 text-base-content/40 hover:text-blue-500 transition-colors',
  buttonTitle: 'Import glossary terms from CSV',
  accept: '.csv',
  multiple: false,
  disabled: false,
  showProgress: true,
  showResults: true,
  autoCloseDelay: 3000,
})

const emit = defineEmits<{
  'import-started': []
  'import-completed': [result: ImportResult]
  'import-error': [error: Error]
  'file-selected': [file: File]
  'import-cancelled': []
  'terms-imported': [count: number]
}>()

// Refs
const importButton = ref<InstanceType<typeof ImportButton>>()
const store = useGlossaryStore()

// Create glossary importer instance
const glossaryImporter = useGlossaryImporter({
  seriesId: props.seriesId || '',
  chapterId: props.chapterId,
  skipDuplicates: true,
  defaultCategory: 'General',
  markAsUserDefined: true,
  batchSize: 10,
})

// Computed
const isImporting = computed(() => glossaryImporter.isImporting.value)
const disabled = computed(() => props.disabled || !props.seriesId)

// Import function for ImportButton
const importGlossaryFile = async (file: File): Promise<ImportResult> => {
  if (!props.seriesId) {
    throw new Error('Cannot import glossary terms without a series selected')
  }
  
  return glossaryImporter.importGlossaryFile(file)
}

// Event handlers
const onImportStarted = () => {
  emit('import-started')
}

const onImportCompleted = (result: ImportResult) => {
  emit('import-completed', result)
  
  // Refresh glossary store to show newly imported terms
  if (result.successRows > 0 && props.seriesId) {
    store.loadTerms(props.seriesId, props.chapterId)
    emit('terms-imported', result.successRows)
  }
}

const onImportError = (error: Error) => {
  emit('import-error', error)
}

const onFileSelected = (file: File) => {
  emit('file-selected', file)
}

const onImportCancelled = () => {
  emit('import-cancelled')
}

// Methods exposed to parent
const triggerFileInput = () => {
  importButton.value?.triggerFileInput()
}

const cancelImport = () => {
  importButton.value?.cancelImport()
}

const closeModal = () => {
  importButton.value?.closeModal()
}

// Watch for seriesId changes to update importer
watch(() => props.seriesId, (newSeriesId) => {
  if (!newSeriesId) {
    // Disable import button when no series selected
    // The disabled computed property handles this
  }
})

// Expose methods
defineExpose({
  triggerFileInput,
  cancelImport,
  closeModal,
})
</script>