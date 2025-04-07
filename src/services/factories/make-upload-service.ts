import { PrismaUploadRepository } from "../../repositories/prisma/prisma-upload-repository";
import { DataLoadService } from "../data-load-service";
import { makeAuthenticateService } from "./make-authenticate-service";
import { makeEventProcedure } from "./make-event-procedure";
import { makeGoalIndicatorService } from "./make-goal-indicator-service";
import { makeUserService } from "./make-user-service";

export const makeDataLoadService = () => {

    const uploadRepository = new PrismaUploadRepository();
    const event = makeEventProcedure();
    const goalService = makeGoalIndicatorService();
    const user = makeUserService();
    const authenticateService = makeAuthenticateService()

    const service = new DataLoadService(
        uploadRepository,
        event,
        goalService,
        user,
        authenticateService,
    );

    return service;

}