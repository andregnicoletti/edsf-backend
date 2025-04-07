import { FastifyReply, FastifyRequest } from "fastify";
import { makeCityService } from "../../../services/factories/make-city-service";
import { FindCitiesType } from "../../../@types/find-cities-type";

export const find = async (request: FastifyRequest<{ Querystring: FindCitiesType }>, response: FastifyReply) => {

    try {
        const { cityName, uf } = request.query;

        const service = makeCityService();
        const resp = await service.findCityByNameAndUf(cityName, uf);

        response.status(200).send({ city: resp.city });

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}