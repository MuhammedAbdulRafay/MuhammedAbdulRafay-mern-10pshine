const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

const httpLogger = pinoHttp({
  logger: logger,
  
  // Fixed serializers - removed req.get() which doesn't exist
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      // Removed: userAgent: req.get('user-agent') - this causes the error
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'response_time_ms',
  },
});

module.exports = {
  logger,
  httpLogger,
};