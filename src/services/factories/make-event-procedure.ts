import { EventProcedure } from "../../events/event";
import { makeCompanyService } from "./make-company-service";
import { makeCourseService } from "./make-course-service";
import { makeGoalIndicatorService } from "./make-goal-indicator-service";
import { makeIndicatorService } from "./make-indicator-service";
import { makeProducerService } from "./make-producer-service";
import { makeWorkerService } from "./make-worker-service";

export const makeEventProcedure = () => {

    const companyService = makeCompanyService();
    const producerService = makeProducerService();
    const indicatorService = makeIndicatorService();
    const goalIndicatorService = makeGoalIndicatorService();
    const courseService = makeCourseService();
    const workerService = makeWorkerService();


    const event = new EventProcedure(
        companyService,
        producerService,
        indicatorService,
        goalIndicatorService,
        courseService,
        workerService,
    );


    return event;

}