import type { APIResponse } from '../../core/types';
import type { ShareRequest, ShareResponse, SharedContent } from '../types';

/**
 * Mock Sharing API - for testing and demo
 *
 * Simulates network delays and stores shares in localStorage
 * Useful for development without a backend
 */

const simulateDelay = (min = 300, max = 1000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export class MockSharingAPI {
  /**
   * Creates a new share link (mock)
   */
  async createShare(request: ShareRequest): Promise<APIResponse<ShareResponse>> {
    await simulateDelay(800, 1500);

    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const shareUrl = `${window.location.origin}/share/${shareId}`;

    const expiresAt = request.expirationDays
      ? new Date(Date.now() + request.expirationDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Build and store shared content
    const sharedContent: SharedContent = {
      id: shareId,
      title: request.title || 'Shared Translation',
      description: request.description,
      content: [], // Would be populated with actual chapter data
      chapterIds: request.chapterIds,
      seriesIds: request.seriesIds,
      createdAt: new Date(),
      expiresAt,
      isPasswordProtected: !!request.password,
      password: request.password, // In real app, this would be hashed
    };

    localStorage.setItem(`share-${shareId}`, JSON.stringify(sharedContent));

    return {
      success: true,
      data: {
        shareId,
        shareUrl,
        expiresAt,
      },
    };
  }

  /**
   * Retrieves shared content by ID (mock)
   */
  async getSharedContent(shareId: string): Promise<APIResponse<SharedContent>> {
    await simulateDelay(300, 800);

    const stored = localStorage.getItem(`share-${shareId}`);
    if (!stored) {
      return {
        success: false,
        error: 'Share not found or has expired',
      };
    }

    try {
      const sharedContent = JSON.parse(stored) as SharedContent;

      // Check expiration
      if (sharedContent.expiresAt && new Date() > new Date(sharedContent.expiresAt)) {
        localStorage.removeItem(`share-${shareId}`);
        return {
          success: false,
          error: 'Share has expired',
        };
      }

      return {
        success: true,
        data: sharedContent,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid share data',
      };
    }
  }

  /**
   * Verifies password for password-protected shares (mock)
   */
  async verifySharePassword(
    shareId: string,
    password: string
  ): Promise<APIResponse<boolean>> {
    await simulateDelay(500, 1000);

    const stored = localStorage.getItem(`share-${shareId}`);
    if (!stored) {
      return {
        success: false,
        error: 'Share not found or has expired',
      };
    }

    try {
      const shareData = JSON.parse(stored);
      const isValid = shareData.password === password;

      return {
        success: true,
        data: isValid,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid share data',
      };
    }
  }

  /**
   * Deletes a share (mock)
   */
  async deleteShare(shareId: string): Promise<APIResponse<void>> {
    await simulateDelay(200, 500);
    localStorage.removeItem(`share-${shareId}`);

    return {
      success: true,
    };
  }

  /**
   * Gets share statistics (mock)
   */
  async getShareStats(shareId: string): Promise<APIResponse<any>> {
    await simulateDelay(200, 500);

    const result = await this.getSharedContent(shareId);
    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Share not found',
      };
    }

    const share = result.data;
    const stats = {
      views: Math.floor(Math.random() * 100),
      totalChapters: share.content.length,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
    };

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Lists all shares (mock)
   */
  async listShares(): Promise<APIResponse<SharedContent[]>> {
    await simulateDelay(300, 800);

    const shares: SharedContent[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('share-')) {
        try {
          const shareData = JSON.parse(localStorage.getItem(key) || '');
          shares.push(shareData);
        } catch (e) {
          // Invalid share data, skip
        }
      }
    }

    // Sort by creation date
    shares.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: shares,
    };
  }
}

export const mockSharingAPI = new MockSharingAPI();
