import { CityEntity, CompanyEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma"
import { CompanyRepository } from "../interface/company-repository";

export class PrismaCompanyRepository implements CompanyRepository {

    async findById(companyId: string): Promise<CompanyEntity | null> {
        return await prisma.companyEntity.findFirst({ where: { id: companyId } })
    }

    async save(data: Prisma.CompanyEntityCreateInput): Promise<CompanyEntity> {
        return await prisma.companyEntity.create({ data })
    }

    async findByCode(code: string): Promise<CompanyEntity | null> {
        const trimmedCode = code.trim();
        return await prisma.companyEntity.findFirst({ where: { code: { equals: trimmedCode, mode: 'insensitive' } } })
    }

    async findByNameAndUf(name: string, uf: string): Promise<CityEntity | null> {
        return await prisma.cityEntity.findFirst({ where: { city: name, state_id: uf } })
    }

};