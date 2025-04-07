import { IndicatorCourseAssocEntity, Prisma } from "@prisma/client";
import { IndicatorCourseRepository } from "../interface/indicator-course-repository";

const mock: IndicatorCourseAssocEntity[] = [
    {
        courseId: '1',
        indicatorId: '1',
    },
    {
        courseId: '2',
        indicatorId: '1',
    },
];

export class InMemoryIndicatorCourseRepository implements IndicatorCourseRepository {

    async listAllByIndicatorId(id: string): Promise<IndicatorCourseAssocEntity[]> {
        return mock.filter(item => item.indicatorId === id);
    }

    async findAllByCouseId(courseIds: string[]): Promise<IndicatorCourseAssocEntity[]> {
        return mock.filter(item => courseIds.includes(item.courseId));
    }

    async find(indicatorId: string, courseId: string): Promise<IndicatorCourseAssocEntity | null> {
        return mock.find(item => item.indicatorId === indicatorId && item.courseId === courseId) || null;
    }

    async save(data: Prisma.IndicatorCourseAssocEntityUncheckedCreateInput): Promise<IndicatorCourseAssocEntity> {
        const newItem: IndicatorCourseAssocEntity = {
            indicatorId: data.indicatorId,
            courseId: data.courseId
        };

        mock.push(newItem);
        return newItem;
    }

}

