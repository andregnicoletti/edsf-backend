import { Prisma, UploadEntity } from "@prisma/client";

export interface UploadRepositoryWithCells extends UploadEntity {
    cells: { id: string, name: string, value: string }[]
}

export interface UploadRepository {

    getByUploadIds(uploadIds: string[]): Promise<UploadEntity[]>;

    getUploadByIdWhereStatusIsFalse(uploadId: string): Promise<UploadRepositoryWithCells[]>;
    
    findAllUploadByComapnyIdDistinctByUploadId(companyId: string): Promise<UploadEntity[]>;
    
    findAllUploadDistinctByUploadId(): Promise<UploadEntity[]>;

    findAllByDateDistinctUploadId(date: Date): Promise<UploadEntity[]>;

    getByUploadId(uploadId: string): Promise<UploadRepositoryWithCells[]>;

    findAll(): Promise<UploadEntity[]>;

    findById(id: string): Promise<UploadEntity | null>

    save(data: Prisma.UploadEntityUncheckedCreateInput): Promise<UploadEntity>

    saveFull(data: Prisma.UploadEntityCreateInput): Promise<UploadEntity>

    // update(data: Prisma.UploadControllerEntityUpdateInput): Promise<UploadControllerEntity>
}