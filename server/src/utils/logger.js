import { config } from '../config/env.js'

const info = (...args) => {
  if (config.env !== 'development') {
    console.log('[INFO]', ...args)
  }
}

const warn = (...args) => {
  if (config.env !== 'development') {
    console.warn('[WARN]', ...args)
  }
}

const error = (...args) => {
  console.error('[ERROR]', ...args)
}
const logger = { info, warn, error }
export default logger
