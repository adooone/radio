import type {
  AlbumDataJson,
  DigitizationDraft,
  DigitizationJob,
  DigitizationSplitApplyResult,
  DigitizationSplitApplySide,
  DigitizationSplitPlanResult,
  DiscogsSearchResult,
} from '@radio/types';
import { waveApiClient } from './clients/http-client';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const SPLIT_TIMEOUT_MS = 180000;

export type FetchDraftMetadataParams = {
  slug: string;
  release: string;
  force?: boolean;
};

export type PlanSplitParams = {
  slug: string;
  noise?: number;
  minSilence?: number;
  tolerance?: number;
  manualCuts?: Record<string, number[]>;
};

export const digitizationApi = {
  listDrafts: async (): Promise<DigitizationDraft[]> => {
    const response = await waveApiClient.get<ApiResponse<DigitizationDraft[]>>(
      '/api/digitization/drafts',
    );
    return response.data.data;
  },

  getDraft: async (slug: string): Promise<DigitizationDraft> => {
    const response = await waveApiClient.get<ApiResponse<DigitizationDraft>>(
      `/api/digitization/drafts/${slug}`,
    );
    return response.data.data;
  },

  getDraftCover: async (slug: string): Promise<Blob> => {
    const response = await waveApiClient.get(
      `/api/digitization/drafts/${slug}/cover`,
      { responseType: 'blob' },
    );
    return response.data as Blob;
  },

  fetchMetadata: async ({
    slug,
    release,
    force,
  }: FetchDraftMetadataParams): Promise<AlbumDataJson> => {
    const response = await waveApiClient.post<ApiResponse<AlbumDataJson>>(
      `/api/digitization/drafts/${slug}/metadata`,
      { release, force },
    );
    return response.data.data;
  },

  updateMetadata: async (
    slug: string,
    data: AlbumDataJson,
  ): Promise<AlbumDataJson> => {
    const response = await waveApiClient.put<ApiResponse<AlbumDataJson>>(
      `/api/digitization/drafts/${slug}/metadata`,
      data,
    );
    return response.data.data;
  },

  searchDiscogs: async (q: string): Promise<DiscogsSearchResult[]> => {
    const response = await waveApiClient.get<
      ApiResponse<DiscogsSearchResult[]>
    >('/api/digitization/discogs/search', { params: { q } });
    return response.data.data;
  },

  planSplit: async ({
    slug,
    noise,
    minSilence,
    tolerance,
    manualCuts,
  }: PlanSplitParams): Promise<DigitizationSplitPlanResult> => {
    const response = await waveApiClient.post<
      ApiResponse<DigitizationSplitPlanResult>
    >(
      `/api/digitization/drafts/${slug}/split/plan`,
      {
        noise,
        minSilence,
        tolerance,
        manualCuts,
      },
      { timeout: SPLIT_TIMEOUT_MS },
    );
    return response.data.data;
  },

  applySplit: async (
    slug: string,
    sides: DigitizationSplitApplySide[],
  ): Promise<DigitizationSplitApplyResult> => {
    const response = await waveApiClient.post<
      ApiResponse<DigitizationSplitApplyResult>
    >(
      `/api/digitization/drafts/${slug}/split/apply`,
      { sides },
      { timeout: SPLIT_TIMEOUT_MS },
    );
    return response.data.data;
  },

  getDraftAudio: async (
    slug: string,
    file: string,
    range?: string,
  ): Promise<Blob> => {
    const response = await waveApiClient.get(
      `/api/digitization/drafts/${slug}/audio/${file}`,
      {
        responseType: 'blob',
        headers: range ? { Range: range } : undefined,
      },
    );
    return response.data as Blob;
  },

  cleanupDraft: async (
    slug: string,
    target: 'sides' | 'folder',
  ): Promise<void> => {
    await waveApiClient.post(`/api/digitization/drafts/${slug}/cleanup`, {
      target,
      confirm: true,
    });
  },

  publishDraft: async (slug: string): Promise<DigitizationJob> => {
    const response = await waveApiClient.post<ApiResponse<DigitizationJob>>(
      `/api/digitization/drafts/${slug}/publish`,
    );
    return response.data.data;
  },

  getJob: async (id: string): Promise<DigitizationJob> => {
    const response = await waveApiClient.get<ApiResponse<DigitizationJob>>(
      `/api/digitization/jobs/${id}`,
    );
    return response.data.data;
  },
};
