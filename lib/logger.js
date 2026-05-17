const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),

    transports: [

        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'logs/app.log'
        }),
        new winston.transports.File({
            filename: 'logs/errors.log',
            level: 'error'
        }),

    ]
});

module.exports = logger;