import { CourseEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma"
import { CourseRepository, CourseVO } from "../interface/course-repository";
import logger from "../../config/logger";

export class PrismaCourseRepository implements CourseRepository {

    async findAllByCompanyIdAndIndicators(companyId: string, indicators: string[]): Promise<CourseEntity[]> {
        return await prisma.courseEntity.findMany({
            where: {
                indicator: {
                    some: {
                        indicators: {
                            code: {
                                in: indicators,
                            },
                            company_id: companyId
                        },
                    },
                },
            },
            include: {
                indicator: {
                    include: {
                        indicators: true,
                    },
                },
            },
        });
    }

    async findByIndicators(
        companyId: string,
        indicators: string[],
        courses: string[]
    ): Promise<CourseVO[]> {
        const query = `
            SELECT  
                cc."ID_CURSO" as id ,
                cc."DESC_CURSO" as course_description ,
                cc."DURACAO_MEDIA" as average_duration ,
                cc."CODIGO" as code ,
                cc."QTD_AULAS" as number_class 
            FROM "CAD_CURSO" cc
            JOIN "ASSOC_INDICADOR_CURSO" aic ON aic."ID_CURSO" = cc."ID_CURSO"
            JOIN "CAD_INDICADOR" ci ON ci."ID_INDICADOR" = aic."ID_INDICADOR"
            where
                ci."ID_ORGANIZACAO" = $1 
                ${indicators.length > 0 ? ` AND ci."CODIGO_INDICADOR" IN (${indicators.map(i => `'${i}'`).join(',')})` : ""}
                ${courses.length > 0 ? ` AND cc."CODIGO" IN (${courses.map(i => `'${i}'`).join(',')})` : ""}
            `

        logger.debug(`findCourseByIndicators: ${query}`)

        return await prisma.$queryRawUnsafe<CourseVO[]>(query, companyId)
    }

    async findAllByCodes(coursesCode: string[]): Promise<CourseEntity[]> {
        return await prisma.courseEntity.findMany({
            where: { code: { in: coursesCode } }
        })
    }

    async findById(id: string): Promise<CourseEntity | null> {
        return await prisma.courseEntity.findFirst({ where: { id } });
    }

    async dashboardFilterCourses(courses: string[]): Promise<CourseEntity[]> {
        return await prisma.courseEntity.findMany({
            where: {
                code: {
                    in: courses
                }
            }
        });
    }

    async deleteByCode(code: string): Promise<CourseEntity> {
        const trimmedCode = code.trim();
        return await prisma.courseEntity.delete({ where: { code: trimmedCode } });
    }

    async findAll(): Promise<CourseEntity[]> {
        return await prisma.courseEntity.findMany();
    }

    async findByCode(code: string): Promise<CourseEntity | null> {
        const trimmedCode = code.trim();
        return await prisma.courseEntity.findFirst({ where: { code: { equals: trimmedCode, mode: 'insensitive' } } })
    }

    async save(data: Prisma.CourseEntityUncheckedCreateInput): Promise<CourseEntity> {
        return await prisma.courseEntity.create({ data });
    }

};