// Radio project shared types

// Core API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Legacy types - used by frontend app but not admin
export interface StreamInfo {
  id: string;
  name: string;
  url: string;
  isLive: boolean;
  listeners: number;
  bitrate: number;
  format: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// Database Types (following polissya pattern)
export interface Account {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string | null;
  isPublic: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: number;
  collectionId: number;
  audioFileId: number;
  order: number;
  addedAt: string;
}

export interface AudioFile {
  id: number;
  name: string;
  path: string;
  duration: string;
  size: number;
  format: string;
  uploadedBy: number;
  uploadedAt: string;
  metadata: string | null;
}

export interface Session {
  id: number;
  accountId: number;
  token: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface StreamConfig {
  id: number;
  name: string;
  rtmpUrl: string;
  streamKey: string;
  inputUrl: string;
  isActive: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Album metadata types (from data.json / album.example.json)
export interface RecordingDetails {
  period?: string;
  location?: string;
  exceptions?: string;
}

export interface ReleaseInfo {
  label?: string;
  distributor?: string;
  catalog_number?: string;
  country?: string;
  issue_year?: number;
  released?: string;
  format?: string;
  phonographic_copyright?: string;
}

export interface DiscogsInfo {
  release_id?: number;
  master_id?: number | null;
  url?: string;
}

export interface TracklistItem {
  position: string;
  title: string;
  duration?: string;
}

export interface PersonnelItem {
  name: string;
  roles: string[];
}

export interface Production {
  engineer?: string;
  producers?: string[];
  coordination?: string;
  thanks?: string;
  mastering?: string;
}

export interface Visuals {
  photography?: string[];
  design?: string;
  sleeve_printing?: string;
}

/** Shape of data.json in album folders */
export interface AlbumDataJson {
  album_title?: string;
  artist?: string;
  recording_year?: number;
  recording_details?: RecordingDetails;
  release_info?: ReleaseInfo;
  discogs?: DiscogsInfo;
  tracklist?: TracklistItem[];
  personnel?: PersonnelItem[];
  production?: Production;
  visuals?: Visuals;
  additional_info?: string;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  year: number | null;
  cover: string | null;
  coverImageUrl?: string | null;
  description: string | null;
  tags: string | null;
  isPublic: number;
  ownerId: number;
  folderSlug: string | null;
  hasMedia: number;
  isPublished: number;
  releaseYear: number | null;
  rpmSpeed: string | null;
  vinylCondition: string | null;
  digitizationDate: string | null;
  equipmentUsed: string | null;
  recordingDetails?: RecordingDetails | null;
  releaseInfo?: ReleaseInfo | null;
  personnel?: PersonnelItem[] | null;
  production?: Production | null;
  visuals?: Visuals | null;
  additionalInfo?: string | null;
  createdAt: string;
  updatedAt: string;
  songCount?: number;
}

export interface Song {
  id: number;
  albumId: number;
  audioFileId: number;
  trackNumber: number;
  position?: string | null;
  title: string;
  artist: string | null;
  duration: string;
  format: string;
  fileSlug: string | null;
  audioUrl: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Streaming & Monitoring Types
export interface StreamHealth {
  isConnected: boolean;
  lastConnectionTime: string | null;
  totalFramesSent: number;
  currentBitrate: number;
  connectionErrors: number;
  lastHealthCheck: string | null;
}

export interface TelegramServiceStats {
  isRunning: boolean;
  pm2Status: {
    pid: number;
    status: string;
    cpu: number;
    memory: number;
    uptime: number;
  } | null;
  daemonStatus: {
    status: 'initializing' | 'running' | 'stopped' | 'error';
    pid: number | null;
    ffmpegPid: number | null;
    restartAttempts: number;
    lastUpdate: string | null;
    streamHealth?: StreamHealth;
  } | null;
  lastHealthCheck: string;
  streamKey?: string; // Masked stream key for identification
}

export interface RtmpServiceStats {
  isRunning: boolean;
  containerName: string;
  status: string;
  stats: {
    container: {
      cpuPercent: number;
      memoryUsage: number; // in bytes
      memoryLimit: number; // in bytes
      memoryPercent: number;
      networkIn: number; // in GB
      networkOut: number; // in GB
    } | null;
    rtmp: {
      activePublishers: number;
      totalConnections: number;
      applications: Array<{
        name: string;
        streams: Array<{
          name: string;
          bandwidth: number;
          clients: number;
        }>;
      }>;
    } | null;
  } | null;
  lastHealthCheck: string;
}

// Admin App - Monitoring Types (USED)
export interface MonitoringData {
  services: {
    telegram: TelegramServiceStats | null;
    rtmp: RtmpServiceStats | null;
  };
  timestamp: string;
  uptime: number;
}

// Admin App - Stream Control Types (USED)
export interface TelegramStreamConfig {
  rtmpUrl: string;
  streamKey: string;
  inputUrl: string;
}

export interface RtmpServerConfig {
  port: number;
  chunkSize: number;
  maxConnections: number;
  outQueue: number;
  outCork: number;
  pingInterval: number;
  pingTimeout: number;
  application: {
    name: string;
    allowPublishFrom: string[];
    allowPlayFrom: string;
    hls: {
      enabled: boolean;
      fragmentLength: number;
      playlistLength: number;
      cleanup: boolean;
    };
    recording: {
      enabled: boolean;
      path?: string;
    };
    dropIdlePublisher: number;
    syncDelay: number;
  };
}

export interface StreamControlResponse {
  success: boolean;
  message: string;
}

export interface ConfigResponse<T> {
  success: boolean;
  config?: T;
  error?: string;
}

// Backend/Internal Types - not used in admin frontend but kept for backend
export interface SystemHealth {
  telegram: TelegramServiceStats | null;
  rtmp: RtmpServiceStats | null;
  timestamp: string;
}

export interface ServiceMetrics {
  uptime: number;
  restarts: number;
  errors: number;
  lastError?: string;
  performance: {
    cpu: number;
    memory: number;
    network: {
      in: number;
      out: number;
    };
  };
}

// Logging Types
export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  source: string;
}

export interface LogData {
  entries: LogEntry[];
  totalLines: number;
  source: string;
  lastUpdated: string;
}

export type QualityPreset = 'low' | 'medium' | 'high';

// Vinyl digitization pipeline types (admin "Оцифровка" feature)

/**
 * Derived from inbox folder contents, in order of progress:
 * no split wavs yet -> sides but no tracks -> tracks but not encoded -> encoded under MEDIA_ROOT_PATH.
 */
export type DigitizationStage =
  | 'awaiting-sides'
  | 'ready-to-split'
  | 'ready-to-encode'
  | 'on-air';

/** A filesystem-derived draft: a `band-slug_album-slug` folder under MEDIA_INBOX_PATH. */
export interface DigitizationDraft {
  slug: string;
  artistSlug: string;
  albumSlug: string;
  artist: string;
  title: string;
  recordingYear: number | null;
  issueYear: number | null;
  label: string;
  country: string;
  hasMetadata: boolean;
  trackCount: number;
  hasCover: boolean;
  sides: string[];
  trackFiles: string[];
  encodedCount: number;
  stage: DigitizationStage;
  metadata?: AlbumDataJson;
}

/** One row of a Discogs `/database/search?type=release&format=Vinyl` response. */
export interface DiscogsSearchResult {
  id: number;
  title: string;
  year: string;
  country: string;
  format: string[];
  label: string[];
  catno: string;
  thumb: string;
}

export type DigitizationCutKind = 'gap' | 'refined' | 'expected' | 'manual';

export interface DigitizationCut {
  time: number;
  kind: DigitizationCutKind;
}

export interface DigitizationTrackPlan {
  index: number;
  fileSlug: string;
  position?: string;
  title?: string;
  start: number;
  end: number;
  expectedDuration?: number;
  warnings: string[];
}

export interface DigitizationPeaks {
  bucketMs: number;
  min: number[];
  max: number[];
}

export interface DigitizationSplitPlan {
  side: string;
  duration: number;
  cuts: DigitizationCut[];
  tracks: DigitizationTrackPlan[];
  warnings: string[];
  peaks: DigitizationPeaks;
}

export interface DigitizationSplitPlanResult {
  missingSides: string[];
  sides: DigitizationSplitPlan[];
}

export interface DigitizationSplitApplyTrack {
  fileSlug: string;
  start: number;
  end: number;
}

export interface DigitizationSplitApplySide {
  side: string;
  tracks: DigitizationSplitApplyTrack[];
}

export interface DigitizationSplitApplyResult {
  written: string[];
}

export type DigitizationJobKind = 'split' | 'encode' | 'publish';
export type DigitizationJobStatus = 'pending' | 'running' | 'success' | 'error';

export interface DigitizationJob {
  id: string;
  kind: DigitizationJobKind;
  status: DigitizationJobStatus;
  progress: string[];
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
