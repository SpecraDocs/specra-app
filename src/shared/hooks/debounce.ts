export function debounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  }) as T;
}
