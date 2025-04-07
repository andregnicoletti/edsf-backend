import { Prisma, UploadEntity } from "@prisma/client";
import { UploadRepository, UploadRepositoryWithCells } from "../interface/upload-repository";
import { prisma } from "../../lib/prisma";
import logger from "../../config/logger";

export class PrismaUploadRepository implements UploadRepository {

    async getByUploadIds(uploadIds: string[]): Promise<UploadEntity[]> {
        const batchSize = 1000; // Divida em lotes abaixo do limite.
        const results: UploadEntity[] = [];

        for (let i = 0; i < uploadIds.length; i += batchSize) {
            logger.info(`batchSize: ${batchSize} - i: ${i}`)
            const chunk = uploadIds.slice(i, i + batchSize);
            const data = await prisma.uploadEntity.findMany({ where: { uploadId: { in: chunk } } });
            logger.info(`data.length: ${data.length}`)
            // results.push(...data);
            data.forEach(d => results.push(d))
            logger.info(`results.length: ${results.length}`)
        }

        return results;
    }

    async getUploadByIdWhereStatusIsFalse(uploadId: string): Promise<UploadRepositoryWithCells[]> {
        return await prisma.uploadEntity.findMany({
            where: {
                uploadId: {
                    equals: uploadId
                },
                status: {
                    equals: false
                }
            },
            include: { cells: true }
        })
    }

    async findAllUploadByComapnyIdDistinctByUploadId(companyId: string): Promise<UploadEntity[]> {
        return await prisma.uploadEntity.findMany({
            where: { company_id: companyId },
            distinct: ["uploadId"]
        })
    }

    async findAllUploadDistinctByUploadId(): Promise<UploadEntity[]> {
        return await prisma.uploadEntity.findMany({
            distinct: ["uploadId"]
        })
    }

    async findAllByDateDistinctUploadId(date: Date): Promise<UploadEntity[]> {
        return await prisma.uploadEntity.findMany({
            where: {
                date: {
                    equals: date
                }
            },
            distinct: ['uploadId'],
        });
    }

    // async getByCode(code: string): Promise<UploadEntity[]> {
    async getByUploadId(uploadId: string): Promise<UploadRepositoryWithCells[]> {

        return await prisma.uploadEntity.findMany({
            where: {
                uploadId: {
                    equals: uploadId
                }
            },
            include: { cells: true }
        })

    }

    async saveFull(data: Prisma.UploadEntityCreateInput): Promise<UploadEntity> {
        return await prisma.uploadEntity.create({ data })
    }

    async findAll(): Promise<UploadEntity[]> {
        return await prisma.uploadEntity.findMany();
    }

    async findById(id: string): Promise<UploadEntity | null> {
        return await prisma.uploadEntity.findUnique({ where: { id } })
    }

    async save(data: Prisma.UploadEntityUncheckedCreateInput): Promise<UploadEntity> {
        return await prisma.uploadEntity.create({ data })
    }

};