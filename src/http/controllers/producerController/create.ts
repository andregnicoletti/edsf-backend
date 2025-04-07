import { FastifyReply, FastifyRequest } from "fastify";
import { makeProducerService } from "../../../services/factories/make-producer-service";
import { GenericError } from "../../../errors/generic-error";
import { ErrorSchema } from "../../../schemas/error-schema";
import { CreateProducerType } from "../../../@types/create-producer-type";

export const create = async (request: FastifyRequest<{ Body: CreateProducerType }>, response: FastifyReply) => {

    try {

        // const requestBody = requestBodyValidation.parse(request.body);
        const { producerCode, companyCode, city, uf, description } = request.body;

        const producerService = makeProducerService();
        const producer = await producerService.createNewProducer( producerCode, companyCode, city, uf, description);


        response.status(200).send({ producer });

    } catch (error) {
        if (error instanceof GenericError) {
            response.status(400).send(new ErrorSchema(error));
        }

        throw error;
    }
}