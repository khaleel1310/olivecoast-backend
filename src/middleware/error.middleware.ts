import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Log the full stack trace on our server console for fast debugging
  console.error('❌ [Global Error Interceptor]:');
  console.error(err.stack || err);

  // 2. Handle known Prisma relational or parsing constraint errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database operation failed. Verify constraint inputs.',
      code: err.code
    });
  }

  // 3. Fallback for any unhandled native javascript runtime exceptions
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error occurred at Olive Coast Kitchen.';

  return res.status(statusCode).json({
    error: message
  });
};