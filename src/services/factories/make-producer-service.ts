import { PrismaProducerRepository } from "../../repositories/prisma/prisma-producer-repository";
import { ProducerService } from "../producer-service";
import { makeAuthenticateService } from "./make-authenticate-service";
import { makeCityService } from "./make-city-service";
import { makeCompanyService } from "./make-company-service";

export const makeProducerService = () => {

    const repository = new PrismaProducerRepository();
    const cityService = makeCityService();
    const companyService = makeCompanyService();
    const authenticateService = makeAuthenticateService();

    const service = new ProducerService(repository, cityService, companyService, authenticateService);

    return service;

}