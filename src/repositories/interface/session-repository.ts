import { Prisma } from "@prisma/client"
import { SessionEntity } from "../../@types/session-entity"

export interface SessionRepository {

    findFirst(token: string, valid: boolean): Promise<SessionEntity | null>

    stopSession(userId: string): Promise<SessionEntity[]>

    save(data: Prisma.SessionEntityUncheckedCreateInput): Promise<SessionEntity>

}