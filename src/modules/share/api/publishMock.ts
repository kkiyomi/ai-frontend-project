/**
 * Share Module - Mock Publisher API Implementation
 */
import type { APIResponse } from '@/modules/core';
import type { ShareLink, CreateShareLinkRequest } from '../types';

const MOCK_LINKS: ShareLink[] = [
  {
    uuid: 'mock-link-001',
    name: 'Chapter 1 share',
    publishType: 'chapter',
    chapterId: 'ch001',
    chapterName: 'Chapter 1: The Beginning',
    includeGlossary: true,
    includeRaw: false,
    active: true,
    viewCount: 42,
    createDate: new Date().toISOString(),
  },
  {
    uuid: 'mock-link-002',
    name: 'Full Series ToC',
    publishType: 'series',
    novelId: 'nov001',
    novelName: 'Mock Series',
    includeGlossary: false,
    includeRaw: false,
    active: true,
    viewCount: 128,
    createDate: new Date().toISOString(),
  },
];

export class PublishMockAPI {
  async createShareLink(request: CreateShareLinkRequest): Promise<APIResponse<ShareLink>> {
    const link: ShareLink = {
      uuid: 'mock-link-new',
      name: request.name,
      publishType: request.publishType,
      chapterId: request.publishType === 'chapter' ? request.contentId : undefined,
      novelId: request.publishType === 'series' ? request.contentId : undefined,
      includeGlossary: request.includeGlossary ?? false,
      includeRaw: request.includeRaw ?? false,
      active: true,
      viewCount: 0,
      createDate: new Date().toISOString(),
    };
    return { data: link, success: true };
  }

  async listShareLinks(): Promise<APIResponse<ShareLink[]>> {
    return { data: [...MOCK_LINKS], success: true };
  }

  async revokeShareLink(uuid: string): Promise<APIResponse<void>> {
    const link = MOCK_LINKS.find((l) => l.uuid === uuid);
    if (link) link.active = false;
    return { success: true };
  }

  async toggleChapterPublished(_chapterUuid: string, isPublished: boolean): Promise<APIResponse<{ is_published: boolean }>> {
    return { data: { is_published: isPublished }, success: true };
  }
}
