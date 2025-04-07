import { PrismaSessionRepository } from "../../repositories/prisma/prisma-session-repository";
import { AuthenticateService } from "../authenticate-service";
import { makeUserService } from "./make-user-service";

export const makeAuthenticateService = () => {

    const sessionRepository = new PrismaSessionRepository();
    const userService = makeUserService();

    const service = new AuthenticateService(sessionRepository, userService);

    return service;

}