import { ChannelLeadsEntity } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ChannelLeadsRepository } from "../interface/channel-leads-repository";

export class PrismaChannelLeadsRepository implements ChannelLeadsRepository {

    async find(): Promise<ChannelLeadsEntity[]> {
        return await prisma.channelLeadsEntity.findMany();
    }

};