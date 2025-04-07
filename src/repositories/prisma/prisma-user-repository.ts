import { Prisma, UserEntity } from "@prisma/client";
import { UserRepository } from "../interface/user-repository"
import { prisma } from "../../lib/prisma"

export class PrismaUserRepository implements UserRepository {

    async updateConsent(userId: string, terms: boolean, lgpdAgreementDate: Date): Promise<UserEntity> {
        return await prisma.userEntity.update({ where: { id: userId }, data: { lgpdConsent: terms, lgpdAgreementDate } })
    }

    async updateUserCode(userId: string, code: string): Promise<UserEntity> {
        return await prisma.userEntity.update({ where: { id: userId }, data: { code } })
    }

    async findById(id: string): Promise<UserEntity | null> {
        return await prisma.userEntity.findUnique({ where: { id } })
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return await prisma.userEntity.findFirst({ where: { email: email, } });
    }

    async save(data: Prisma.UserEntityUncheckedCreateInput): Promise<UserEntity> {
        return await prisma.userEntity.create({ data })
    }

};