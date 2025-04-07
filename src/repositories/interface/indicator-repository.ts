import { IndicatorEntity, Prisma } from "@prisma/client";

export interface IndicatorRepository {

    findAllByCompanyIdAndCourses(company_id: string, courses: string[]): Promise<IndicatorEntity[]>;

    findAllByCompanyId(company_id: string): Promise<IndicatorEntity[]>;

    findAllByIndicatorId(indicatorIds: string[]): Promise<IndicatorEntity[]>

    findAll(): Promise<IndicatorEntity[]>

    findByCode(code: string): Promise<IndicatorEntity | null>

    save(data: Prisma.IndicatorEntityUncheckedCreateInput): Promise<IndicatorEntity>

    deleteByCode(code: string): Promise<IndicatorEntity>;

}