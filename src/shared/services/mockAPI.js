// Mock API implementation - moved from services/mockAPI.js
import mockSeriesData from '../../mock/series.js';
import mockChaptersData from '../../mock/chapters.js';
import mockGlossaryTermsData from '../../mock/glossaryTerms.js';

// Create working copies that we can modify
let mockSeries = [...mockSeriesData];
let mockChapters = [...mockChaptersData];
let mockGlossaryTerms = [...mockGlossaryTermsData];

// Initialize series with their chapters
const initializeSeriesWithChapters = () => {
  mockSeries.forEach(series => {
    series.chapters = mockChapters.filter(chapter => chapter.seriesId === series.id);
  });
};

// Initialize on module load
initializeSeriesWithChapters();

// Simulate network delay for realistic testing
const simulateDelay = (min = 500, max = 2000) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate occasional failures for robust error handling testing
const simulateFailure = (failureRate = 0.1) => {
  return Math.random() < failureRate;
};

export class MockAPI {
  // Translation endpoints
  async translateText(text, glossaryContext) {
    console.log('MockAPI translateText');
    await simulateDelay();
    
    if (simulateFailure(0.05)) {
      return {
        success: false,
        error: 'Translation service temporarily unavailable'
      };
    }
    
    const contextNote = glossaryContext && glossaryContext.length > 0 
      ? ` (with context: ${glossaryContext.join(', ')})` 
      : '';
    
    return {
      success: true,
      data: `[Mock Translation]${contextNote} ${text}`,
    };
  }

  async translateParagraph(text, chapterId, paragraphIndex, glossaryContext) {
    await simulateDelay(300, 800);
    
    if (simulateFailure(0.03)) {
      return {
        success: false,
        error: 'Paragraph translation failed'
      };
    }
    
    const contextNote = glossaryContext && glossaryContext.length > 0 
      ? ` (with context: ${glossaryContext.join(', ')})` 
      : '';
    
    return {
      success: true,
      data: `[Mock Paragraph Translation]${contextNote} ${text}`,
    };
  }

