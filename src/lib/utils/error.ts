import type { QueryError } from '@/services/backend/types';

export function isRetryableError(error: QueryError): boolean {
  switch (error.type) {
    case 'network':
      return true;
    case 'api':
      const status = error.error.response?.status;
      return status ? [408, 500, 502, 503, 504].includes(status) : true;
    case 'validation':
      return false;
    default:
      return false;
  }
}

export function getErrorMessage(error: QueryError): string {
  switch (error.type) {
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'api':
      return error.message || 'An error occurred while fetching data.';
    case 'validation':
      return Object.entries(error.fields)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n');
    default:
      return 'An unexpected error occurred.';
  }
}

export function logError(error: QueryError): void {
  // In production, this would send to an error reporting service
  console.error('[Query Error]:', {
    type: error.type,
    message: getErrorMessage(error),
    timestamp: new Date().toISOString(),
    ...(error.type === 'api' && {
      status: error.error.response?.status,
      endpoint: error.error.config?.url
    })
  });
}
