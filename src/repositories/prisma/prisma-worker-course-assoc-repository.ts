import { Prisma, WorkerCourseAssocEntity } from "@prisma/client";
import { DashCities, DashLineEntity, DashStackedEntity, DashTopOneCourse, DashTotalCertified, DashTotalGoal, DashTotalProducers, DashTotalStudents, DashTotalSubscribers, DashWorkerCourseAssocEntity, MinMaxYear, WorkerCourseAssocRepository } from "../interface/worker-course-assoc-repository";
import { prisma } from "../../lib/prisma";
import logger from "../../config/logger";

export class PrismaWorkerCourseAssocRepository implements WorkerCourseAssocRepository {

    async updateCompletionDate(cpf: string, registrationDate: Date, course_id: string, completionDate: Date | null | undefined): Promise<WorkerCourseAssocEntity> {
        return await prisma.workerCourseAssocEntity.update({
            data: {
                completionDate
            },
            where: {
                cpf_course_id_registrationDate: {
                    cpf, registrationDate, course_id
                }
            }
        });
    }

    async countTotalTrainingByFilters(company_id: string, startOfMonth: Date | null, endOfMonth: Date, cities: string[], courses: string[], indicators: string[], producers: string[]): Promise<DashTotalSubscribers[]> {
        const query = `
            SELECT
                atc."ID_CIDADE" AS city_id,
                COUNT(DISTINCT atc."CPF")::INT AS total_subscribers
            FROM "ASSOC_TRABALHADOR_CURSO" atc
            JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
            JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
            JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
            JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
            JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
            JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE 
                atc."DATA_CONCLUSAO" IS NULL  
                AND atc."DATA_INSCRICAO" <= $2
                ${startOfMonth ? `AND atc."DATA_INSCRICAO" >= $3` : ""}
                ${cities.length > 0 ? ` AND atc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(',')}) ` : ""}
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')}) ` : ""}
                ${producers.length > 0 ? ` AND cp."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')}) ` : ""}
                AND co."ID_ORGANIZACAO" = $1
            GROUP BY atc."ID_CIDADE";`

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`countTotalTrainingByFilters: ${query}`);
        logger.debug(`params: ${params}`);

        return await prisma.$queryRawUnsafe<DashTotalSubscribers[]>(query, ...params);
    }

    async fetchMinAndMaxYears(): Promise<MinMaxYear> {
        const query = `
            SELECT 
                MIN(EXTRACT(YEAR FROM "DATA_INSCRICAO")) AS min_date,
                MAX(EXTRACT(YEAR FROM "DATA_INSCRICAO")) AS max_date
            FROM "ASSOC_TRABALHADOR_CURSO";
        `;

        logger.debug(`fetchMinAndMaxYears: ${query}`)
        const result = await prisma.$queryRawUnsafe<[MinMaxYear]>(query);

        // Pega o primeiro item do array, ou retorna um objeto vazio caso não exista resultado
        return result[0] ?? { min_date: null, max_date: null };

    }

    async getCourseWithMostEnrollments(
        company_id: string,
        startOfMonth: Date,
        endOfMonth: Date,
        order: string,
        indicators: string[],
        courses: string[],
        cities: string[],
        producers: string[],
    ): Promise<DashTopOneCourse[]> {
        //ok
        const query = `
            WITH course_stats AS (
                SELECT
                    cc."DESC_CURSO" AS course_name,
                    COUNT(DISTINCT atc."CPF") FILTER (WHERE atc."DATA_CONCLUSAO" IS NULL AND atc."DATA_INSCRICAO" <= $2)::INT AS people_in_training,
                    COUNT(DISTINCT atc."CPF") FILTER (WHERE atc."DATA_CONCLUSAO" BETWEEN $3 AND $2)::INT AS certified_people,
                    COUNT(DISTINCT atc."CPF") FILTER (WHERE atc."DATA_INSCRICAO" BETWEEN $3 AND $2)::INT AS total_enrollments,
                    MAX(cc."QTD_AULAS")::INT AS total_lessons,
                    AVG(cc."DURACAO_MEDIA")::INT AS average_duration
                FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
                WHERE
                    co."ID_ORGANIZACAO" = $1
                    ${producers.length > 0 ? `AND cp."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')}) ` : ""}
                    ${indicators.length > 0 ? `AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')}) ` : ""}
                    ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')})` : ""} 
                    ${cities.length > 0 ? ` AND atc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(',')})` : ""} 
                GROUP BY cc."DESC_CURSO"
            )
            SELECT 
                course_name,
                people_in_training,
                certified_people,
                total_lessons,
                average_duration
            FROM course_stats
            ORDER BY total_enrollments ${order}
            LIMIT 1;
        `;

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`getCourseWithMostEnrollments: ${query}`)
        logger.debug(`params: ${params}`)

        return await prisma.$queryRawUnsafe<DashTopOneCourse[]>(query, ...params);
    }

    async countTotalGoalByFilters(
        company_id: string,
        yearFrom: string,
        yearTo: string,
        cities: string[],
        indicators: string[],
        courses: string[],
        producers: string[],
    ): Promise<DashTotalGoal[]> {

        const query = `
            WITH producer_goal_status AS (
            SELECT 
                cdc."ID_CIDADE" AS city_id,
                cim."ID_PRODUTOR" AS producer_id,
                CASE 
                    WHEN MAX(cim."PERCENTUAL_REALIZADO")::INT >= 100 THEN 1 ELSE 0 
                END AS has_achieved_goal
            FROM "CAD_INDICADOR_META" cim
                JOIN "CAD_PRODUTOR" cp ON cim."ID_PRODUTOR" = cp."ID_PRODUTOR"
                JOIN "CAD_CIDADE" cdc ON cp."ID_CIDADE" = cdc."ID_CIDADE"
                JOIN "CAD_INDICADOR" ci ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON ci."ID_INDICADOR" = aic."ID_INDICADOR"
                JOIN "CAD_CURSO" cc ON cc."ID_CURSO" = aic."ID_CURSO"  
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
            WHERE 
                (cim."ANO_META" = $2 OR cim."ANO_META" = $3)
                AND cp."ID_ORGANIZACAO" = $1
                ${cities.length > 0 ? ` AND cdc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(',')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')}) ` : ""}
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')}) ` : ""}
                ${producers.length > 0 ? ` AND cp."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')}) ` : ""}
            GROUP BY cdc."ID_CIDADE", cim."ID_PRODUTOR"
        )
        SELECT 
            city_id,
            COUNT(producer_id)::INT AS total_producers,
            SUM(has_achieved_goal)::INT AS has_achieved_goal
        FROM producer_goal_status
        GROUP BY city_id
        ORDER BY city_id;`

        logger.debug(`countTotalGoalByFilters: ${query}`)

        return await prisma.$queryRawUnsafe<DashTotalGoal[]>(query, company_id, String(yearFrom), String(yearTo));
    }

    async countTotalProducerByFilters(
        company_id: string,
        cities: string[],
        indicador: string[],
        courses: string[],
        yearFrom: string,
        yearTo: string,
        producers: string[],
    ): Promise<DashTotalProducers[]> {
        const query = `
            SELECT 
                cp."ID_CIDADE" AS city_id,
                COUNT(DISTINCT cp."ID_PRODUTOR")::INT AS total_producer
            FROM "CAD_PRODUTOR" cp
            JOIN "CAD_CIDADE" cdc ON cdc."ID_CIDADE" = cp."ID_CIDADE"
            JOIN "CAD_INDICADOR_META" cim ON cim."ID_PRODUTOR" = cp."ID_PRODUTOR"
            JOIN "CAD_INDICADOR" ci ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
            JOIN "ASSOC_INDICADOR_CURSO" aic ON ci."ID_INDICADOR" = aic."ID_INDICADOR"
            JOIN "CAD_CURSO" cc ON cc."ID_CURSO" = aic."ID_CURSO"  
            WHERE
                cp."ID_ORGANIZACAO" = $1
                ${cities.length > 0 ? ` AND cp."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(',')}) ` : ""}
                ${indicador.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicador.map(i => `'${i}'`).join(',')})` : ""}
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')})` : ""}
                ${producers.length > 0 ? ` AND cp."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')})` : ""}
                AND cim."ANO_META" BETWEEN $2 AND $3
            GROUP BY cp."ID_CIDADE";`

        const params: Array<string | Date> = [company_id, yearFrom, yearTo];
        logger.debug(`countTotalProducerByFilters: ${query}`)
        logger.debug(`params: ${params}`);

        return await prisma.$queryRawUnsafe<DashTotalProducers[]>(query, ...params)
    }


    async countTotalCertifiedByFilters(company_id: string, startOfMonth: Date | null, endOfMonth: Date, cities: string[], courses: string[], indicators: string[], producers: string[]): Promise<DashTotalCertified[]> {

        const query = `
            SELECT
                atc."ID_CIDADE" AS city_id,
                COUNT(DISTINCT atc."CPF")::INT AS total_certified
            FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "CAD_CIDADE" cdc ON atc."ID_CIDADE" = cdc."ID_CIDADE"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE 
                atc."DATA_CONCLUSAO" <= $2 AND
                ${startOfMonth ? ` atc."DATA_CONCLUSAO" >= $3 AND` : ""}
                ${cities.length > 0 ? ` atc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(',')}) AND ` : ""}
                ${courses.length > 0 ? ` cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')}) AND ` : ""}
                ${indicators.length > 0 ? `ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')}) AND ` : ""}
                ${producers.length > 0 ? ` cp."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')}) AND ` : ""}
                co."ID_ORGANIZACAO" = $1
            GROUP BY atc."ID_CIDADE";`

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`countTotalCertifiedByFilters: ${query}`);
        logger.debug(`params: ${params}`);

        return await prisma.$queryRawUnsafe<DashTotalCertified[]>(query, ...params);
    }

    async getTopCitiesByRegistrations(
        company_id: string,
        startOfMonth: Date | null,
        endOfMonth: Date,
        cities: string[],
        courses: string[],
        limit: number,
        order: string,
        indicators: string[],
    ): Promise<DashTotalStudents[]> {

        const query = `
            SELECT 
                atc."ID_CIDADE" AS city_id, 
                COUNT(DISTINCT "CPF")::INT AS total_student
            FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE 
                co."ID_ORGANIZACAO" = $1 AND
                atc."DATA_INSCRICAO" <= $2
                ${startOfMonth ? ` AND atc."DATA_INSCRICAO" >= $3 ` : ""}
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')}) ` : ""}
                ${cities.length > 0 ? ` AND atc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(', ')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(', ')})` : ""}
            GROUP BY atc."ID_CIDADE"
            ORDER BY total_student ${order}
			LIMIT ${limit};`

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`getTopCitiesByRegistrations: ${query}`);
        logger.debug(`params: ${params}`);

        return await prisma.$queryRawUnsafe<DashTotalStudents[]>(query, ...params)
    }

    async countTotalStudentByFilters(company_id: string, startOfMonth: Date | null, endOfMonth: Date, cities: string[], courses: string[], indicators: string[], producers: string[]): Promise<DashTotalStudents[]> {
        const query = `
            SELECT
                atc."ID_CIDADE" AS city_id,
                COUNT(DISTINCT atc."CPF")::INT AS total_student
            FROM "ASSOC_TRABALHADOR_CURSO" atc
            JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
            JOIN "CAD_CIDADE" cdc ON atc."ID_CIDADE" = cdc."ID_CIDADE"
            JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
            JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
            JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
            JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
            JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE 
                co."ID_ORGANIZACAO" = $1
                AND atc."DATA_INSCRICAO" <= $2
                ${startOfMonth ? `AND atc."DATA_INSCRICAO" >= $3` : ""}
                ${cities.length > 0 ? ` AND atc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(',')}) ` : ""}
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')}) ` : ""}
                ${indicators.length > 0 ? ` AND cim."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')}) ` : ""}
                ${producers.length > 0 ? ` AND ip."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')}) ` : ""}
            GROUP BY 
                atc."ID_CIDADE";`;

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`countTotalStudentByFilters: ${query}`)
        logger.debug(`params: ${params}`)

        return await prisma.$queryRawUnsafe<DashTotalStudents[]>(query, ...params);
    }

    async findCitiesIdByFilters(
        company_id: string,
        startOfMonth: Date,
        endOfMonth: Date,
        cities: string[],
        states: string[],
        courses: string[],
        indicators: string[],
        producers: string[]
    ): Promise<DashCities[]> {

        const query = `
            SELECT 
                atc."ID_CIDADE" AS "city_id", 
                cdc."CIDADE" AS "city_name",
                cdc."ID_UF" AS "state_id"
            FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "CAD_CIDADE" cdc ON atc."ID_CIDADE" = cdc."ID_CIDADE"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE 
                atc."DATA_INSCRICAO" <= $2 
                ${startOfMonth ? ` AND atc."DATA_INSCRICAO" >= $3 ` : ""}
                ${cities.length > 0 ? ` AND cdc."CIDADE" IN (${cities.map(i => `'${i}'`).join(',')}) ` : ""}
                ${states.length > 0 ? ` AND cdc."ID_UF" IN (${states.map(i => `'${i}'`).join(',')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')})` : ""}
                ${producers.length > 0 ? ` AND cp."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')}) ` : ""}
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')}) ` : ""}
                AND co."ID_ORGANIZACAO" = $1
            GROUP BY atc."ID_CIDADE", cdc."CIDADE", cdc."ID_UF";`

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`findCitiesIdByFilters: ${query}`)
        logger.debug(`params: ${params}`)

        return await prisma.$queryRawUnsafe<DashCities[]>(query, ...params);
    }

    async subscribedStudentsAndCompany(
        company_id: string,
        startOfMonth: Date | null,
        endOfMonth: Date,
        cities: string[],
        states: string[],
        courses: string[],
        indicators: string[],
        producers: string[],
    ): Promise<DashWorkerCourseAssocEntity[]> {

        const query = `
            SELECT DISTINCT ON (atc."CPF")
                atc."CPF" AS cpf,
                atc."DATA_INSCRICAO" AS "registration_date", 
                atc."DATA_CONCLUSAO" AS "completion_date", 
                atc."ID_CURSO" AS "course_id", 
                atc."ID_CIDADE" AS "city_id", 
                atc."DATA_ULT_ACESSO" AS "last_access_date",
                cc."CODIGO" AS "course_code",
                cdc."CIDADE" AS "city_name",
                cdc."ID_UF" AS "state"
            FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "CAD_CIDADE" cdc ON atc."ID_CIDADE" = cdc."ID_CIDADE"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON atc."ID_CURSO" = aic."ID_CURSO"
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE
                co."ID_ORGANIZACAO" = $1
                AND atc."DATA_INSCRICAO" <= $2
                ${startOfMonth ? ` AND atc."DATA_INSCRICAO" >= $3 ` : ""}
                ${cities.length > 0 ? ` AND cdc."CIDADE" IN (${cities.map(i => `'${i}'`).join(',')}) ` : ""}
                ${states.length > 0 ? ` AND cdc."ID_UF" IN (${states.map(i => `'${i}'`).join(',')}) ` : ""} 
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')})` : ""}
                ${producers.length > 0 ? ` AND cp."CODIGO_PRODUTOR" IN (${producers.map(i => `'${i}'`).join(',')})` : ""}
            ORDER BY atc."CPF", city_name;
        `;


        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`subscribedStudentsAndCompany: ${query}`)
        logger.debug(`params: ${params}`)

        return await prisma.$queryRawUnsafe<DashWorkerCourseAssocEntity[]>(query, ...params);
    }

    async dashLineChart(
        company_id: string,
        start: Date,
        end: Date,
        order: string,
        limit: number,
        courses: string[],
        cities: string[],
        indicators: string[],
    ): Promise<DashLineEntity[]> {

        const query = `
            SELECT 
                c."CIDADE" AS city_name,
                c."ID_UF" AS state,
                c."ID_CIDADE" as city_id,
                COUNT(DISTINCT atc."CPF")::INT AS total_enrolled,
                COUNT(DISTINCT CASE WHEN atc."DATA_CONCLUSAO" IS NOT NULL THEN atc."CPF" END)::INT AS "certified",
                COUNT(DISTINCT CASE WHEN atc."DATA_CONCLUSAO" IS NULL THEN atc."CPF" END)::INT AS "in_training"
            FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO"
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
                JOIN "CAD_CIDADE" c ON atc."ID_CIDADE" = c."ID_CIDADE"
                JOIN "CAD_UF" u ON c."ID_UF" = u."ID_UF"
            WHERE 
                atc."DATA_CONCLUSAO" BETWEEN $2 AND $3 
                AND co."ID_ORGANIZACAO" = $1
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(', ')}) ` : ""}
                ${cities.length > 0 ? ` AND c."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(', ')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(', ')})` : ""}
            GROUP BY c."CIDADE", c."ID_UF",  c."ID_CIDADE"
            ORDER BY total_enrolled ${order}
            LIMIT ${limit};`

        logger.debug(`dashLineChart: ${query}`)

        return await prisma.$queryRawUnsafe<DashLineEntity[]>(query, company_id, start, end);
    }

    async dashStackedColumnChartCoursesCompleted(
        company_id: string,
        startOfMonth: Date,
        endOfMonth: Date,
        order: string,
        courses: string[],
        cities: string[],
        indicators: string[]
    ): Promise<DashStackedEntity[]> {

        const query = `
            SELECT 
                c."CIDADE" AS city_name,
                c."ID_UF" AS state,
                atc."ID_CIDADE" AS city_id, 
                atc."ID_CURSO" AS course_id, 
                cc."DESC_CURSO" AS course_description,
                cc."CODIGO" AS course_code,
                CAST(COUNT(DISTINCT "CPF") AS INTEGER) AS total_distinct_cpfs
            FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CIDADE" c ON atc."ID_CIDADE" = c."ID_CIDADE"
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE 
                atc."DATA_CONCLUSAO" >= $3 AND 
                atc."DATA_CONCLUSAO" <= $2 AND
                co."ID_ORGANIZACAO" = $1
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(', ')}) ` : ""}
                ${cities.length > 0 ? ` AND atc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(', ')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(', ')}) ` : ""}
            GROUP BY c."CIDADE", c."ID_UF", atc."ID_CIDADE", atc."ID_CURSO", cc."DESC_CURSO", cc."CODIGO" 
            ORDER BY total_distinct_cpfs ${order}`

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`dashStackedColumnChartCoursesCompleted: ${query}`)
        logger.debug(`params: ${params}`)

        return await prisma.$queryRawUnsafe<DashStackedEntity[]>(query, ...params);
    }

    async dashStackedColumnChartCoursesNotCompleted(
        company_id: string,
        startOfMonth: Date | null,
        endOfMonth: Date,
        order: string,
        courses: string[],
        cities: string[],
        indicators: string[],
    ): Promise<DashStackedEntity[]> {
        const query = `
            SELECT 
                c."CIDADE" AS city_name,
                c."ID_UF" AS state,
                atc."ID_CIDADE" AS city_id, 
                atc."ID_CURSO" AS course_id, 
                cc."DESC_CURSO" AS course_description,
                cc."CODIGO" AS course_code,
                CAST(COUNT(DISTINCT "CPF") AS INTEGER) AS total_distinct_cpfs
            FROM "ASSOC_TRABALHADOR_CURSO" atc
                JOIN "CAD_CIDADE" c ON atc."ID_CIDADE" = c."ID_CIDADE"
                JOIN "CAD_CURSO" cc ON atc."ID_CURSO" = cc."ID_CURSO"
                JOIN "ASSOC_INDICADOR_CURSO" aic ON cc."ID_CURSO" = aic."ID_CURSO" 
                JOIN "CAD_INDICADOR" ci ON aic."ID_INDICADOR" = ci."ID_INDICADOR"
                JOIN "CAD_ORGANIZACAO" co ON ci."ID_ORGANIZACAO" = co."ID_ORGANIZACAO"
                JOIN "CAD_INDICADOR_META" cim ON ci."ID_INDICADOR" = cim."ID_INDICADOR"
                JOIN "CAD_PRODUTOR" cp ON cp."ID_PRODUTOR" = cim."ID_PRODUTOR"
            WHERE 
                atc."DATA_INSCRICAO" <= $2 AND
                ${startOfMonth ? `atc."DATA_INSCRICAO" >= $3 AND ` : ""}
                co."ID_ORGANIZACAO" = $1
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(', ')}) ` : ""}
                ${cities.length > 0 ? ` AND atc."ID_CIDADE" IN (${cities.map(i => `'${i}'`).join(', ')}) ` : ""}
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(', ')}) ` : ""}
            GROUP BY c."CIDADE", c."ID_UF", atc."ID_CIDADE", atc."ID_CURSO", cc."DESC_CURSO", cc."CODIGO" 
            ORDER BY total_distinct_cpfs ${order}`

        const params: Array<string | Date> = [company_id, endOfMonth];
        if (startOfMonth) {
            params.push(startOfMonth);
        }

        logger.debug(`dashStackedColumnChartCoursesNotCompleted: ${query}`)
        logger.debug(`params: ${params}`)

        return await prisma.$queryRawUnsafe<DashStackedEntity[]>(query, ...params);
    }


    async listPeopleByCourseAndCurrentMonthDistinctByCpf(coursesIds: string[], startOfMonth: Date, endOfMonth: Date): Promise<WorkerCourseAssocEntity[]> {
        return await prisma.workerCourseAssocEntity.findMany({
            where: {
                course_id: { in: coursesIds },
                registrationDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                }
            },
            distinct: "cpf"
        });
    }

    async findByCoursesAndDateIdsDistinctByCityId(coursesIds: string[], startOfMonth: Date, endOfMonth: Date): Promise<WorkerCourseAssocEntity[]> {
        return await prisma.workerCourseAssocEntity.findMany({
            where: {
                course_id: { in: coursesIds },
                registrationDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                }
            },
            distinct: "city_id"
        });
    }

    async findByCoursesIdsDistinctByCityId(coursesIds: string[]): Promise<WorkerCourseAssocEntity[]> {
        return await prisma.workerCourseAssocEntity.findMany({
            where: {
                course_id: { in: coursesIds }
            },
            distinct: "city_id"
        });
    }

    async countStudentsByData(startOfMonth: Date, endOfMonth: Date): Promise<number> {
        return await prisma.workerCourseAssocEntity.count({
            where: {
                registrationDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                }
            }
        })
    }

    async getWorkerCourseAssocById(cpf: string, course_id: string, initDate: Date): Promise<WorkerCourseAssocEntity | null> {
        return await prisma.workerCourseAssocEntity.findFirst({
            where: { cpf, course_id, registrationDate: initDate }
        });
    }

    async filterCountPeopleCertifiedInMonth(cityId: string, startDate: Date, endDate: Date): Promise<number> {
        return await prisma.workerCourseAssocEntity.count({
            where: {
                city_id: cityId,
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                },
                completionDate: {
                    not: null,
                },
            }
        });
    }

    async findByCityIdDistinctByCityIdInMonth(cityId: string, startDate: Date, endDate: Date): Promise<WorkerCourseAssocEntity[]> {
        return await prisma.workerCourseAssocEntity.findMany({
            where: {
                city_id: cityId,
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            distinct: "city_id"
        });
    }

    async filterCountPeopleRegistredInMonth(cityId: string, startDate: Date, endDate: Date): Promise<number> {
        return await prisma.workerCourseAssocEntity.count({
            where: {
                city_id: cityId,
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                }
            }
        });
    }

    async findByCityIdDistinctByCityId(id: string): Promise<WorkerCourseAssocEntity[]> {
        return await prisma.workerCourseAssocEntity.findMany({ where: { city_id: id }, distinct: "city_id" });
    }

    async findByCityId(cityId: string): Promise<WorkerCourseAssocEntity[]> {
        return await prisma.workerCourseAssocEntity.findMany({
            where: {
                city_id: cityId
            },
            include: {
                course: true,
                city: true,
            }
        })
    }

    async save(data: Prisma.WorkerCourseAssocEntityUncheckedCreateInput): Promise<WorkerCourseAssocEntity> {
        return await prisma.workerCourseAssocEntity.create({ data })
    }

};