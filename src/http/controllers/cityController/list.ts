import { FastifyReply, FastifyRequest } from "fastify";
import { makeCityService } from "../../../services/factories/make-city-service";

export const list = async (_request: FastifyRequest, response: FastifyReply) => {

    const service = makeCityService();
    const cities = await service.listAllCities();

    response.status(200).send({ cities });
}