/**
 * Format duration in seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted string like "2h 30m" or "45m" or "30s"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  // Only show seconds if there are no hours or minutes
  if (hours === 0 && minutes === 0 && secs > 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ') || '0s';
}
