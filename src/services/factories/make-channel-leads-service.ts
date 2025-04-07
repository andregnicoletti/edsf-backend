import { PrismaChannelLeadsRepository } from "../../repositories/prisma/prisma-channel-leads-repository"
import { ChannelLeadsService } from "../channel-leads-service";

export const makeChannelLeadsService = () => {

    const channelLeadsRepository = new PrismaChannelLeadsRepository();
    const channelLeadsService = new ChannelLeadsService(channelLeadsRepository);

    return channelLeadsService;

}