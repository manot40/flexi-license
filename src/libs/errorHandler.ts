import {
  PrismaClientRustPanicError as DBFatalErr,
  PrismaClientValidationError as DBValidationErr,
  PrismaClientKnownRequestError as DBKnownReqErr,
  PrismaClientUnknownRequestError as DBUnknownReqErr,
} from '@prisma/client/runtime';

import { AxiosError } from 'axios';

type ErrorResponse = {
  code: number;
  message: string;
};

export default function errorHandler(err: any): ErrorResponse {
  const res = {
    code: 500,
    message: 'Internal server error',
  };

  if (err instanceof DBValidationErr) {
    res.code = 400;
    res.message = 'Validation error, please check your query data';
  }

  if (err instanceof DBKnownReqErr || err instanceof DBUnknownReqErr) {
    res.code = 400;
    res.message = 'Server cannot processing your request';
  }

  if (err instanceof DBFatalErr) {
    console.error('Fatal error occurred in the database engine');
  }

  if (err instanceof AxiosError) {
    const { response: res } = err;
    console.error(res?.status, res?.data);
  }

  console.error(err.message);

  return res;
}
