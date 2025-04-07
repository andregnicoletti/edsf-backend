import { PanelEntity, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma"
import { PanelRepository } from "../interface/panel-repository";

export class PrismaPanelRepository implements PanelRepository {

    async update(panelId: string, updatedData: { name: string; type: string; configuration: string; }, userId: string): Promise<PanelEntity> {
        return await prisma.panelEntity.update({
            where: {
                id: panelId
            },
            data: {
                name: updatedData.name,
                type: updatedData.type,
                configuration: updatedData.configuration,
                userId: userId,
            },
        })
    }

    async findAll(companyId: string): Promise<PanelEntity[]> {
        return await prisma.panelEntity.findMany({ where: { companyId } });
    }

    async findById(id: string, companyId: string): Promise<PanelEntity | null> {
        return await prisma.panelEntity.findFirst({ where: { id, companyId } });
    }

    async delete(id: string): Promise<PanelEntity> {
        return await prisma.panelEntity.delete({ where: { id } });
    }

    async save(data: Prisma.PanelEntityUncheckedCreateInput): Promise<PanelEntity> {
        return await prisma.panelEntity.create({ data });
    }

};