export function debounce<T = any, P = any>(cb: (...args: P[]) => T, wait = 0) {
  let timeout: NodeJS.Timeout;
  return (...args: P[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb.apply(null, args);
    }, wait);
  };
}
