import type { LogData, MonitoringData } from '@radio/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { monitoringApi } from '../monitoring-api';

// Main monitoring hook - single request every 10 seconds for all monitoring data
export const useMonitoringData = (
  options?: Omit<UseQueryOptions<MonitoringData>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['monitoring', 'data'],
    queryFn: monitoringApi.getMonitoringData,
    refetchInterval: 10000, // Single request every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    ...options,
  });
};

// Logs hook - fetches logs with configurable source and lines
export const useLogs = (
  source = 'all',
  lines = 100,
  options?: Omit<UseQueryOptions<LogData>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['monitoring', 'logs', source, lines],
    queryFn: () => monitoringApi.getLogs(source, lines),
    refetchInterval: 5000, // Refresh logs every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
    ...options,
  });
};

// Service-specific logs hook
export const useServiceLogs = (
  service: string,
  lines = 100,
  options?: Omit<UseQueryOptions<LogData>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['monitoring', 'logs', service, lines],
    queryFn: () => monitoringApi.getServiceLogs(service, lines),
    refetchInterval: 5000, // Refresh logs every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
    ...options,
  });
};
