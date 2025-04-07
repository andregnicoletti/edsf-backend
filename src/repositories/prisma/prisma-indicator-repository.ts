import { IndicatorEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IndicatorRepository } from "../interface/indicator-repository";

export class PrismaIndicatorRepository implements IndicatorRepository {

    async findAllByCompanyIdAndCourses(company_id: string, courses: string[]): Promise<IndicatorEntity[]> {
        return await prisma.indicatorEntity.findMany({
            where: {
                company_id: company_id,
                indicator: {
                    some: {
                        courses: {
                            code: {
                                in: courses,
                            },
                        },
                    },
                },
            },
            include: {
                indicator: {
                    include: {
                        courses: true,
                    },
                },
            },
        });
    }

    async findAllByCompanyId(company_id: string): Promise<IndicatorEntity[]> {
        return await prisma.indicatorEntity.findMany({ where: { company_id } });
    }

    async findAllByIndicatorId(indicatorIds: string[]): Promise<IndicatorEntity[]> {
        return await prisma.indicatorEntity.findMany({ where: { id: { in: indicatorIds } } });
    }

    async findAll(): Promise<IndicatorEntity[]> {
        return await prisma.indicatorEntity.findMany();
    }
    async findByCode(code: string): Promise<IndicatorEntity | null> {
        const trimmedCode = code.trim();
        return await prisma.indicatorEntity.findFirst({ where: { code: { equals: trimmedCode, mode: 'insensitive' } } });
    }

    async save(data: Prisma.IndicatorEntityUncheckedCreateInput): Promise<IndicatorEntity> {
        return await prisma.indicatorEntity.create({ data })
    }

    async deleteByCode(code: string): Promise<IndicatorEntity> {
        return await prisma.indicatorEntity.delete({ where: { code } })
    }

};