import { PrismaGoalIndicatorRepository } from "../../repositories/prisma/prisma-goal-indicator-repository";
import { GoalIndicatorService } from "../goal-indicator-service";
import { makeIndicatorService } from "./make-indicator-service";
import { makeProducerService } from "./make-producer-service";

export const makeGoalIndicatorService = () => {

    const repository = new PrismaGoalIndicatorRepository();
    const producerService = makeProducerService();
    const indicatorService = makeIndicatorService();

    const service = new GoalIndicatorService(
        repository,
        producerService,
        indicatorService,
    );

    return service;

}