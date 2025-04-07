import { ChannelLeadsEntity } from "@prisma/client"

export interface ChannelLeadsRepository {

    find(): Promise<ChannelLeadsEntity[]>

}