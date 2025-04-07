import { FastifyReply, FastifyRequest } from "fastify";
import { makeCityService } from "../../../services/factories/make-city-service";
import { FindCitiesType } from "../../../@types/find-cities-type";


export const findByCity = async (request: FastifyRequest<{ Querystring: FindCitiesType }>, response: FastifyReply) => {

    const { cityName } = request.query;

    const service = makeCityService();
    const resp = await service.findCityByName(cityName);

    response.status(200).send({ status: true, cities: resp });
}