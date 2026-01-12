const Pago = require('../models/Pago')
const Persona = require('../models/Persona')
const logger = require('../utils/logger')
const path = require('path')
const fs = require('fs')

const getPagos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      socio = '',
      metodoPago = '',
      tipoPago = '',
      startDate = '',
      endDate = '',
      includeDeleted = true,
    } = req.query

    // Construir filtros
    let filter = {}

    // Por defecto mostrar todos (incluidos eliminados)
    // Solo excluir eliminados si se solicita específicamente
    if (includeDeleted === 'false') {
      filter.deleted = { $ne: true }
    }

    if (metodoPago) {
      filter.metodoPago = metodoPago
    }

    if (tipoPago) {
      filter.tipoPago = tipoPago
    }

    if (startDate || endDate) {
      filter.fechaPago = {}
      if (startDate) filter.fechaPago.$gte = new Date(startDate)
      if (endDate) filter.fechaPago.$lte = new Date(endDate)
    }

    if (socio) {
      // Buscar personas que coincidan con el término de búsqueda (nombre, apellido, dni)
      const personas = await Persona.find({
        $or: [
          { nombre: new RegExp(socio, 'i') },
          { apellido: new RegExp(socio, 'i') },
          { dni: new RegExp(socio, 'i') },
        ],
      }).select('_id')

      const personaIds = personas.map((p) => p._id)

      // Filtrar pagos de esos socios
      filter.socio = { $in: personaIds }
    }

    const pagos = await Pago.find(filter)
      .populate({
        path: 'socio',
        select: 'nombre apellido dni',
        populate: {
          path: 'rama',
          select: 'nombre',
        },
      })
      .populate({
        path: 'registradoPor',
        select: 'username',
        populate: {
          path: 'persona',
          select: 'nombre apellido',
        },
      })
      .populate({
        path: 'modificadoPor',
        select: 'username',
        populate: {
          path: 'persona',
          select: 'nombre apellido',
        },
      })
      .sort({ fechaPago: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Pago.countDocuments(filter)

    res.json({
      pagos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const getPagoById = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)
      .populate({
        path: 'socio',
        populate: {
          path: 'rama',
          select: 'nombre',
        },
      })
      .populate({
        path: 'registradoPor',
        select: 'username',
        populate: {
          path: 'persona',
          select: 'nombre apellido',
        },
      })
      .populate({
        path: 'modificadoPor',
        select: 'username',
        populate: {
          path: 'persona',
          select: 'nombre apellido',
        },
      })

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }

    res.json(pago)
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const createPago = async (req, res) => {
  try {
    const {
      socio,
      monto,
      fechaPago,
      mesCorrespondiente,
      metodoPago,
      tipoPago,
      observaciones,
    } = req.body
    if (!socio || !monto || !mesCorrespondiente || !metodoPago || !tipoPago) {
      return res.status(400).json({
        message:
          'Socio, monto, mes correspondiente y método de pago son requeridos',
      })
    }
    const montoNumerico = parseFloat(monto)
    if (
      isNaN(montoNumerico) ||
      montoNumerico <= 0 ||
      !Number.isFinite(montoNumerico)
    ) {
      return res.status(400).json({
        message: 'El monto debe ser un número válido mayor a 0',
      })
    }
    const socioExistente = await Persona.findById(socio)
    if (!socioExistente) {
      return res.status(400).json({ message: 'Socio no encontrado' })
    }
    const pagoData = {
      socio,
      monto: montoNumerico,
      fechaPago: fechaPago || new Date(),
      mesCorrespondiente,
      metodoPago,
      tipoPago,
      observaciones,
      registradoPor: req.user._id,
    }

    // Si hay archivo de comprobante
    if (req.file) {
      const year = new Date().getFullYear()
      const comprobanteData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `${year}/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }

      // Agregar información de validación avanzada si está disponible
      if (req.fileValidation) {
        comprobanteData.validation = {
          riskLevel: req.fileValidation.riskLevel,
          riskScore: req.fileValidation.riskScore,
          fileHash: req.fileValidation.fileHash,
          processingTime: req.fileValidation.processingTime,
          detectedType: req.fileValidation.metadata?.detectedType,
          validationDate: new Date().toISOString(),
        }

        // Si hubo warnings, registrarlos
        if (
          req.fileValidation.warnings &&
          req.fileValidation.warnings.length > 0
        ) {
          comprobanteData.validation.warnings = req.fileValidation.warnings
        }

        // Marcar para revisión si es riesgo medio (ya que los de alto van a cuarentena)
        if (req.fileValidation.riskLevel === 'MEDIUM') {
          comprobanteData.needsReview = true
          comprobanteData.reviewReason =
            'Archivo con riesgo medio requiere revisión'
        }
      }

      pagoData.comprobante = comprobanteData
    }

    const pago = await Pago.create(pagoData)
    const pagoCreado = await Pago.findById(pago._id)
      .populate({
        path: 'socio',
        select: 'nombre apellido dni',
        populate: {
          path: 'rama',
          select: 'nombre',
        },
      })
      .populate({
        path: 'registradoPor',
        select: 'username',
        populate: {
          path: 'persona',
          select: 'nombre apellido',
        },
      })

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      pago: pagoCreado,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const updatePago = async (req, res) => {
  try {
    const { monto, fechaPago, metodoPago, tipoPago, observaciones, estado } =
      req.body

    const pago = await Pago.findById(req.params.id)

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }
    if (monto) {
      const montoNumerico = parseFloat(monto)
      if (
        isNaN(montoNumerico) ||
        montoNumerico <= 0 ||
        !Number.isFinite(montoNumerico)
      ) {
        return res.status(400).json({
          message: 'El monto debe ser un número válido mayor a 0',
        })
      }
      pago.monto = montoNumerico
    }
    if (fechaPago) pago.fechaPago = fechaPago
    if (metodoPago) pago.metodoPago = metodoPago
    if (tipoPago) pago.tipoPago = tipoPago
    if (observaciones !== undefined) pago.observaciones = observaciones
    if (estado) pago.estado = estado

    // Registrar quién modificó el pago
    pago.modificadoPor = req.user._id

    // Si hay nuevo archivo de comprobante
    if (req.file) {
      if (pago.comprobante && pago.comprobante.path) {
        const oldFilePath = path.join(
          process.env.UPLOAD_PATH || './uploads',
          pago.comprobante.path
        )
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      const year = new Date().getFullYear()
      const comprobanteData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `${year}/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }

      // Agregar información de validación avanzada si está disponible
      if (req.fileValidation) {
        comprobanteData.validation = {
          riskLevel: req.fileValidation.riskLevel,
          riskScore: req.fileValidation.riskScore,
          fileHash: req.fileValidation.fileHash,
          processingTime: req.fileValidation.processingTime,
          detectedType: req.fileValidation.metadata?.detectedType,
          validationDate: new Date().toISOString(),
        }

        // Si hubo warnings, registrarlos
        if (
          req.fileValidation.warnings &&
          req.fileValidation.warnings.length > 0
        ) {
          comprobanteData.validation.warnings = req.fileValidation.warnings
        }

        // Marcar para revisión si es riesgo medio
        if (req.fileValidation.riskLevel === 'MEDIUM') {
          comprobanteData.needsReview = true
          comprobanteData.reviewReason =
            'Archivo con riesgo medio requiere revisión'
        }
      }

      pago.comprobante = comprobanteData
    }

    await pago.save()

    const pagoActualizado = await Pago.findById(pago._id)
      .populate({
        path: 'socio',
        select: 'nombre apellido dni',
        populate: {
          path: 'rama',
          select: 'nombre',
        },
      })
      .populate({
        path: 'registradoPor',
        select: 'username',
        populate: {
          path: 'persona',
          select: 'nombre apellido',
        },
      })
      .populate({
        path: 'modificadoPor',
        select: 'username',
        populate: {
          path: 'persona',
          select: 'nombre apellido',
        },
      })

    res.json({
      message: 'Pago actualizado exitosamente',
      pago: pagoActualizado,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const deletePago = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }

    if (pago.deleted) {
      return res.status(400).json({ message: 'El pago ya está eliminado' })
    }

    // Eliminación lógica - NO eliminar archivo de comprobante
    pago.deleted = true
    pago.deletedAt = new Date()
    pago.deletedBy = req.user._id

    await pago.save()
    const pagoEliminado = await Pago.findById(req.params.id)
      .populate('socio', 'nombre apellido dni rama')
      .populate('registradoPor', 'username')
      .populate('deletedBy', 'username')

    res.json({
      message: 'Pago eliminado exitosamente',
      pago: pagoEliminado,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const restorePago = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }

    if (!pago.deleted) {
      return res.status(400).json({ message: 'El pago no está eliminado' })
    }

    // Restaurar el pago
    pago.deleted = false
    pago.deletedAt = undefined
    pago.deletedBy = undefined

    await pago.save()
    const pagoRestaurado = await Pago.findById(req.params.id)
      .populate('socio', 'nombre apellido dni rama')
      .populate('registradoPor', 'username')

    res.json({
      message: 'Pago restaurado exitosamente',
      pago: pagoRestaurado,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const getResumenPagosSocio = async (req, res) => {
  try {
    const { socioId } = req.params
    const { año = new Date().getFullYear() } = req.query

    const pagos = await Pago.find({
      socio: socioId,
      mesCorrespondiente: { $regex: `^${año}` },
    }).sort({ mesCorrespondiente: 1 })

    const mesesPagados = pagos.map((pago) => pago.mesCorrespondiente)
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0)

    res.json({
      socio: socioId,
      año,
      mesesPagados,
      tipoPago,
      totalPagos: pagos.length,
      totalPagado,
      pagos,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  getPagos,
  getPagoById,
  createPago,
  updatePago,
  deletePago,
  restorePago,
  getResumenPagosSocio,
}
