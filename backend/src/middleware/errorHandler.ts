import { Request, Response, NextFunction } from 'express'
import multer from 'multer'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Never log Protected Health Information (PHI) in production logs
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err)

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'File size exceeds maximum 10MB limit. Please upload a smaller file.',
        code: 'FILE_TOO_LARGE',
        timestamp: new Date().toISOString(),
      })
      return
    }

    res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
      code: err.code || 'UPLOAD_ERROR',
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Handle file filter rejection
  if (
    err.message &&
    (err.message.includes('Unsupported file type') ||
      err.message.includes('Only PDF, PNG, and JPG'))
  ) {
    res.status(400).json({
      success: false,
      error: err.message,
      code: 'INVALID_FILE_TYPE',
      timestamp: new Date().toISOString(),
    })
    return
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500)

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred',
    code: err.code || 'SERVER_ERROR',
    timestamp: new Date().toISOString(),
  })
}

