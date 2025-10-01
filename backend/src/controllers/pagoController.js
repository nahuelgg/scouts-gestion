const Pago = require('../models/Pago')
const Persona = require('../models/Persona')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const year = new Date().getFullYear()
    const uploadPath = path.join(
      process.env.UPLOAD_PATH || './uploads',
      year.toString()
    )

    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, 'comprobante-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter,
})

// @desc    Obtener todos los pagos
// @route   GET /api/pagos
// @access  Private
const getPagos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      socio = '',
      mes = '',
      metodoPago = '',
      desde = '',
      hasta = '',
      includeDeleted = true,
    } = req.query

    // Construir filtros
    let filter = {}

    // Por defecto mostrar todos (incluidos eliminados)
    // Solo excluir eliminados si se solicita específicamente
    if (includeDeleted === 'false') {
      filter.deleted = { $ne: true }
    }

    if (socio) {
      filter.socio = socio
    }

    if (mes) {
      filter.mesCorrespondiente = mes
    }

    if (metodoPago) {
      filter.metodoPago = metodoPago
    }

    if (desde || hasta) {
      filter.fechaPago = {}
      if (desde) filter.fechaPago.$gte = new Date(desde)
      if (hasta) filter.fechaPago.$lte = new Date(hasta)
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
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Obtener un pago por ID
// @route   GET /api/pagos/:id
// @access  Private
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
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Crear nuevo pago
// @route   POST /api/pagos
// @access  Private (jefe de rama, administrador)
const createPago = async (req, res) => {
  try {
    const {
      socio,
      monto,
      fechaPago,
      mesCorrespondiente,
      metodoPago,
      observaciones,
    } = req.body

    // Validar campos requeridos
    if (!socio || !monto || !mesCorrespondiente || !metodoPago) {
      return res.status(400).json({
        message:
          'Socio, monto, mes correspondiente y método de pago son requeridos',
      })
    }

    // Validar que el monto sea un número válido
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

    // Verificar que el socio existe
    const socioExistente = await Persona.findById(socio)
    if (!socioExistente) {
      return res.status(400).json({ message: 'Socio no encontrado' })
    }

    // Crear objeto de pago
    const pagoData = {
      socio,
      monto: montoNumerico,
      fechaPago: fechaPago || new Date(),
      mesCorrespondiente,
      metodoPago,
      observaciones,
      registradoPor: req.user._id,
    }

    // Si hay archivo de comprobante
    if (req.file) {
      const year = new Date().getFullYear()
      pagoData.comprobante = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `${year}/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
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
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Actualizar pago
// @route   PUT /api/pagos/:id
// @access  Private (jefe de rama, administrador)
const updatePago = async (req, res) => {
  try {
    const { monto, fechaPago, metodoPago, observaciones, estado } = req.body

    const pago = await Pago.findById(req.params.id)

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }

    // Actualizar campos
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
    if (observaciones !== undefined) pago.observaciones = observaciones
    if (estado) pago.estado = estado

    // Registrar quién modificó el pago
    pago.modificadoPor = req.user._id

    // Si hay nuevo archivo de comprobante
    if (req.file) {
      // Eliminar archivo anterior si existe
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
      pago.comprobante = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `${year}/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
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
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Eliminar pago
// @route   DELETE /api/pagos/:id
// @access  Private (administrador)
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

    // Obtener el pago actualizado con datos poblados
    const pagoEliminado = await Pago.findById(req.params.id)
      .populate('socio', 'nombre apellido dni rama')
      .populate('registradoPor', 'username')
      .populate('deletedBy', 'username')

    res.json({
      message: 'Pago eliminado exitosamente',
      pago: pagoEliminado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Restaurar pago eliminado
// @route   PATCH /api/pagos/:id/restore
// @access  Private (administrador)
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

    // Obtener el pago restaurado con datos poblados
    const pagoRestaurado = await Pago.findById(req.params.id)
      .populate('socio', 'nombre apellido dni rama')
      .populate('registradoPor', 'username')

    res.json({
      message: 'Pago restaurado exitosamente',
      pago: pagoRestaurado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Obtener resumen de pagos por socio
// @route   GET /api/pagos/resumen/:socioId
// @access  Private
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
      totalPagos: pagos.length,
      totalPagado,
      pagos,
    })
  } catch (error) {
    console.error(error)
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
  upload,
}
