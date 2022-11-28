import type { NextApiRequest } from 'next';

import dayjs from 'dayjs';

const rfs = require('rotating-file-stream');
const logStream = rfs.createStream('access.log', {
  interval: '1d',
  maxFiles: 30,
  path: 'logs',
  size: '5M',
});

export default function logger(req: NextApiRequest, user: User | null) {
  logStream.write(`${dayjs().format('YYYY/MM/DD HH:mm:ss')} ${req.method} ${req.url} ${user?.username || 'guest'}
`);
}
