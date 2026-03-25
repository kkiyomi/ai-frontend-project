/**
 * Translation Module - Mock API Implementation
 *
 * Provides mock translation responses for development and testing.
 * Simulates realistic network delays and occasional failures.
 *
 * IMPORTANT: This is feature-specific mock logic that belongs to Translation module,
 * NOT in Core infrastructure.
 */

import type { APIResponse } from '@/modules/core';
import type { TranslationJobResponse } from '../types';

const simulateDelay = (min = 300, max = 1000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateFailure = (failureRate = 0.05): boolean => {
  return Math.random() < failureRate;
};

interface MockJob {
  jobId: string;
  chapterId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalParagraphs: number;
  processedParagraphs: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TranslationMockAPI {
  private mockJobs = new Map<string, MockJob>();

  async translateChapter(
    chapterId: string
  ): Promise<APIResponse<{ jobId: string }>> {
    await simulateDelay(500, 1000);
    
    if (simulateFailure(0.05)) {
      return {
        success: false,
        error: 'Failed to start chapter translation'
      };
    }
    
    const jobId = `mock-job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const job: MockJob = {
      jobId,
      chapterId,
      status: 'pending',
      progress: 0,
      totalParagraphs: 10, // Mock number of paragraphs
      processedParagraphs: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockJobs.set(jobId, job);
    
    // Start processing after a short delay
    setTimeout(() => {
      const currentJob = this.mockJobs.get(jobId);
      if (currentJob) {
        currentJob.status = 'processing';
        currentJob.updatedAt = new Date();
      }
    }, 1000);
    
    return {
      success: true,
      data: { jobId }
    };
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    await simulateDelay(400, 800);

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

  async getTranslationJobStatus(
    jobId: string
  ): Promise<APIResponse<TranslationJobResponse>> {
    await simulateDelay(200, 500);
    
    const job = this.mockJobs.get(jobId);
    
    if (!job) {
      return {
        success: false,
        error: 'Job not found'
      };
    }
    
    // Simulate progress for in-progress jobs
    if (job.status === 'processing') {
      const elapsed = Date.now() - job.createdAt.getTime();
      const totalTime = 8000; // 8 seconds simulated translation time
      
      // Simulate occasional failure
      if (simulateFailure(0.02)) {
        job.status = 'failed';
        job.progress = 0;
        job.updatedAt = new Date();
      } else if (elapsed >= totalTime) {
        job.status = 'completed';
        job.progress = 100;
        job.processedParagraphs = job.totalParagraphs;
        job.updatedAt = new Date();
      } else {
        const progress = Math.min(95, Math.floor((elapsed / totalTime) * 100));
        job.progress = progress;
        job.processedParagraphs = Math.floor((progress / 100) * job.totalParagraphs);
        job.updatedAt = new Date();
      }
    }
    
    return {
      success: true,
      data: {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        errorMessage: job.status === 'failed' ? 'Translation job failed' : undefined
      }
    };
  }
}
