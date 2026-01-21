/**
 * API utilities for error handling and timeouts
 */

// Timeout duration in milliseconds
export const API_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch with timeout using AbortController
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Format error for API response (hide details in production)
 */
export function formatApiError(error: unknown, genericMessage: string) {
  const isDev = process.env.NODE_ENV === 'development';

  if (isTimeoutError(error)) {
    return {
      error: 'Service timeout. Please try again.',
      ...(isDev && { details: 'Request timed out' }),
    };
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorType = error instanceof Error && 'type' in error
    ? (error as { type?: string }).type
    : undefined;

  return {
    error: genericMessage,
    ...(isDev && { message: errorMessage, type: errorType }),
  };
}
