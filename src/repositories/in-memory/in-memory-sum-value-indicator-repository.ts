import { IndicatorValueSumEntity, Prisma } from "@prisma/client";
import { ValueIndicatorRepository } from "../interface/sum-value-indicator-repository";

const mock: IndicatorValueSumEntity[] = [
    {
        indicator_id: '1',
        indicatorValue: new Prisma.Decimal(1500),
        producer_id: '1',
        summaryGrouper: '2025',
    },
    {
        indicator_id: '1',
        indicatorValue: new Prisma.Decimal(1000),
        producer_id: '1',
        summaryGrouper: '2024',
    },
    {
        indicator_id: '1',
        indicatorValue: new Prisma.Decimal(500),
        producer_id: '1',
        summaryGrouper: '2023',
    }
];

export class InMemoryValueIndicatorRepository implements ValueIndicatorRepository {

    async findById(goalYear: string, indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity | null> {
        return mock.find(
            item =>
                item.summaryGrouper === goalYear &&
                item.indicator_id === indicatorId &&
                item.producer_id === producerId
        ) || null;
    }

    async findAll(): Promise<IndicatorValueSumEntity[]> {
        return mock;
    }

    async find(indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity | null> {
        return mock.find(
            item =>
                item.indicator_id === indicatorId &&
                item.producer_id === producerId
        ) || null;
    }

    async save(data: Prisma.IndicatorValueSumEntityUncheckedCreateInput): Promise<IndicatorValueSumEntity> {
        const newItem: IndicatorValueSumEntity = {
            indicatorValue: new Prisma.Decimal(Number(data.indicatorValue)),
            summaryGrouper: data.summaryGrouper,
            producer_id: data.producer_id,
            indicator_id: data.indicator_id
        };

        mock.push(newItem);
        return newItem;
    }

    async deleteById(goalYear: string, indicatorId: string, producerId: string): Promise<IndicatorValueSumEntity> {
        const index = mock.findIndex(
            item =>
                item.summaryGrouper === goalYear &&
                item.indicator_id === indicatorId &&
                item.producer_id === producerId
        );

        const [deletedItem] = mock.splice(index, 1);
        return deletedItem;

    }

}

