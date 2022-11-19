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
  }).then((res) => res.json());

  return res as T;
}
