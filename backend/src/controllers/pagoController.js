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
    } = req.query

    // Construir filtros
    const filter = {}

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
      .populate('socio', 'nombre apellido dni')
      .populate('registradoPor', 'username')
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
      .populate('socio')
      .populate('registradoPor', 'username')

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
// @access  Private (jefe_de_rama, administrador)
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

    // Verificar que el socio existe
    const socioExistente = await Persona.findById(socio)
    if (!socioExistente) {
      return res.status(400).json({ message: 'Socio no encontrado' })
    }

    // Verificar si ya existe un pago para este socio en este mes
    const pagoExistente = await Pago.findOne({ socio, mesCorrespondiente })
    if (pagoExistente) {
      return res.status(400).json({
        message: 'Ya existe un pago registrado para este socio en este mes',
      })
    }

    // Crear objeto de pago
    const pagoData = {
      socio,
      monto: parseFloat(monto),
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
      .populate('socio', 'nombre apellido dni')
      .populate('registradoPor', 'username')

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
// @access  Private (jefe_de_rama, administrador)
const updatePago = async (req, res) => {
  try {
    const { monto, fechaPago, metodoPago, observaciones, estado } = req.body

    const pago = await Pago.findById(req.params.id)

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' })
    }

    // Actualizar campos
    if (monto) pago.monto = parseFloat(monto)
    if (fechaPago) pago.fechaPago = fechaPago
    if (metodoPago) pago.metodoPago = metodoPago
    if (observaciones !== undefined) pago.observaciones = observaciones
    if (estado) pago.estado = estado

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
      .populate('socio', 'nombre apellido dni')
      .populate('registradoPor', 'username')

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

    // Eliminar archivo de comprobante si existe
    if (pago.comprobante && pago.comprobante.path) {
      const filePath = path.join(
        process.env.UPLOAD_PATH || './uploads',
        pago.comprobante.path
      )
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await Pago.findByIdAndDelete(req.params.id)

    res.json({ message: 'Pago eliminado exitosamente' })
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
  getResumenPagosSocio,
  upload,
}
