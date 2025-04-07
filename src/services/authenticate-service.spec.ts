
import { beforeAll, describe, expect, it } from 'vitest'
import { AuthenticateService } from './authenticate-service';
import { InMemorySessionRepository } from '../repositories/in-memory/in-memory-sesion-repository';
import { UserService } from './user-service';
import { CompanyService } from './company-service';
import { InMemoryCompanyRepository } from '../repositories/in-memory/in-memory-company-repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { ServiceError } from '../errors/service-error';

let service: AuthenticateService;

describe('Authenticate Use Case', () => {

    beforeAll(() => {
        const companyService = new CompanyService(new InMemoryCompanyRepository());
        const userService = new UserService(new InMemoryUserRepository(), companyService);
        const sessionRepository = new InMemorySessionRepository();
        service = new AuthenticateService(sessionRepository, userService);
    });

    it('should return code value ', async () => {
        const email = "teste@cpqd.com.br";
        const code = await service.generateAccessCode(email);

        expect(code).toBeTypeOf("string");
    });

    it('should return exception when email is wrong', async () => {
        const email = "wrong-email@cpqd.com.br"; // Email incorreto

        await expect(service.generateAccessCode(email))
            .rejects.toThrowError(ServiceError);
    });

    it('should return profile by user id', async () => {
        const userId = '1';

        const profile = await service.getProfile(userId);
        console.log('profile: ', profile);

        expect(profile.id).equal(userId);
    });

});