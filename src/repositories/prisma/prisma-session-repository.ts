import { Prisma } from "@prisma/client";
import { SessionRepository } from "../interface/session-repository";
import { prisma } from "../../lib/prisma";
import { SessionEntity } from "../../@types/session-entity";

export class PrismaSessionRepository implements SessionRepository {

    async findFirst(token: string, valid: boolean): Promise<SessionEntity | null> {
        return await prisma.sessionEntity.findFirst({ where: { token, valid } });
    }

    async stopSession(userId: string): Promise<SessionEntity[]> {
        await prisma.sessionEntity.updateMany({
            where: { userId, valid: true },
            data: { valid: false }
        })

        return await prisma.sessionEntity.findMany({ where: { userId } });
    }

    async save(data: Prisma.SessionEntityUncheckedCreateInput): Promise<SessionEntity> {
        return await prisma.sessionEntity.create({ data });
    }

};