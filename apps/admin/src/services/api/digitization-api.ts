import type {
  AlbumDataJson,
  DigitizationDraft,
  DigitizationJob,
  DigitizationSplitApplyResult,
  DigitizationSplitApplySide,
  DigitizationSplitPlanResult,
  DigitizationUploadSession,
  DiscogsSearchResult,
} from '@radio/types';
import { waveApiClient } from './clients/http-client';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const SPLIT_TIMEOUT_MS = 180000;
const CHUNK_UPLOAD_TIMEOUT_MS = 60000;

export type CreateDraftInput =
  | { slug: string }
  | { artist: string; album: string };

export type UploadChunkOptions = {
  signal?: AbortSignal;
  onUploadProgress?: (uploadedBytes: number) => void;
};

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

  createDraft: async (input: CreateDraftInput): Promise<DigitizationDraft> => {
    const response = await waveApiClient.post<ApiResponse<DigitizationDraft>>(
      '/api/digitization/drafts',
      input,
    );
    return response.data.data;
  },

  initUpload: async (
    slug: string,
    body: { filename: string; size: number; chunkSize: number },
  ): Promise<DigitizationUploadSession> => {
    const response = await waveApiClient.post<
      ApiResponse<DigitizationUploadSession>
    >(`/api/digitization/drafts/${slug}/uploads`, body);
    return response.data.data;
  },

  getUploadStatus: async (
    slug: string,
    uploadId: string,
  ): Promise<DigitizationUploadSession> => {
    const response = await waveApiClient.get<
      ApiResponse<DigitizationUploadSession>
    >(`/api/digitization/drafts/${slug}/uploads/${uploadId}/status`);
    return response.data.data;
  },

  uploadChunk: async (
    slug: string,
    uploadId: string,
    chunkIndex: number,
    chunk: Blob,
    options: UploadChunkOptions = {},
  ): Promise<void> => {
    await waveApiClient.put(
      `/api/digitization/drafts/${slug}/uploads/${uploadId}/chunks/${chunkIndex}`,
      chunk,
      {
        headers: { 'Content-Type': 'application/octet-stream' },
        timeout: CHUNK_UPLOAD_TIMEOUT_MS,
        signal: options.signal,
        onUploadProgress: options.onUploadProgress
          ? (event) => options.onUploadProgress?.(event.loaded)
          : undefined,
      },
    );
  },

  completeUpload: async (
    slug: string,
    uploadId: string,
  ): Promise<{ filename: string; size: number }> => {
    const response = await waveApiClient.post<
      ApiResponse<{ filename: string; size: number }>
    >(`/api/digitization/drafts/${slug}/uploads/${uploadId}/complete`);
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
