const mongoose = require('mongoose')
const logger = require('../utils/logger')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    logger.database(`MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    logger.error('Error conectando a MongoDB:', {
      error: error.message,
      stack: error.stack,
    })
    process.exit(1)
  }
}

module.exports = connectDB
