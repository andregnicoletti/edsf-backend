import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, errors } = format;

// Função para determinar o nível de log com base no NODE_ENV
const getLogLevel = () => {
    const env = process.env.NODE_ENV || 'development'; // Padrão para 'development'
    switch (env) {
        case 'production':
            return 'warn'; // Menos verboso em produção
        case 'test':
            return 'silent'; // Não gerar logs em testes
        case 'dev':
        default:
            return 'debug'; // Mais verboso em desenvolvimento
    }
};


const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

// Configuração da rotação de logs
const rotateTransport = new transports.DailyRotateFile({
    dirname: 'logs',               // Diretório para salvar os logs
    filename: 'app-%DATE%.log',    // Nome do arquivo com data
    datePattern: 'YYYY-MM-DD',     // Padrão de data para rotação
    maxFiles: '7d',                // Retém logs por 7 dias
    level: getLogLevel(),                 // Nível mínimo de log
    zippedArchive: true            // Compacta logs antigos
});

const logger = createLogger({
    level: getLogLevel(),  // Definir o nível baseado no NODE_ENV
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        new transports.Console(),   // Exibe no console
        rotateTransport             // Log em arquivos com rotação
    ]
});

export default logger;
