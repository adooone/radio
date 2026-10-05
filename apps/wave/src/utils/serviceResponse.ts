import { SUCCESS_MESSAGES, getErrorMessage } from './errorMessages';

export interface ServiceResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ServiceError {
  success: false;
  message: string;
  error?: string;
}

export const ServiceResponseHelper = {
  success<T>(message: string, data?: T): ServiceResponse<T> {
    return {
      success: true,
      message,
      ...(data && { data }),
    };
  },

  error(message: string, error?: string): ServiceError {
    return {
      success: false,
      message,
      ...(error && { error }),
    };
  },

  // Account-related responses
  account: {
    notFound: (id: string | number) =>
      ServiceResponseHelper.error(getErrorMessage.account('NOT_FOUND', id)),
    currentNotFound: (id: string | number) =>
      ServiceResponseHelper.error(
        getErrorMessage.account('CURRENT_NOT_FOUND', id),
      ),
    emailExists: () =>
      ServiceResponseHelper.error(getErrorMessage.account('EMAIL_EXISTS')),
    usernameExists: () =>
      ServiceResponseHelper.error(getErrorMessage.account('USERNAME_EXISTS')),
    created: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.ACCOUNT.CREATED),
    updated: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.ACCOUNT.UPDATED),
    deleted: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.ACCOUNT.DELETED),
  },

  // Collection-related responses
  collection: {
    notFound: (id: string | number) =>
      ServiceResponseHelper.error(getErrorMessage.collection('NOT_FOUND', id)),
    created: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.COLLECTION.CREATED),
    updated: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.COLLECTION.UPDATED),
    deleted: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.COLLECTION.DELETED),
    itemAdded: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.COLLECTION.ITEM_ADDED),
    itemRemoved: () =>
      ServiceResponseHelper.success(SUCCESS_MESSAGES.COLLECTION.ITEM_REMOVED),
    itemsReordered: () =>
      ServiceResponseHelper.success(
        SUCCESS_MESSAGES.COLLECTION.ITEMS_REORDERED,
      ),
  },

  // Stream-related responses
  stream: {
    rtmp: {
      alreadyRunning: () =>
        ServiceResponseHelper.success(getErrorMessage.rtmp('ALREADY_RUNNING')),
      alreadyStopped: () =>
        ServiceResponseHelper.success(getErrorMessage.rtmp('ALREADY_STOPPED')),
      startSuccess: () =>
        ServiceResponseHelper.success(SUCCESS_MESSAGES.STREAM.RTMP_START),
      stopSuccess: () =>
        ServiceResponseHelper.success(SUCCESS_MESSAGES.STREAM.RTMP_STOP),
      restartSuccess: () =>
        ServiceResponseHelper.success(SUCCESS_MESSAGES.STREAM.RTMP_RESTART),
      startFailed: (details?: string) =>
        ServiceResponseHelper.serviceError('RTMP server', 'start', details),
      stopFailed: (details?: string) =>
        ServiceResponseHelper.serviceError('RTMP server', 'stop', details),
      restartFailed: (details?: string) =>
        ServiceResponseHelper.serviceError('RTMP server', 'restart', details),
      configUpdated: (config: unknown) =>
        ServiceResponseHelper.success(
          SUCCESS_MESSAGES.STREAM.CONFIG_UPDATED,
          config,
        ),
      configUpdateFailed: (details?: string) =>
        ServiceResponseHelper.serviceError('RTMP config', 'update', details),
    },
  },

  // Monitoring-related responses
  monitoring: {
    unknownService: (service: string) =>
      ServiceResponseHelper.error(
        getErrorMessage.monitoring('UNKNOWN_SERVICE', service),
      ),
    logsFetchFailed: () =>
      ServiceResponseHelper.error(
        getErrorMessage.monitoring('LOGS_FETCH_FAILED'),
      ),
    statsFetchFailed: () =>
      ServiceResponseHelper.error(
        getErrorMessage.monitoring('STATS_FETCH_FAILED'),
      ),
    healthCheckFailed: () =>
      ServiceResponseHelper.error(
        getErrorMessage.monitoring('HEALTH_CHECK_FAILED'),
      ),
  },

  // Generic responses
  notFound: (resource: string, id?: string | number): ServiceError => {
    const identifier = id ? ` with ID ${id}` : '';
    return ServiceResponseHelper.error(`${resource}${identifier} not found`);
  },

  alreadyExists: (resource: string, identifier?: string): ServiceError => {
    const id = identifier ? ` ${identifier}` : '';
    return ServiceResponseHelper.error(`${resource}${id} already exists`);
  },

  unauthorized: (action?: string): ServiceError => {
    const context = action ? ` to ${action}` : '';
    return ServiceResponseHelper.error(`Unauthorized${context}`);
  },

  forbidden: (action?: string): ServiceError => {
    const context = action ? ` to ${action}` : '';
    return ServiceResponseHelper.error(`Access denied${context}`);
  },

  validationError: (field: string, message: string): ServiceError => {
    return ServiceResponseHelper.error(
      `Validation error: ${field} - ${message}`,
    );
  },

  serviceError: (
    service: string,
    action: string,
    details?: string,
  ): ServiceError => {
    const context = details ? `: ${details}` : '';
    return ServiceResponseHelper.error(`${service} ${action} failed${context}`);
  },
};
