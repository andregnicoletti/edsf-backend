import { GoalIndicatorEntity, Prisma } from "@prisma/client";

export interface GoalIndicatorRepository {

    findById(indicatorId: string, producerId: string, year: string): Promise<GoalIndicatorEntity | null>;

    findAllByIndicatorId(indicatorIds: string[]): Promise<GoalIndicatorEntity[]>

    updatePercentAccomplished(goalYear: string, indicatorId: string, producerId: string, percentageAccomplished: number): void;

    findAll(): Promise<GoalIndicatorEntity[]>

    findByCode(code: string): Promise<GoalIndicatorEntity | null>

    save(data: Prisma.GoalIndicatorEntityUncheckedCreateInput): Promise<GoalIndicatorEntity>

    deleteByCode(code: string): Promise<GoalIndicatorEntity>;

}