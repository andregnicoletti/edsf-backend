import { IndicatorValueSumEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ValueIndicatorRepository } from "../interface/sum-value-indicator-repository";

export class PrismaValueIndicatorCourseRepository implements ValueIndicatorRepository {

    async findById(goalYear: string, indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity | null> {
        return await prisma.indicatorValueSumEntity.findUnique({
            where: {
                producer_id_indicator_id_summaryGrouper: {
                    producer_id: producerId,
                    indicator_id: indicatorId,
                    summaryGrouper: goalYear,
                }
            }
        })
    }

    async findAll(): Promise<IndicatorValueSumEntity[]> {
        return await prisma.indicatorValueSumEntity.findMany();
    }

    async find(indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity | null> {
        return await prisma.indicatorValueSumEntity.findFirst({
            where: {
                AND: {
                    indicator_id: indicatorId,
                    producer_id: producerId,
                }
            }
        })
    }

    async save(data: Prisma.IndicatorValueSumEntityUncheckedCreateInput): Promise<IndicatorValueSumEntity> {
        return await prisma.indicatorValueSumEntity.create({ data });
    }

    async deleteById(goalYear: string, indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity> {
        return await prisma.indicatorValueSumEntity.delete({
            where: {
                producer_id_indicator_id_summaryGrouper: {
                    producer_id: producerId,
                    indicator_id: indicatorId,
                    summaryGrouper: goalYear,
                }
            }
        })
    }

};