  async retranslateWithGlossary(originalText, currentTranslation, glossaryTerms) {
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

  async suggestGlossaryTerms(text) {
    await simulateDelay(500, 1000);
    
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency = {};
    
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
  async getSeries() {
    await simulateDelay(300, 800);
    
    initializeSeriesWithChapters();
    
    return {
      success: true,
      data: mockSeries,
    };
  }

  async createSeries(name, description) {
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

  async updateSeries(seriesId, updates) {
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

  async deleteSeries(seriesId) {
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
  async getChapters(seriesId) {
    await simulateDelay(200, 600);
    
    const chapters = seriesId 
      ? mockChapters.filter(ch => ch.seriesId === seriesId)
      : mockChapters;
    
    return {
      success: true,
      data: chapters,
    };
  }

  async createChapter(title, content, seriesId) {
    await simulateDelay(800, 1500);
    
    const originalParagraphs = content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const newChapter = {
      id: `ch${Date.now()}`,
      title,
      content,
      translatedContent: '',
      originalParagraphs,
      translatedParagraphs: [],
      seriesId
    };
    
    mockChapters.push(newChapter);
    
    const series = mockSeries.find(s => s.id === seriesId);
    if (series) {
      series.chapters.push(newChapter);
    }
    
    return {
      success: true,
      data: newChapter,
    };
  }

  async updateChapter(chapterId, updates) {
    await simulateDelay(300, 600);
    
    const index = mockChapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found'
      };
    }
    
    mockChapters[index] = { ...mockChapters[index], ...updates };
    
    const series = mockSeries.find(s => s.id === mockChapters[index].seriesId);
    if (series) {
      const seriesChapterIndex = series.chapters.findIndex(ch => ch.id === chapterId);
      if (seriesChapterIndex !== -1) {
        series.chapters[seriesChapterIndex] = mockChapters[index];
      }
    }
    
    return {
      success: true,
      data: mockChapters[index],
    };
  }

  async deleteChapter(chapterId) {
    await simulateDelay(300, 600);
    
    const index = mockChapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found'
      };
    }
    
    const chapter = mockChapters[index];
    mockChapters.splice(index, 1);
    
    const series = mockSeries.find(s => s.id === chapter.seriesId);
    if (series) {
      series.chapters = series.chapters.filter(ch => ch.id !== chapterId);
    }
    
    return {
      success: true,
    };
  }

  // Glossary endpoints
  async getGlossaryTerms(seriesId, chapterId) {
    await simulateDelay(200, 500);
    
    let filteredTerms = [...mockGlossaryTerms];
    
    if (chapterId) {
      filteredTerms = filteredTerms.filter(term => 
        term.chapterId === chapterId || 
        (term.seriesId === seriesId && !term.chapterId)
      );
    } else if (seriesId) {
      filteredTerms = filteredTerms.filter(term => term.seriesId === seriesId);
    }
    
    return {
      success: true,
      data: filteredTerms,
    };
  }

  async createGlossaryTerm(term) {
    await simulateDelay(400, 800);
    
    const existingTerm = mockGlossaryTerms.find(
      t => t.term.toLowerCase() === term.term.toLowerCase() && t.seriesId === term.seriesId
    );
    
    if (existingTerm) {
      return {
        success: false,
        error: 'Term already exists in this series'
      };
    }
    
    const newTerm = {
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

  async updateGlossaryTerm(termId, updates) {
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

  async deleteGlossaryTerm(termId) {
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
  async createShare(request) {
    await simulateDelay(800, 1500);
    console.log('mockAPI createShare');

    if (simulateFailure(0.02)) {
      return {
        success: false,
        error: 'Failed to create share link'
      };
    }
    
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const shareUrl = `${window.location.origin}/share/${shareId}`;

    const expiresAt = request.expirationDays 
      ? new Date(Date.now() + request.expirationDays * 24 * 60 * 60 * 1000)
      : undefined;

    const sharedContent = await this.buildSharedContent(request, shareId, expiresAt, request.password);
    if (sharedContent) {
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

  async getSharedContent(shareId) {
    await simulateDelay(300, 800);
    
    const stored = localStorage.getItem(`share-${shareId}`);
    if (!stored) {
      return {
        success: false,
        error: 'Share not found or has expired'
      };
    }
    
    try {
      const sharedContent = JSON.parse(stored);
      
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

  async verifySharePassword(shareId, password) {
    await simulateDelay(500, 1000);
    
    const stored = localStorage.getItem(`share-${shareId}`);
    if (!stored) {
      return {
        success: false,
        error: 'Share not found or has expired'
      };
    }
    
    try {
      const shareData = JSON.parse(stored);
      const isValid = shareData.password === password;
      
      return {
        success: true,
        data: isValid
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid share data'
      };
    }
  }

  async deleteShare(shareId) {
    await simulateDelay(200, 500);
    
    localStorage.removeItem(`share-${shareId}`);
    
    return {
      success: true
    };
  }

  async buildSharedContent(request, shareId, expiresAt, password) {
    let chapters = [];

    if (request.seriesIds.length > 0) {
      const seriesChapters = mockChapters.filter(c => 
        request.seriesIds.includes(c.seriesId) &&
        this.isChapterFullyTranslated(c)
      );
      chapters.push(...seriesChapters);
    }

    if (request.chapterIds.length > 0) {
      const individualChapters = mockChapters.filter(c => 
        request.chapterIds.includes(c.id) &&
        !request.seriesIds.includes(c.seriesId)
      );
      chapters.push(...individualChapters);
    }

    if (chapters.length === 0) return null;

    const sharedChapters = chapters.map(chapter => {
      const series = mockSeries.find(s => s.id === chapter.seriesId);
      
      return {
        id: chapter.id,
        title: chapter.title,
        originalText: chapter.content,
        translatedText: chapter.translatedContent,
        seriesName: series?.name || 'Unknown Series',
        seriesId: chapter.seriesId
      };
    });

    return {
      type: request.seriesIds.length > 0 ? 'series' : 'chapters',
      id: shareId,
      title: request.title || 'Shared Translation',
      description: request.description,
      content: sharedChapters,
      createdAt: new Date(),
      expiresAt,
      isPasswordProtected: !!password,
      password: password
    };
  }
  
  isChapterFullyTranslated(chapter) {
    return chapter.isTranslated || false;
  }
}