export interface SessionEntity {
    id?: number
    token: string
    valid?: boolean
    createdAt?: Date | string
    userId: string
}