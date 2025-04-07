
import { beforeEach, describe, expect, it } from 'vitest'
import { CompanyService } from './company-service';
import { InMemoryCompanyRepository } from '../repositories/in-memory/in-memory-company-repository';
import { ServiceError } from '../errors/service-error';

let companyService: CompanyService;

describe('Company Service Tests', () => {

    beforeEach(() => {
        const companyRepository = new InMemoryCompanyRepository()
        companyService = new CompanyService(companyRepository);
    });

    it('should create new company', async () => {
        const code = '0123';
        const companyDescription = 'Some description for test';
        const businessSegment = 'Segment Example'

        const entity = await companyService.createNewCompany(code, companyDescription, businessSegment);
        console.log(entity);

        expect(entity.company.code).equal(code);
    });

    it('should find company by code', async () => {
        const code = '0123';
        const entity = await companyService.findCompanyByCode(code);
        console.log(entity);

        expect(entity.company.code).equal(code);
    });

    it('should find company by id', async () => {
        const code = '0123';
        const entity = await companyService.findCompanyByCode(code);

        console.log('find company by id: ', entity.company.id);
        const company = await companyService.findCompanyById(entity.company.id);
        console.log('company: ', company);

        expect(entity.company.id).equal(company.id);
    });

    it('should throw error when create new company with same code', async () => {
        const code = '0123';
        const companyDescription = 'Some description for test';
        const businessSegment = 'Segment Example'

        console.log('company code: ', code);

        await expect(companyService.createNewCompany(code, companyDescription, businessSegment))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new company without code', async () => {
        const code = '';
        const companyDescription = 'Some description for test';
        const businessSegment = 'Segment Example'

        console.log('company code: ', code);

        await expect(companyService.createNewCompany(code, companyDescription, businessSegment))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new company without company description', async () => {
        const code = '0123';
        const companyDescription = '';
        const businessSegment = 'Segment Example'

        console.log('company description: ', code);

        await expect(companyService.createNewCompany(code, companyDescription, businessSegment))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when create new company without business segment', async () => {
        const code = '0123';
        const companyDescription = 'Some description for test';
        const businessSegment = ''

        console.log('business cegment: ', code);

        await expect(companyService.createNewCompany(code, companyDescription, businessSegment))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when find by company with unknow code', async () => {
        const code = 'xpto';
        console.log('company code: ', code);

        await expect(companyService.findCompanyByCode(code))
            .rejects.toThrowError(ServiceError);
    });

    it('should throw error when find by company with unknow id', async () => {
        const id = 'xpto';
        console.log('company id: ', id);

        await expect(companyService.findCompanyById(id))
            .rejects.toThrowError(ServiceError);
    });

});