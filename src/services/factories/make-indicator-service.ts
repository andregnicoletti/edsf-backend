import { PrismaIndicatorCourseRepository } from "../../repositories/prisma/prisma-indicator-course-repository";
import { PrismaIndicatorRepository } from "../../repositories/prisma/prisma-indicator-repository";
import { PrismaValueIndicatorCourseRepository } from "../../repositories/prisma/prisma-sum-value-indicator-repository";
import { IndicatorService } from "../indicator-service";
import { makeCourseService } from "./make-course-service";
import { makeCompanyService } from "./make-company-service";
import { makeProducerService } from "./make-producer-service";
import { PrismaGoalIndicatorRepository } from "../../repositories/prisma/prisma-goal-indicator-repository";
import { makeAuthenticateService } from "./make-authenticate-service";

export const makeIndicatorService = () => {

    const indicatorRepository = new PrismaIndicatorRepository();
    const indicatorCourseRepository = new PrismaIndicatorCourseRepository();
    const valueIndicatorRepository = new PrismaValueIndicatorCourseRepository();
    const goalIndicatorRepository = new PrismaGoalIndicatorRepository();
    const companyService = makeCompanyService();
    const courseService = makeCourseService();
    const producerService = makeProducerService();
    const authenticateService = makeAuthenticateService();

    const service = new IndicatorService(
        indicatorRepository,
        indicatorCourseRepository,
        valueIndicatorRepository,
        goalIndicatorRepository,
        companyService,
        courseService,
        producerService,
        authenticateService,
    );

    return service;

}