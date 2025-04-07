import { CompanyEntity, Prisma } from "@prisma/client";
import { CompanyRepository } from "../interface/company-repository";
import { randomUUID } from "node:crypto";

const repository: CompanyEntity[] = [
    {
        id: '1',
        code: 'C001',
        businessSegment: 'Segment test',
        companyDescription: 'Company description for test',
    },
    {
        id: '2',
        code: 'C002',
        businessSegment: 'Segment test',
        companyDescription: 'Company description for test',
    },
];

export class InMemoryCompanyRepository implements CompanyRepository {

    findById(companyId: string): Promise<CompanyEntity | null> {
        const data = repository.find((item) => item.id === companyId);

        if (!data) {
            return Promise.resolve(null);
        }

        return Promise.resolve(data);
    }
    findByCode(code: string): Promise<CompanyEntity | null> {
        const data = repository.find((item) => item.code === code);

        if (!data) {
            return Promise.resolve(null);
        }

        return Promise.resolve(data);
    }

    save(data: Prisma.CompanyEntityCreateInput): Promise<CompanyEntity> {
        data.id = randomUUID();
        repository.push(data as CompanyEntity);
        return Promise.resolve(data as CompanyEntity);
    }

}