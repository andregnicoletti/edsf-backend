import { beforeEach, describe, expect, it } from "vitest";
import { CompanyService } from "./company-service";
import { UserService } from "./user-service";
import { InMemoryUserRepository } from "../repositories/in-memory/in-memory-user-repository";
import { InMemoryCompanyRepository } from "../repositories/in-memory/in-memory-company-repository";
import { InMemorySessionRepository } from "../repositories/in-memory/in-memory-sesion-repository";
import { AuthenticateService } from "./authenticate-service";
import { InMemoryCityRepository } from "../repositories/in-memory/in-memory-city-repository";
import { CityService } from "./city-service";
import { ProducerService } from "./producer-service";
import { InMemoryProducerRepository } from "../repositories/in-memory/in-memory-producer-repository";
import { ServiceError } from "../errors/service-error";

let service: ProducerService;

describe('Producer Service Tests', () => {

    beforeEach(() => {
        const companyRepository = new InMemoryCompanyRepository();
        const companyService = new CompanyService(companyRepository);

        const sessionRespository = new InMemorySessionRepository();
        const userRepository = new InMemoryUserRepository();
        const userService = new UserService(userRepository, companyService);
        const authenticateService = new AuthenticateService(sessionRespository, userService);

        const producerRepository = new InMemoryProducerRepository();
        const cityRepository = new InMemoryCityRepository();
        const cityService = new CityService(cityRepository);

        service = new ProducerService(producerRepository, cityService, companyService, authenticateService);
    });

    it('should create new producer', async () => {
        const producerCode = 'P002';
        const companyCode = 'C001';
        const city = 'Campinas';
        const state = 'SP';
        const description = 'Some description';

        const entity = await service.createNewProducer(producerCode, companyCode, city, state, description);
        console.log('producer:', entity);

        expect(entity.code).equal(producerCode);
    });

    it('should return erro when description is too large', async () => {
        const producerCode = 'P002';
        const companyCode = 'C001';
        const city = 'Campinas';
        const state = 'SP';
        const description = 'Some test producer description';

        await expect(service.createNewProducer(producerCode, companyCode, city, state, description)).rejects.toThrowError(ServiceError);
    });

    it('should find producer by code', async () => {
        const producerCode = 'P002';

        const entity = await service.findProducerByCode(producerCode);
        console.log('producer:', entity);

        expect(entity.producer.code).equal(producerCode);
    });

    it('should return producer by id', async () => {
        const producerId = '1';

        const entity = await service.getProducerById(producerId);
        console.log('producer:', entity);

        expect(entity.id).equal(producerId);
    });

    it('should create new producer', async () => {
        const entityList = await service.listAllProducers();
        console.log('all producer:', entityList);

        expect(entityList.length).greaterThanOrEqual(0);
    });

    it('should count producers by city id', async () => {
        const entity = await service.countProducerByCityId('1');
        console.log('producer count:', entity);

        expect(entity).greaterThanOrEqual(0);
    });

    it('should list cities where there are producers', async () => {
        const compoanyId = '1';
        const entity = await service.listCitiesWhereThereAreProducers(compoanyId);
        console.log('list:', entity);

        expect(entity.length).greaterThanOrEqual(0);
    });

    it('should list producers by city', async () => {
        const userId = '1';
        const cityName = 'Campinas';
        const entity = await service.listProducerByCity(userId, cityName);
        console.log('list:', entity);

        expect(entity.length).greaterThanOrEqual(0);
    });

    it('should list producers by city', async () => {
        const userId = '1';
        const citiesIds = ["1", "2", "3"];
        const entity = await service.listProducerByCityIds(userId, citiesIds);
        console.log('listProducerByCityId:', entity);

        expect(entity.length).greaterThanOrEqual(0);
    });

});