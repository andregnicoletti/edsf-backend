
import { beforeEach, describe, expect, it } from 'vitest'
import { CompanyService } from './company-service';
import { InMemoryCompanyRepository } from '../repositories/in-memory/in-memory-company-repository';
import { ServiceError } from '../errors/service-error';
import { InMemoryCourseRepository } from '../repositories/in-memory/in-memory-course-repository';
import { AuthenticateService } from './authenticate-service';
import { InMemorySessionRepository } from '../repositories/in-memory/in-memory-sesion-repository';
import { UserService } from './user-service';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { InMemoryIndicatorRepository } from '../repositories/in-memory/in-memory-indicator-repository';
import { InMemoryIndicatorCourseRepository } from '../repositories/in-memory/in-memory-indicator-course-repository';
import { CourseService } from './course-service';

let service: CourseService;

describe('Course Service Tests', () => {

    beforeEach(() => {
        const courseRepository = new InMemoryCourseRepository();
        const sessionRespository = new InMemorySessionRepository();
        const userRepository = new InMemoryUserRepository();
        const companyRepository = new InMemoryCompanyRepository();
        const companyService = new CompanyService(companyRepository);
        const userService = new UserService(userRepository, companyService);
        const authenticateService = new AuthenticateService(sessionRespository, userService);
        const indicatorRepository = new InMemoryIndicatorRepository();
        const indicatorCourseRepository = new InMemoryIndicatorCourseRepository()
        service = new CourseService(courseRepository, authenticateService, indicatorRepository, indicatorCourseRepository);
    });

    it('should create new Course', async () => {
        const code: string = '0123';
        const numberClass: number = 10;
        const averageDuration: number = 50;
        const courseDescription: string = 'Course description'

        const entity = await service.createNewCourse(code, numberClass, averageDuration, courseDescription);
        console.log(entity);

        expect(entity.couse.code).equal(code);
    });

    it('should find course by code', async () => {
        const code = '0123';

        const entity = await service.findCourseByCode(code)
        console.log(entity);

        expect(entity.course.code).equal(code);
    });

    it('should find course by id', async () => {
        const code = '0123';
        const entity = await service.findCourseByCode(code);

        console.log('find course by id: ', entity.course.id);
        const course = await service.findCourseById(entity.course.id);
        console.log('course: ', course);

        expect(entity.course.id).equal(course.id);
    });

    it('should throw error when create new course with same code', async () => {
        const code: string = '0123';
        const numberClass: number = 10;
        const averageDuration: number = 50;
        const courseDescription: string = 'Course description'

        console.log('course code: ', code);

        await expect(service.createNewCourse(code, numberClass, averageDuration, courseDescription))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new course without code', async () => {
        const code: string = '';
        const numberClass: number = 10;
        const averageDuration: number = 50;
        const courseDescription: string = 'Course description'

        console.log('company code: ', code);

        await expect(service.createNewCourse(code, numberClass, averageDuration, courseDescription))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new course without company description', async () => {
        const code: string = '0123';
        const numberClass: number = 10;
        const averageDuration: number = 50;
        const courseDescription: string = '';

        console.log('company description: ', code);

        await expect(service.createNewCourse(code, numberClass, averageDuration, courseDescription))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new course without average duration', async () => {
        const code: string = '0123';
        const numberClass: number = 10;
        const averageDuration = null;
        const courseDescription: string = 'Course description'

        await expect(service.createNewCourse(code, numberClass, averageDuration, courseDescription))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when find by course with unknow code', async () => {
        const code = 'xpto';
        console.log('course code: ', code);

        await expect(service.findCourseByCode(code))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when find by company with unknow id', async () => {
        const id = 'xpto';
        console.log('course code: ', id);

        await expect(service.findCourseById(id))
            .rejects.toThrowError(ServiceError);
    });

    it('should list all course', async () => {
        const userId = '1';

        const entity = await service.listAllCourses(userId);
        console.log('list all course by user id: ', entity);

        expect(entity.length).greaterThanOrEqual(0);
    });

    it('should throw excption when delete course by error code', async () => {
        const courseCode = 'XPTO';
        await expect(service.removeCourseByCode(courseCode)).rejects.toThrowError(Error);
    });

});