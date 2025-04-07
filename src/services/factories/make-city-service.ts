import { PrismaCityRepository } from "../../repositories/prisma/prisma-city-repository";
import { CityService } from "../city-service";
import { makeAuthenticateService } from "./make-authenticate-service";

export const makeCityService = () => {

    const repository = new PrismaCityRepository();
    const authenticateService = makeAuthenticateService();

    const service = new CityService(repository, authenticateService);

    return service;

}