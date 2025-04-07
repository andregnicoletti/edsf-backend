import { FastifyPluginCallback } from 'fastify';
import logger from '../config/logger';

const loggerPlugin: FastifyPluginCallback = (fastify, _options, done) => {
    
    fastify.addHook('onRequest', (request, _response, done) => {
        logger.info(`Request: ${request.method} ${request.url}`);
        done();
    });

    fastify.addHook('onError', (_request, _response, error, done) => {
        logger.error(`Error: ${error.message}`);
        done();
    });

    done();
};

export default loggerPlugin;
