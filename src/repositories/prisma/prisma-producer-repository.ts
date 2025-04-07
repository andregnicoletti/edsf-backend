import { Prisma, ProducerEntity } from "@prisma/client";
import { prisma } from "../../lib/prisma"
import { ProducerEntityWithCities, ProducerEntityWithGoalIndicatorAndIndicatorValueSum, ProducerRepository, ProducerVO } from "../interface/producer-repository";

export class PrismaProducerRepository implements ProducerRepository {

    async findAllByFilters(
        companyId: string, 
        startOfMonth: Date, 
        endOfMonth: Date, 
        indicators: string[], 
        citiesId: string[],
    ): Promise<ProducerVO[]> {

        const query = `
            SELECT DISTINCT 
                cp."ID_PRODUTOR" as producer_id, 
                cp."DESC_PRODUTOR" as producer_description, 
                cp."CODIGO_PRODUTOR" as producer_code,
                cp."ID_CIDADE" as producer_city_id
            FROM "CAD_PRODUTOR" cp
            JOIN "CAD_INDICADOR_META" cim ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            JOIN "CAD_INDICADOR" ci ON cim."ID_INDICADOR" = ci."ID_INDICADOR"
            WHERE  cp."ID_ORGANIZACAO" = $1
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')}) ` : ""}
                ${citiesId.length > 0 ? ` AND cp."ID_CIDADE" IN (${citiesId.map(i => `'${i}'`).join(',')}) ` : ""}
                AND cim."ANO_META" BETWEEN EXTRACT(YEAR FROM $2::DATE)::TEXT AND EXTRACT(YEAR FROM $3::DATE)::TEXT
        `;

        const params: Array<string | Date> = [
            companyId,
            startOfMonth,
            endOfMonth
        ];

        console.log('Query:', query);
        console.log('Params:', params);

        const r = await prisma.$queryRawUnsafe<ProducerVO[]>(query, ...params);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> r: ', r)
        return r;
    }

    async findAllByCompaniesDistinctByCityAndState(companyId: string): Promise<ProducerEntity[]> {
        return await prisma.producerEntity.findMany({ where: { company_id: companyId }, distinct: "city_id" })
    }

    async countByCity(cityId: string): Promise<number> {
        return await prisma.producerEntity.count({ where: { city_id: cityId } })
    }

    async findAllByCompanies(companiesIds: string[]): Promise<ProducerEntity[]> {
        return await prisma.producerEntity.findMany({ where: { company_id: { in: companiesIds } }, distinct: "company_id" });
    }

    async findAllByCompany(companyId: string): Promise<ProducerEntity[]> {
        return await prisma.producerEntity.findMany({ where: { company_id: companyId } });
    }

    async getById(producerId: string): Promise<ProducerEntityWithGoalIndicatorAndIndicatorValueSum | null> {
        return await prisma.producerEntity.findUnique({
            where: { id: producerId },
            include: { goalIndicator: true, indicatorValueSum: true },
        });
    }

    // async findProducerByCityId(companyId: string, id: string): Promise<ProducerEntity[]> {
    async findProducerByCityId(companyId: string, id: string): Promise<ProducerEntityWithCities[]> {
        return await prisma.producerEntity.findMany({
            where: {
                city_id: id,
                company_id: companyId
            },
            include: { city: true }
        });
    }

    async findProducerByCities(companyId: string, ids: string[]): Promise<ProducerEntity[]> {
        return await prisma.producerEntity.findMany(
            {
                where: {
                    city_id: { in: ids },
                    company_id: companyId,
                }
            }
        )
    }

    async findAll(): Promise<ProducerEntity[]> {
        return await prisma.producerEntity.findMany();
    }

    async findByCode(code: string): Promise<ProducerEntity | null> {
        const trimmedCode = code.trim();
        return await prisma.producerEntity.findFirst({ where: { code: { equals: trimmedCode, mode: 'insensitive' } } })
    }

    async save(data: Prisma.ProducerEntityUncheckedCreateInput): Promise<ProducerEntity> {
        return await prisma.producerEntity.create({ data });
    }

};