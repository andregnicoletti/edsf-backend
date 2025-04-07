import { PrismaWorkerCourseAssocRepository } from "../../repositories/prisma/prisma-worker-course-assoc-repository";
import { WorkerService } from "../worker-service";
import { makeCityService } from "./make-city-service";
import { makeCourseService } from "./make-course-service";

export const makeWorkerService = () => {

    const WorkerCourseRepository = new PrismaWorkerCourseAssocRepository();
    const courseService = makeCourseService();
    const cityService = makeCityService();

    const service = new WorkerService(
        WorkerCourseRepository,
        courseService,
        cityService,
    );

    return service;

}