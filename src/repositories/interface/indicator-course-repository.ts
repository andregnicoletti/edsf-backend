import { IndicatorCourseAssocEntity, Prisma } from "@prisma/client";

export interface IndicatorCourseRepository {

    listAllByIndicatorId(id: string): Promise<IndicatorCourseAssocEntity[]>;

    findAllByCouseId(courseIds: string[]): Promise<IndicatorCourseAssocEntity[]>;

    find(indicatorId: string, courseId: string): Promise<IndicatorCourseAssocEntity | null>;

    save(data: Prisma.IndicatorCourseAssocEntityUncheckedCreateInput): Promise<IndicatorCourseAssocEntity>

}