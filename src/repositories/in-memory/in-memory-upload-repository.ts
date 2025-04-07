import { Prisma, UploadEntity } from "@prisma/client";
import { UploadRepository, UploadRepositoryWithCells } from "../interface/upload-repository";
import { randomUUID } from "node:crypto";

const mock: UploadEntity[] = [];

export class InMemoryProducerRepository implements UploadRepository {

    async getByUploadIds(uploadIds: string[]): Promise<UploadEntity[]> {
        return mock.filter(item => uploadIds.includes(item.uploadId));
    }

    async getUploadByIdWhereStatusIsFalse(uploadId: string): Promise<UploadRepositoryWithCells[]> {
        const uploads = mock.filter(item => item.uploadId === uploadId && !item.status);
        return uploads.map(upload => ({
            ...upload,
            cells: [] // Add logic to retrieve cells if necessary
        }));
    }

    async findAllUploadByComapnyIdDistinctByUploadId(companyId: string): Promise<UploadEntity[]> {
        const uniqueUploads = new Map<string, UploadEntity>();
        mock.filter(item => item.company_id === companyId).forEach(item => {
            if (!uniqueUploads.has(item.uploadId)) {
                uniqueUploads.set(item.uploadId, item);
            }
        });
        return Array.from(uniqueUploads.values());
    }

    async findAllUploadDistinctByUploadId(): Promise<UploadEntity[]> {
        const uniqueUploads = new Map<string, UploadEntity>();
        mock.forEach(item => {
            if (!uniqueUploads.has(item.uploadId)) {
                uniqueUploads.set(item.uploadId, item);
            }
        });
        return Array.from(uniqueUploads.values());
    }

    async findAllByDateDistinctUploadId(date: Date): Promise<UploadEntity[]> {
        const uniqueUploads = new Map<string, UploadEntity>();
        mock.filter(item => item.date.toISOString() === date.toISOString()).forEach(item => {
            if (!uniqueUploads.has(item.uploadId)) {
                uniqueUploads.set(item.uploadId, item);
            }
        });
        return Array.from(uniqueUploads.values());
    }

    async getByUploadId(uploadId: string): Promise<UploadRepositoryWithCells[]> {
        const uploads = mock.filter(item => item.uploadId === uploadId);
        return uploads.map(upload => ({
            ...upload,
            cells: [] // Add logic to retrieve cells if necessary
        }));
    }

    async findAll(): Promise<UploadEntity[]> {
        return mock;
    }

    async findById(id: string): Promise<UploadEntity | null> {
        return mock.find(item => item.id === id) || null;
    }

    async save(data: Prisma.UploadEntityUncheckedCreateInput): Promise<UploadEntity> {

        const newItem: UploadEntity = {
            id: (mock.length + 1).toString(),
            code: data.code,
            fileName: data.fileName || "",
            uploadId: data.uploadId,
            status: data.status,
            event: data.event,
            date: new Date(),
            company_id: data.company_id
        };

        mock.push(newItem);
        return newItem;
    }

    async saveFull(data: Prisma.UploadEntityCreateInput): Promise<UploadEntity> {
        const newItem: UploadEntity = {
            id: (mock.length + 1).toString(),
            code: data.code,
            fileName: data.fileName || "",
            uploadId: data.uploadId,
            status: data.status,
            event: data.event,
            date: new Date(),
            company_id: randomUUID()
        };

        mock.push(newItem);
        return newItem;
    }

}

