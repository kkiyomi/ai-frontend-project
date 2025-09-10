import type { APIResponse, Series, Chapter, GlossaryTerm} from '../types';
import type { ShareRequest, ShareResponse, SharedContent, SharedChapter } from '../types/sharing';
import { mockSeries, mockChapters, mockGlossaryTerms } from '../mock';

// Simulate network delay for realistic testing
const simulateDelay = (min = 500, max = 2000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate occasional failures for robust error handling testing
const simulateFailure = (failureRate = 0.1): boolean => {
  return Math.random() < failureRate;
};

export class MockAPI {
  // Translation endpoints
  async translateText(
    text: string, 
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    await simulateDelay();
    
    if (simulateFailure(0.05)) { // 5% failure rate
      return {
        success: false,
        error: 'Translation service temporarily unavailable'
      };
    }
    
    // Create a more realistic mock translation
    const contextNote = glossaryContext && glossaryContext.length > 0 
      ? ` (with context: ${glossaryContext.join(', ')})` 
      : '';
    
    return {
      success: true,
      data: `[Mock Translation]${contextNote} ${text}`,
    };
  }

  async retranslateWithGlossary(
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> {
    await simulateDelay(800, 1500);
    
    if (simulateFailure(0.03)) {
      return {
        success: false,
        error: 'Retranslation failed'
      };
    }
    
    return {
      success: true,
      data: `[Mock Retranslation with glossary: ${glossaryTerms.join(', ')}] ${originalText} ${currentTranslation}`,
    };
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    await simulateDelay(500, 1000);
    
    // Extract potential terms from text (simple word frequency analysis)
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const suggestions = Object.entries(frequency)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([word, _]) => word);

    return {
      success: true,
      data: suggestions,
    };
  }

  // Series endpoints
  async getSeries(): Promise<APIResponse<typeof mockSeries>> {
    await simulateDelay(300, 800);
    
    return {
      success: true,
      data: mockSeries,
    };
  }

  async createSeries(name: string, description?: string): Promise<APIResponse<typeof mockSeries[0]>> {
    await simulateDelay(500, 1000);
    
    const newSeries = {
      id: `s${Date.now()}`,
      name,
      description,
      createdAt: new Date(),
      chapters: []
    };
    
    mockSeries.push(newSeries);
    
    return {
      success: true,
      data: newSeries,
    };
  }

  async updateSeries(seriesId: string, updates: Partial<Series>): Promise<APIResponse<Series>> {
    await simulateDelay(300, 600);
    
    const index = mockSeries.findIndex(s => s.id === seriesId);
    if (index === -1) {
      return {
        success: false,
        error: 'Series not found'
      };
    }
    
    mockSeries[index] = { ...mockSeries[index], ...updates };
    
    return {
      success: true,
      data: mockSeries[index],
    };
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    await simulateDelay(300, 600);
    
    const index = mockSeries.findIndex(s => s.id === seriesId);
    if (index === -1) {
      return {
        success: false,
        error: 'Series not found'
      };
    }
    
    mockSeries.splice(index, 1);
    
    return {
      success: true,
    };
  }

  // Chapter endpoints
  async getChapters(seriesId?: string): Promise<APIResponse<typeof mockChapters>> {
    await simulateDelay(200, 600);
    
    const chapters = seriesId 
      ? mockChapters.filter(ch => ch.seriesId === seriesId)
      : mockChapters;
    
    return {
      success: true,
      data: chapters,
    };
  }

  async createChapter(
    title: string, 
    content: string, 
    seriesId: string
  ): Promise<APIResponse<typeof mockChapters[0]>> {
    await simulateDelay(800, 1500);
    
    const paragraphs = content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map((text, index) => ({
        id: `ch${Date.now()}-p${index}`,
        originalText: text,
        translatedText: '',
        isEditing: false,
        chapterId: `ch${Date.now()}`
      }));

    const newChapter = {
      id: `ch${Date.now()}`,
      title,
      content,
      paragraphs,
      seriesId
    };
    
    mockChapters.push(newChapter);
    
    return {
      success: true,
      data: newChapter,
    };
  }

  async updateChapter(chapterId: string, updates: Partial<Chapter>): Promise<APIResponse<Chapter>> {
    await simulateDelay(300, 600);
    
    const index = mockChapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found'
      };
    }
    
    mockChapters[index] = { ...mockChapters[index], ...updates };
    
    return {
      success: true,
      data: mockChapters[index],
    };
  }

  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    await simulateDelay(300, 600);
    
    const index = mockChapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found'
      };
    }
    
    mockChapters.splice(index, 1);
    
    return {
      success: true,
    };
  }

  // Glossary endpoints
  async getGlossaryTerms(seriesId?: string, chapterId?: string): Promise<APIResponse<GlossaryTerm[]>> {
    await simulateDelay(200, 500);
    
    let filteredTerms = [...mockGlossaryTerms];
    
    if (chapterId) {
      // Filter by specific chapter OR series-level terms (no chapterId)
      filteredTerms = filteredTerms.filter(term => 
        term.chapterId === chapterId || 
        (term.seriesId === seriesId && !term.chapterId)
      );
    } else if (seriesId) {
      // Filter by series
      filteredTerms = filteredTerms.filter(term => term.seriesId === seriesId);
    }
    
    return {
      success: true,
      data: filteredTerms,
    };
  }

  async createGlossaryTerm(term: Omit<GlossaryTerm, 'id' | 'frequency'>): Promise<APIResponse<GlossaryTerm>> {
    await simulateDelay(400, 800);
    
    // Check if term already exists in the series
    const existingTerm = mockGlossaryTerms.find(
      t => t.term.toLowerCase() === term.term.toLowerCase() && t.seriesId === term.seriesId
    );
    
    if (existingTerm) {
      return {
        success: false,
        error: 'Term already exists in this series'
      };
    }
    
    const newTerm: GlossaryTerm = {
      ...term,
      id: `term${Date.now()}`,
      frequency: 1,
    };
    
    mockGlossaryTerms.push(newTerm);
    
    return {
      success: true,
      data: newTerm,
    };
  }

  async updateGlossaryTerm(termId: string, updates: Partial<GlossaryTerm>): Promise<APIResponse<GlossaryTerm>> {
    await simulateDelay(300, 600);
    
    const index = mockGlossaryTerms.findIndex(t => t.id === termId);
    if (index === -1) {
      return {
        success: false,
        error: 'Glossary term not found'
      };
    }
    
    mockGlossaryTerms[index] = { ...mockGlossaryTerms[index], ...updates };
    
    return {
      success: true,
      data: mockGlossaryTerms[index],
    };
  }

  async deleteGlossaryTerm(termId: string): Promise<APIResponse<void>> {
    await simulateDelay(300, 600);
    
    const index = mockGlossaryTerms.findIndex(t => t.id === termId);
    if (index === -1) {
      return {
        success: false,
        error: 'Glossary term not found'
      };
    }
    
    mockGlossaryTerms.splice(index, 1);
    
    return {
      success: true,
    };
  }

  // Sharing endpoints
  async createShare(request: ShareRequest): Promise<APIResponse<ShareResponse>> {
    await simulateDelay(800, 1500);
    
    if (simulateFailure(0.02)) {
      return {
        success: false,
        error: 'Failed to create share link'
      };
    }
    
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    
    // Calculate expiration date
    const expiresAt = request.expirationDays 
      ? new Date(Date.now() + request.expirationDays * 24 * 60 * 60 * 1000)
      : undefined;
    
    // Store the shared content (in a real app, this would be in a database)
    const sharedContent = await this.buildSharedContent(request, shareId, expiresAt, request.password);
    if (sharedContent) {
      // In a real app, you'd store this in a database
      localStorage.setItem(`share-${shareId}`, JSON.stringify(sharedContent));
    }
    
    return {
      success: true,
      data: {
        shareId,
        shareUrl,
        expiresAt
      }
    };
  }

  async getSharedContent(shareId: string): Promise<APIResponse<SharedContent>> {
    await simulateDelay(300, 800);
    
    // In a real app, this would query a database
    const stored = localStorage.getItem(`share-${shareId}`);
    if (!stored) {
      return {
        success: false,
        error: 'Share not found or has expired'
      };
    }
    
    try {
      const sharedContent = JSON.parse(stored) as SharedContent;
      
      // Check if expired
      if (sharedContent.expiresAt && new Date() > new Date(sharedContent.expiresAt)) {
        localStorage.removeItem(`share-${shareId}`);
        return {
          success: false,
          error: 'Share has expired'
        };
      }
      
      return {
        success: true,
        data: sharedContent
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid share data'
      };
    }
  }

  async deleteShare(shareId: string): Promise<APIResponse<void>> {
    await simulateDelay(200, 500);
    
    localStorage.removeItem(`share-${shareId}`);
    
    return {
      success: true
    };
  }

  private async buildSharedContent(
    request: ShareRequest, 
    shareId: string, 
    expiresAt?: Date, 
    password?: string
  ): Promise<SharedContent | null> {
    let chapters: Chapter[] = [];
    
    switch (request.type) {
      case 'chapter':
        if (request.chapterIds && request.chapterIds.length > 0) {
          chapters = mockChapters.filter(c => request.chapterIds!.includes(c.id));
        }
        break;
      case 'chapters':
        if (request.chapterIds && request.chapterIds.length > 0) {
          chapters = mockChapters.filter(c => request.chapterIds!.includes(c.id));
        }
        break;
      case 'series':
        if (request.seriesIds && request.seriesIds.length > 0) {
          chapters = mockChapters.filter(c => request.seriesIds!.includes(c.seriesId));
        }
        break;
      case 'multiple-series':
        if (request.seriesIds && request.seriesIds.length > 0) {
          chapters = mockChapters.filter(c => request.seriesIds!.includes(c.seriesId));
        }
        break;
    }
    
    if (chapters.length === 0) return null;
    
    const sharedChapters: SharedChapter[] = chapters.map(chapter => {
      const series = mockSeries.find(s => s.id === chapter.seriesId);
      
      return {
        id: chapter.id,
        title: chapter.title,
        originalText: chapter.paragraphs.map(p => p.originalText).join('\n\n'),
        translatedText: chapter.paragraphs.map(p => p.translatedText).filter(t => t.trim()).join('\n\n'),
        seriesName: series?.name || 'Unknown Series',
        seriesId: chapter.seriesId
      };
    });
    
    return {
      id: shareId,
      type: request.type,
      title: request.title || 'Shared Translation',
      description: request.description,
      content: sharedChapters,
      createdAt: new Date(),
      expiresAt,
      isPasswordProtected: !!password
    };
  }
}