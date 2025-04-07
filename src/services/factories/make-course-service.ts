import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaIndicatorCourseRepository } from "../../repositories/prisma/prisma-indicator-course-repository";
import { PrismaIndicatorRepository } from "../../repositories/prisma/prisma-indicator-repository";
import { CourseService } from "../course-service";
import { makeAuthenticateService } from "./make-authenticate-service";

export const makeCourseService = () => {

    const repository = new PrismaCourseRepository();
    const auth = makeAuthenticateService();
    const indicatorRepository = new PrismaIndicatorRepository();
    const indicatorCourseRepository = new PrismaIndicatorCourseRepository();

    const service = new CourseService(
        repository,
        auth,
        indicatorRepository,
        indicatorCourseRepository
    );

    return service;

}