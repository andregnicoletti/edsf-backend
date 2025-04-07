import { FastifyReply, FastifyRequest } from "fastify";
import { makeProducerService } from "../../../services/factories/make-producer-service";
import { ProducerFindByCityId } from "../../../@types/producer-find-by-city-id";


export const listProducerByCityId = async (request: FastifyRequest<{ Body: ProducerFindByCityId }>, response: FastifyReply) => {

    const userId = request.user.sub;
    const { ids } = request.body;

    const producerService = makeProducerService();
    const producer = await producerService.listProducerByCityIds(userId, ids);

    response.status(200).send({ status: true, producers: producer });
}