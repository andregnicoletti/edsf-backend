import { IndicatorEntity, Prisma } from "@prisma/client";
import { IndicatorRepository } from "../interface/indicator-repository";

const mock: IndicatorEntity[] = [
    {
        id: '1',
        code: 'I001',
        company_id: '1',
        indicatorDescription: 'Indicator I001 for tests',
    }
];

export class InMemoryIndicatorRepository implements IndicatorRepository {

    async findAllByCompanyId(company_id: string): Promise<IndicatorEntity[]> {
        return mock.filter(item => item.company_id === company_id);
    }

    async findAllByIndicatorId(indicatorIds: string[]): Promise<IndicatorEntity[]> {
        return mock.filter(item => indicatorIds.includes(item.id));
    }

    async findAll(): Promise<IndicatorEntity[]> {
        return mock;
    }

    async findByCode(code: string): Promise<IndicatorEntity | null> {
        return mock.find(item => item.code === code) || null;
    }

    async save(data: Prisma.IndicatorEntityUncheckedCreateInput): Promise<IndicatorEntity> {
        const newItem: IndicatorEntity = {
            id: (mock.length + 1).toString(), // Generating a simple ID
            company_id: data.company_id,
            indicatorDescription: data.indicatorDescription,
            code: data.code,
        };

        mock.push(newItem);
        return newItem;
    }

    async deleteByCode(code: string): Promise<IndicatorEntity> {
        const index = mock.findIndex(item => item.code === code);
        const [deletedItem] = mock.splice(index, 1);
        return deletedItem;
    }

}

