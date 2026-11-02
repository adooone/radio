export const sideLetterFromFile = (wavFile: string): string =>
  wavFile.replace(/^side-/, '').replace(/\.wav$/, '');

export const formatSeconds = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } })
      .response;
    if (response?.data?.error) {
      return response.data.error;
    }
  }
  return 'Не вдалося виконати операцію.';
}
