import { Prisma, ProducerEntity } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface ProducerEntityWithGoalIndicatorAndIndicatorValueSum extends ProducerEntity {
    goalIndicator: {
        goalYear: string,
        goal: Decimal,
        percentageAccomplished: Decimal,
        code: string,
        producerId: string,
        indicatorId: string,
    }[],
    indicatorValueSum: {
        indicatorValue: Decimal,
        summaryGrouper: string,
        producer_id: string,
        indicator_id: string,
    }[]
}

export interface ProducerEntityWithCities extends ProducerEntity {
    city: {
        id: string
        city: string
        cityNormalized: string | null
        state_id: string
    }
}

export interface ProducerVO {
    producer_id: string,
    producer_code: string,
    producer_description: string,
    producer_city_id: string,
}

export interface ProducerRepository {

    findAllByFilters(companyId: string, startOfMonth: Date, endOfMonth: Date, indicators: string[], citiesId: string[]): Promise<ProducerVO[]>;

    findAllByCompaniesDistinctByCityAndState(companyId: string): Promise<ProducerEntity[]>;

    countByCity(cityId: string): Promise<number>;

    findAllByCompanies(companiesIds: string[]): Promise<ProducerEntity[]>;

    findAllByCompany(companyId: string): Promise<ProducerEntity[]>;

    getById(producerId: string): Promise<ProducerEntityWithGoalIndicatorAndIndicatorValueSum | null>;

    findProducerByCityId(companyId: string, id: string): Promise<ProducerEntityWithCities[]>;

    findProducerByCities(companyId: string, ids: string[]): Promise<ProducerEntity[]>;

    findAll(): Promise<ProducerEntity[]>;

    findByCode(code: string): Promise<ProducerEntity | null>

    save(data: Prisma.ProducerEntityUncheckedCreateInput): Promise<ProducerEntity>

}