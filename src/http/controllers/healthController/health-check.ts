import { FastifyReply, FastifyRequest } from "fastify";

export const healthCheck = async (_request: FastifyRequest, response: FastifyReply) => {
    return response.status(200).send({
        message: 'ok',
        status: true
    });
}