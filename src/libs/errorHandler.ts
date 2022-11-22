import {
  PrismaClientRustPanicError as DBFatalErr,
  PrismaClientValidationError as DBValidationErr,
  PrismaClientKnownRequestError as DBKnownReqErr,
  PrismaClientUnknownRequestError as DBUnknownReqErr,
} from '@prisma/client/runtime';

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
    console.error(err.message);
  }

  if (err instanceof DBKnownReqErr || err instanceof DBUnknownReqErr) {
    res.code = 400;
    res.message = 'Server cannot processing your request';
    console.error(err.message);
  }

  if (err instanceof DBFatalErr) {
    console.error('Fatal error occurred in the database engine');
    console.error(err.message);
  }

  return res;
}
