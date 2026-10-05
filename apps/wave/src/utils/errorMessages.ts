// Centralized error messages for consistent API responses
export const ERROR_MESSAGES = {
  // Authentication & Authorization
  AUTH: {
    UNAUTHORIZED: 'Authentication required',
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Invalid or expired token',
    FORBIDDEN: 'Access denied',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  },

  // Resource Management
  RESOURCE: {
    NOT_FOUND: 'Resource not found',
    ALREADY_EXISTS: 'Resource already exists',
    CONFLICT: 'Resource conflict',
    VALIDATION_FAILED: 'Validation failed',
    INVALID_INPUT: 'Invalid input provided',
  },

  // Account Management
  ACCOUNT: {
    NOT_FOUND: (id: string | number) => `Account with ID ${id} not found`,
    CURRENT_NOT_FOUND: (id: string | number) =>
      `Current account with ID ${id} not found`,
    EMAIL_EXISTS: 'Email already exists',
    USERNAME_EXISTS: 'Username already exists',
    CREATED_SUCCESS: 'Account created successfully',
    UPDATED_SUCCESS: 'Account updated successfully',
    DELETED_SUCCESS: 'Account deleted successfully',
  },

  // Collection Management
  COLLECTION: {
    NOT_FOUND: (id: string | number) => `Collection with ID ${id} not found`,
    CREATED_SUCCESS: 'Collection created successfully',
    UPDATED_SUCCESS: 'Collection updated successfully',
    DELETED_SUCCESS: 'Collection deleted successfully',
    ITEM_ADDED_SUCCESS: 'Item added to collection successfully',
    ITEM_REMOVED_SUCCESS: 'Item removed from collection successfully',
    ITEMS_REORDERED_SUCCESS: 'Collection items reordered successfully',
  },

  // Stream Services
  STREAM: {
    RTMP: {
      ALREADY_RUNNING: 'RTMP server is already running',
      ALREADY_STOPPED: 'RTMP server is already stopped',
      START_SUCCESS: 'RTMP server started successfully',
      STOP_SUCCESS: 'RTMP server stopped successfully',
      RESTART_SUCCESS: 'RTMP server restarted successfully',
      START_FAILED: 'RTMP server failed to start',
      STOP_FAILED: 'RTMP server failed to stop',
      RESTART_FAILED: 'RTMP server failed to restart',
      CONFIG_UPDATED_SUCCESS: 'RTMP configuration updated successfully',
      CONFIG_UPDATE_FAILED: 'RTMP configuration update failed',
    },
  },

  // Monitoring Services
  MONITORING: {
    UNKNOWN_SERVICE: (service: string) =>
      `Unknown service: ${service}. Supported services: rtmp, wave`,
    LOGS_FETCH_FAILED: 'Failed to fetch logs',
    STATS_FETCH_FAILED: 'Failed to fetch service statistics',
    HEALTH_CHECK_FAILED: 'Health check failed',
  },

  // Validation Errors
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Password must be at least 8 characters long',
    INVALID_USERNAME: 'Username must be between 3 and 50 characters',
    INVALID_ID: 'Invalid ID format',
    INVALID_PORT: 'Port must be between 1 and 65535',
    INVALID_CHUNK_SIZE: 'Chunk size must be between 128 and 65536',
    INVALID_MAX_CONNECTIONS: 'Max connections must be between 1 and 10000',
    INVALID_FRAGMENT_LENGTH: 'Fragment length must be between 1 and 30',
    INVALID_PLAYLIST_LENGTH: 'Playlist length must be between 10 and 300',
  },

  // System Errors
  SYSTEM: {
    INTERNAL_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    TIMEOUT: 'Request timeout',
    RATE_LIMITED: 'Too many requests',
  },

  // File Operations
  FILE: {
    NOT_FOUND: (path: string) => `File not found: ${path}`,
    READ_FAILED: (path: string) => `Failed to read file: ${path}`,
    WRITE_FAILED: (path: string) => `Failed to write file: ${path}`,
    DELETE_FAILED: (path: string) => `Failed to delete file: ${path}`,
  },

  // Database Operations
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed',
    QUERY_FAILED: 'Database query failed',
    TRANSACTION_FAILED: 'Database transaction failed',
    CONSTRAINT_VIOLATION: 'Database constraint violation',
  },
} as const;

