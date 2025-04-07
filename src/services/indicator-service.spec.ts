import { beforeEach, describe, expect, it } from "vitest";
import { CompanyService } from "./company-service";
import { UserService } from "./user-service";
import { InMemoryUserRepository } from "../repositories/in-memory/in-memory-user-repository";
import { InMemoryCompanyRepository } from "../repositories/in-memory/in-memory-company-repository";
import { InMemoryCourseRepository } from "../repositories/in-memory/in-memory-course-repository";
import { InMemorySessionRepository } from "../repositories/in-memory/in-memory-sesion-repository";
import { AuthenticateService } from "./authenticate-service";
import { InMemoryIndicatorRepository } from "../repositories/in-memory/in-memory-indicator-repository";
import { InMemoryIndicatorCourseRepository } from "../repositories/in-memory/in-memory-indicator-course-repository";
import { CourseService } from "./course-service";
import { InMemoryCityRepository } from "../repositories/in-memory/in-memory-city-repository";
import { CityService } from "./city-service";
import { IndicatorService } from "./indicator-service";
import { InMemoryValueIndicatorRepository } from "../repositories/in-memory/in-memory-sum-value-indicator-repository";
import { InMemoryGoalIndicatorRepository } from "../repositories/in-memory/in-memory-goal-indicator-repository";
import { ProducerService } from "./producer-service";
import { InMemoryProducerRepository } from "../repositories/in-memory/in-memory-producer-repository";
import { ServiceError } from "../errors/service-error";

let service: IndicatorService;

describe('Indicator Service Tests', () => {

    beforeEach(() => {
        const indicatorRepository = new InMemoryIndicatorRepository();
        const indicatorCourseRepository = new InMemoryIndicatorCourseRepository();
        const valueIndicatorRepository = new InMemoryValueIndicatorRepository()
        const goalIndicatorRepository = new InMemoryGoalIndicatorRepository();

        const companyRepository = new InMemoryCompanyRepository();
        const companyService = new CompanyService(companyRepository);

        const courseRepository = new InMemoryCourseRepository();
        const sessionRespository = new InMemorySessionRepository();
        const userRepository = new InMemoryUserRepository();
        const userService = new UserService(userRepository, companyService);
        const authenticateService = new AuthenticateService(sessionRespository, userService);
        const courseService = new CourseService(courseRepository, authenticateService, indicatorRepository, indicatorCourseRepository);

        const producerRepository = new InMemoryProducerRepository();
        const cityRepository = new InMemoryCityRepository();
        const cityService = new CityService(cityRepository);
        const producerService = new ProducerService(producerRepository, cityService, companyService, authenticateService);

        service = new IndicatorService(
            indicatorRepository,
            indicatorCourseRepository,
            valueIndicatorRepository,
            goalIndicatorRepository,
            companyService,
            courseService,
            producerService,
            authenticateService
        );
    });

    it('should create new indicator', async () => {
        const indicatorCode = 'I002';
        const description = 'Some description';
        const companyCode = 'C001';

        const entity = await service.createNewIndicator(indicatorCode, description, companyCode);
        console.log('indicator:', entity);

        expect(entity.indicator.code).equal(indicatorCode);
    });

    it('should throw error when create new indicator without indicator code', async () => {
        const indicatorCode = '';
        const description = 'Some description';
        const companyCode = 'C001';

        await expect(service.createNewIndicator(indicatorCode, description, companyCode)).rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new indicator without description', async () => {
        const indicatorCode = 'I002';
        const description = '';
        const companyCode = 'C001';

        await expect(service.createNewIndicator(indicatorCode, description, companyCode)).rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new indicator without company code', async () => {
        const indicatorCode = 'I002';
        const description = 'Some description';
        const companyCode = '';

        await expect(service.createNewIndicator(indicatorCode, description, companyCode)).rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new indicator with same code', async () => {
        const indicatorCode = 'I001';
        const description = 'Some description';
        const companyCode = 'C001';

        await expect(service.createNewIndicator(indicatorCode, description, companyCode)).rejects.toThrowError(ServiceError);
    });

    it('should count indicator goal', async () => {
        const courseIds = ['1', '2'];

        const entity = await service.countIndicatorGoal(courseIds);
        console.log('count indicator goal:', entity);

        expect(entity).greaterThanOrEqual(0);
    });

    // it('should create new indicator course assoc', async () => {
    //     const indicatorCode = 'I001';
    //     const courseCode = 'C002';
    //     await expect(async () => await service.createNewIndicatorCourseAssoc(indicatorCode, courseCode)).not.toThrow();  // Espera que não lance erro
    // });

    it('should throw error when create new course assoc without indicator code', async () => {
        const indicatorCode = '';
        const courseCode = 'C002';

        await expect(service.createNewIndicatorCourseAssoc(indicatorCode, courseCode)).rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new course assoc without course code', async () => {
        const indicatorCode = 'I001';
        const courseCode = '';

        await expect(service.createNewIndicatorCourseAssoc(indicatorCode, courseCode)).rejects.toThrowError(ServiceError);
    });


    it('should find an assoc indicator course by company id', async () => {
        const companyId = '1';

        const entity = await service.findAssocIndicatorCourseByCompanyId(companyId);
        console.log('indicator course by company id:', entity);

        expect(entity).instanceof(Set);
    });

    it('should find an indicator by its code', async () => {
        const indicatorCode = 'I001';

        const entity = await service.findIndicatorByCode(indicatorCode);
        console.log('indicator by code:', entity);

        expect(entity.indicator.code).equal(indicatorCode);
    });

    it('should find an goal', async () => {
        const indicatorId = '1';
        const producerId = '1';
        const year = '2025';

        const entity = await service.getGoal(indicatorId, producerId, year);
        console.log('goal:', entity);

        expect(entity?.indicatorId).equal(indicatorId);
    });

    it('should find an indicator', async () => {
        const userId = '1';
        const indicatorId = '1';

        const entity = await service.getIndicator(userId, indicatorId);
        console.log('indicator:', entity);

        expect(entity.id).equal(indicatorId);
    });

    it('should get sum value indicator by id', async () => {
        const indicatorId = '1';
        const producerId = '1';
        const goalYear = '2025';

        const entity = await service.getSumValueIndicatorById(goalYear, indicatorId, producerId);
        console.log('sum value indicator: ', entity);

        expect(entity?.indicator_id).equal(indicatorId);
    });

    it('should list all indicators', async () => {
        const userId = '1';

        const entity = await service.listAllIndicators(userId);
        console.log('indicator list: ', entity);

        expect(entity.length).greaterThanOrEqual(0);
    });

    it('should list companies ids', async () => {
        const courseIds = ['1', '2'];

        const entity = await service.listCompanyIds(courseIds)
        console.log('company id list: ', entity);

        expect(entity.length).greaterThanOrEqual(0);
    });

    it('should list goals by indicators id', async () => {
        const indicatorsIds = ['1'];

        const entity = await service.listGoalsByIndicatorsId(indicatorsIds)
        console.log('goals list: ', entity);

        expect(entity.length).greaterThanOrEqual(0);
    });

    it('should summary', async () => {
        const indicatorCode = 'I001';
        const producerCode = 'P001';
        const indicatorValue = '2000';
        const summaryGrouper = '2026';

        await expect(async () => await service.summary(indicatorCode, producerCode, indicatorValue, summaryGrouper)).not.toThrow();  // Espera que não lance erro
    });

});