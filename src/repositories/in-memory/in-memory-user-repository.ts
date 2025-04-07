import { Prisma, UserEntity } from "@prisma/client";
import { UserRepository } from "../interface/user-repository";

const mock: UserEntity[] = [
    {
        id: '1',
        company_id: '1',
        code: '1234',
        email: 'teste@cpqd.com.br',
        phone: '0000000000',
        lgpdAgreementDate: new Date(),
        lgpdConsent: true,
    }
];

export class InMemoryUserRepository implements UserRepository {

    async updateConsent(userId: string, terms: boolean, lgpdAgreementDate: Date): Promise<UserEntity> {
        const user = mock.find(item => item.id === userId);
        if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
        }
        user.lgpdConsent = terms;
        user.lgpdAgreementDate = lgpdAgreementDate;
        return user;
    }

    async updateUserCode(userId: string, code: string): Promise<UserEntity> {
        const user = mock.find(item => item.id === userId);
        if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
        }
        user.code = code;
        return user;
    }

    async findById(id: string): Promise<UserEntity | null> {
        return mock.find(item => item.id === id) || null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return mock.find(item => item.email === email) || null;
    }

    async save(data: Prisma.UserEntityUncheckedCreateInput): Promise<UserEntity> {
        const newItem: UserEntity = {
            id: (mock.length + 1).toString(),
            email: data.email,
            phone: data.phone,
            code: data.code || "",
            lgpdAgreementDate: data.lgpdAgreementDate ? new Date(data.lgpdAgreementDate) : null,
            lgpdConsent: data.lgpdConsent || null,
            company_id: data.company_id,
        };

        mock.push(newItem);
        return newItem;
    }

}

