import multer from 'multer'

// Restrict file storage in memory to avoid leaking PHI to disk
const storage = multer.memoryStorage()

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `Unsupported file type "${file.mimetype}". Only PDF, PNG, and JPG medical reports are accepted.`
      )
    )
  }
}

export const uploadReport = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
  fileFilter,
})
