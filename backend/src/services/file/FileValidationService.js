/**
 * Servicio de Validación de Comprobantes de Pago
 * Específico para archivos de comprobantes: PDF, JPG, PNG
 *
 * @author Sistema de Gestión Scouts
 * @version 4.0.0 (Ultra-simplificado para comprobantes)
 */

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

  /**
   * Valida un comprobante de pago
   *
   * @param {Object} file - Archivo de multer
   * @returns {Object} Resultado de validación
   */
  static validatePaymentReceipt(file) {
    const result = {
      isValid: true,
      errors: [],
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }

    // Validar tamaño
    if (file.size > this.MAX_SIZE) {
      result.isValid = false
      result.errors.push(
        `Archivo muy grande. Máximo permitido: ${this.formatSize(
          this.MAX_SIZE
        )}`
      )
    }

    // Validar tipo
    if (!this.ALLOWED_TYPES[file.mimetype]) {
      result.isValid = false
      result.errors.push('Tipo de archivo no permitido. Solo PDF, JPG o PNG')
    }

    // Validar extensión
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExts = this.ALLOWED_TYPES[file.mimetype] || []
    if (!allowedExts.includes(ext)) {
      result.isValid = false
      result.errors.push('Extensión de archivo no coincide con el tipo')
    }

    return result
  }

  /**
   * Formatea el tamaño de archivo
   */
  static formatSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Genera hash para identificación única
   */
  static generateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }
}

module.exports = FileValidationService
