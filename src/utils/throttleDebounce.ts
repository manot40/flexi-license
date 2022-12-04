export function throttleDebounce<T = any, P = any>(cb: (...args: P[]) => T, delay = 0) {
  let timeout: NodeJS.Timeout;
  let called: boolean;

  return (...args: P[]) => {
    if (timeout) clearTimeout(timeout);

    if (!called) {
      cb.apply(null, args);
      called = true;
      setTimeout(() => {
        called = false;
      }, delay);
    } else {
      timeout = setTimeout(cb, delay);
    }
  };
}
