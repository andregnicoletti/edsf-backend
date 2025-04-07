import { beforeEach, describe, expect, it } from "vitest";
import { CompanyService } from "./company-service";
import { UserService } from "./user-service";
import { InMemoryUserRepository } from "../repositories/in-memory/in-memory-user-repository";
import { InMemoryCompanyRepository } from "../repositories/in-memory/in-memory-company-repository";
import { ServiceError } from "../errors/service-error";
import { FastifyReply } from "fastify";

let userService: UserService;

describe('User Service Tests', () => {

    beforeEach(() => {
        const userRepository = new InMemoryUserRepository();
        const companyRepository = new InMemoryCompanyRepository();
        const companyService = new CompanyService(companyRepository);
        userService = new UserService(userRepository, companyService);
    });

    it('should create new user', async () => {
        const email: string = 'test@test.com';
        const dddphone: string = '00988887777';
        const companyCode: string = 'C001';
        const genCode: string = '0000';

        const entity = await userService.createUser(email, dddphone, companyCode, genCode);
        console.log(entity);

        expect(entity.email).equal(email);
    });

    it('should find user by email', async () => {
        const email: string = 'test@test.com';

        const entity = await userService.findUserByEmail(email);
        console.log(entity);

        expect(entity.email).equal(email);
    });

    it('should throw error whrn create new user with same email', async () => {
        const email: string = 'teste@cpqd.com.br';
        const dddphone: string = '00988887777';
        const companyCode: string = 'C001';
        const genCode: string = '0000';

        await expect(userService.createUser(email, dddphone, companyCode, genCode)).rejects.toThrowError(ServiceError);
    });

    it('should find user by id', async () => {
        const userId: string = '1';

        const entity = await userService.getUserById(userId);
        console.log(entity);

        expect(entity.id).equal(userId);
    });

    it('should throw error when find user by error id', async () => {
        const userId: string = 'x';
        await expect(userService.getUserById(userId)).rejects.toThrowError(ServiceError);
    });

    it('should throw error when user id is null', async () => {
        const userId = null;
        await expect(userService.getUserById(userId)).rejects.toThrowError(ServiceError);
    });

    it('should update access code', async () => {
        const userId: string = '1';
        const accessCode: string = 'XPTO';

        userService.updateAccessCode(userId, accessCode);

        const entity = await userService.getUserById(userId);
        console.log(entity.code);

        expect(entity.code).equal(accessCode);
    });

    it('should find user by email and return company info', async () => {
        const email: string = 'teste@cpqd.com.br';

        const entity = await userService.findUserByEmailWithCompany(email);
        console.log(entity);

        expect(entity.company_id).equal('1');
    });

    it('should update terms of the user', async () => {
        const userId = '1';
        const terms = true;
        const response: FastifyReply = {};

        const entity = await userService.updateUserTerms(userId, terms, response);
        console.log(entity);

        expect(entity.company_id).equal('1');
    });

    it('should update terms of the user with false', async () => {
        const userId = '1';
        const terms = false;
        const response: FastifyReply = {};

        const entity = await userService.updateUserTerms(userId, terms, response);
        console.log(entity);

        expect(entity.company_id).equal('1');
    });

});