import { Prisma, ProducerEntity } from "@prisma/client";
import { ProducerEntityWithCities, ProducerEntityWithGoalIndicatorAndIndicatorValueSum, ProducerRepository } from "../interface/producer-repository";
import { Decimal } from "@prisma/client/runtime/library";

// const mock: ProducerEntity[] = [];
const mock: ProducerEntity[] = [
    {
        id: "1",
        code: 'P001',
        company_id: "company-1",
        city_id: "1",
        description: ""
    }
];

const goalIndicatorsMock = [
    {
        goalYear: "2025",
        goal: new Decimal(100),
        percentageAccomplished: new Decimal(75),
        code: "G1",
        producerId: "1",
        indicatorId: "indicator-1",
    },
];

const indicatorValueSumMock = [
    {
        indicatorValue: new Decimal(50),
        summaryGrouper: "2025-Q1",
        producer_id: "1",
        indicator_id: "indicator-1",
    },
];

export class InMemoryProducerRepository implements ProducerRepository {

    async findAllByCompaniesDistinctByCityAndState(companyId: string): Promise<ProducerEntity[]> {
        return mock.filter((item, index, self) =>
            item.company_id === companyId &&
            self.findIndex(i => i.city_id === item.city_id) === index
        );
    }

    async countByCity(cityId: string): Promise<number> {
        return mock.filter(item => item.city_id === cityId).length;
    }

    async findAllByCompanies(companiesIds: string[]): Promise<ProducerEntity[]> {
        return mock.filter(item => companiesIds.includes(item.company_id));
    }

    async findAllByCompany(companyId: string): Promise<ProducerEntity[]> {
        return mock.filter(item => item.company_id === companyId);
    }

    async getById(producerId: string): Promise<ProducerEntityWithGoalIndicatorAndIndicatorValueSum | null> {
        const producer = mock.find(item => item.id === producerId);

        if (!producer) {
            return null;
        }

        return {
            ...producer,
            goalIndicator: goalIndicatorsMock.filter(gi => gi.producerId === producerId),
            indicatorValueSum: indicatorValueSumMock.filter(iv => iv.producer_id === producerId),
        };
    }

    async findProducerByCityId(companyId: string, cityId: string): Promise<ProducerEntityWithCities[]> {
        // Filtra os produtores que pertencem à empresa e cidade fornecidas
        const filteredProducers = mock.filter(item => item.company_id === companyId && item.city_id === cityId);

        // Mock de cidades para adicionar aos produtores
        const citiesMock = [
            {
                id: "1",
                city: "Cidade Exemplo",
                cityNormalized: "cidade-exemplo",
                state_id: "estado-1"
            },
            // Adicione mais cidades se necessário
        ];

        // Combina os produtores filtrados com suas respectivas cidades
        const producersWithCities: ProducerEntityWithCities[] = filteredProducers.map(producer => {
            const city = citiesMock.find(c => c.id === producer.city_id);
            if (city) {
                return {
                    ...producer,
                    city // Garantindo que a propriedade city está presente
                };
            }
            // Caso a cidade não seja encontrada, retorna o produtor sem a cidade (ajustado para garantir que sempre retornamos um ProducerEntityWithCities)
            return {
                ...producer,
                city: {
                    id: '',
                    city: '',
                    cityNormalized: null,
                    state_id: ''
                }
            };
        });

        return producersWithCities;
    }


    async findProducerByCities(cityIds: string[]): Promise<ProducerEntity[]> {
        return mock.filter(item => cityIds.includes(item.city_id));
    }

    async findAll(): Promise<ProducerEntity[]> {
        return mock;
    }

    async findByCode(code: string): Promise<ProducerEntity | null> {
        return mock.find(item => item.code === code) || null;
    }

    async save(data: Prisma.ProducerEntityUncheckedCreateInput): Promise<ProducerEntity> {
        const newItem: ProducerEntity = {
            id: (mock.length + 1).toString(),
            code: data.code,
            description: data.description || null,
            company_id: data.company_id,
            city_id: data.city_id
        };

        mock.push(newItem);
        return newItem;
    }

}

