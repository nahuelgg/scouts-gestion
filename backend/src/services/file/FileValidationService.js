
const path = require('path')
const crypto = require('crypto')

class FileValidationService {
  // Tipos de archivo permitidos para comprobantes
  static ALLOWED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
  }

  static MAX_SIZE = 5 * 1024 * 1024 // 5MB máximo

  static validatePaymentReceipt(file) {
    const result = {
      isValid: true,
      errors: [],
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }
    if (file.size > this.MAX_SIZE) {
      result.isValid = false
      result.errors.push(
        `Archivo muy grande. Máximo permitido: ${this.formatSize(
          this.MAX_SIZE
        )}`
      )
    }
    if (!this.ALLOWED_TYPES[file.mimetype]) {
      result.isValid = false
      result.errors.push('Tipo de archivo no permitido. Solo PDF, JPG o PNG')
    }
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExts = this.ALLOWED_TYPES[file.mimetype] || []
    if (!allowedExts.includes(ext)) {
      result.isValid = false
      result.errors.push('Extensión de archivo no coincide con el tipo')
    }

    return result
  }

  static formatSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static generateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }
}

module.exports = FileValidationService
