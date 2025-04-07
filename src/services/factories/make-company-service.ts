import { PrismaCompanyRepository } from "../../repositories/prisma/prisma-company-repository";
import { CompanyService } from "../company-service";

export const makeCompanyService = () => {

    const repository = new PrismaCompanyRepository();
    const service = new CompanyService(repository);

    return service;

}