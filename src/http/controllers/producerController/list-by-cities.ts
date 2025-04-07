import { FastifyReply, FastifyRequest } from "fastify";
import { makeProducerService } from "../../../services/factories/make-producer-service";
import { ProducerFindByCity } from "../../../@types/producer-find-by-city";


export const listProducerByCities = async (request: FastifyRequest<{ Querystring: ProducerFindByCity }>, response: FastifyReply) => {

    const userId = request.user.sub;
    const { cityName } = request.query;

    const producerService = makeProducerService();
    const producer = await producerService.listProducerByCity(userId, cityName);

    response.status(200).send({ status: true, producers: producer });
}