// Error message keys for type safety
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type AuthErrorKey = keyof typeof ERROR_MESSAGES.AUTH;
export type ResourceErrorKey = keyof typeof ERROR_MESSAGES.RESOURCE;
export type AccountErrorKey = keyof typeof ERROR_MESSAGES.ACCOUNT;
export type CollectionErrorKey = keyof typeof ERROR_MESSAGES.COLLECTION;
export type StreamErrorKey = keyof typeof ERROR_MESSAGES.STREAM;
export type RtmpErrorKey = keyof typeof ERROR_MESSAGES.STREAM.RTMP;
export type MonitoringErrorKey = keyof typeof ERROR_MESSAGES.MONITORING;
export type ValidationErrorKey = keyof typeof ERROR_MESSAGES.VALIDATION;
export type SystemErrorKey = keyof typeof ERROR_MESSAGES.SYSTEM;
export type FileErrorKey = keyof typeof ERROR_MESSAGES.FILE;
export type DatabaseErrorKey = keyof typeof ERROR_MESSAGES.DATABASE;

// Helper function to get error messages with type safety
export const getErrorMessage = {
  auth: (key: AuthErrorKey) => ERROR_MESSAGES.AUTH[key],
  resource: (key: ResourceErrorKey) => ERROR_MESSAGES.RESOURCE[key],
  account: (key: AccountErrorKey, arg?: string | number) => {
    const message = ERROR_MESSAGES.ACCOUNT[key];
    return typeof message === 'function' ? message(arg || '') : message;
  },
  collection: (key: CollectionErrorKey, arg?: string | number) => {
    const message = ERROR_MESSAGES.COLLECTION[key];
    return typeof message === 'function' ? message(arg || '') : message;
  },
  rtmp: (key: RtmpErrorKey) => ERROR_MESSAGES.STREAM.RTMP[key],
  monitoring: (key: MonitoringErrorKey, arg?: string) => {
    const message = ERROR_MESSAGES.MONITORING[key];
    return typeof message === 'function' ? message(arg || '') : message;
  },
  validation: (key: ValidationErrorKey, arg?: string) => {
    const message = ERROR_MESSAGES.VALIDATION[key];
    return typeof message === 'function' ? message(arg || '') : message;
  },
  system: (key: SystemErrorKey) => ERROR_MESSAGES.SYSTEM[key],
  file: (key: FileErrorKey, arg?: string) => {
    const message = ERROR_MESSAGES.FILE[key];
    return typeof message === 'function' ? message(arg || '') : message;
  },
  database: (key: DatabaseErrorKey) => ERROR_MESSAGES.DATABASE[key],
};

// Success message keys for consistency
export const SUCCESS_MESSAGES = {
  ACCOUNT: {
    CREATED: 'Account created successfully',
    UPDATED: 'Account updated successfully',
    DELETED: 'Account deleted successfully',
    LOGIN: 'Login successful',
  },
  COLLECTION: {
    CREATED: 'Collection created successfully',
    UPDATED: 'Collection updated successfully',
    DELETED: 'Collection deleted successfully',
    ITEM_ADDED: 'Item added to collection successfully',
    ITEM_REMOVED: 'Item removed from collection successfully',
    ITEMS_REORDERED: 'Collection items reordered successfully',
  },
  STREAM: {
    RTMP_START: 'RTMP server started successfully',
    RTMP_STOP: 'RTMP server stopped successfully',
    RTMP_RESTART: 'RTMP server restarted successfully',
    CONFIG_UPDATED: 'Configuration updated successfully',
  },
  MONITORING: {
    DATA_FETCHED: 'Monitoring data fetched successfully',
    LOGS_FETCHED: 'Logs fetched successfully',
    HEALTH_CHECKED: 'Health check completed successfully',
  },
} as const;

export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
