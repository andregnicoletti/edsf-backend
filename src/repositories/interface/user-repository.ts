import { Prisma, UserEntity } from "@prisma/client"

export interface UserRepository {

    updateConsent(userId: string, terms: boolean, lgpdAgreementDate: Date): Promise<UserEntity>

    updateUserCode(userId: string, code: string): Promise<UserEntity>

    findById(id: string): Promise<UserEntity | null>

    findByEmail(email: string): Promise<UserEntity | null>

    save(data: Prisma.UserEntityUncheckedCreateInput): Promise<UserEntity>

}