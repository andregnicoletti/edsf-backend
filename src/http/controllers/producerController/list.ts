import { FastifyReply, FastifyRequest } from "fastify";
import { makeProducerService } from "../../../services/factories/make-producer-service";

export const list = async (_request: FastifyRequest, response: FastifyReply) => {

    const producerService = makeProducerService();
    const allProducers = await producerService.listAllProducers();

    response.status(200).send({ producers: allProducers });
}