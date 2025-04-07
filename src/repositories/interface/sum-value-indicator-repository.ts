import { IndicatorValueSumEntity, Prisma } from "@prisma/client";

export interface ValueIndicatorRepository {

    findById(goalYear: string, indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity | null>;

    findAll(): Promise<IndicatorValueSumEntity[]>

    find(indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity | null>

    save(data: Prisma.IndicatorValueSumEntityUncheckedCreateInput): Promise<IndicatorValueSumEntity>

    deleteById(goalYear: string, indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity>;

}