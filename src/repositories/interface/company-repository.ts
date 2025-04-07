import { CompanyEntity, Prisma } from "@prisma/client";

export interface CompanyRepository {

    findById(companyId: string): Promise<CompanyEntity | null>

    findByCode(code: string): Promise<CompanyEntity | null>

    save(data: Prisma.CompanyEntityCreateInput): Promise<CompanyEntity>

}