import { IndicatorCourseAssocEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IndicatorCourseRepository } from "../interface/indicator-course-repository";

export class PrismaIndicatorCourseRepository implements IndicatorCourseRepository {

    listAllByIndicatorId = async (id: string): Promise<IndicatorCourseAssocEntity[]> => {
        return await prisma.indicatorCourseAssocEntity.findMany({ where: { indicatorId: id } });
    }

    findAllByCouseId = async (courseIds: string[]): Promise<IndicatorCourseAssocEntity[]> => {
        return await prisma.indicatorCourseAssocEntity.findMany({
            where: {
                courseId: { in: courseIds },
            }
        });
    }

    find = async (indicators_id: string, course_id: string): Promise<IndicatorCourseAssocEntity | null> => {
        return await prisma.indicatorCourseAssocEntity.findFirst({
            where: { courseId: course_id, indicatorId: indicators_id }
        });
    }

    save = async (data: Prisma.IndicatorCourseAssocEntityUncheckedCreateInput): Promise<IndicatorCourseAssocEntity> => {
        return await prisma.indicatorCourseAssocEntity.create({ data });
    }

};