import { GoalIndicatorEntity, Prisma } from "@prisma/client";
import { GoalIndicatorRepository } from "../interface/goal-indicator-repository";
import { Decimal } from "@prisma/client/runtime/library";

const mock: GoalIndicatorEntity[] = [
    {
        code: 'goal-2025',
        goal: new Prisma.Decimal(750.0),
        goalYear: '2025',
        indicatorId: '1',
        percentageAccomplished: new Prisma.Decimal(50.0),
        producerId: '1'
    },
    {
        code: 'goal-2024',
        goal: new Prisma.Decimal(1500.0),
        goalYear: '2024',
        indicatorId: '1',
        percentageAccomplished: new Prisma.Decimal(150.0),
        producerId: '1'
    },
    {
        code: 'goal-2023',
        goal: new Prisma.Decimal(500.0),
        goalYear: '2023',
        indicatorId: '1',
        percentageAccomplished: new Prisma.Decimal(100.0),
        producerId: '1'
    }
];

export class InMemoryGoalIndicatorRepository implements GoalIndicatorRepository {

    async findById(indicatorId: string, producerId: string, year: string): Promise<GoalIndicatorEntity | null> {
        return mock.find(
            item =>
                item.indicatorId === indicatorId &&
                item.producerId === producerId &&
                item.goalYear === year
        ) || null;
    }

    async findAllByIndicatorId(indicatorIds: string[]): Promise<GoalIndicatorEntity[]> {
        return mock.filter(item => indicatorIds.includes(item.indicatorId));
    }

    async updatePercentAccomplished(
        goalYear: string,
        indicatorId: string,
        producerId: string,
        percentageAccomplished: number
    ) {
        const item = mock.find(
            i =>
                i.goalYear === goalYear &&
                i.indicatorId === indicatorId &&
                i.producerId === producerId
        );

        if (item) {
            item.percentageAccomplished = new Decimal(Number(percentageAccomplished));
        }
    }

    async findAll(): Promise<GoalIndicatorEntity[]> {
        return mock;
    }

    async findByCode(code: string): Promise<GoalIndicatorEntity | null> {
        return mock.find(item => item.code === code) || null;
    }

    async save(data: Prisma.GoalIndicatorEntityUncheckedCreateInput): Promise<GoalIndicatorEntity> {
        const newItem: GoalIndicatorEntity = {
            indicatorId: data.indicatorId,
            producerId: data.producerId,
            goalYear: data.goalYear,
            goal: new Decimal(Number(data.goal)),
            percentageAccomplished: new Decimal(Number(data.percentageAccomplished) || 0), // Conversão para Decimal
            code: data.code
        };

        mock.push(newItem);
        return newItem;
    }
    async deleteByCode(code: string): Promise<GoalIndicatorEntity> {
        const index = mock.findIndex(item => item.code === code);
        const [deletedItem] = mock.splice(index, 1);
        return deletedItem;
    }
}

