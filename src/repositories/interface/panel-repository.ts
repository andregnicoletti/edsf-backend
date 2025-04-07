import { PanelEntity, Prisma } from "@prisma/client"

export interface PanelRepository {

    update(panelId: string, updatedData: { name: string; type: string; configuration: string; }, userId: string): Promise<PanelEntity>;

    findAll(userId: string): Promise<PanelEntity[]>;

    findById(id: string, companyId: string): Promise<PanelEntity | null>;

    delete(id: string): Promise<PanelEntity>;

    save(data: Prisma.PanelEntityUncheckedCreateInput): Promise<PanelEntity>;

}