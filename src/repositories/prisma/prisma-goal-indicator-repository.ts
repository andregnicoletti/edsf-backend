import { GoalIndicatorEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma"
import { GoalIndicatorRepository } from "../interface/goal-indicator-repository";

export class PrismaGoalIndicatorRepository implements GoalIndicatorRepository {

    async findById(indicatorId: string, producerId: string, goalYear: string): Promise<GoalIndicatorEntity | null> {
        return await prisma.goalIndicatorEntity.findUnique({
            where: {
                goalYear_indicatorId_producerId: {
                    goalYear,
                    indicatorId,
                    producerId,
                }
            }
        })
    }

    async findAllByIndicatorId(indicatorIds: string[]): Promise<GoalIndicatorEntity[]> {
        return await prisma.goalIndicatorEntity.findMany({ where: { indicatorId: { in: indicatorIds } } });
    }

    async updatePercentAccomplished(goalYear: string, indicatorId: string, producerId: string, percentageAccomplished: number) {
        await prisma.goalIndicatorEntity.update({
            where: {
                goalYear_indicatorId_producerId: {
                    goalYear,
                    indicatorId,
                    producerId,
                }
            },
            data: { percentageAccomplished }
        });
    }

    async findAll(): Promise<GoalIndicatorEntity[]> {
        return await prisma.goalIndicatorEntity.findMany();
    }

    async findByCode(code: string): Promise<GoalIndicatorEntity | null> {
        const trimmedCode = code.trim();
        return await prisma.goalIndicatorEntity.findFirst({ where: { code: { equals: trimmedCode, mode: 'insensitive' } } });
    }

    async save(data: Prisma.GoalIndicatorEntityUncheckedCreateInput): Promise<GoalIndicatorEntity> {
        return await prisma.goalIndicatorEntity.create({ data });
    }

    async deleteByCode(code: string): Promise<GoalIndicatorEntity> {
        const trimmedCode = code.trim();
        return await prisma.goalIndicatorEntity.delete({ where: { code: trimmedCode } })
    }

};