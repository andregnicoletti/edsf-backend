import { FastifyReply, FastifyRequest } from "fastify";
import { makeProducerService } from "../../../services/factories/make-producer-service";
import { FindProducerType } from "../../../@types/find-producer-type";

export const find = async (request: FastifyRequest<{ Params: FindProducerType }>, response: FastifyReply) => {

    try {

        const { code } = request.params;

        const producerService = makeProducerService();
        const producer = await producerService.findProducerByCode(code);

        response.status(200).send({ producer: producer.producer });

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}