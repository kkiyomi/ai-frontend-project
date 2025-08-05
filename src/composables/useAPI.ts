import type { APIResponse } from '../types';

// Placeholder API functions - replace with actual API calls later
export function useAPI() {
  const translateText = async (
    text: string, 
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock translation response
    return {
      success: true,
      data: `[AI Translation] ${text} (Context: ${glossaryContext?.join(', ') || 'none'})`,
    };
  };

  const retranslateWithGlossary = async (
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      data: `[Retranslated with glossary] ${originalText} (Terms: ${glossaryTerms.join(', ')})`,
    };
  };

  const suggestGlossaryTerms = async (text: string): Promise<APIResponse<string[]>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock suggestions based on common patterns
    const mockSuggestions = ['character_name', 'cultural_term', 'idiom_phrase'];
    return {
      success: true,
      data: mockSuggestions,
    };
  };

  return {
    translateText,
    retranslateWithGlossary,
    suggestGlossaryTerms,
  };
}