import { Prisma } from "@prisma/client";
import { SessionRepository } from "../interface/session-repository";
import { SessionEntity } from "../../@types/session-entity";

const repository: SessionEntity[] = [];

export class InMemorySessionRepository implements SessionRepository {

    findFirst(token: string, valid: boolean): Promise<SessionEntity | null> {
        const data = repository.find(
            (item) => item.token === token && item.valid === valid
        );

        if (!data) {
            return Promise.resolve(null);
        }

        return Promise.resolve(data);
    }

    stopSession(userId: string): Promise<SessionEntity[]> {
        repository.forEach(item => {
            if (item.userId === userId) {
                item.valid = false;
            }
        });

        return Promise.resolve(repository);
    }

    save(data: Prisma.SessionEntityUncheckedCreateInput): Promise<SessionEntity> {
        data.id = repository.length + 1;
        repository.push(data);
        return Promise.resolve(data);
    }

}