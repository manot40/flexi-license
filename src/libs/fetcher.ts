type FetcherOptions = {
  body?: any;
  keepalive?: boolean;
  headers?: { [key: string]: string };
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
};

export default async function fetcher<T = any>(url: string, { method = 'GET', body, ...opts } = {} as FetcherOptions) {
  const res = await fetch(url, {
    ...opts,
    method,
    body: typeof body == 'object' ? JSON.stringify(body) : body,
    headers: {
      'Content-Type': typeof body == 'object' ? 'application/json' : '*/*',
      ...opts.headers,
    },
  });

  const data = (await res.json()) as any;

  if (res.status < 400) return data as T;

  const err = new Error(data.message || res.statusText) as any;
  err.name = 'HTTPError';
  err.status = res.status;
  err.data = data;

  throw err;
}
