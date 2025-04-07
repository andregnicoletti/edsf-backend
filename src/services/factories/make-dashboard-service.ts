import { PrismaWorkerCourseAssocRepository } from "../../repositories/prisma/prisma-worker-course-assoc-repository";
import { DashboardService } from "../dashboard-service";
import { makeAuthenticateService } from "./make-authenticate-service";
import { makeCityService } from "./make-city-service";
import { makeCourseService } from "./make-course-service";
import { makeIndicatorService } from "./make-indicator-service";
import { makeProducerService } from "./make-producer-service";

export const makeDashboardService = () => {

    const WorkerCourseRepository = new PrismaWorkerCourseAssocRepository();
    const courseService = makeCourseService();
    const cityService = makeCityService();
    const producerService = makeProducerService();
    const indicatorService = makeIndicatorService();
    const authenticateService = makeAuthenticateService();

    const service = new DashboardService(
        WorkerCourseRepository,
        courseService,
        cityService,
        producerService,
        indicatorService,
        authenticateService,
    );

    return service;

}