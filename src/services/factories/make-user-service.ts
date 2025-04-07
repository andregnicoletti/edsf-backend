import { PrismaUserRepository } from "../../repositories/prisma/prisma-user-repository";
import { UserService } from "../user-service";
import { makeCompanyService } from "./make-company-service";

export const makeUserService = () => {

    const repository = new PrismaUserRepository();
    const companyService = makeCompanyService();
    const service = new UserService(repository, companyService);

    return service;

}