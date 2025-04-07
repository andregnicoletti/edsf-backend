import { CityEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma"
import { CityRepository, CityVO } from "../interface/city-repository";
import logger from "../../config/logger";

export class PrismaCityRepository implements CityRepository {

    async findAllByFilters(company_id: string, startOfMonth: Date, endOfMonth: Date, courses: string[], indicators: string[]): Promise<CityVO[]> {

         const query = `
            SELECT cuf."ID_UF" as state_id, cuf."CIDADE" as city, cuf."ID_CIDADE" as id
            FROM "CAD_CIDADE" cuf
            WHERE cuf."ID_CIDADE" IN (
                SELECT DISTINCT atc."ID_CIDADE"
                FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
                WHERE ci."ID_ORGANIZACAO" = $1
                ${courses.length > 0 ? `AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(', ')})` : ""}
                ${indicators.length > 0 ? `AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(', ')})` : ""}
                AND (
                    atc."DATA_INSCRICAO" <= $3
                    ${startOfMonth ? `AND atc."DATA_INSCRICAO" >= $2` : ""}
                    OR atc."DATA_CONCLUSAO" <= $3
                    ${startOfMonth ? `AND atc."DATA_CONCLUSAO" >= $2` : ""}
                )
            )
            OR cuf."ID_CIDADE" IN (
                SELECT DISTINCT cp."ID_CIDADE"
                FROM "CAD_PRODUTOR" cp
                JOIN "CAD_INDICADOR_META" cim ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
                JOIN "CAD_INDICADOR" ci ON cim."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON ci."ID_INDICADOR" = aic."ID_INDICADOR" 
                JOIN "CAD_CURSO" cc ON aic."ID_CURSO" = cc."ID_CURSO"
                WHERE ci."ID_ORGANIZACAO" = $1
                ${courses.length > 0 ? `AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(', ')})` : ""}
                ${indicators.length > 0 ? `AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(', ')})` : ""}
                AND cim."ANO_META" BETWEEN EXTRACT(YEAR FROM $2::DATE)::TEXT AND EXTRACT(YEAR FROM $3::DATE)::TEXT
            );
         `;

        // Preparar os parâmetros dinamicamente
        const params: Array<string | Date> = [company_id];

        if (startOfMonth) {
            params.push(startOfMonth);
        } else {
            // Placeholders exigem algo nas posições mesmo que não use
            params.push(new Date('1900-01-01'));
        }

        params.push(endOfMonth);

        // Adiciona os cursos e indicadores aos parâmetros
        params.push(...courses);
        params.push(...indicators);

        console.log(`Query findAllByFilters: ${query}`);
        console.log(`Params: ${params}`);

        return await prisma.$queryRawUnsafe<CityVO[]>(query, ...params);
    }

    async getById(cityId: string): Promise<CityEntity | null> {
        return await prisma.cityEntity.findFirst({ where: { id: cityId } });
    }

    async findByIds(citiesId: string[]): Promise<CityEntity[]> {
        return await prisma.cityEntity.findMany({ where: { id: { in: citiesId } } });
    }

    async dashboardFilterCities(cities: string[], states: string[]): Promise<CityEntity[]> {
        // return await prisma.cityEntity.findMany({
        //     where: {
        //         AND: [
        //             { city: { in: cities, mode: "insensitive" } },
        //             { state_id: { in: states, mode: "insensitive" } },
        //         ],
        //     }
        // })

        // Condicionalmente criar o array de filtros baseado nos valores de cities e states
        const filters: Prisma.CityEntityWhereInput = {};

        // Adiciona o filtro para as cidades, se houver valores em 'cities'
        if (cities.length > 0) {
            filters.city = { in: cities, mode: "insensitive" };
        }

        // Adiciona o filtro para os estados, se houver valores em 'states'
        if (states.length > 0) {
            filters.state_id = { in: states, mode: "insensitive" };
        }

        // Executa a consulta, usando os filtros gerados
        return await prisma.cityEntity.findMany({
            where: filters, // Aplica os filtros gerados dinamicamente
        });
    }

    async findAllCitiesByName(cityName: string): Promise<CityEntity[]> {
        return await prisma.cityEntity.findMany({
            where: {
                city: {
                    contains: cityName,
                    mode: "insensitive"
                }
            }
        })
    }

    async findAll(): Promise<CityEntity[]> {
        return await prisma.cityEntity.findMany();
    }

    async findByNameAndUf(name: string, uf: string): Promise<CityEntity | null> {

        const trimmedName = name.trim();
        const trimmedUf = uf.trim();

        logger.debug(`Search values: ${trimmedName} - ${trimmedUf}`);

        return await prisma.cityEntity.findFirst({
            where: {
                OR: [
                    {
                        city: {
                            // contains: trimmedName,
                            equals: trimmedName,
                            mode: 'insensitive', // Ignora maiúsculas e minúsculas
                        },
                    },
                    {
                        cityNormalized: {
                            // contains: trimmedName,
                            equals: trimmedName,
                            mode: 'insensitive', // Ignora maiúsculas e minúsculas
                        },
                    },
                ],
                AND: [
                    {
                        state_id: {
                            // contains: trimmedUf,
                            equals: trimmedUf,
                            mode: 'insensitive', // Ignora maiúsculas e minúsculas
                        },
                    },
                ],
            },
        });
    }

};