export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export type QualityPreset = 'low' | 'medium' | 'high';
