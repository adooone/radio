import type { DigitizationSplitApplySide } from '@radio/types';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { digitizationApi } from '../digitization-api';

export type SplitPlanParams = {
  noise: number;
  minSilence: number;
  tolerance: number;
  manualCuts?: Record<string, number[]>;
};

export const digitizationKeys = {
  all: ['digitization'] as const,
  drafts: () => [...digitizationKeys.all, 'drafts'] as const,
  details: () => [...digitizationKeys.all, 'detail'] as const,
  detail: (slug: string) => [...digitizationKeys.details(), slug] as const,
  search: (q: string) => [...digitizationKeys.all, 'search', q] as const,
  cover: (slug: string) => [...digitizationKeys.all, 'cover', slug] as const,
  plan: (slug: string, params: SplitPlanParams) =>
    [...digitizationKeys.all, 'plan', slug, params] as const,
  job: (id: string) => [...digitizationKeys.all, 'job', id] as const,
};

export const useDigitizationDrafts = () => {
  return useQuery({
    queryKey: digitizationKeys.drafts(),
    queryFn: digitizationApi.listDrafts,
  });
};

export const useDigitizationDraft = (slug: string) => {
  return useQuery({
    queryKey: digitizationKeys.detail(slug),
    queryFn: () => digitizationApi.getDraft(slug),
    enabled: !!slug,
  });
};

export const useCreateDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: digitizationApi.createDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
    },
  });
};

export const useDraftCover = (slug: string, hasCover: boolean) => {
  return useQuery({
    queryKey: digitizationKeys.cover(slug),
    queryFn: () => digitizationApi.getDraftCover(slug),
    enabled: hasCover && !!slug,
  });
};

export const useDiscogsSearch = (q: string) => {
  return useQuery({
    queryKey: digitizationKeys.search(q),
    queryFn: () => digitizationApi.searchDiscogs(q),
    enabled: q.trim().length > 0,
  });
};

export const useFetchDraftMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: digitizationApi.fetchMetadata,
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({
        queryKey: digitizationKeys.detail(slug),
      });
      queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
    },
  });
};

export const useUpdateDraftMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: Parameters<typeof digitizationApi.updateMetadata>[1];
    }) => digitizationApi.updateMetadata(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({
        queryKey: digitizationKeys.detail(slug),
      });
      queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
    },
  });
};

export const useSplitPlan = (
  slug: string,
  params: SplitPlanParams,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: digitizationKeys.plan(slug, params),
    queryFn: () => digitizationApi.planSplit({ slug, ...params }),
    enabled: enabled && !!slug,
    placeholderData: keepPreviousData,
    retry: false,
  });
};

export const useApplySplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      sides,
    }: {
      slug: string;
      sides: DigitizationSplitApplySide[];
    }) => digitizationApi.applySplit(slug, sides),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({
        queryKey: digitizationKeys.detail(slug),
      });
      queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
    },
  });
};

export const usePublishDraft = () => {
  return useMutation({
    mutationFn: digitizationApi.publishDraft,
  });
};

export const useCleanupDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      target,
    }: {
      slug: string;
      target: 'sides' | 'folder';
    }) => digitizationApi.cleanupDraft(slug, target),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({
        queryKey: digitizationKeys.detail(slug),
      });
      queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
    },
  });
};

const ACTIVE_JOB_POLL_INTERVAL_MS = 1500;

export const useDigitizationJob = (jobId: string | null) => {
  return useQuery({
    queryKey: digitizationKeys.job(jobId ?? ''),
    queryFn: () => digitizationApi.getJob(jobId as string),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const job = query.state.data;
      if (!job || job.status === 'running' || job.status === 'pending') {
        return ACTIVE_JOB_POLL_INTERVAL_MS;
      }
      return false;
    },
  });
};
