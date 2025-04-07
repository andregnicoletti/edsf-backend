import { beforeEach, describe, expect, it } from "vitest";
import { CompanyService } from "./company-service";
import { UserService } from "./user-service";
import { InMemoryUserRepository } from "../repositories/in-memory/in-memory-user-repository";
import { InMemoryCompanyRepository } from "../repositories/in-memory/in-memory-company-repository";
import { ServiceError } from "../errors/service-error";
import { WorkerService } from "./worker-service";
import { InMemoryWorkerCourseAssocRepository } from "../repositories/in-memory/in-memory-worker-course-assoc-repository";
import { InMemoryCourseRepository } from "../repositories/in-memory/in-memory-course-repository";
import { InMemorySessionRepository } from "../repositories/in-memory/in-memory-sesion-repository";
import { AuthenticateService } from "./authenticate-service";
import { InMemoryIndicatorRepository } from "../repositories/in-memory/in-memory-indicator-repository";
import { InMemoryIndicatorCourseRepository } from "../repositories/in-memory/in-memory-indicator-course-repository";
import { CourseService } from "./course-service";
import { InMemoryCityRepository } from "../repositories/in-memory/in-memory-city-repository";
import { CityService } from "./city-service";

let service: WorkerService;

describe('Worker Service Tests', () => {

    beforeEach(() => {
        const workerCourseRepository = new InMemoryWorkerCourseAssocRepository();

        const courseRepository = new InMemoryCourseRepository();
        const sessionRespository = new InMemorySessionRepository();
        const userRepository = new InMemoryUserRepository();
        const companyRepository = new InMemoryCompanyRepository();
        const companyService = new CompanyService(companyRepository);
        const userService = new UserService(userRepository, companyService);
        const authenticateService = new AuthenticateService(sessionRespository, userService);
        const indicatorRepository = new InMemoryIndicatorRepository();
        const indicatorCourseRepository = new InMemoryIndicatorCourseRepository();
        const courseService = new CourseService(courseRepository, authenticateService, indicatorRepository, indicatorCourseRepository);

        const repository = new InMemoryCityRepository();
        const cityService = new CityService(repository);

        service = new WorkerService(workerCourseRepository, courseService, cityService);
    });

    it('should create new enroll', async () => {
        const cpf = '00011122233';
        const courseCode = 'C001';
        const cityName = 'Campinas';
        const uf = 'SP';
        const initDate = '01/01/2025';
        const endDate = '01/02/2025';
        const lastDateDate = '01/02/2025';

        const entity = await service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate);
        console.log('enroll:', entity);

        expect(entity.worker.cpf).equal(cpf);
    });

    it('should return error when cpf is empty', async () => {
        const cpf = '';
        const courseCode = 'C001';
        const cityName = 'Campinas';
        const uf = 'SP';
        const initDate = '01/01/2025';
        const endDate = '01/02/2025';
        const lastDateDate = '01/02/2025';

        await expect(service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate)).rejects.toThrowError(ServiceError);
    });

    it('should return error when course code is empty', async () => {
        const cpf = '00011122233';
        const courseCode = '';
        const cityName = 'Campinas';
        const uf = 'SP';
        const initDate = '01/01/2025';
        const endDate = '01/02/2025';
        const lastDateDate = '01/02/2025';

        await expect(service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate)).rejects.toThrowError(ServiceError);
    });

    it('should return error when city name is empty', async () => {
        const cpf = '00011122233';
        const courseCode = 'C001';
        const cityName = '';
        const uf = 'SP';
        const initDate = '01/01/2025';
        const endDate = '01/02/2025';
        const lastDateDate = '01/02/2025';

        await expect(service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate)).rejects.toThrowError(ServiceError);
    });

    it('should return error when state is empty', async () => {
        const cpf = '00011122233';
        const courseCode = 'C001';
        const cityName = 'Campinas';
        const uf = '';
        const initDate = '01/01/2025';
        const endDate = '01/02/2025';
        const lastDateDate = '01/02/2025';

        await expect(service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate)).rejects.toThrowError(ServiceError);
    });

    it('should return error when initial date is empty', async () => {
        const cpf = '00011122233';
        const courseCode = 'C001';
        const cityName = 'Campinas';
        const uf = 'SP';
        const initDate = '';
        const endDate = '01/02/2025';
        const lastDateDate = '01/02/2025';

        await expect(service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate)).rejects.toThrowError(ServiceError);
    });

    it('should return error when initial date is null', async () => {
        const cpf = '00011122233';
        const courseCode = 'C001';
        const cityName = 'Campinas';
        const uf = 'SP';

        await expect(service.enroll(cpf, courseCode, cityName, uf)).rejects.toThrowError(ServiceError);
    });

    it('should return an error when the completion date is later than the initial date', async () => {
        const cpf = '00011122233';
        const courseCode = 'C001';
        const cityName = 'Campinas';
        const uf = 'SP';
        const initDate = '02/01/2025';
        const endDate = '01/01/2025';
        const lastDateDate = '01/02/2025';

        await expect(service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate)).rejects.toThrowError(ServiceError);
    });

    it('should return the existing enrollment instead of creating a new one if the user is already enrolled', async () => {
        const cpf = '11122233344';
        const courseCode = 'C001';
        const cityName = 'Campinas';
        const uf = 'SP';
        const initDate = '01/01/2025';
        const endDate = '01/02/2025';
        const lastDateDate = '01/02/2025';

        const entity = await service.enroll(cpf, courseCode, cityName, uf, initDate, endDate, lastDateDate);
        console.log('enroll:', entity);

        expect(entity.worker.cpf).equal(cpf);
    });

    it('should return an error if course id is wrong', async () => {
        const cpf = '00011122233';
        const courseId = '0';
        const initDate = new Date('02/01/2025');

        await expect(service.getEnrollById(cpf, courseId, initDate)).rejects.toThrowError(ServiceError);
    });

    it('should return enroll by id', async () => {
        const cpf = '00011122233';
        const courseId = '1';
        const initDate = new Date('01/01/2025');

        const entity = await service.getEnrollById(cpf, courseId, initDate)
        console.log('enroll: ', entity);

        expect(entity?.cpf).equal(cpf);
    });

    it('should verify enroll by id', async () => {
        const cpf = '00011122233';
        const courseId = '1';
        const initDate = new Date('01/01/2025');

        const entity = await service.verifyEnroll(cpf, courseId, initDate)
        console.log('verify enroll: ', entity);

        expect(entity?.cpf).equal(cpf);
    });

    it('should verify enroll by id', async () => {
        const cpf = '00000000000';
        const courseId = '1';
        const initDate = new Date('01/01/2025');

        const entity = await service.verifyEnroll(cpf, courseId, initDate)
        console.log('verify enroll: ', entity);

        expect(entity).equal(null);
    });

});